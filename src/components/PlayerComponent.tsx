import React, { useState, useEffect, useRef } from 'react';
import { Track, RepeatMode } from '../types/music';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Repeat1, 
  Shuffle, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Download, 
  Check, 
  HardDrive, 
  Loader2, 
  Moon, 
  ChevronDown,
  Tv,
  Headphones,
  BadgeCheck,
  RotateCcw,
  RotateCw,
  FileText,
  ListMusic,
  Sliders,
  Gauge,
  Trash2,
  Sparkles
} from 'lucide-react';
import { exportAudioToDevice } from '../services/db';
import { getTrackLyrics } from '../data/lyricsData';
import { saveUserProfile } from '../services/authService';
import { NEUTRAL_VINYL_COVER } from '../utils/artistPortraits';

interface PlayerComponentProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  isOfflinePlaying: boolean;
  sleepTimer: number | null;
  downloadedIds: Set<string>;
  downloadingIds: Map<string, number>;
  playbackRate?: number;
  onSetPlaybackRate?: (rate: number) => void;
  onJumpForward?: (seconds?: number) => void;
  onJumpBackward?: (seconds?: number) => void;
  queue?: Track[];
  queueIndex?: number;
  onPlayQueueIndex?: (index: number) => void;
  onRemoveFromQueue?: (index: number) => void;
  userProfile?: any;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSetVolume: (vol: number) => void;
  onToggleMute: () => void;
  onToggleRepeat: () => void;
  onToggleShuffle: () => void;
  onDownloadTrack: (track: Track) => void;
  onSetSleepTimer: (minutes: number | null) => void;
  onOpenArtist?: (artistId: string) => void;
}

const FALLBACK_COVER = NEUTRAL_VINYL_COVER;
const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const EQUALIZER_PRESETS = [
  { id: 'tarab', name: 'طرب أصيل', desc: 'تعزيز الآلات الشرقية والوتريات' },
  { id: 'bass', name: 'باس عميق', desc: 'تضخيم الترددات المنخفضة والإيقاع' },
  { id: 'vocal', name: 'صوت نقي', desc: 'إبراز صوت المغني بدقة عالية' },
  { id: 'balanced', name: 'متوازن استوديو', desc: 'نقاء وتوازن حيادي' }
];

export const PlayerComponent: React.FC<PlayerComponentProps> = ({
  currentTrack,
  isPlaying,
  isLoading,
  currentTime,
  duration,
  volume,
  isMuted,
  repeatMode,
  isShuffle,
  isOfflinePlaying,
  sleepTimer,
  downloadedIds,
  downloadingIds,
  playbackRate = 1,
  onSetPlaybackRate,
  onJumpForward,
  onJumpBackward,
  queue = [],
  queueIndex = 0,
  onPlayQueueIndex,
  onRemoveFromQueue,
  userProfile,
  onTogglePlay,
  onSeek,
  onNext,
  onPrevious,
  onSetVolume,
  onToggleMute,
  onToggleRepeat,
  onToggleShuffle,
  onDownloadTrack,
  onSetSleepTimer,
  onOpenArtist,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [playerViewMode, setPlayerViewMode] = useState<'theater' | 'audio' | 'lyrics' | 'queue'>('audio');
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showEqMenu, setShowEqMenu] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [resolvedYtId, setResolvedYtId] = useState<string | null>(null);

  const ytIframeRef = useRef<HTMLIFrameElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const isYouTube = Boolean(currentTrack?.source === 'youtube' || currentTrack?.youtubeId);

  // Check if track has native direct audio stream
  const hasDirectAudio = Boolean(
    isOfflinePlaying ||
    (currentTrack?.streamUrl &&
     !currentTrack.streamUrl.includes('youtube.com/watch') &&
     !currentTrack.streamUrl.includes('youtu.be/') &&
     (currentTrack.streamUrl.includes('/stream') ||
      currentTrack.streamUrl.includes('archive.org') ||
      currentTrack.streamUrl.endsWith('.mp3') ||
      currentTrack.streamUrl.endsWith('.m4a') ||
      currentTrack.streamUrl.startsWith('blob:') ||
      currentTrack.streamUrl.startsWith('data:')))
  );

  // Dynamic YouTube ID resolver if track missing youtubeId
  useEffect(() => {
    setResolvedYtId(null);
    if (currentTrack && isYouTube && !currentTrack.youtubeId && !isOfflinePlaying) {
      let isMounted = true;
      fetch(`/api/resolve-youtube?q=${encodeURIComponent(`${currentTrack.title} ${currentTrack.artist}`)}`)
        .then(res => res.json())
        .then(data => {
          if (isMounted && data?.youtubeId) {
            currentTrack.youtubeId = data.youtubeId;
            setResolvedYtId(data.youtubeId);
          }
        })
        .catch(() => {});
      return () => { isMounted = false; };
    }
  }, [currentTrack?.id, isYouTube, isOfflinePlaying]);

  // Keep Audio view as default so user enjoys album art & soundwaves immediately
  useEffect(() => {
    setPlayerViewMode('audio');
  }, [currentTrack?.id]);

  // Sync play / pause state to YouTube iframe
  useEffect(() => {
    if (!isYouTube || !ytIframeRef.current) return;
    try {
      // When native direct audio is playing and user is not watching the theater video, pause the hidden YouTube iframe
      const shouldPlayYouTube = isPlaying && !isOfflinePlaying && (!hasDirectAudio || (isExpanded && playerViewMode === 'theater'));
      const command = shouldPlayYouTube ? 'playVideo' : 'pauseVideo';
      ytIframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: command, args: '' }),
        '*'
      );
    } catch {
      // Ignore cross-origin warnings
    }
  }, [isPlaying, isYouTube, isOfflinePlaying, hasDirectAudio, isExpanded, playerViewMode]);

  // When theater video mode is activated, sync video scrubber with current audio time
  useEffect(() => {
    if (isYouTube && isExpanded && playerViewMode === 'theater' && ytIframeRef.current) {
      try {
        ytIframeRef.current.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'seekTo', args: [currentTime, true] }),
          '*'
        );
        ytIframeRef.current.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
          '*'
        );
      } catch {
        // Ignore
      }
    }
  }, [playerViewMode, isExpanded, isYouTube]);

  // Sync playback speed to YouTube iframe
  useEffect(() => {
    if (!isYouTube || !ytIframeRef.current) return;
    try {
      ytIframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: 'setPlaybackRate', args: [playbackRate] }),
        '*'
      );
    } catch {
      // Ignore
    }
  }, [playbackRate, isYouTube]);

  // Sync volume & mute to YouTube iframe
  useEffect(() => {
    if (!isYouTube || !ytIframeRef.current) return;
    try {
      // If direct audio is active natively via HTML5 audio, mute YouTube to prevent double audio
      if (hasDirectAudio || isMuted) {
        ytIframeRef.current.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'mute', args: '' }),
          '*'
        );
      } else {
        ytIframeRef.current.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'unMute', args: '' }),
          '*'
        );
        ytIframeRef.current.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'setVolume', args: [Math.round(volume * 100)] }),
          '*'
        );
      }
    } catch {
      // Ignore cross-origin warnings
    }
  }, [volume, isMuted, isYouTube, hasDirectAudio]);

  const effectiveDuration = duration > 0 ? duration : (currentTrack?.duration || 210);

  // Keep background music alive when user locks screen or leaves app ("لو طلعت برا")
  useEffect(() => {
    if (!isYouTube || isOfflinePlaying) return;

    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        // Tab was minimized or phone was locked - reinforce playback
        try {
          ytIframeRef.current?.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
            '*'
          );
        } catch {
          // Ignore
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying, isYouTube, isOfflinePlaying]);

  // Listen for YouTube player state changes (auto-advance & background lockscreen auto-resume)
  useEffect(() => {
    if (!isYouTube) return;

    const handleMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data && data.event === 'onStateChange') {
          // If YouTube paused itself because screen was turned off or tab minimized, auto-resume!
          if (data.info === 2 && isPlaying && document.hidden) {
            try {
              ytIframeRef.current?.contentWindow?.postMessage(
                JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
                '*'
              );
            } catch {
              // Ignore
            }
          } else if (data.info === 0) {
            // Song genuinely finished
            if (currentTime >= Math.max(30, effectiveDuration - 6)) {
              if (repeatMode === 'one') {
                handleSeek(0);
              } else {
                onNext();
              }
            }
          }
        }
      } catch {
        // Ignore non-json messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isYouTube, onNext, currentTime, repeatMode, effectiveDuration, isPlaying]);

  if (!currentTrack) return null;

  const isDownloaded = downloadedIds.has(currentTrack.id);
  const downloadProgress = downloadingIds.get(currentTrack.id);
  const isDownloading = downloadProgress !== undefined;

  const handleSeek = (seconds: number) => {
    onSeek(seconds);
    if (isYouTube && ytIframeRef.current) {
      try {
        ytIframeRef.current.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'seekTo', args: [seconds, true] }),
          '*'
        );
      } catch {
        // Ignore
      }
    }
  };

  const handleJumpBack = () => {
    if (onJumpBackward) {
      onJumpBackward(10);
    } else {
      handleSeek(Math.max(currentTime - 10, 0));
    }
    if (isYouTube && ytIframeRef.current) {
      try {
        ytIframeRef.current.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'seekTo', args: [Math.max(currentTime - 10, 0), true] }),
          '*'
        );
      } catch {
        // Ignore
      }
    }
  };

  const handleJumpForward = () => {
    if (onJumpForward) {
      onJumpForward(10);
    } else {
      handleSeek(Math.min(currentTime + 10, effectiveDuration));
    }
    if (isYouTube && ytIframeRef.current) {
      try {
        ytIframeRef.current.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'seekTo', args: [Math.min(currentTime + 10, effectiveDuration), true] }),
          '*'
        );
      } catch {
        // Ignore
      }
    }
  };

  const handleSpeedSelect = (rate: number) => {
    onSetPlaybackRate?.(rate);
    setShowSpeedMenu(false);
  };

  const handleEqSelect = (presetId: string) => {
    saveUserProfile({ equalizerPreset: presetId as any });
    setShowEqMenu(false);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;
  const activeYtId = currentTrack.youtubeId || resolvedYtId;

  // Iframe Source: embed with authentic full video ID
  const iframeSrc = activeYtId
    ? `https://www.youtube-nocookie.com/embed/${activeYtId}?autoplay=1&enablejsapi=1&origin=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}&controls=1&rel=0&playsinline=1`
    : '';

  const lyricsLines = getTrackLyrics(currentTrack.title, currentTrack.artist, currentTrack.id);
  const activeLyricIndex = Math.min(
    Math.floor((currentTime / Math.max(effectiveDuration, 1)) * lyricsLines.length),
    lyricsLines.length - 1
  );

  return (
    <>
      {/* 
        Persistent Mounted YouTube Player Engine:
        Crucial for instant playback and background continuity.
        Must NEVER be unmounted or given opacity-0, so audio starts immediately
        the moment any track is selected, even from the mini player docked bar.
      */}
      {activeYtId && !isOfflinePlaying && (
        <div 
          className={
            isExpanded && playerViewMode === 'theater'
              ? 'fixed z-[52] left-1/2 top-[32%] -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-2xl aspect-video rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 transition-all duration-300'
              : 'fixed -top-[9999px] left-0 w-[320px] h-[240px] pointer-events-none z-[-1]'
          }
        >
          {iframeSrc ? (
            <iframe
              ref={ytIframeRef}
              key={activeYtId}
              src={iframeSrc}
              title={currentTrack.title}
              className="w-full h-full border-0 rounded-3xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : null}
        </div>
      )}

      {/* 
        ========================================================================
        1. DOCKED MINI-PLAYER BAR (LUXURIOUS SPOTIFY / APPLE MUSIC AESTHETIC)
        - Cleanly docked above mobile navigation on phones, bottom of screen on desktop.
        - Rich playback controls (+10s, -10s, soundwave animation, mode peek).
        - Smooth scrubbing and zero layout shifts.
        ========================================================================
      */}
      <div 
        className="fixed bottom-[58px] md:bottom-0 inset-x-0 z-40 bg-[#181818]/95 backdrop-blur-2xl border-t border-white/10 select-none shadow-2xl transition-all"
      >
        {/* Top 2px Progress Bar with Smooth Scrubber */}
        <div 
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            handleSeek(clickPos * effectiveDuration);
          }}
          className="w-full h-1 bg-white/10 hover:h-2 cursor-pointer transition-all group"
        >
          <div 
            className="h-full bg-[#1ed760] transition-all relative"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          
          {/* Left: Track Artwork, Dynamic Soundwave & Info */}
          <div 
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial sm:w-72 cursor-pointer group"
          >
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shrink-0 shadow-md border border-white/10 bg-zinc-900">
              <img 
                src={currentTrack.coverUrl || FALLBACK_COVER} 
                alt={currentTrack.title}
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isPlaying ? 'scale-105' : 'group-hover:scale-105'
                }`}
                loading="eager"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
                  <span className="w-1 h-3 bg-[#1ed760] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-4 bg-[#1ed760] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-2 bg-[#1ed760] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-[#1ed760] transition-colors">
                {currentTrack.title}
              </h4>
              <p 
                onClick={(e) => {
                  if (onOpenArtist && currentTrack.artist) {
                    e.stopPropagation();
                    onOpenArtist(currentTrack.artistId || currentTrack.artist);
                  }
                }}
                className="text-[11px] text-zinc-400 truncate hover:underline hover:text-white cursor-pointer mt-0.5"
              >
                {currentTrack.artist}
              </p>
            </div>
          </div>

          {/* Center: Playback Controls Deck */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5 sm:gap-3">
              <button
                onClick={onToggleShuffle}
                title="تشغيل عشوائي"
                className={`p-1.5 rounded-full transition-colors hidden md:block ${
                  isShuffle ? 'text-[#1ed760]' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              {/* Rewind 10 Seconds */}
              <button
                onClick={handleJumpBack}
                title="ترجيع 10 ثواني"
                className="p-1.5 rounded-full text-zinc-400 hover:text-white active:scale-95 transition-all hidden xs:flex items-center justify-center"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={onPrevious}
                title="السابق"
                className="p-1.5 rounded-full text-zinc-300 hover:text-white active:scale-95 transition-all"
              >
                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </button>

              {/* Primary Green Play Button */}
              <button
                onClick={onTogglePlay}
                title={isPlaying ? 'إيقاف' : 'تشغيل'}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={onNext}
                title="التالي"
                className="p-1.5 rounded-full text-zinc-300 hover:text-white active:scale-95 transition-all"
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </button>

              {/* Forward 10 Seconds */}
              <button
                onClick={handleJumpForward}
                title="تقديم 10 ثواني"
                className="p-1.5 rounded-full text-zinc-400 hover:text-white active:scale-95 transition-all hidden xs:flex items-center justify-center"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <button
                onClick={onToggleRepeat}
                title={`تكرار: ${repeatMode}`}
                className={`p-1.5 rounded-full transition-colors hidden md:block ${
                  repeatMode !== 'off' ? 'text-[#1ed760]' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>
            </div>

            {/* Time Stamp (Desktop) */}
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(effectiveDuration)}</span>
            </div>
          </div>

          {/* Right: Actions, Mode Toggles, Volume & Expand */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Direct In-App Theater Video Preview Button */}
            {isYouTube && (
              <button
                onClick={() => {
                  setPlayerViewMode('theater');
                  setIsExpanded(true);
                }}
                title="مشاهدة فيديو كليب الأغنية بدقة عالية"
                className="px-2.5 py-1 rounded-full bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 flex items-center gap-1 text-xs font-bold transition-all active:scale-95"
              >
                <Tv className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">فيديو</span>
              </button>
            )}

            {/* Quick Lyrics Button */}
            <button
              onClick={() => {
                setPlayerViewMode('lyrics');
                setIsExpanded(true);
              }}
              title="عرض كلمات الأغنية"
              className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-colors hidden sm:block"
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* Quick Queue Button */}
            <button
              onClick={() => {
                setPlayerViewMode('queue');
                setIsExpanded(true);
              }}
              title="قائمة التشغيل والتالي"
              className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-colors hidden sm:block relative"
            >
              <ListMusic className="w-4 h-4" />
              {queue.length > 1 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#1ed760]" />
              )}
            </button>

            {/* Download Button */}
            <button
              onClick={() => onDownloadTrack(currentTrack)}
              disabled={isDownloading}
              title={isDownloaded ? 'محملة في المكتبة الأوفلاين' : 'تحميل للاستماع بدون إنترنت'}
              className={`p-2 rounded-full transition-colors active:scale-95 ${
                isDownloaded 
                  ? 'text-[#1ed760] bg-[#1ed760]/10' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {isDownloading ? (
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{downloadProgress}%</span>
                </div>
              ) : isDownloaded ? (
                <Check className="w-4 h-4 text-[#1ed760]" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>

            {/* Volume Control (Desktop) */}
            <div className="hidden lg:flex items-center gap-1.5 pl-2">
              <button 
                onClick={onToggleMute}
                className="text-zinc-400 hover:text-white transition-colors"
                title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => onSetVolume(parseFloat(e.target.value))}
                className="w-20 h-1 bg-white/20 accent-[#1ed760] rounded-lg cursor-pointer"
              />
            </div>

            {/* Expand Fullscreen Button */}
            <button
              onClick={() => setIsExpanded(true)}
              title="تكبير المشغل والشاشة الكاملة"
              className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        2. FULL-SCREEN EXPANDED PLAYER MODAL (PERSISTENT MOUNTED DOM)
        - Seamless zero-reload slide transition so playback never stops.
        - Segmented Multi-Mode Switcher: [صوت | فيديو | كلمات | التالي].
        - Speed Control (0.75x, 1x, 1.25x, 1.5x, 2x).
        - Equalizer Preset Selector with Web Audio updates.
        - +10s / -10s Quick Jump and Scrubber.
        ========================================================================
      */}
      <div 
        className={`fixed inset-0 z-50 bg-[#121212]/98 backdrop-blur-3xl flex flex-col justify-between p-4 sm:p-8 transition-all duration-300 overflow-y-auto ${
          isExpanded 
            ? 'translate-y-0 opacity-100 pointer-events-auto' 
            : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        {/* Top Bar: Collapse, Title & Segmented Multi-Mode Bar */}
        <div className="relative z-[55] flex items-center justify-between gap-4 max-w-3xl mx-auto w-full pt-2">
          <button
            onClick={() => setIsExpanded(false)}
            className="p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="تصغير المشغل"
          >
            <ChevronDown className="w-6 h-6" />
          </button>

          <div className="text-center min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              {isOfflinePlaying ? 'تشغيل أوفلاين' : 'يتم التشغيل الآن'}
            </p>
            <p className="text-xs font-semibold text-white truncate max-w-[180px] sm:max-w-xs mt-0.5">
              {currentTrack.album || 'نغمات ميكس'}
            </p>
          </div>

          {/* Segmented Mode Switcher (Audio / Video / Lyrics / Queue) */}
          <div className="flex items-center bg-[#202020] p-1 rounded-full border border-white/10 text-xs shrink-0">
            <button
              onClick={() => setPlayerViewMode('audio')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all ${
                playerViewMode === 'audio' ? 'bg-[#1ed760] text-black shadow' : 'text-zinc-400 hover:text-white'
              }`}
              title="وضع الصوت واستعراض الغلاف والذبذبات"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">صوت</span>
            </button>

            {isYouTube && (
              <button
                onClick={() => setPlayerViewMode('theater')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all ${
                  playerViewMode === 'theater' ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-white'
                }`}
                title="مشاهدة فيديو كليب الأغنية"
              >
                <Tv className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">فيديو</span>
              </button>
            )}

            <button
              onClick={() => setPlayerViewMode('lyrics')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all ${
                playerViewMode === 'lyrics' ? 'bg-amber-400 text-black shadow' : 'text-zinc-400 hover:text-white'
              }`}
              title="عرض كلمات الأغنية"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">كلمات</span>
            </button>

            <button
              onClick={() => setPlayerViewMode('queue')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all ${
                playerViewMode === 'queue' ? 'bg-indigo-500 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
              title="قائمة التشغيل والتالي"
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">التالي ({queue.length})</span>
            </button>
          </div>
        </div>

        {/* Middle Stage: Dynamically Swapped based on playerViewMode */}
        <div className={`my-auto py-3 sm:py-6 flex flex-col items-center justify-center mx-auto w-full transition-all duration-300 ${
          playerViewMode === 'theater' ? 'max-w-3xl' : 'max-w-lg'
        }`}>
          
          {/* Stage Container */}
          <div className={`relative w-full rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 bg-black flex items-center justify-center ${
            playerViewMode === 'theater' 
              ? 'aspect-video border-2 border-white/20 shadow-green-500/10' 
              : 'aspect-square max-w-sm sm:max-w-md border border-white/10'
          }`}>
            
            {/* View 1: YouTube Theater Stage Backdrop (Active video iframe mounts at z-[60] directly above) */}
            {isYouTube && playerViewMode === 'theater' && (
              <div className="absolute inset-0 w-full h-full bg-black rounded-3xl flex flex-col items-center justify-center text-white gap-3 p-4">
                <Loader2 className="w-8 h-8 animate-spin text-[#1ed760]" />
                <p className="text-sm font-bold">جارٍ عرض الفيديو الرسمي...</p>
                <p className="text-xs text-zinc-400">{currentTrack.title} - {currentTrack.artist}</p>
              </div>
            )}

            {/* View 2: Audio Artwork with Dynamic Audio Equalizer Bars */}
            <div 
              className={`relative w-full h-full transition-opacity duration-200 ${
                playerViewMode === 'audio' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none -z-10'
              }`}
            >
              <img 
                src={currentTrack.coverUrl || FALLBACK_COVER} 
                alt={currentTrack.title}
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? 'scale-105' : ''
                }`}
              />
              
              {/* Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              {/* Dynamic Equalizer Visualizer Soundwave Bars */}
              <div className="absolute bottom-12 inset-x-6 flex items-end justify-center gap-1.5 h-14 pointer-events-none">
                {[40, 75, 55, 90, 60, 85, 45, 95, 70, 80, 50, 90, 65, 85, 55, 75, 45, 80].map((baseHeight, idx) => (
                  <span 
                    key={idx}
                    className="w-1.5 bg-[#1ed760] rounded-full transition-all duration-150"
                    style={{
                      height: isPlaying ? `${Math.max(12, (baseHeight * (0.4 + (idx % 3) * 0.3)))}%` : '6px',
                      opacity: isPlaying ? 0.9 : 0.3,
                      animation: isPlaying ? `soundwave-pulse ${0.4 + (idx % 5) * 0.15}s ease-in-out infinite alternate` : 'none'
                    }}
                  />
                ))}
              </div>

              {/* Quality & Equalizer Tag */}
              <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-bold text-zinc-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1ed760] animate-ping" />
                <span>320 KBPS استوديو نقي</span>
              </div>
            </div>

            {/* View 3: Live Arabic Lyrics Display */}
            <div 
              ref={lyricsContainerRef}
              className={`absolute inset-0 w-full h-full p-6 sm:p-8 bg-gradient-to-b from-[#181818]/95 to-[#101010]/95 flex flex-col justify-center text-center transition-opacity duration-200 overflow-y-auto ${
                playerViewMode === 'lyrics' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 pointer-events-none -z-10'
              }`}
            >
              <div className="space-y-4 max-w-sm mx-auto">
                <p className="text-xs uppercase tracking-widest text-[#1ed760] font-bold">
                  كلمات الأغنية الرسمية
                </p>
                {lyricsLines.map((line, idx) => (
                  <p 
                    key={idx}
                    className={`text-base sm:text-lg font-bold transition-all duration-300 leading-relaxed ${
                      idx === activeLyricIndex 
                        ? 'text-white text-xl sm:text-2xl font-black scale-105 drop-shadow-[0_0_12px_rgba(30,215,96,0.5)]' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>

            {/* View 4: Up Next Queue Drawer */}
            <div 
              className={`absolute inset-0 w-full h-full p-4 sm:p-6 bg-gradient-to-b from-[#181818] to-[#121212] flex flex-col transition-opacity duration-200 overflow-y-auto ${
                playerViewMode === 'queue' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 pointer-events-none -z-10'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <ListMusic className="w-4 h-4 text-[#1ed760]" />
                  <span>قائمة التشغيل والتالي ({queue.length})</span>
                </h3>
                <span className="text-xs text-zinc-400">
                  المسار {queueIndex + 1} من {queue.length || 1}
                </span>
              </div>

              {queue.length === 0 ? (
                <div className="my-auto text-center text-zinc-400 text-xs">
                  لا توجد مسارات إضافية في قائمة الانتظار
                </div>
              ) : (
                <div className="space-y-1 overflow-y-auto flex-1 pr-1">
                  {queue.map((track, idx) => (
                    <div 
                      key={`${track.id}-${idx}`}
                      onClick={() => onPlayQueueIndex?.(idx)}
                      className={`flex items-center justify-between gap-3 p-2 rounded-xl cursor-pointer transition-colors ${
                        idx === queueIndex 
                          ? 'bg-[#1ed760]/15 text-[#1ed760] border border-[#1ed760]/30' 
                          : 'hover:bg-white/5 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs font-mono w-5 text-zinc-500 shrink-0">
                          {idx + 1}
                        </span>
                        <img 
                          src={track.coverUrl || FALLBACK_COVER} 
                          alt={track.title} 
                          className="w-9 h-9 rounded-lg object-cover shrink-0 bg-zinc-800"
                        />
                        <div className="min-w-0 text-right">
                          <p className="text-xs font-bold truncate text-white">
                            {track.title}
                          </p>
                          <p className="text-[11px] text-zinc-400 truncate">
                            {track.artist}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono text-zinc-500">
                          {formatTime(track.duration)}
                        </span>
                        {onRemoveFromQueue && idx !== queueIndex && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveFromQueue(idx);
                            }}
                            className="p-1 hover:text-red-400 text-zinc-500 transition-colors"
                            title="إزالة من القائمة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Song Meta Information */}
          <div className="relative z-[55] w-full mt-5 text-right space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white truncate">
              {currentTrack.title}
            </h2>
            <div className="flex items-center justify-between">
              <p 
                onClick={() => {
                  if (onOpenArtist && currentTrack.artist) {
                    setIsExpanded(false);
                    onOpenArtist(currentTrack.artistId || currentTrack.artist);
                  }
                }}
                className="text-sm sm:text-base text-zinc-400 font-medium hover:underline hover:text-white cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>{currentTrack.artist}</span>
                <BadgeCheck className="w-4 h-4 text-[#1ed760]" />
              </p>

              <button
                onClick={() => onDownloadTrack(currentTrack)}
                disabled={isDownloading}
                className={`p-2 rounded-full border transition-colors ${
                  isDownloaded
                    ? 'bg-[#1ed760]/15 border-[#1ed760] text-[#1ed760]'
                    : 'border-white/10 text-zinc-400 hover:text-white'
                }`}
                title={isDownloaded ? 'محملة في المكتبة' : 'تحميل أوفلاين'}
              >
                {isDownloading ? (
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                    <Loader2 className="w-4 h-4 animate-spin text-[#1ed760]" />
                    <span>{downloadProgress}%</span>
                  </div>
                ) : isDownloaded ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Scrubber Progress Bar */}
          <div className="w-full mt-5 space-y-1.5">
            <input 
              type="range"
              min="0"
              max={effectiveDuration}
              step="1"
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/15 accent-[#1ed760] rounded-lg cursor-pointer transition-all"
            />
            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(effectiveDuration)}</span>
            </div>
          </div>

          {/* Main Primary Controls Deck (+10s, -10s, Shuffle, Repeat) */}
          <div className="flex items-center justify-between w-full max-w-sm mt-5">
            <button
              onClick={onToggleShuffle}
              title="تشغيل عشوائي"
              className={`p-2 rounded-full transition-colors ${
                isShuffle ? 'text-[#1ed760]' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Shuffle className="w-5 h-5" />
            </button>

            {/* Rewind 10 Seconds */}
            <button
              onClick={handleJumpBack}
              title="ترجيع 10 ثواني"
              className="p-2.5 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center relative group"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="absolute -bottom-3 text-[9px] font-bold text-zinc-400 font-mono">10-</span>
            </button>

            <button
              onClick={onPrevious}
              title="السابق"
              className="p-3 rounded-full text-white hover:bg-white/10 transition-colors active:scale-95"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>

            {/* Giant Emerald Play/Pause Button */}
            <button
              onClick={onTogglePlay}
              title={isPlaying ? 'إيقاف' : 'تشغيل'}
              className="w-16 h-16 rounded-full bg-[#1ed760] text-black hover:bg-emerald-400 flex items-center justify-center shadow-2xl shadow-green-500/25 hover:scale-105 active:scale-95 transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-7 h-7 fill-current" />
              ) : (
                <Play className="w-7 h-7 fill-current ml-1" />
              )}
            </button>

            <button
              onClick={onNext}
              title="التالي"
              className="p-3 rounded-full text-white hover:bg-white/10 transition-colors active:scale-95"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>

            {/* Fast Forward 10 Seconds */}
            <button
              onClick={handleJumpForward}
              title="تقديم 10 ثواني"
              className="p-2.5 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center relative group"
            >
              <RotateCw className="w-5 h-5" />
              <span className="absolute -bottom-3 text-[9px] font-bold text-zinc-400 font-mono">10+</span>
            </button>

            <button
              onClick={onToggleRepeat}
              title={`تكرار: ${repeatMode}`}
              className={`p-2 rounded-full transition-colors ${
                repeatMode !== 'off' ? 'text-[#1ed760]' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Bottom Audio Settings Bar (Speed, Equalizer, Sleep, Export) */}
        <div className="max-w-xl mx-auto w-full flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 text-xs text-zinc-400">
          
          {/* Playback Speed Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSpeedMenu(!showSpeedMenu);
                setShowEqMenu(false);
                setShowSleepMenu(false);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/5"
              title="سرعة التشغيل"
            >
              <Gauge className="w-3.5 h-3.5 text-[#1ed760]" />
              <span>{playbackRate}x</span>
            </button>

            {showSpeedMenu && (
              <div className="absolute bottom-9 right-0 bg-[#242424] border border-white/10 rounded-2xl p-1.5 shadow-2xl min-w-[110px] space-y-1 z-50">
                {PLAYBACK_SPEEDS.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleSpeedSelect(rate)}
                    className={`w-full text-right px-3 py-1 rounded-xl text-xs transition-colors ${
                      playbackRate === rate ? 'bg-[#1ed760] text-black font-bold' : 'hover:bg-white/10 text-white'
                    }`}
                  >
                    {rate}x {rate === 1 ? '(عادي)' : ''}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Equalizer Presets Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setShowEqMenu(!showEqMenu);
                setShowSpeedMenu(false);
                setShowSleepMenu(false);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/5"
              title="معادل الصوت والاستوديو"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>معادل الصوت</span>
            </button>

            {showEqMenu && (
              <div className="absolute bottom-9 left-1/2 -translate-x-1/2 bg-[#242424] border border-white/10 rounded-2xl p-2 shadow-2xl min-w-[180px] space-y-1.5 z-50">
                <p className="text-[10px] font-bold text-zinc-400 px-2 uppercase">أوضاع الصوت المسبقة</p>
                {EQUALIZER_PRESETS.map((preset) => {
                  const activePreset = userProfile?.equalizerPreset || 'tarab';
                  const isActive = activePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleEqSelect(preset.id)}
                      className={`w-full text-right px-3 py-1.5 rounded-xl text-xs transition-all flex flex-col ${
                        isActive ? 'bg-[#1ed760] text-black font-bold' : 'hover:bg-white/10 text-white'
                      }`}
                    >
                      <span>{preset.name}</span>
                      <span className={`text-[10px] ${isActive ? 'text-black/80' : 'text-zinc-400'}`}>
                        {preset.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sleep Timer */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSleepMenu(!showSleepMenu);
                setShowSpeedMenu(false);
                setShowEqMenu(false);
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/5 ${
                sleepTimer ? 'text-amber-400 border-amber-500/30' : ''
              }`}
              title="مؤقت إيقاف التشغيل التلقائي"
            >
              <Moon className="w-3.5 h-3.5 text-amber-400" />
              <span>{sleepTimer ? `${sleepTimer} دقيقة` : 'مؤقت النوم'}</span>
            </button>

            {showSleepMenu && (
              <div className="absolute bottom-9 left-1/2 -translate-x-1/2 bg-[#242424] border border-white/10 rounded-2xl p-2 shadow-2xl min-w-[130px] space-y-1 z-50">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      onSetSleepTimer(mins);
                      setShowSleepMenu(false);
                    }}
                    className="w-full text-right px-3 py-1.5 rounded-xl text-xs hover:bg-white/10 text-white"
                  >
                    {mins} دقيقة
                  </button>
                ))}
                {sleepTimer && (
                  <button
                    onClick={() => {
                      onSetSleepTimer(null);
                      setShowSleepMenu(false);
                    }}
                    className="w-full text-right px-3 py-1.5 rounded-xl text-xs text-red-400 hover:bg-red-950/40"
                  >
                    إلغاء المؤقت
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Export Device MP3 */}
          <button
            onClick={() => exportAudioToDevice(currentTrack)}
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            title="تصدير كملف صوتي MP3 لجهازك"
          >
            <HardDrive className="w-3.5 h-3.5 text-[#1ed760]" />
            <span>تصدير MP3</span>
          </button>
        </div>
      </div>
    </>
  );
};
