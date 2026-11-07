import React from 'react';
import { Track } from '../types/music';
import { Heart, Play, Pause, Download, Check, Trash2, Clock, Music } from 'lucide-react';

interface FavoritesComponentProps {
  favoriteTracks: Track[];
  onPlayTrack: (track: Track, queue: Track[]) => void;
  currentTrack: Track | null;
  isPlaying: boolean;
  downloadedIds: Set<string>;
  onDownloadTrack: (track: Track) => void;
  onRemoveFavorite: (track: Track) => void;
  onGoToSearch: () => void;
}

export const FavoritesComponent: React.FC<FavoritesComponentProps> = ({
  favoriteTracks,
  onPlayTrack,
  currentTrack,
  isPlaying,
  downloadedIds,
  onDownloadTrack,
  onRemoveFavorite,
  onGoToSearch,
}) => {
  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-rose-950/60 via-zinc-900 to-zinc-950 border border-rose-900/40 p-6 lg:p-8 shadow-2xl">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold mb-3">
            <Heart className="w-3.5 h-3.5 fill-rose-500" />
            <span>قائمتك المفضلة</span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-white mb-2">
            الأغاني والمقاطع المفضلة
          </h1>
          <p className="text-zinc-400 text-sm max-w-lg">
            قائمتك الخاصة التي تضم جميع النغمات التي أحببتها للوصول السريع والاستماع بضغطة واحدة.
          </p>
        </div>
      </div>

      {/* List */}
      {favoriteTracks.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-zinc-900/30 border border-zinc-800/60 p-8">
          <Heart className="w-14 h-14 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">
            لا توجد أغانٍ مفضلة بعد
          </h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
            اضغط على أيقونة الإعجاب بجانب أي أغنية لإضافتها إلى قائمتك المفضلة.
          </p>
          <button
            onClick={onGoToSearch}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-6 py-2.5 rounded-2xl text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <Music className="w-4 h-4" />
            <span>تصفح وابحث عن الموسيقى</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {favoriteTracks.map((track) => {
            const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
            const isDownloaded = downloadedIds.has(track.id);

            return (
              <div
                key={track.id}
                className={`group relative rounded-2xl p-3 border transition-all duration-200 flex items-center gap-3.5 ${
                  currentTrack?.id === track.id
                    ? 'bg-amber-950/20 border-amber-500/50 shadow-lg'
                    : 'bg-zinc-900/70 hover:bg-zinc-800/80 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div 
                  onClick={() => onPlayTrack(track, favoriteTracks)}
                  className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-950 shrink-0 cursor-pointer shadow-md group-hover:scale-105 transition-transform"
                >
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                    isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    {isCurrentPlaying ? (
                      <div className="flex items-end gap-1 h-5">
                        <span className="w-1 bg-amber-400 rounded-full soundwave-bar" />
                        <span className="w-1 bg-amber-400 rounded-full soundwave-bar" style={{ animationDelay: '0.2s' }} />
                        <span className="w-1 bg-amber-400 rounded-full soundwave-bar" style={{ animationDelay: '0.4s' }} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 fill-zinc-950 ml-0.5" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0" onClick={() => onPlayTrack(track, favoriteTracks)}>
                  <h3 className={`font-bold text-sm truncate cursor-pointer ${
                    currentTrack?.id === track.id ? 'text-amber-400' : 'text-white'
                  }`}>
                    {track.title}
                  </h3>
                  <p className="text-xs text-zinc-400 truncate mt-0.5 cursor-pointer">
                    {track.artist}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(track.duration)}
                    </span>
                    {isDownloaded && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 font-bold flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> أوفلاين
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onDownloadTrack(track)}
                    title={isDownloaded ? 'محفوظ أوفلاين' : 'تحميل أوفلاين'}
                    className={`p-2 rounded-xl transition-all ${
                      isDownloaded
                        ? 'text-emerald-400 bg-emerald-950/40'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {isDownloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => onRemoveFavorite(track)}
                    title="إزالة من المفضلة"
                    className="p-2 rounded-xl text-rose-400 hover:bg-rose-950/20 transition-all"
                  >
                    <Heart className="w-4 h-4 fill-rose-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
