import { useState, useEffect, useRef, useCallback } from 'react';
import { Track, DownloadedTrack, RepeatMode } from '../types/music';
import { getAllDownloadedTracks } from '../services/db';

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOfflinePlaying, setIsOfflinePlaying] = useState<boolean>(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null); // minutes
  const [sleepTimerEndTime, setSleepTimerEndTime] = useState<number | null>(null);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
      setIsLoading(false);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    const handleEnded = () => {
      // Repeat one
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
        return;
      }
      // Otherwise play next in queue
      playNext();
    };

    const handleError = () => {
      // Ignore if element is unloaded or has no valid src
      if (!audio.getAttribute('src')) return;
      setIsLoading(false);
      setIsPlaying(false);
      console.warn('Audio playback error occurred.');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeAttribute('src');
      audio.load();
    };
  }, []);

  // Sync MediaSession for mobile lockscreen controls
  useEffect(() => {
    if (!currentTrack || typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
      return;
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: currentTrack.album || 'نغمات ميكس',
      artwork: [
        { src: currentTrack.coverUrl, sizes: '512x512', type: 'image/jpeg' }
      ]
    });

    navigator.mediaSession.setActionHandler('play', () => {
      audioRef.current?.play().catch(console.error);
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      audioRef.current?.pause();
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      playPrevious();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      playNext();
    });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined && audioRef.current) {
        audioRef.current.currentTime = details.seekTime;
      }
    });
  }, [currentTrack]);


  // Sleep Timer countdown handler
  useEffect(() => {
    if (!sleepTimerEndTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= sleepTimerEndTime) {
        audioRef.current?.pause();
        setIsPlaying(false);
        setSleepTimer(null);
        setSleepTimerEndTime(null);
        clearInterval(interval);
      } else {
        const remainingMinutes = Math.ceil((sleepTimerEndTime - now) / 60000);
        setSleepTimer(remainingMinutes);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerEndTime]);

  const setTimer = (minutes: number | null) => {
    if (!minutes) {
      setSleepTimer(null);
      setSleepTimerEndTime(null);
      return;
    }
    const endTime = Date.now() + minutes * 60 * 1000;
    setSleepTimer(minutes);
    setSleepTimerEndTime(endTime);
  };

  // Play track with smart local cache inspection
  const playTrack = useCallback(async (track: Track, newQueue?: Track[]) => {
    setIsLoading(true);

    if (newQueue) {
      setQueue(newQueue);
      const idx = newQueue.findIndex(t => t.id === track.id);
      setQueueIndex(idx !== -1 ? idx : 0);
    }

    // Is this a YouTube track?
    const isYT = track.source === 'youtube' || Boolean(track.youtubeId);

    if (isYT) {
      // Pause HTML5 audio if it was running cleanly
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
      }
      setIsOfflinePlaying(false);
      setCurrentTrack(track);
      setDuration(track.duration || 210);
      setCurrentTime(0);
      setIsPlaying(true);
      setIsLoading(false);
      return;
    }

    // Check if song is downloaded offline in IndexedDB
    let playbackSource = track.streamUrl;
    let isLocal = false;

    // Check if the track has a localAudioUrl already attached
    if ((track as DownloadedTrack).localAudioUrl) {
      playbackSource = (track as DownloadedTrack).localAudioUrl!;
      isLocal = true;
    } else {
      // Query offline library in IndexedDB
      try {
        const downloaded = await getAllDownloadedTracks();
        const found = downloaded.find(d => d.id === track.id);
        if (found && found.localAudioUrl) {
          playbackSource = found.localAudioUrl;
          isLocal = true;
        }
      } catch (err) {
        console.warn('Could not query offline DB:', err);
      }
    }

    // If external online audio, proxy it through /api/proxy-audio to guarantee valid CORS and audio/mpeg headers
    let effectiveUrl = playbackSource;
    if (!isLocal && effectiveUrl && !effectiveUrl.startsWith('/api/') && !effectiveUrl.startsWith('blob:')) {
      effectiveUrl = `/api/proxy-audio?url=${encodeURIComponent(effectiveUrl)}`;
    }

    setIsOfflinePlaying(isLocal);
    setCurrentTrack(track);

    if (audioRef.current && effectiveUrl) {
      audioRef.current.src = effectiveUrl;
      audioRef.current.load();

      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setIsLoading(false);
      }).catch(err => {
        console.warn('Auto-play error or stream interrupted:', err);
        setIsLoading(false);
      });
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!currentTrack) return;
    const isYT = currentTrack.source === 'youtube' || Boolean(currentTrack.youtubeId);
    
    if (isYT) {
      setIsPlaying(prev => !prev);
      return;
    }

    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  }, [isPlaying, currentTrack]);

  const seek = useCallback((timeInSeconds: number) => {
    const isYT = currentTrack?.source === 'youtube' || Boolean(currentTrack?.youtubeId);
    setCurrentTime(timeInSeconds);

    if (!isYT && audioRef.current) {
      audioRef.current.currentTime = timeInSeconds;
    }
  }, [currentTrack]);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;

    let nextIndex = queueIndex + 1;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        return; // Stopped at end of queue
      }
    }

    const nextTrack = queue[nextIndex];
    if (nextTrack) {
      setQueueIndex(nextIndex);
      playTrack(nextTrack);
    }
  }, [queue, queueIndex, isShuffle, repeatMode, playTrack]);

  const playPrevious = useCallback(() => {
    if (!audioRef.current || queue.length === 0) return;

    // If current time > 3 seconds, rewind to start first
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }

    const prevTrack = queue[prevIndex];
    if (prevTrack) {
      setQueueIndex(prevIndex);
      playTrack(prevTrack);
    }
  }, [queue, queueIndex, playTrack]);

  // YouTube playback progress handler
  useEffect(() => {
    const isYT = currentTrack?.source === 'youtube' || Boolean(currentTrack?.youtubeId);
    if (!isYT || !isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        if (duration > 0 && prev >= duration) {
          playNext();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTrack, isPlaying, duration, playNext]);

  const setVolume = useCallback((newVolume: number) => {
    if (!audioRef.current) return;
    const clamped = Math.max(0, Math.min(1, newVolume));
    audioRef.current.volume = clamped;
    setVolumeState(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
      audioRef.current.muted = false;
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  }, [isMuted]);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  return {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration: duration || currentTrack?.duration || 0,
    volume,
    isMuted,
    repeatMode,
    isShuffle,
    queue,
    queueIndex,
    isOfflinePlaying,
    sleepTimer,
    playTrack,
    togglePlay,
    seek,
    playNext,
    playPrevious,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    setTimer
  };
}
