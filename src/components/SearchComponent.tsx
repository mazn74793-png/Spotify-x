import React, { useState, useEffect } from 'react';
import { Track, Artist } from '../types/music';
import { searchLocalMusic } from '../data/musicData';
import { 
  Search, 
  X, 
  Play, 
  Download, 
  Check, 
  Heart, 
  Clock, 
  Loader2, 
  BadgeCheck, 
  Plus, 
  User, 
  ArrowLeft
} from 'lucide-react';

interface SearchComponentProps {
  onPlayTrack: (track: Track, queue: Track[]) => void;
  currentTrack: Track | null;
  isPlaying: boolean;
  downloadedIds: Set<string>;
  downloadingIds: Map<string, number>;
  onDownloadTrack: (track: Track) => void;
  favorites: Set<string>;
  onToggleFavorite: (track: Track) => void;
  onOpenArtist: (artistId: string) => void;
  followedArtistIds: Set<string>;
  onToggleFollowArtist: (artist: Artist) => void;
}

const QUICK_SEARCH_TAGS = [
  'عمرو دياب',
  'فيروز',
  'شيرين',
  'تامر حسني',
  'حماقي',
  'أم كلثوم',
  'عبد الحليم',
  'The Weeknd',
  'لو فاي'
];

export const SearchComponent: React.FC<SearchComponentProps> = ({
  onPlayTrack,
  currentTrack,
  isPlaying,
  downloadedIds,
  downloadingIds,
  onDownloadTrack,
  favorites,
  onToggleFavorite,
  onOpenArtist,
  followedArtistIds,
  onToggleFollowArtist,
}) => {
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'youtube' | 'audius'>('all');
  const [results, setResults] = useState<Track[]>([]);
  const [matchedArtists, setMatchedArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    fetchResults('', sourceFilter);
  }, [sourceFilter]);

  const fetchResults = async (searchTerm: string, source: 'all' | 'youtube' | 'audius' = sourceFilter) => {
    setLoading(true);
    try {
      const q = searchTerm.trim();
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (source !== 'all') params.set('source', source);

      const url = `/api/search?${params.toString()}`;
      const res = await fetch(url);
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && (data.results?.length || data.matchedArtists?.length)) {
            setResults(data.results || []);
            setMatchedArtists(data.matchedArtists || []);
            setSearched(Boolean(q));
            return;
          }
        }
      }
      // Offline / Vercel fallback
      const local = searchLocalMusic(searchTerm, source);
      setResults(local.results);
      setMatchedArtists(local.matchedArtists);
      setSearched(Boolean(q));
    } catch (err) {
      console.warn('Network search error, using local database fallback:', err);
      const local = searchLocalMusic(searchTerm, source);
      setResults(local.results);
      setMatchedArtists(local.matchedArtists);
      setSearched(Boolean(searchTerm.trim()));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults(query, sourceFilter);
  };

  const handleClear = () => {
    setQuery('');
    fetchResults('', sourceFilter);
  };

  const handleFilterChange = (filter: 'all' | 'youtube' | 'audius') => {
    setSourceFilter(filter);
    fetchResults(query, filter);
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-8 pb-32">
      {/* 1. Spotify Top Search Bar */}
      <div className="max-w-3xl space-y-3">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!e.target.value) fetchResults('', sourceFilter);
              }}
              placeholder="ابحث عن أي أغنية، فيديو يوتيوب، فنان، أو ألبوم..."
              className="w-full bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#242424] text-white placeholder-zinc-400 rounded-full py-3.5 pr-12 pl-24 text-sm font-medium outline-none transition-all border border-transparent focus:border-white/20 shadow-lg"
            />

            <div className="absolute right-4 text-zinc-400">
              <Search className="w-5 h-5" />
            </div>

            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute left-16 text-zinc-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              className="absolute left-2.5 bg-white hover:bg-zinc-200 text-black font-bold px-4 py-1.5 rounded-full text-xs transition-all active:scale-95 shadow"
            >
              بحث
            </button>
          </div>
        </form>

        {/* Source Selector Tabs (All / YouTube / MP3) */}
        <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => handleFilterChange('all')}
            className={`text-xs px-4 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              sourceFilter === 'all'
                ? 'bg-white text-black shadow'
                : 'bg-[#242424] hover:bg-[#2e2e2e] text-zinc-300'
            }`}
          >
            <span>✨ الكل</span>
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange('youtube')}
            className={`text-xs px-4 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              sourceFilter === 'youtube'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-[#242424] hover:bg-[#2e2e2e] text-zinc-300'
            }`}
          >
            <span>🔴 يوتيوب (بحث شامل)</span>
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange('audius')}
            className={`text-xs px-4 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              sourceFilter === 'audius'
                ? 'bg-[#1ed760] text-black shadow-lg shadow-green-500/30'
                : 'bg-[#242424] hover:bg-[#2e2e2e] text-zinc-300'
            }`}
          >
            <span>🟢 أغاني كاملة MP3 (تحميل أوفلاين)</span>
          </button>
        </div>

        {/* Quick Tag Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {QUICK_SEARCH_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setQuery(tag);
                fetchResults(tag, sourceFilter);
              }}
              className={`text-xs px-3 py-1 rounded-full transition-all ${
                query === tag
                  ? 'bg-zinc-200 text-black font-bold'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-400'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Loading State */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#1ed760]" />
          <p className="text-xs">جاري البحث...</p>
        </div>
      )}

      {/* 3. Matched Artist Top Result (Spotify Style) */}
      {!loading && matchedArtists.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-white">
            {searched ? 'أفضل نتيجة: فنان' : 'الفنانون الأكثر شهرة'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {matchedArtists.map((artist) => {
              const isFollowed = followedArtistIds.has(artist.id);

              return (
                <div
                  key={artist.id}
                  className="group relative rounded-2xl p-4 bg-[#181818] hover:bg-[#282828] transition-all duration-200 flex flex-col justify-between cursor-pointer border border-white/5"
                  onClick={() => onOpenArtist(artist.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Round Artist Avatar */}
                    <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden shadow-xl shrink-0 group-hover:scale-105 transition-transform bg-zinc-800">
                      <img
                        src={artist.avatarUrl}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-base text-white truncate group-hover:text-[#1ed760] transition-colors">
                          {artist.name}
                        </h3>
                        {artist.isVerified && (
                          <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500 shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-zinc-400 font-medium mt-0.5">
                        فنان • {artist.monthlyListeners} مستمع
                      </p>

                      <span className="inline-block mt-2 text-[11px] font-bold text-zinc-400 bg-white/5 px-2.5 py-0.5 rounded-full">
                        تصفح الأغاني الكاملة
                      </span>
                    </div>
                  </div>

                  {/* Follow Button */}
                  <div className="mt-3.5 pt-3 border-t border-white/5 flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFollowArtist(artist);
                      }}
                      className={`text-xs font-bold px-4 py-1.5 rounded-full border transition-all ${
                        isFollowed
                          ? 'border-zinc-500 text-white hover:border-white'
                          : 'bg-white text-black border-transparent hover:bg-zinc-200'
                      }`}
                    >
                      {isFollowed ? 'تتابعه' : 'متابعة'}
                    </button>

                    <span className="text-xs text-zinc-400 flex items-center gap-1 group-hover:text-white">
                      <span>عرض البروفايل</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Track Results List (Spotify Style Table Rows) */}
      {!loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {searched ? `الأغاني المتعلقة بـ "${query}"` : 'أشهر الأغاني المتوفرة'}
            </h2>
            <span className="text-xs text-zinc-400 font-medium">
              {results.length} مقطع
            </span>
          </div>

          {results.length === 0 ? (
            <div className="py-16 text-center text-zinc-400 bg-[#181818] rounded-2xl p-8">
              لا توجد نتائج مطابقة لبحثك. جرب اسم فنان مثل "عمرو دياب" أو "فيروز".
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((track, index) => {
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
                        : 'hover:bg-[#1f1f1f]'
                    }`}
                  >
                    {/* Index or Play icon */}
                    <div 
                      onClick={() => onPlayTrack(track, results)}
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

                    {/* Artwork + Title */}
                    <div 
                      onClick={() => onPlayTrack(track, results)}
                      className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                    >
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-11 h-11 rounded-lg object-cover shrink-0 shadow"
                      />
                      <div className="min-w-0">
                        <h4 className={`text-sm font-semibold truncate ${
                          currentTrack?.id === track.id ? 'text-[#1ed760]' : 'text-white'
                        }`}>
                          {track.title}
                        </h4>

                        {/* Clickable Artist Name opens their profile + Source Badge */}
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p 
                            onClick={(e) => {
                              if (track.artistId) {
                                e.stopPropagation();
                                onOpenArtist(track.artistId);
                              }
                            }}
                            className={`text-xs truncate transition-colors ${
                              track.artistId 
                                ? 'text-zinc-400 hover:text-white hover:underline' 
                                : 'text-zinc-400'
                            }`}
                          >
                            {track.artist}
                          </p>
                          {track.source === 'youtube' ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-600/20 text-red-400 border border-red-500/20 shrink-0">
                              يوتيوب
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#1ed760]/10 text-[#1ed760] shrink-0">
                              MP3 كامل
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Album Name */}
                    <div className="hidden lg:block text-xs text-zinc-400 truncate w-36">
                      {track.album}
                    </div>

                    {/* Actions: Favorite, Download, Duration */}
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Favorite Button */}
                      <button
                        onClick={() => onToggleFavorite(track)}
                        className={`p-1.5 transition-colors ${
                          isFav ? 'text-[#1ed760]' : 'text-zinc-500 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-[#1ed760]' : ''}`} />
                      </button>

                      {/* Download Button */}
                      {track.source === 'youtube' ? (
                        <button
                          onClick={() => {
                            alert('هذا المقطع مستضاف عبر يوتيوب للاستماع المباشر ومشاهدة الفيديو بجودة عالية ⚡. للأغاني القابلة للحفظ أوفلاين بدون نت، اضغط على تبويب "أغاني كاملة MP3" بالأعلى!');
                          }}
                          title="استماع مباشر عبر يوتيوب"
                          className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      ) : (
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
                      )}

                      {/* Duration */}
                      <span className="text-xs font-mono text-zinc-400 w-12 text-left">
                        {formatDuration(track.duration)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
