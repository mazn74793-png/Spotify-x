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
      const src = audio.getAttribute('src') || '';
      // Only sync currentTime from HTML5 audio for real audio files, not silent carrier
      if (src.startsWith('data:')) return;
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      const src = audio.getAttribute('src') || '';
      // NEVER overwrite track duration with a silent carrier duration
      if (src.startsWith('data:')) {
        setIsLoading(false);
        return;
      }
      // Strictly guard: Only overwrite duration if audio file is genuinely full-length (> 50s)
      // Never allow a 30s preview snippet to shorten our 3-5 minute song!
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 50) {
        setDuration(audio.duration);
      }
      setIsLoading(false);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => {
      const src = audio.getAttribute('src') || '';
      if (!src.startsWith('data:')) {
        setIsPlaying(false);
      }
    };
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    const handleEnded = () => {
      const src = audio.getAttribute('src') || '';
      // If playing silent carrier for YouTube, simply loop it and DO NOT skip track!
      if (src.startsWith('data:')) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }

      // CRITICAL ANTI-SKIP GUARD: If audio ends under 45 seconds while track is supposed to be full-length,
      // it was an incomplete preview or abort — DO NOT auto-skip the song!
      if (audio.currentTime < 45 && duration > 60) {
        console.warn('Audio stream ended prematurely (under 45s); preventing false auto-skip.');
        return;
      }

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

    const activeTrack = { ...track };
    const isYT = activeTrack.source === 'youtube' || Boolean(activeTrack.youtubeId);

    // Check if song is downloaded offline in IndexedDB
    let playbackSource = activeTrack.streamUrl;
    let isLocal = false;

    if ((activeTrack as DownloadedTrack).localAudioUrl) {
      playbackSource = (activeTrack as DownloadedTrack).localAudioUrl!;
      isLocal = true;
    } else {
      try {
        const downloaded = await getAllDownloadedTracks();
        const found = downloaded.find(d => d.id === activeTrack.id);
        if (found && found.localAudioUrl) {
          playbackSource = found.localAudioUrl;
          isLocal = true;
        }
      } catch (err) {
        console.warn('Could not query offline DB:', err);
      }
    }

    // Dynamic Full-Length YouTube ID Resolver:
    // If a track is marked as YouTube but has no video ID yet, fetch the official YouTube ID dynamically
    if (isYT && !activeTrack.youtubeId && !isLocal) {
      (async () => {
        try {
          const res = await fetch(`/api/resolve-youtube?q=${encodeURIComponent(`${activeTrack.title} ${activeTrack.artist}`)}`);
          if (res.ok) {
            const data = await res.json();
            if (data?.youtubeId) {
              activeTrack.youtubeId = data.youtubeId;
              if (data.duration && data.duration > 60) {
                activeTrack.duration = data.duration;
                setDuration(data.duration);
              }
              setCurrentTrack({ ...activeTrack });
              return;
            }
          }
        } catch {
          // Fallback to search query
        }

        try {
          const searchRes = await fetch(`/api/search?q=${encodeURIComponent(`${activeTrack.title} ${activeTrack.artist}`)}&source=youtube`);
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            const yt = searchData?.results?.find((r: any) => r.youtubeId);
            if (yt?.youtubeId) {
              activeTrack.youtubeId = yt.youtubeId;
              if (yt.duration) {
                activeTrack.duration = yt.duration;
                setDuration(yt.duration);
              }
              setCurrentTrack({ ...activeTrack });
            }
          }
        } catch {
          // Ignore
        }
      })();
    }

    // 100% Single-Engine Authority: Guarantee NO double audio playback
    // When playing a YouTube track online (!isLocal), the YouTube player is the single audio source.
    // HTML5 <audio> plays SILENT_CARRIER to keep mobile lockscreen / background session active with zero sound.
    // When playing an offline downloaded file (isLocal) or direct MP3 (Audius/Catalog without YouTube), HTML5 <audio> plays the real stream.
    const SILENT_CARRIER = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

    if (isYT && !isLocal) {
      playbackSource = SILENT_CARRIER;
    }

    let effectiveUrl = playbackSource;
    if (!isLocal && effectiveUrl && !effectiveUrl.startsWith('/api/') && !effectiveUrl.startsWith('blob:') && !effectiveUrl.startsWith('data:')) {
      effectiveUrl = `/api/proxy-audio?url=${encodeURIComponent(effectiveUrl)}`;
    }

    setIsOfflinePlaying(isLocal);
    setCurrentTrack(activeTrack);
    setDuration(activeTrack.duration || 210);
    setCurrentTime(0);

    if (audioRef.current && effectiveUrl) {
      audioRef.current.src = effectiveUrl;
      audioRef.current.loop = effectiveUrl === SILENT_CARRIER;
      // When playing silent carrier, mute HTML5 audio to be 100% certain it emits zero noise
      if (effectiveUrl === SILENT_CARRIER) {
        audioRef.current.volume = 0;
      } else {
        audioRef.current.volume = isMuted ? 0 : volume;
      }
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

  // Progression timer for YouTube/silent carrier tracks (Never premature, full song length)
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (audioRef.current && (!audioRef.current.src || audioRef.current.src.startsWith('data:'))) {
        setCurrentTime(prev => {
          const effectiveDur = Math.max(duration || 0, (currentTrack?.duration || 0), 180);
          if (prev >= effectiveDur) {
            if (repeatMode === 'one') {
              return 0;
            }
            playNext();
            return 0;
          }
          return prev + 1;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, duration, currentTrack?.duration, repeatMode, playNext]);

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
