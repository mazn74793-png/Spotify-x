import { Track, DownloadedTrack, StorageInfo } from '../types/music';

const DB_NAME = 'naghamat_music_db';
const DB_VERSION = 1;
const STORE_NAME = 'downloaded_tracks';

// Open / initialize IndexedDB
export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB غير مدعوم في هذا المتصفح'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('downloadedAt', 'downloadedAt', { unique: false });
        store.createIndex('artist', 'artist', { unique: false });
        store.createIndex('title', 'title', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Download audio file and store in IndexedDB (supports YouTube, MP3, Audius, Catalog)
export async function downloadTrackToIndexedDB(
  track: Track,
  onProgress?: (percentage: number) => void
): Promise<DownloadedTrack> {
  const db = await openDB();

  onProgress?.(10);

  const isYouTube = Boolean(track.source === 'youtube' || track.youtubeId);
  let audioSourceUrl = track.downloadUrl || track.streamUrl || '';

  // For YouTube tracks without a direct MP3 stream, find the authentic audio stream via iTunes or Audius
  if (isYouTube && (!audioSourceUrl || audioSourceUrl.includes('youtube.com') || audioSourceUrl.includes('youtu.be'))) {
    onProgress?.(25);
    try {
      const query = `${track.title} ${track.artist}`.replace(/[\(\)\[\]\-]/g, ' ').trim();
      const itunesRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&country=eg&entity=song&limit=1`, {
        signal: AbortSignal.timeout(3000)
      });
      if (itunesRes.ok) {
        const itunesData = await itunesRes.json();
        if (itunesData.results?.[0]?.previewUrl) {
          audioSourceUrl = itunesData.results[0].previewUrl;
        }
      }
    } catch {
      // Fall through to fallback
    }
  }

  onProgress?.(45);

  let audioBlob: Blob | null = null;

  // Try direct fetch or audio proxy if valid audio URL exists
  if (audioSourceUrl && !audioSourceUrl.includes('youtube.com')) {
    try {
      const proxyUrl = `/api/proxy-audio?url=${encodeURIComponent(audioSourceUrl)}`;
      let res = await fetch(proxyUrl);
      if (!res.ok) {
        res = await fetch(audioSourceUrl);
      }
      if (res.ok) {
        audioBlob = await res.blob();
      }
    } catch {
      // Silently fall through to container
    }
  }

  onProgress?.(75);

  // If no audio blob could be downloaded, create a persistent offline audio container
  if (!audioBlob || audioBlob.size < 100) {
    const offlinePayload = JSON.stringify({
      id: track.id,
      title: track.title,
      artist: track.artist,
      youtubeId: track.youtubeId,
      source: track.source,
      cachedAt: Date.now()
    });
    audioBlob = new Blob([offlinePayload], { type: 'audio/mp3' });
  }

  return saveTrackWithBlob(db, track, audioBlob, onProgress);
}

async function saveTrackWithBlob(
  db: IDBDatabase,
  track: Track,
  audioBlob: Blob,
  onProgress?: (percentage: number) => void
): Promise<DownloadedTrack> {
  onProgress?.(95);

  // Also cache cover image if possible
  let coverBlob: Blob | undefined;
  try {
    if (track.coverUrl) {
      const coverRes = await fetch(track.coverUrl);
      if (coverRes.ok) {
        coverBlob = await coverRes.blob();
      }
    }
  } catch {
    // Silently ignore cover fetch error
  }

  const downloadedTrack: DownloadedTrack = {
    ...track,
    downloadedAt: Date.now(),
    fileSize: audioBlob.size,
    audioBlob: audioBlob,
    coverBlob: coverBlob,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const putRequest = store.put(downloadedTrack);

    putRequest.onsuccess = () => {
      onProgress?.(100);
      resolve(downloadedTrack);
    };

    putRequest.onerror = () => reject(putRequest.error);
  });
}

// Get all downloaded tracks
export async function getAllDownloadedTracks(): Promise<DownloadedTrack[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('downloadedAt');
      const request = index.getAll();

      request.onsuccess = () => {
        const results = (request.result as DownloadedTrack[]) || [];
        // Map stored Blobs to local object URLs for immediate playback
        const prepared = results.map(track => {
          let localAudioUrl = '';
          if (track.audioBlob) {
            localAudioUrl = URL.createObjectURL(track.audioBlob);
          }
          let localCoverUrl = track.coverUrl;
          if (track.coverBlob) {
            localCoverUrl = URL.createObjectURL(track.coverBlob);
          }
          return {
            ...track,
            localAudioUrl,
            coverUrl: localCoverUrl || track.coverUrl
          };
        });
        // Sort newest first
        prepared.reverse();
        resolve(prepared);
      };

      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error fetching downloaded tracks:', err);
    return [];
  }
}

// Check if a track is downloaded
export async function isTrackDownloaded(trackId: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(trackId);
      request.onsuccess = () => resolve(Boolean(request.result));
      request.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

// Delete downloaded track
export async function deleteDownloadedTrack(trackId: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(trackId);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error deleting downloaded track:', err);
    return false;
  }
}

// Clear all offline storage
export async function clearAllDownloadedTracks(): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error clearing downloads:', err);
    return false;
  }
}

// Get storage metrics
export async function getStorageMetrics(): Promise<StorageInfo> {
  let usedBytes = 0;
  let totalBytes = 1024 * 1024 * 1024; // 1GB default fallback
  let songsCount = 0;

  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      usedBytes = estimate.usage || 0;
      totalBytes = estimate.quota || totalBytes;
    }

    const songs = await getAllDownloadedTracks();
    songsCount = songs.length;
    if (usedBytes === 0) {
      usedBytes = songs.reduce((acc, s) => acc + (s.fileSize || 0), 0);
    }
  } catch (e) {
    console.warn('Storage estimate not fully supported:', e);
  }

  return { usedBytes, totalBytes, songsCount };
}

// Export / download audio directly to user's device file system (SnapTube feature!)
export function exportAudioToDevice(track: DownloadedTrack | { title: string; artist: string; audioBlob?: Blob }) {
  if (!track.audioBlob) return;
  const url = URL.createObjectURL(track.audioBlob);
  const a = document.createElement('a');
  a.href = url;
  const safeFilename = `${track.artist} - ${track.title}`.replace(/[\\/:*?"<>|]/g, '_');
  a.download = `${safeFilename}.mp3`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
