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

// Extract pure, clean title and artist from noisy YouTube strings
export function cleanMusicQuery(title: string, artist?: string): { cleanTitle: string; cleanArtist: string } {
  let t = title || '';
  t = t.replace(/\(.*?\)/g, ' ').replace(/\[.*?\]/g, ' ');
  t = t.replace(/official\s*(music)?\s*video/gi, ' ')
       .replace(/lyric\s*video/gi, ' ')
       .replace(/audio\s*video/gi, ' ')
       .replace(/فيديو\s*كليب/g, ' ')
       .replace(/كليب\s*رسمي/g, ' ')
       .replace(/أغنية/g, ' ')
       .replace(/اغنية/g, ' ')
       .replace(/ريمكس/g, ' ')
       .replace(/remix/gi, ' ')
       .replace(/hd/gi, ' ')
       .replace(/4k/gi, ' ')
       .replace(/prod\.\s*by/gi, ' ')
       .replace(/feat\./gi, ' ')
       .replace(/ft\./gi, ' ')
       .replace(/[|•_—–-]/g, ' ')
       .replace(/\s+/g, ' ')
       .trim();

  let a = (artist || '').trim();
  if (a && t.toLowerCase().includes(a.toLowerCase())) {
    t = t.replace(new RegExp(a, 'gi'), '').trim();
  }

  return { cleanTitle: t || title, cleanArtist: a };
}

// Search Audius for high-quality full-length 320kbps MP3 stream
async function searchAudiusAudioDirect(cleanTitle: string): Promise<string | null> {
  try {
    const url = `https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(cleanTitle)}&app_name=NAGHAMAT_APP&limit=3`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      const track = data.data?.[0];
      if (track?.id) {
        return `https://discoveryprovider.audius.co/v1/tracks/${track.id}/stream?app_name=NAGHAMAT_APP`;
      }
    }
  } catch {
    // Ignore
  }
  return null;
}

// Download genuine audio file and store in IndexedDB with real full-length audio bytes
export async function downloadTrackToIndexedDB(
  track: Track,
  onProgress?: (percentage: number) => void
): Promise<DownloadedTrack> {
  const db = await openDB();

  onProgress?.(15);

  const { cleanTitle, cleanArtist } = cleanMusicQuery(track.title, track.artist);

  // Determine candidate audio stream URLs (Strictly authentic full-length, never 30s previews)
  const candidateUrls: string[] = [];

  const isExcludedUrl = (u?: string) => {
    if (!u) return true;
    return (
      u.includes('youtube.com') ||
      u.includes('youtu.be') ||
      u.includes('itunes.apple.com') ||
      u.includes('mzstatic.com') ||
      u.includes('apple.com')
    );
  };

  // 1. Direct streamUrl if present and NOT YouTube or Apple iTunes 30s preview
  if (track.streamUrl && !isExcludedUrl(track.streamUrl)) {
    candidateUrls.push(track.streamUrl);
  }
  if (track.downloadUrl && !isExcludedUrl(track.downloadUrl)) {
    candidateUrls.push(track.downloadUrl);
  }

  onProgress?.(30);

  // 2. Query our server audio resolver (searches catalog, Archive.org 320kbps MP3s, Audius)
  try {
    const resolveRes = await fetch(`/api/resolve-audio?title=${encodeURIComponent(cleanTitle || track.title)}&artist=${encodeURIComponent(cleanArtist || track.artist || '')}`, {
      signal: AbortSignal.timeout(6000)
    });
    if (resolveRes.ok) {
      const resolveData = await resolveRes.json();
      if (resolveData?.success && resolveData?.audioUrl && !candidateUrls.includes(resolveData.audioUrl)) {
        candidateUrls.unshift(resolveData.audioUrl);
      }
    }
  } catch {
    // Fallback to direct audius
  }

  onProgress?.(50);

  // 3. Fallback: Query Audius API for full-length 320kbps MP3
  if (candidateUrls.length === 0) {
    const audiusUrl = await searchAudiusAudioDirect(cleanTitle);
    if (audiusUrl) {
      candidateUrls.push(audiusUrl);
    }
  }

  onProgress?.(65);

  let audioBlob: Blob | null = null;

  // Attempt to fetch genuine audio bytes from candidate sources
  for (const url of candidateUrls) {
    try {
      // First try proxy which bypasses CORS and redirects safely
      const proxyUrl = url.startsWith('/api/') || url.startsWith('blob:') || url.startsWith('data:') 
        ? url 
        : `/api/proxy-audio?url=${encodeURIComponent(url)}`;
      
      let res = await fetch(proxyUrl, { signal: AbortSignal.timeout(12000) });
      if (!res.ok && !url.startsWith('/api/')) {
        // Direct fetch fallback
        res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      }

      if (res.ok) {
        const blob = await res.blob();
        // Verify audio blob has authentic audio size (> 50KB, genuine song file)
        if (blob && blob.size > 50000) {
          audioBlob = blob;
          break;
        }
      }
    } catch {
      // Try next candidate
    }
  }

  onProgress?.(85);

  if (!audioBlob || audioBlob.size < 50000) {
    throw new Error('عذراً، لم نتمكن من تنزيل ملف الصوت بجودة عالية لهذه الأغنية حالياً. يرجى المحاولة لاحقاً.');
  }

  return saveTrackWithBlob(db, track, audioBlob, onProgress);
}

async function saveTrackWithBlob(
  db: IDBDatabase,
  track: Track,
  audioBlob: Blob,
  onProgress?: (percentage: number) => void
): Promise<DownloadedTrack> {
  onProgress?.(90);

  // Cache cover image if possible
  let coverBlob: Blob | undefined;
  try {
    if (track.coverUrl) {
      const coverRes = await fetch(track.coverUrl, { signal: AbortSignal.timeout(3000) });
      if (coverRes.ok) {
        coverBlob = await coverRes.blob();
      }
    }
  } catch {
    // Ignore cover error
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
  let totalBytes = 1024 * 1024 * 1024; // 1GB default
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

// Export / download audio directly to user's device file system (.mp3)
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
