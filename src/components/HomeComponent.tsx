import React, { useEffect, useState } from 'react';
import { Track, Artist } from '../types/music';
import { DEFAULT_TRACKS, DEFAULT_ARTISTS } from '../data/musicData';
import { 
  Play, 
  Download, 
  Check, 
  ArrowLeft,
  BadgeCheck,
  Smartphone
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
    <div className="space-y-10 pb-36">
      {/* 1. Spotify Greeting Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {getGreeting()}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            استمع لأشهر الأغاني والفنانين وحمّلها لتشغيلها أوفلاين
          </p>
        </div>

        <button
          onClick={onOpenInstallModal}
          className="text-xs font-bold px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5 active:scale-95 shadow"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#1ed760]" />
          <span>تثبيت التطبيق</span>
        </button>
      </div>

      {/* 2. Spotify Quick Access Grid (6 Rectangular Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {quickTracks.map((track) => {
          const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;

          return (
            <div
              key={track.id}
              onClick={() => onPlayTrack(track, featured)}
              className="group relative flex items-center gap-3 bg-[#242424]/60 hover:bg-[#2a2a2a] rounded-lg overflow-hidden cursor-pointer transition-all border border-white/5 shadow-md"
            >
              <img
                src={track.coverUrl}
                alt={track.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = FALLBACK_COVER;
                }}
                className="w-14 h-14 sm:w-16 sm:h-16 object-cover shrink-0 shadow"
              />

              <div className="min-w-0 flex-1 pr-1 pl-2">
                <h4 className={`font-bold text-xs sm:text-sm truncate ${
                  currentTrack?.id === track.id ? 'text-[#1ed760]' : 'text-white'
                }`}>
                  {track.title}
                </h4>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                  {track.artist}
                </p>
              </div>

              {/* Floating Green Play Button on Hover */}
              <button
                className={`ml-3 w-10 h-10 rounded-full bg-[#1ed760] text-black shadow-xl items-center justify-center transition-all ${
                  isCurrentPlaying 
                    ? 'flex opacity-100 scale-100' 
                    : 'hidden group-hover:flex group-hover:scale-105 active:scale-95'
                }`}
              >
                <Play className="w-4 h-4 fill-black ml-0.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* 3. Popular Artists Section (Circular Avatars) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              أشهر الفنانين
            </h2>
            <p className="text-xs text-zinc-400">
              اضغط على أي فنان لمشاهدة بروفايله وجميع أغانيه
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
              className="group p-3.5 rounded-2xl bg-[#181818] hover:bg-[#282828] transition-all flex flex-col items-center text-center cursor-pointer border border-white/5"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-xl mb-3 group-hover:scale-105 transition-transform bg-zinc-800">
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
                <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-[#1ed760] transition-colors">
                  {artist.name}
                </h4>
                {artist.isVerified && (
                  <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500 shrink-0" />
                )}
              </div>

              <p className="text-[11px] text-zinc-400 mt-0.5">
                فنان
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Featured Songs Shelf (Square Cards with Hover Play) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              المقاطع الكاملة الأكثر رواجاً
            </h2>
            <p className="text-xs text-zinc-400">
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
                className="group relative p-3 rounded-2xl bg-[#181818] hover:bg-[#282828] transition-all cursor-pointer border border-white/5 flex flex-col justify-between"
                onClick={() => onPlayTrack(track, featured)}
              >
                {/* Square Card Artwork */}
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-zinc-800 shadow-md">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = FALLBACK_COVER;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />

                  {/* Floating Green Play Button on Hover */}
                  <div className={`absolute bottom-2 left-2 transition-all ${
                    isCurrentPlaying ? 'opacity-100 scale-100' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                  }`}>
                    <div className="w-10 h-10 rounded-full bg-[#1ed760] text-black shadow-xl flex items-center justify-center hover:scale-105 active:scale-95">
                      <Play className="w-4 h-4 fill-black ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Track Details */}
                <div>
                  <h4 className={`font-bold text-xs sm:text-sm truncate ${
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

                {/* Download Status */}
                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadTrack(track);
                    }}
                    title={isDownloaded ? 'محفوظ أوفلاين' : 'تحميل أوفلاين'}
                    className={`p-1 rounded-lg transition-colors ${
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
