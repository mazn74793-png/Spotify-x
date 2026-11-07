import React, { useEffect, useState } from 'react';
import { Track, Artist } from '../types/music';
import { DEFAULT_TRACKS, DEFAULT_ARTISTS } from '../data/musicData';
import { 
  Play, 
  Download, 
  Check, 
  ArrowLeft,
  BadgeCheck, 
  Smartphone,
  Sparkles,
  Flame,
  Radio,
  Coffee,
  Disc3
} from 'lucide-react';

interface HomeComponentProps {
  onPlayTrack: (track: Track, queue: Track[]) => void;
  currentTrack: Track | null;
  isPlaying: boolean;
  downloadedIds: Set<string>;
  onDownloadTrack: (track: Track) => void;
  onGoToSearch: () => void;
  onGoToLibrary: () => void;
  onOpenInstallModal: () => void;
  onOpenArtist: (artistId: string) => void;
}

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';

const CURATED_MOODS = [
  {
    id: 'tarab',
    title: 'طرب وكلاسيكيات زمان',
    subtitle: 'أم كلثوم، عبد الحليم، فيروز',
    gradient: 'from-amber-900/60 via-amber-950/30 to-[#181818]',
    border: 'border-amber-500/20',
    icon: Coffee,
    artistFilter: 'fairouz'
  },
  {
    id: 'rap',
    title: 'تراب وهيب هوب مصري',
    subtitle: 'ويجز، كايروكي، راب حديث',
    gradient: 'from-emerald-900/60 via-emerald-950/30 to-[#181818]',
    border: 'border-emerald-500/20',
    icon: Flame,
    artistFilter: 'wegz'
  },
  {
    id: 'pop',
    title: 'أجمل أغاني البوب العربي',
    subtitle: 'عمرو دياب، حماقي، تامر حسني',
    gradient: 'from-purple-900/60 via-purple-950/30 to-[#181818]',
    border: 'border-purple-500/20',
    icon: Sparkles,
    artistFilter: 'amr-diab'
  },
  {
    id: 'shaabi',
    title: 'شعبي وسهرات مودرن',
    subtitle: 'أحمد سعد، ريمكسات، ديسكو',
    gradient: 'from-rose-900/60 via-rose-950/30 to-[#181818]',
    border: 'border-rose-500/20',
    icon: Radio,
    artistFilter: 'ahmed-saad'
  }
];

export const HomeComponent: React.FC<HomeComponentProps> = ({
  onPlayTrack,
  currentTrack,
  isPlaying,
  downloadedIds,
  onDownloadTrack,
  onGoToSearch,
  onOpenInstallModal,
  onOpenArtist,
}) => {
  // Pre-seed with full curated library so it NEVER loads as an empty black box on Vercel or offline
  const [featured, setFeatured] = useState<Track[]>(DEFAULT_TRACKS);
  const [artists, setArtists] = useState<Artist[]>(DEFAULT_ARTISTS);

  useEffect(() => {
    fetch('/api/trending')
      .then(async res => {
        if (!res.ok) return null;
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) return null;
        return res.json();
      })
      .then(data => {
        if (data?.featured?.length) {
          setFeatured(data.featured);
        }
        if (data?.artists?.length) {
          setArtists(data.artists);
        }
      })
      .catch(() => {
        // Safe silent fallback: DEFAULT_TRACKS and DEFAULT_ARTISTS are already active
      });
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'صباح الخير';
    if (hour >= 12 && hour < 18) return 'مساء الخير';
    return 'سهرة سعيدة';
  };

  const quickTracks = featured.slice(0, 6);

  return (
    <div className="space-y-12 pb-36 animate-in fade-in duration-300">
      
      {/* 1. Spotify Luxurious Ambient Greeting Header */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-950/40 via-[#181818] to-[#121212] border border-white/5 shadow-2xl overflow-hidden">
        {/* Ambient glow in corner */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#1ed760]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#1ed760] animate-pulse" />
              <span className="text-xs font-bold text-[#1ed760] tracking-wider uppercase">
                Spotify Music Experience
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {getGreeting()}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-lg">
              استمع لأشهر الأغاني والفنانين بجودة استوديو عالية وحمّلها لتشغيلها أوفلاين في أي وقت بدون إنترنت.
            </p>
          </div>

          <button
            onClick={onOpenInstallModal}
            className="text-xs font-bold px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-2 self-start sm:self-center active:scale-95 border border-white/10 shadow-lg"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#1ed760]" />
            <span>تثبيت التطبيق على الهاتف</span>
          </button>
        </div>
      </div>

      {/* 2. Spotify Quick Access Grid (6 Rectangular Cards with Glowing Hover Play) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {quickTracks.map((track) => {
          const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;

          return (
            <div
              key={track.id}
              onClick={() => onPlayTrack(track, featured)}
              className={`group relative flex items-center gap-3 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 border shadow-md ${
                currentTrack?.id === track.id
                  ? 'bg-[#2a2a2a] border-[#1ed760]/40 ring-1 ring-[#1ed760]/30'
                  : 'bg-[#222222]/80 hover:bg-[#282828] border-white/5 hover:border-white/10'
              }`}
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-zinc-800">
                <img
                  src={track.coverUrl || FALLBACK_COVER}
                  alt={track.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK_COVER;
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {isCurrentPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="flex items-end gap-0.5 h-4">
                      <span className="w-1 bg-[#1ed760] rounded-full soundwave-bar" />
                      <span className="w-1 bg-[#1ed760] rounded-full soundwave-bar" style={{ animationDelay: '0.2s' }} />
                      <span className="w-1 bg-[#1ed760] rounded-full soundwave-bar" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 pr-1 pl-2">
                <h4 className={`font-bold text-xs sm:text-sm truncate transition-colors ${
                  currentTrack?.id === track.id ? 'text-[#1ed760]' : 'text-white'
                }`}>
                  {track.title}
                </h4>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                  {track.artist}
                </p>
              </div>

              {/* Floating Green Play Button on Hover */}
              <div className="ml-3 sm:ml-4 shrink-0 pr-1">
                <button
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black shadow-2xl items-center justify-center transition-all ${
                    isCurrentPlaying 
                      ? 'flex opacity-100 scale-100' 
                      : 'hidden group-hover:flex group-hover:scale-105 active:scale-95'
                  }`}
                  title="تشغيل"
                >
                  <Play className="w-4 h-4 fill-black ml-0.5 text-black" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Curated Moods & Playlists Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>أجواء وقوائم مختارة لك</span>
              <Disc3 className="w-5 h-5 text-[#1ed760]" />
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              استكشف مجموعات الأغاني حسب مزاجك اليوم
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CURATED_MOODS.map((mood) => {
            const Icon = mood.icon;
            return (
              <div
                key={mood.id}
                onClick={() => {
                  if (mood.artistFilter) {
                    onOpenArtist(mood.artistFilter);
                  } else {
                    onGoToSearch();
                  }
                }}
                className={`group relative p-5 rounded-3xl bg-gradient-to-br ${mood.gradient} border ${mood.border} hover:border-white/20 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-2xl flex flex-col justify-between overflow-hidden`}
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow">
                    <Icon className="w-5 h-5 text-[#1ed760]" />
                  </div>
                  <h3 className="font-extrabold text-base text-white group-hover:text-[#1ed760] transition-colors">
                    {mood.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium">
                    {mood.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-zinc-300 group-hover:text-white">
                  <span>تصفح الأغاني</span>
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Popular Artists Section (Circular Avatars with Glow Rings) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              أشهر الفنانين
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              اضغط على أي فنان لمشاهدة بروفايله وجميع أعماله
            </p>
          </div>

          <button
            onClick={onGoToSearch}
            className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>عرض الكل</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {artists.slice(0, 6).map((artist) => (
            <div
              key={artist.id}
              onClick={() => onOpenArtist(artist.id)}
              className="group p-4 rounded-3xl bg-[#181818] hover:bg-[#242424] transition-all duration-300 flex flex-col items-center text-center cursor-pointer border border-white/5 hover:border-white/10 shadow-lg hover:shadow-2xl"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-2xl mb-3.5 group-hover:scale-105 transition-transform bg-zinc-800 ring-2 ring-white/10 group-hover:ring-[#1ed760]/60">
                <img
                  src={artist.avatarUrl}
                  alt={artist.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK_COVER;
                  }}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center gap-1 max-w-full">
                <h4 className="font-extrabold text-xs sm:text-sm text-white truncate group-hover:text-[#1ed760] transition-colors">
                  {artist.name}
                </h4>
                {artist.isVerified && (
                  <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500 shrink-0" />
                )}
              </div>

              <p className="text-[11px] text-zinc-400 mt-0.5">
                فنان موثق
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Featured Songs Shelf (Square Cards with Hover Play) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              المقاطع الكاملة الأكثر رواجاً
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              استماع مباشر عالي النقاء وتحميل أوفلاين
            </p>
          </div>

          <button
            onClick={onGoToSearch}
            className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>المزيد</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {featured.map((track) => {
            const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
            const isDownloaded = downloadedIds.has(track.id);

            return (
              <div
                key={track.id}
                className={`group relative p-3.5 rounded-3xl transition-all duration-300 cursor-pointer border flex flex-col justify-between shadow-lg hover:shadow-2xl ${
                  currentTrack?.id === track.id
                    ? 'bg-[#222222] border-[#1ed760]/40'
                    : 'bg-[#181818] hover:bg-[#242424] border-white/5 hover:border-white/10'
                }`}
                onClick={() => onPlayTrack(track, featured)}
              >
                {/* Square Card Artwork */}
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-zinc-800 shadow-md">
                  <img
                    src={track.coverUrl || FALLBACK_COVER}
                    alt={track.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = FALLBACK_COVER;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Floating Green Play Button on Hover */}
                  <div className={`absolute bottom-2.5 left-2.5 transition-all duration-200 ${
                    isCurrentPlaying ? 'opacity-100 scale-100' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                  }`}>
                    <div className="w-10 h-10 rounded-full bg-[#1ed760] text-black shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95">
                      <Play className="w-4 h-4 fill-black ml-0.5 text-black" />
                    </div>
                  </div>
                </div>

                {/* Track Details */}
                <div>
                  <h4 className={`font-bold text-xs sm:text-sm truncate transition-colors ${
                    currentTrack?.id === track.id ? 'text-[#1ed760]' : 'text-white'
                  }`}>
                    {track.title}
                  </h4>

                  <p 
                    onClick={(e) => {
                      if (track.artistId) {
                        e.stopPropagation();
                        onOpenArtist(track.artistId);
                      }
                    }}
                    className={`text-[11px] truncate mt-0.5 ${
                      track.artistId ? 'text-zinc-400 hover:text-white hover:underline' : 'text-zinc-400'
                    }`}
                  >
                    {track.artist}
                  </p>
                </div>

                {/* Download Status & Duration */}
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadTrack(track);
                    }}
                    title={isDownloaded ? 'محفوظ أوفلاين' : 'تحميل أوفلاين'}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDownloaded ? 'text-[#1ed760]' : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    {isDownloaded ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
