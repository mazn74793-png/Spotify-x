import React, { useState, useEffect } from 'react';
import { Artist, Track } from '../types/music';
import { getLocalArtistProfile } from '../data/musicData';
import { 
  Play, 
  Pause, 
  Check, 
  Plus, 
  Heart, 
  Download, 
  Clock, 
  ArrowRight, 
  BadgeCheck, 
  Music, 
  Share2, 
  Users,
  Loader2,
  Sparkles
} from 'lucide-react';

interface ArtistProfileModalProps {
  artistId: string | null;
  onClose: () => void;
  onPlayTrack: (track: Track, queue: Track[]) => void;
  currentTrack: Track | null;
  isPlaying: boolean;
  downloadedIds: Set<string>;
  downloadingIds: Map<string, number>;
  onDownloadTrack: (track: Track) => void;
  favorites: Set<string>;
  onToggleFavorite: (track: Track) => void;
  followedArtistIds: Set<string>;
  onToggleFollowArtist: (artist: Artist) => void;
}

export const ArtistProfileModal: React.FC<ArtistProfileModalProps> = ({
  artistId,
  onClose,
  onPlayTrack,
  currentTrack,
  isPlaying,
  downloadedIds,
  downloadingIds,
  onDownloadTrack,
  favorites,
  onToggleFavorite,
  followedArtistIds,
  onToggleFollowArtist,
}) => {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!artistId) return;

    // Load initial data immediately from local cache so screen never blinks or shows empty
    const local = getLocalArtistProfile(artistId);
    if (local) {
      setArtist(local.artist);
      setTracks(local.tracks);
      setLoading(false);
    } else {
      setLoading(true);
    }

    fetch(`/api/artists/${artistId}`)
      .then(async r => {
        if (!r.ok) return null;
        const ct = r.headers.get('content-type');
        if (!ct || !ct.includes('application/json')) return null;
        return r.json();
      })
      .then(data => {
        if (data?.artist) {
          setArtist(data.artist);
          setTracks(data.tracks || []);
        }
      })
      .catch((err) => {
        console.warn('Network fetch artist profile error:', err);
      })
      .finally(() => setLoading(false));
  }, [artistId]);

  if (!artistId) return null;

  const isFollowed = artist ? followedArtistIds.has(artist.id) : false;

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      onPlayTrack(tracks[0], tracks);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121212] overflow-y-auto animate-in fade-in duration-200">
      {/* Sticky top action bar */}
      <div className="sticky top-0 z-40 bg-[#121212]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-sm font-bold text-zinc-300 hover:text-white transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
          <span>رجوع</span>
        </button>

        {artist && (
          <span className="font-bold text-sm text-white truncate max-w-xs">
            {artist.name}
          </span>
        )}

        <div className="w-10" />
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-3 text-zinc-400">
          <Loader2 className="w-10 h-10 animate-spin text-[#1ed760]" />
          <p className="text-sm">جاري تحميل بروفايل الفنان...</p>
        </div>
      ) : !artist ? (
        <div className="py-40 text-center text-zinc-400">
          لم يتم العثور على بروفايل الفنان.
        </div>
      ) : (
        <div className="pb-36">
          {/* 1. Spotify Huge Hero Banner */}
          <div className="relative min-h-[340px] sm:min-h-[400px] flex items-end p-6 sm:p-10 overflow-hidden">
            {/* Background cover image with heavy Spotify dark vignette */}
            <div className="absolute inset-0 z-0">
              <img
                src={artist.headerUrl || artist.avatarUrl}
                alt={artist.name}
                className="w-full h-full object-cover object-top opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/60 to-black/30" />
            </div>

            {/* Artist Info */}
            <div className="relative z-10 max-w-4xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md">
                  <BadgeCheck className="w-4 h-4 fill-blue-500 text-white" />
                </div>
                <span>فنان موثق</span>
              </div>

              <h1 className="text-3xl sm:text-6xl font-black text-white tracking-tight">
                {artist.name}
              </h1>

              {artist.englishName && (
                <p className="text-sm sm:text-base text-zinc-400 font-medium">
                  {artist.englishName}
                </p>
              )}

              <p className="text-xs sm:text-sm text-zinc-300 font-medium flex items-center gap-2 pt-1">
                <Users className="w-4 h-4 text-[#1ed760]" />
                <span>{artist.monthlyListeners} مستمع شهرياً</span>
                <span className="text-zinc-600">•</span>
                <span>{artist.followersCount} متابع</span>
              </p>
            </div>
          </div>

          {/* 2. Action Controls Bar (Play Circle, Follow Button, Options) */}
          <div className="max-w-7xl mx-auto px-6 sm:px-10 py-6 flex flex-wrap items-center gap-4">
            {/* Big Green Spotify Play Button */}
            <button
              onClick={handlePlayAll}
              className="w-14 h-14 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] hover:scale-105 active:scale-95 text-black flex items-center justify-center shadow-xl shadow-green-500/20 transition-all cursor-pointer"
              title="تشغيل الكل"
            >
              <Play className="w-6 h-6 fill-black ml-0.5" />
            </button>

            {/* Follow / Following Button */}
            <button
              onClick={() => onToggleFollowArtist(artist)}
              className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold border transition-all active:scale-95 flex items-center gap-1.5 ${
                isFollowed
                  ? 'bg-transparent text-white border-zinc-500 hover:border-white hover:scale-105'
                  : 'bg-white text-black border-transparent hover:bg-zinc-200 hover:scale-105'
              }`}
            >
              {isFollowed ? (
                <>
                  <Check className="w-4 h-4 text-[#1ed760]" />
                  <span>تتابعه</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>متابعة</span>
                </>
              )}
            </button>
          </div>

          {/* 3. Popular Songs Section */}
          <div className="max-w-7xl mx-auto px-6 sm:px-10 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              الأشهر والأكثر استماعاً
            </h2>

            <div className="space-y-1">
              {tracks.map((track, index) => {
                const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
                const isDownloaded = downloadedIds.has(track.id);
                const downloadProgress = downloadingIds.get(track.id);
                const isDownloading = downloadProgress !== undefined;
                const isFav = favorites.has(track.id);

                return (
                  <div
                    key={track.id}
                    className={`group rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-3 sm:gap-4 transition-colors ${
                      currentTrack?.id === track.id
                        ? 'bg-white/10'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Index or Play Overlay */}
                    <div 
                      onClick={() => onPlayTrack(track, tracks)}
                      className="w-8 flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      {isCurrentPlaying ? (
                        <div className="flex items-end gap-0.5 h-4">
                          <span className="w-1 bg-[#1ed760] rounded-full soundwave-bar" />
                          <span className="w-1 bg-[#1ed760] rounded-full soundwave-bar" style={{ animationDelay: '0.2s' }} />
                          <span className="w-1 bg-[#1ed760] rounded-full soundwave-bar" style={{ animationDelay: '0.4s' }} />
                        </div>
                      ) : (
                        <>
                          <span className="text-sm font-mono text-zinc-400 group-hover:hidden">
                            {index + 1}
                          </span>
                          <Play className="w-4 h-4 text-white fill-white hidden group-hover:block" />
                        </>
                      )}
                    </div>

                    {/* Artwork & Title */}
                    <div 
                      onClick={() => onPlayTrack(track, tracks)}
                      className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                    >
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-cover shrink-0 shadow"
                      />
                      <div className="min-w-0">
                        <h4 className={`text-sm font-semibold truncate ${
                          currentTrack?.id === track.id ? 'text-[#1ed760]' : 'text-white'
                        }`}>
                          {track.title}
                        </h4>
                        <p className="text-xs text-zinc-400 truncate">
                          {track.album || artist.name}
                        </p>
                      </div>
                    </div>

                    {/* Plays Count */}
                    <div className="hidden md:block text-xs text-zinc-400 font-mono w-28 text-left">
                      {track.playCount || '18,500,000'}
                    </div>

                    {/* Duration & Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Favorite button */}
                      <button
                        onClick={() => onToggleFavorite(track)}
                        className={`p-1.5 transition-colors ${
                          isFav ? 'text-[#1ed760]' : 'text-zinc-500 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-[#1ed760]' : ''}`} />
                      </button>

                      {/* Download button */}
                      <button
                        disabled={isDownloading}
                        onClick={() => onDownloadTrack(track)}
                        title={isDownloaded ? 'محفوظ أوفلاين' : 'تحميل أوفلاين'}
                        className={`p-1.5 transition-colors ${
                          isDownloaded 
                            ? 'text-[#1ed760]' 
                            : isDownloading 
                            ? 'text-amber-400 animate-spin' 
                            : 'text-zinc-500 hover:text-white'
                        }`}
                      >
                        {isDownloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                      </button>

                      {/* Duration */}
                      <span className="text-xs font-mono text-zinc-400 w-12 text-left">
                        {formatDuration(track.duration)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. About Artist Box (Spotify Style) */}
          <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-10">
            <h2 className="text-xl font-bold text-white mb-4">نبذة عن الفنان</h2>
            <div className="relative rounded-3xl p-6 sm:p-8 bg-zinc-900/60 border border-white/5 overflow-hidden">
              <div className="max-w-2xl space-y-3 relative z-10">
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                  {artist.bio}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {artist.genres.map(g => (
                    <span 
                      key={g} 
                      className="text-xs px-3 py-1 rounded-full bg-white/5 text-zinc-300 border border-white/10"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
