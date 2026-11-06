export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  streamUrl: string;
  downloadUrl?: string;
  genre?: string;
  releaseDate?: string;
  bitrate?: string;
  isFullLength?: boolean;
  playCount?: string;
  source?: 'youtube' | 'audius' | 'catalog';
  youtubeId?: string;
}

export interface Artist {
  id: string;
  name: string;
  englishName?: string;
  avatarUrl: string;
  headerUrl: string;
  bio: string;
  monthlyListeners: string;
  followersCount: string;
  genres: string[];
  isVerified: boolean;
}

export interface DownloadedTrack extends Track {
  downloadedAt: number;
  fileSize: number; // in bytes
  audioBlob: Blob;
  coverBlob?: Blob;
  localAudioUrl?: string; // transient ObjectURL
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  isOfflineMode: boolean;
  sleepTimer: number | null;
}

export type ActiveTab = 'home' | 'search' | 'library' | 'favorites' | 'docs';

export interface StorageInfo {
  usedBytes: number;
  totalBytes: number;
  songsCount: number;
}
