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
  Disc,
  ExternalLink,
  RefreshCw
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

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';

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
  const [videoMode, setVideoMode] = useState(true); // Default to video preview for YouTube so it doesn't freeze on mobile
  const [iframeKey, setIframeKey] = useState(0);
  const ytIframeRef = useRef<HTMLIFrameElement | null>(null);

  const isYouTube = Boolean(currentTrack?.source === 'youtube' || currentTrack?.youtubeId);

  // Sync play / pause state to YouTube iframe
  useEffect(() => {
    if (!isYouTube || !ytIframeRef.current) return;
    try {
      const command = isPlaying ? 'playVideo' : 'pauseVideo';
      ytIframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: command, args: '' }),
        '*'
      );
    } catch {
      // Ignore cross-origin warnings
    }
  }, [isPlaying, isYouTube]);

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

  // Listen for YouTube player state changes (e.g. video ended -> playNext)
  useEffect(() => {
    if (!isYouTube) return;

    const handleMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data && data.event === 'onStateChange') {
          // 0 = ended, 1 = playing, 2 = paused
          if (data.info === 0) {
            onNext();
          }
        }
      } catch {
        // Ignore non-json messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isYouTube, onNext]);

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
        // Ignore cross-origin warnings
      }
    }
  };

  const handleDownloadClick = () => {
    if (isYouTube) {
      alert('هذا المقطع مستضاف عبر يوتيوب للبث المباشر ومشاهدة الفيديو بجودة عالية ⚡. للأغاني القابلة للحفظ أوفلاين كملف صوتي بدون نت، تصفح تبويب "أغاني كاملة MP3" في صفحة البحث!');
      return;
    }
    onDownloadTrack(currentTrack);
  };

  const reloadIframe = () => {
    setIframeKey(prev => prev + 1);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const youtubeUrl = currentTrack.youtubeId ? `https://www.youtube.com/watch?v=${currentTrack.youtubeId}` : null;

  return (
    <>
      {/* 1. SINGLE PERSISTENT YOUTUBE IFRAME (Prevents mobile iOS Safari / Android throttling) */}
      {isYouTube && (
        <div
          className={`transition-all duration-300 z-50 ${
            isExpanded
              ? videoMode
                ? 'fixed top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-lg aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black pointer-events-auto'
                : 'fixed top-0 left-0 w-1 h-1 opacity-[0.01] pointer-events-none'
              : 'fixed bottom-16 right-4 sm:right-8 w-28 sm:w-36 aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black pointer-events-auto'
          }`}
        >
          <iframe
            ref={ytIframeRef}
            key={`${currentTrack.youtubeId || currentTrack.id}-${iframeKey}`}
            src={
              currentTrack.youtubeId
                ? `https://www.youtube.com/embed/${currentTrack.youtubeId}?enablejsapi=1&autoplay=1&playsinline=1&rel=0`
                : `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(currentTrack.artist + ' ' + currentTrack.title)}&enablejsapi=1&autoplay=1&playsinline=1&rel=0`
            }
            title={currentTrack.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            className="w-full h-full border-0"
          />

          {/* Mini overlay when playing in bottom bar */}
          {!isExpanded && (
            <div 
              onClick={() => setIsExpanded(true)}
              className="absolute inset-0 bg-transparent cursor-pointer"
              title="توسيع المشغل"
            />
          )}
        </div>
      )}

      {/* 2. Bottom Sticky Mini Player Bar (Spotify Style) */}
      <div className="fixed bottom-14 md:bottom-0 left-0 right-0 z-40 bg-[#181818] border-t border-white/10 shadow-2xl safe-area-bottom">
        {/* Top Slim Progress Bar for Mini Player */}
        <div 
          className="relative h-1 w-full bg-[#3e3e3e] cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const ratio = 1 - (clickX / rect.width);
            handleSeek(Math.max(0, Math.min(duration, ratio * duration)));
          }}
        >
          <div 
            className="absolute top-0 right-0 h-full bg-[#1ed760] transition-all duration-100 group-hover:bg-[#1fdf64]"
            style={{ width: `${progressPercent}%` }}
          />
          <div 
            className="absolute -top-1 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none"
            style={{ right: `calc(${progressPercent}% - 6px)` }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Left / Track Info & Cover */}
          <div 
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-3 min-w-0 cursor-pointer group max-w-[45%] sm:max-w-[30%]"
          >
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800 shadow-md group-hover:scale-105 transition-transform">
              <img
                src={currentTrack.coverUrl || FALLBACK_COVER}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = FALLBACK_COVER;
                }}
                className="w-full h-full object-cover"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1ed760] animate-ping" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-[#1ed760] transition-colors">
                {currentTrack.title}
              </h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p 
                  onClick={(e) => {
                    if (currentTrack.artistId && onOpenArtist) {
                      e.stopPropagation();
                      onOpenArtist(currentTrack.artistId);
                    }
                  }}
                  className={`text-[11px] text-zinc-400 truncate ${currentTrack.artistId ? 'hover:underline hover:text-white' : ''}`}
                >
                  {currentTrack.artist}
                </p>
                {isYouTube ? (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-600/20 text-red-400 border border-red-500/20 shrink-0">
                    يوتيوب
                  </span>
                ) : (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-[#1ed760] shrink-0">
                    أغنية كاملة
                  </span>
                )}
                {isOfflinePlaying && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#1ed760]/10 text-[#1ed760] shrink-0">
                    أوفلاين
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center Playback Controls */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Shuffle button (desktop) */}
              <button
                onClick={onToggleShuffle}
                title={isShuffle ? 'إيقاف الخلط العشوائي' : 'تشغيل الخلط العشوائي'}
                className={`hidden md:block p-1.5 rounded-lg transition-colors ${
                  isShuffle ? 'text-[#1ed760]' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              {/* Previous button */}
              <button
                onClick={onPrevious}
                title="المقطع السابق"
                className="p-1.5 text-zinc-300 hover:text-white active:scale-95 transition-all"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Main Play / Pause Button (Spotify White Circle) */}
              <button
                onClick={onTogglePlay}
                disabled={isLoading}
                title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:scale-105 active:scale-95 text-black flex items-center justify-center shadow transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 fill-black text-black" />
                ) : (
                  <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                )}
              </button>

              {/* Next button */}
              <button
                onClick={onNext}
                title="المقطع التالي"
                className="p-1.5 text-zinc-300 hover:text-white active:scale-95 transition-all"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              {/* Repeat button (desktop) */}
              <button
                onClick={onToggleRepeat}
                title={`وضع التكرار: ${repeatMode === 'all' ? 'الكل' : repeatMode === 'one' ? 'مقطع واحد' : 'معطل'}`}
                className={`hidden md:block p-1.5 rounded-lg transition-colors ${
                  repeatMode !== 'off' ? 'text-[#1ed760]' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>
            </div>

            {/* Time labels (desktop) */}
            <div className="hidden lg:flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Actions: Download, Volume, Expand */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick reload button if YouTube hangs on mobile */}
            {isYouTube && (
              <button
                onClick={reloadIframe}
                title="إعادة تحميل البث إذا علّق"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            {/* Download Button in Player */}
            <button
              disabled={isDownloading}
              onClick={handleDownloadClick}
              title={isDownloaded ? 'محفوظ في الذاكرة الأوفلاين' : 'تحميل أوفلاين'}
              className={`p-2 rounded-xl transition-all ${
                isDownloaded
                  ? 'text-[#1ed760] hover:bg-green-950/30'
                  : isDownloading
                  ? 'text-amber-400 animate-pulse'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {isDownloading ? (
                <div className="flex items-center gap-1 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">{downloadProgress}%</span>
                </div>
              ) : isDownloaded ? (
                <Check className="w-4 h-4 text-[#1ed760]" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>

            {/* Volume slider (desktop) */}
            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={onToggleMute}
                className="text-zinc-400 hover:text-white p-1"
                title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-zinc-500" />
                ) : (
                  <Volume2 className="w-4 h-4 text-zinc-300" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={isMuted ? 0 : volume}
                onChange={(e) => onSetVolume(parseFloat(e.target.value))}
                className="w-18 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Expand Fullscreen Button */}
            <button
              onClick={() => setIsExpanded(true)}
              title="توسيع شاشة المشغل"
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Expandable Full-Screen Spotify-Style Player Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-[#121212]/98 backdrop-blur-3xl overflow-y-auto flex flex-col justify-between p-6 sm:p-10 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header of Expanded Player */}
          <div className="max-w-2xl mx-auto w-full flex items-center justify-between pb-4">
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
            >
              <ChevronDown className="w-5 h-5" />
              <span>تصغير</span>
            </button>

            <div className="text-center">
              <p className="text-[11px] uppercase tracking-wider text-[#1ed760] font-bold">
                {isOfflinePlaying 
                  ? 'تشغيل أوفلاين (بدون إنترنت) ⚡' 
                  : isYouTube
                  ? 'بث فوري عبر يوتيوب HD 🎬'
                  : currentTrack.isFullLength !== false 
                  ? 'تشغيل أغنية كاملة 320kbps ⚡' 
                  : 'معاينة مقطع صوتي'}
              </p>
              <h3 className="text-xs text-zinc-400 truncate max-w-xs mt-0.5">
                {currentTrack.album || 'ألبوم منفرد'}
              </h3>
            </div>

            {/* Sleep Timer & Options */}
            <div className="relative">
              <button
                onClick={() => setShowSleepMenu(!showSleepMenu)}
                className={`p-2.5 rounded-full transition-all flex items-center gap-1 text-xs font-semibold ${
                  sleepTimer 
                    ? 'bg-[#1ed760] text-black font-bold' 
                    : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                }`}
                title="مؤقت النوم"
              >
                <Moon className="w-4 h-4" />
                {sleepTimer && <span>{sleepTimer}د</span>}
              </button>

              {/* Sleep Timer Popover */}
              {showSleepMenu && (
                <div className="absolute left-0 mt-2 w-44 rounded-2xl bg-[#242424] border border-white/10 p-2 shadow-2xl z-20">
                  <div className="px-2 py-1 text-xs font-bold text-zinc-400 border-b border-white/10 mb-1">
                    مؤقت النوم (Sleep Timer)
                  </div>
                  {[15, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => {
                        onSetSleepTimer(mins);
                        setShowSleepMenu(false);
                      }}
                      className="w-full text-right px-3 py-1.5 rounded-xl text-xs text-zinc-300 hover:bg-white/10 hover:text-[#1ed760] flex items-center justify-between"
                    >
                      <span>بعد {mins} دقيقة</span>
                      {sleepTimer === mins && <Check className="w-3.5 h-3.5 text-[#1ed760]" />}
                    </button>
                  ))}
                  {sleepTimer && (
                    <button
                      onClick={() => {
                        onSetSleepTimer(null);
                        setShowSleepMenu(false);
                      }}
                      className="w-full text-right px-3 py-1.5 rounded-xl text-xs text-rose-400 hover:bg-rose-950/30 mt-1 border-t border-white/10"
                    >
                      إلغاء المؤقت
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Central Artwork Presentation / Video Area */}
          <div className="max-w-md mx-auto w-full my-auto flex flex-col items-center text-center">
            
            {/* Mode Switcher for YouTube Tracks (Cover Art vs Video Clip) */}
            {isYouTube && (
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10 mb-4 shadow-inner">
                <button
                  onClick={() => setVideoMode(true)}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    videoMode 
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/40' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>مشاهدة الفيديو</span>
                </button>
                <button
                  onClick={() => setVideoMode(false)}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    !videoMode 
                      ? 'bg-white text-black shadow' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Disc className="w-3.5 h-3.5" />
                  <span>غلاف الألبوم</span>
                </button>
              </div>
            )}

            {/* Cover Artwork (shown when not in videoMode or not a YouTube track) */}
            {(!isYouTube || !videoMode) && (
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 my-4">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#1ed760]/20 via-blue-500/10 to-transparent blur-2xl" />

                <div className={`relative w-full h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-950 ${
                  isPlaying ? 'ring-4 ring-[#1ed760]/20' : ''
                }`}>
                  <img
                    src={currentTrack.coverUrl || FALLBACK_COVER}
                    alt={currentTrack.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = FALLBACK_COVER;
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              </div>
            )}

            {/* Video Placeholder space when videoMode is active (the iframe is positioned above) */}
            {isYouTube && videoMode && (
              <div className="w-full aspect-video my-4 rounded-2xl opacity-0 pointer-events-none" />
            )}

            {/* Title & Artist */}
            <div className="mt-3 px-4 w-full">
              <h2 className="text-xl sm:text-2xl font-black text-white truncate">
                {currentTrack.title}
              </h2>
              <p 
                onClick={() => {
                  if (currentTrack.artistId && onOpenArtist) {
                    setIsExpanded(false);
                    onOpenArtist(currentTrack.artistId);
                  }
                }}
                className={`text-sm sm:text-base text-zinc-400 font-medium mt-1 truncate ${
                  currentTrack.artistId ? 'hover:underline hover:text-white cursor-pointer' : ''
                }`}
              >
                {currentTrack.artist}
              </p>

              {/* YouTube Helper Actions */}
              {isYouTube && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <button
                    onClick={reloadIframe}
                    className="text-xs px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>إعادة تحميل البث</span>
                  </button>

                  {youtubeUrl && (
                    <a
                      href={youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-1 rounded-full bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/20 flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>فتح في تطبيق YouTube</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Interactive Controls */}
          <div className="max-w-xl mx-auto w-full space-y-4 pt-2">
            
            {/* Scrub Progress Bar */}
            <div className="space-y-1.5">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.5"
                value={currentTime}
                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-zinc-400 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playback Button Row */}
            <div className="flex items-center justify-between px-4 sm:px-8">
              <button
                onClick={onToggleShuffle}
                className={`p-2 rounded-xl transition-all ${
                  isShuffle ? 'text-[#1ed760]' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="خلط عشوائي"
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <button
                onClick={onPrevious}
                className="p-3 text-zinc-200 hover:text-white active:scale-95 transition-all"
                title="السابق"
              >
                <SkipForward className="w-7 h-7" />
              </button>

              {/* Big Center Play Button (Spotify Signature Style) */}
              <button
                onClick={onTogglePlay}
                disabled={isLoading}
                className="w-16 h-16 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black flex items-center justify-center shadow-xl shadow-green-500/25 active:scale-90 transition-all hover:scale-105"
                title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              >
                {isLoading ? (
                  <Loader2 className="w-7 h-7 animate-spin text-black" />
                ) : isPlaying ? (
                  <Pause className="w-7 h-7 fill-black text-black" />
                ) : (
                  <Play className="w-7 h-7 fill-black text-black ml-1" />
                )}
              </button>

              <button
                onClick={onNext}
                className="p-3 text-zinc-200 hover:text-white active:scale-95 transition-all"
                title="التالي"
              >
                <SkipBack className="w-7 h-7" />
              </button>

              <button
                onClick={onToggleRepeat}
                className={`p-2 rounded-xl transition-all ${
                  repeatMode !== 'off' ? 'text-[#1ed760]' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="تكرار"
              >
                {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
              </button>
            </div>

            {/* Action Buttons: Offline download / Export */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                disabled={isDownloading}
                onClick={handleDownloadClick}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold border transition-all active:scale-95 ${
                  isDownloaded
                    ? 'bg-emerald-950/40 text-[#1ed760] border-emerald-700/60'
                    : isDownloading
                    ? 'bg-amber-950/60 text-amber-400 border-amber-600/60'
                    : 'bg-[#242424] hover:bg-[#2e2e2e] text-white border-white/10'
                }`}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري الحفظ أوفلاين ({downloadProgress}%)...</span>
                  </>
                ) : isDownloaded ? (
                  <>
                    <Check className="w-4 h-4 text-[#1ed760]" />
                    <span>محفوظة في الذاكرة الأوفلاين</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-[#1ed760]" />
                    <span>{isYouTube ? 'تحميل أوفلاين (MP3)' : 'حفظ للاستماع بدون نت'}</span>
                  </>
                )}
              </button>

              {/* Export MP3 to device storage (Snaptube feature for cached tracks) */}
              {!isYouTube && (
                <button
                  onClick={() => exportAudioToDevice(currentTrack)}
                  title="حفظ ملف MP3 إلى مجلد التنزيلات بالجهاز"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-all"
                >
                  <HardDrive className="w-4 h-4 text-[#1ed760]" />
                  <span className="hidden sm:inline">تصدير MP3 للجهاز</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
