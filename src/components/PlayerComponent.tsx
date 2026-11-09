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
  BadgeCheck
} from 'lucide-react';
import { exportAudioToDevice } from '../services/db';

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

import { NEUTRAL_VINYL_COVER } from '../utils/artistPortraits';

const FALLBACK_COVER = NEUTRAL_VINYL_COVER;

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
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [videoMode, setVideoMode] = useState(false); // Default to Audio Mode for lockscreen & background play
  const [resolvedYtId, setResolvedYtId] = useState<string | null>(null);
  const ytIframeRef = useRef<HTMLIFrameElement | null>(null);
  const isYouTube = Boolean(currentTrack?.source === 'youtube' || currentTrack?.youtubeId);

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

  // Auto-switch mode: For YouTube tracks, enable video theater preview by default so user gets the in-app video experience
  useEffect(() => {
    if (isYouTube && !isOfflinePlaying) {
      setVideoMode(true);
    } else {
      setVideoMode(false);
    }
  }, [currentTrack?.id, isYouTube, isOfflinePlaying]);

  // Sync play / pause state to YouTube iframe
  useEffect(() => {
    if (!isYouTube || !ytIframeRef.current) return;
    try {
      const shouldPlayYouTube = isPlaying && !isOfflinePlaying;
      const command = shouldPlayYouTube ? 'playVideo' : 'pauseVideo';
      ytIframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: command, args: '' }),
        '*'
      );
    } catch {
      // Ignore cross-origin warnings
    }
  }, [isPlaying, isYouTube, isOfflinePlaying]);

  // Sync volume & mute to YouTube iframe
  useEffect(() => {
    if (!isYouTube || !ytIframeRef.current) return;
    try {
      if (isMuted) {
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
  }, [volume, isMuted, isYouTube]);

  const effectiveDuration = duration > 0 ? duration : (currentTrack?.duration || 210);

  // Listen for YouTube player state changes (auto-advance ONLY when song genuinely finishes)
  useEffect(() => {
    if (!isYouTube) return;

    const handleMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data && data.event === 'onStateChange' && data.info === 0) {
          // ANTI-SKIP GUARD: Only advance if the song has genuinely finished
          // (i.e. played within 6s of effectiveDuration, or at least 60s)
          // Prevents premature auto-skipping during ads or buffering!
          if (currentTime >= Math.max(30, effectiveDuration - 6)) {
            if (repeatMode === 'one') {
              handleSeek(0);
            } else {
              onNext();
            }
          }
        }
      } catch {
        // Ignore non-json messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isYouTube, onNext, currentTime, repeatMode, effectiveDuration]);

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

  const handleDownloadClick = () => {
    onDownloadTrack(currentTrack);
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

  return (
    <>
      {/* 
        ========================================================================
        1. DOCKED MINI-PLAYER BAR (SPOTIFY / SNAPTUBE AESTHETIC)
        - Cleanly docked above the mobile nav on phones, bottom of screen on desktop.
        - Never obscures other UI elements.
        - Click anywhere on track info to smoothly expand to full-screen.
        ========================================================================
      */}
      <div 
        className="fixed bottom-[58px] md:bottom-0 inset-x-0 z-40 bg-[#181818]/95 backdrop-blur-2xl border-t border-white/10 select-none shadow-2xl transition-all"
      >
        {/* Top 2px Progress Bar */}
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
          
          {/* Left: Track Artwork & Info */}
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

          {/* Center: Playback Controls */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={onToggleShuffle}
                title="تشغيل عشوائي"
                className={`p-1.5 rounded-full transition-colors hidden sm:block ${
                  isShuffle ? 'text-[#1ed760]' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Shuffle className="w-4 h-4" />
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

              <button
                onClick={onToggleRepeat}
                title={`تكرار: ${repeatMode}`}
                className={`p-1.5 rounded-full transition-colors hidden sm:block ${
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

          {/* Right: Actions, Volume & Expand */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Direct In-App Theater Video Preview Button */}
            {isYouTube && (
              <button
                onClick={() => {
                  setVideoMode(true);
                  setIsExpanded(true);
                }}
                title="مشاهدة فيديو كليب الأغنية مباشرة داخل التطبيق بجودة عالية"
                className="px-2.5 py-1 rounded-full bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 flex items-center gap-1 text-xs font-bold transition-all active:scale-95"
              >
                <Tv className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">فيديو</span>
              </button>
            )}

            {/* Download Button */}
            <button
              onClick={handleDownloadClick}
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
        - YouTube iframe sits directly IN-LINE in the center stage in Video Mode.
        - In Audio Mode, high-resolution authentic artwork with vinyl animation.
        - Perfect mobile touch controls and full lockscreen compatibility.
        ========================================================================
      */}
      <div 
        className={`fixed inset-0 z-50 bg-[#121212]/98 backdrop-blur-3xl flex flex-col justify-between p-4 sm:p-8 transition-all duration-300 overflow-y-auto ${
          isExpanded 
            ? 'translate-y-0 opacity-100 pointer-events-auto' 
            : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        {/* Top Bar: Collapse, Title & Mode Toggle */}
        <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto w-full pt-2">
          <button
            onClick={() => setIsExpanded(false)}
            className="p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="تصغير المشغل"
          >
            <ChevronDown className="w-6 h-6" />
          </button>

          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              {isOfflinePlaying ? 'تشغيل أوفلاين' : 'يتم التشغيل الآن'}
            </p>
            <p className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-xs mt-0.5">
              {currentTrack.album || 'نغمات ميكس'}
            </p>
          </div>

          {/* Audio / Video Switcher (Clean Pill Toggle) */}
          {isYouTube ? (
            <div className="flex items-center bg-[#242424] p-1 rounded-full border border-white/10 text-xs">
              <button
                onClick={() => setVideoMode(false)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all ${
                  !videoMode ? 'bg-[#1ed760] text-black shadow' : 'text-zinc-400 hover:text-white'
                }`}
                title="وضع الاستماع الصوتي مع دعم الخلفية وقفل الشاشة"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>صوت</span>
              </button>
              <button
                onClick={() => setVideoMode(true)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all ${
                  videoMode ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-white'
                }`}
                title="مشاهدة فيديو كليب الأغنية بدقة عالية"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>فيديو</span>
              </button>
            </div>
          ) : (
            <div className="w-10" />
          )}
        </div>

        {/* Middle Stage: Video Theater Container or Authentic Album Artwork */}
        <div className={`my-auto py-2 sm:py-4 flex flex-col items-center justify-center mx-auto w-full transition-all duration-300 ${
          videoMode ? 'max-w-3xl' : 'max-w-md'
        }`}>
          <div className={`relative w-full rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 bg-black flex items-center justify-center ${
            videoMode 
              ? 'aspect-video border-2 border-white/20 shadow-green-500/10' 
              : 'aspect-square max-w-sm sm:max-w-md border border-white/10'
          }`}>
            {/* 1. YouTube Iframe sits cleanly inside the stage container */}
            {isYouTube && (
              <div 
                className={`absolute inset-0 w-full h-full transition-opacity duration-200 ${
                  videoMode ? 'opacity-100 z-20 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {iframeSrc ? (
                  <iframe
                    ref={ytIframeRef}
                    src={iframeSrc}
                    title={currentTrack.title}
                    className="w-full h-full border-0 rounded-3xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black/90 text-white gap-3 p-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1ed760]" />
                    <p className="text-sm font-bold">جارٍ تحضير الفيديو الكامل...</p>
                    <p className="text-xs text-zinc-400">{currentTrack.title} - {currentTrack.artist}</p>
                  </div>
                )}
              </div>
            )}

            {/* 2. Authentic Artwork (Visible in Audio Mode) */}
            <div 
              className={`relative w-full h-full transition-opacity duration-200 ${
                !videoMode ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none -z-10'
              }`}
            >
              <img 
                src={currentTrack.coverUrl || FALLBACK_COVER} 
                alt={currentTrack.title}
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? 'scale-105' : ''
                }`}
              />
              
              {/* Vignette overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              
              {/* Quick switch to Video button */}
              {isYouTube && (
                <button
                  onClick={() => setVideoMode(true)}
                  className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-red-600/80 hover:bg-red-600 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                  title="مشاهدة فيديو كليب الأغنية"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>عرض المسرح والفيديو</span>
                </button>
              )}

              {/* Badge */}
              <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-bold text-zinc-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1ed760] animate-ping" />
                <span>صوت كامل عالي النقاء</span>
              </div>
            </div>
          </div>

          {/* Song Meta Info */}
          <div className="w-full mt-6 text-right space-y-1">
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
                onClick={handleDownloadClick}
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
          <div className="w-full mt-6 space-y-1.5">
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

          {/* Main Primary Controls */}
          <div className="flex items-center justify-between w-full max-w-sm mt-6">
            <button
              onClick={onToggleShuffle}
              title="تشغيل عشوائي"
              className={`p-2 rounded-full transition-colors ${
                isShuffle ? 'text-[#1ed760]' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button
              onClick={onPrevious}
              title="السابق"
              className="p-3 rounded-full text-white hover:bg-white/10 transition-colors active:scale-95"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>

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

        {/* Bottom Action Footer */}
        <div className="max-w-md mx-auto w-full flex items-center justify-between pt-4 border-t border-white/10 text-xs text-zinc-400">
          {/* Export Device MP3 */}
          <button
            onClick={() => exportAudioToDevice(currentTrack)}
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            title="تصدير كملف صوتي MP3 لجهازك"
          >
            <HardDrive className="w-4 h-4 text-[#1ed760]" />
            <span>تصدير كملف MP3</span>
          </button>

          {/* Sleep Timer */}
          <div className="relative">
            <button
              onClick={() => setShowSleepMenu(!showSleepMenu)}
              className={`inline-flex items-center gap-1.5 hover:text-white transition-colors ${
                sleepTimer ? 'text-amber-400 font-bold' : ''
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>{sleepTimer ? `${sleepTimer} دقيقة` : 'مؤقت النوم'}</span>
            </button>

            {showSleepMenu && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#242424] border border-white/10 rounded-2xl p-2 shadow-2xl min-w-[130px] space-y-1 z-50">
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

          {/* Quality Indicator */}
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            {currentTrack.bitrate || '320 KBPS'}
          </span>
        </div>
      </div>
    </>
  );
};
