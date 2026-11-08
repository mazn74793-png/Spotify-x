import { useState, useEffect, useRef, useCallback } from 'react';
import { Track, DownloadedTrack, RepeatMode } from '../types/music';
import { getAllDownloadedTracks, cleanMusicQuery } from '../services/db';
import { addListeningTime, getUserProfile, subscribeUserProfile } from '../services/authService';

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const trebleFilterRef = useRef<BiquadFilterNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

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
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [sleepTimerEndTime, setSleepTimerEndTime] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState(getUserProfile());

  // Listen to profile updates (e.g. equalizer preset, background playback toggle)
  useEffect(() => {
    return subscribeUserProfile((updated) => {
      setUserProfile(updated);
    });
  }, []);

  // Update Web Audio equalizer filters based on profile preset
  useEffect(() => {
    if (!bassFilterRef.current || !trebleFilterRef.current) return;
    const preset = userProfile.equalizerPreset || 'tarab';

    switch (preset) {
      case 'bass':
        bassFilterRef.current.gain.value = 7;
        trebleFilterRef.current.gain.value = -1;
        break;
      case 'tarab':
        bassFilterRef.current.gain.value = 3;
        trebleFilterRef.current.gain.value = 5;
        break;
      case 'vocal':
        bassFilterRef.current.gain.value = -2;
        trebleFilterRef.current.gain.value = 6;
        break;
      case 'relax':
        bassFilterRef.current.gain.value = 2;
        trebleFilterRef.current.gain.value = -3;
        break;
      case 'balanced':
      default:
        bassFilterRef.current.gain.value = 0;
        trebleFilterRef.current.gain.value = 0;
        break;
    }
  }, [userProfile.equalizerPreset]);

  // Track listening minutes while playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      addListeningTime(1);
    }, 60000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Request WakeLock while playing to prevent mobile screen sleep during active playback
  useEffect(() => {
    let wakeLockSentinel: any = null;
    if (isPlaying && typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      (navigator as any).wakeLock.request('screen')
        .then((sentinel: any) => {
          wakeLockSentinel = sentinel;
        })
        .catch(() => {
          // Silently ignore if power saving prevents wake lock
        });
    }
    return () => {
      wakeLockSentinel?.release?.().catch(() => {});
    };
  }, [isPlaying]);

  // Initialize HTML5 Audio element and Web Audio API
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    (audio as any).playsInline = true;
    audioRef.current = audio;

    // Attach Web Audio equalizer (when supported)
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const bass = ctx.createBiquadFilter();
        bass.type = 'lowshelf';
        bass.frequency.value = 250;
        bass.gain.value = 3;
        bassFilterRef.current = bass;

        const treble = ctx.createBiquadFilter();
        treble.type = 'highshelf';
        treble.frequency.value = 3500;
        treble.gain.value = 4;
        trebleFilterRef.current = treble;

        // Note: createMediaElementSource will be hooked on first play
      }
    } catch {
      // Ignore if Web Audio is restricted
    }

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
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
        return;
      }
      playNext();
    };

    const handleError = () => {
      const src = audio.getAttribute('src');
      if (!src) return;
      if (src.includes('/api/proxy-audio')) {
        const match = src.match(/url=([^&]+)/);
        if (match && match[1]) {
          const directUrl = decodeURIComponent(match[1]);
          console.warn('Proxy audio error, switching to direct URL:', directUrl);
          audio.src = directUrl;
          audio.load();
          audio.play().catch(() => {});
          return;
        }
      }
      setIsLoading(false);
      setIsPlaying(false);
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

  // Sync MediaSession for full lockscreen & background controls
  useEffect(() => {
    if (!currentTrack || typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
      return;
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: currentTrack.album || 'نغمات ميكس',
      artwork: [
        { src: currentTrack.coverUrl, sizes: '96x96', type: 'image/jpeg' },
        { src: currentTrack.coverUrl, sizes: '128x128', type: 'image/jpeg' },
        { src: currentTrack.coverUrl, sizes: '192x192', type: 'image/jpeg' },
        { src: currentTrack.coverUrl, sizes: '256x256', type: 'image/jpeg' },
        { src: currentTrack.coverUrl, sizes: '384x384', type: 'image/jpeg' },
        { src: currentTrack.coverUrl, sizes: '512x512', type: 'image/jpeg' }
      ]
    });

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    navigator.mediaSession.setActionHandler('play', () => {
      togglePlay();
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      togglePlay();
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      playPrevious();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      playNext();
    });
    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      const skip = details.seekOffset || 10;
      seek(Math.max(currentTime - skip, 0));
    });
    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      const skip = details.seekOffset || 10;
      seek(Math.min(currentTime + skip, duration || 300));
    });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        seek(details.seekTime);
      }
    });

    if ('setPositionState' in navigator.mediaSession && duration > 0) {
      try {
        navigator.mediaSession.setPositionState({
          duration: Math.max(duration, 0),
          playbackRate: 1,
          position: Math.min(Math.max(currentTime, 0), duration)
        });
      } catch {
        // Ignore sync boundary warning
      }
    }
  }, [currentTrack, isPlaying, duration, currentTime]);

  // Timer countdown for sleep timer
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

  // Play track with background audio support and offline storage inspection
  const playTrack = useCallback(async (track: Track, newQueue?: Track[]) => {
    setIsLoading(true);

    if (newQueue) {
      setQueue(newQueue);
      const idx = newQueue.findIndex(t => t.id === track.id);
      setQueueIndex(idx !== -1 ? idx : 0);
    }

    const isYT = track.source === 'youtube' || Boolean(track.youtubeId);

    // Check if song is downloaded offline in IndexedDB
    let playbackSource = track.streamUrl;
    let isLocal = false;

    if ((track as DownloadedTrack).localAudioUrl) {
      playbackSource = (track as DownloadedTrack).localAudioUrl!;
      isLocal = true;
    } else {
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

    // 100% Full-Length Playback & Mobile Lockscreen Carrier
    // If the track has a real audio stream, play the real audio!
    // Only if the track has NO audio stream at all and is YouTube, use a silent carrier loop
    // so mobile browsers keep the lockscreen controls active while YouTube plays!
    const SILENT_CARRIER = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

    if (!playbackSource && isYT) {
      // Use silent background carrier only when track has NO direct audio stream
      playbackSource = SILENT_CARRIER;
    }

    let effectiveUrl = playbackSource;
    if (!isLocal && effectiveUrl && !effectiveUrl.startsWith('/api/') && !effectiveUrl.startsWith('blob:') && !effectiveUrl.startsWith('data:')) {
      effectiveUrl = `/api/proxy-audio?url=${encodeURIComponent(effectiveUrl)}`;
    }

    setIsOfflinePlaying(isLocal);
    setCurrentTrack(track);
    setDuration(track.duration || 210);
    setCurrentTime(0);

    if (audioRef.current && effectiveUrl) {
      audioRef.current.src = effectiveUrl;
      audioRef.current.loop = effectiveUrl === SILENT_CARRIER;
      audioRef.current.load();

      // Resume Web Audio Context if suspended
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }

      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setIsLoading(false);
      }).catch(err => {
        console.warn('Audio auto-play notice:', err);
        // Fallback: If proxy failed, try playing direct audio URL
        if (effectiveUrl.includes('/api/proxy-audio') && playbackSource && audioRef.current) {
          audioRef.current.src = playbackSource;
          audioRef.current.load();
          audioRef.current.play().catch(() => {});
        }
        setIsPlaying(true);
        setIsLoading(false);
      });
    } else {
      setIsPlaying(true);
      setIsLoading(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!currentTrack) return;
    const hasAudioSrc = Boolean(audioRef.current?.getAttribute('src'));

    if (isPlaying) {
      if (hasAudioSrc) {
        audioRef.current?.pause();
      }
      setIsPlaying(false);
    } else {
      if (hasAudioSrc) {
        audioRef.current?.play().catch(console.error);
      }
      setIsPlaying(true);
    }
  }, [isPlaying, currentTrack]);

  const seek = useCallback((timeInSeconds: number) => {
    setCurrentTime(timeInSeconds);
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.currentTime = timeInSeconds;
    }
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    const clamped = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : clamped;
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.volume = next ? 0 : volume;
      }
      return next;
    });
  }, [volume]);

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

  const playNext = useCallback(() => {
    if (queue.length === 0) return;

    if (isShuffle) {
      const nextIndex = Math.floor(Math.random() * queue.length);
      setQueueIndex(nextIndex);
      playTrack(queue[nextIndex]);
      return;
    }

    let nextIndex = queueIndex + 1;
    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    setQueueIndex(nextIndex);
    playTrack(queue[nextIndex]);
  }, [queue, queueIndex, isShuffle, repeatMode, playTrack]);

  const playPrevious = useCallback(() => {
    if (queue.length === 0) return;

    if (currentTime > 4 && audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }

    setQueueIndex(prevIndex);
    playTrack(queue[prevIndex]);
  }, [queue, queueIndex, currentTime, playTrack]);

  // Progression timer for YouTube/silent carrier tracks
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (audioRef.current && (!audioRef.current.src || audioRef.current.src.startsWith('data:'))) {
        setCurrentTime(prev => {
          if (duration > 0 && prev >= duration) {
            playNext();
            return 0;
          }
          return prev + 1;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, duration, playNext]);

  return {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffle,
    queue,
    queueIndex,
    isLoading,
    isOfflinePlaying,
    sleepTimer,
    setTimer,
    playTrack,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    playNext,
    playPrevious,
    userProfile
  };
}
