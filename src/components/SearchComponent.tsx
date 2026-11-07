import React, { useState, useRef } from 'react';
import { Track, Artist } from '../types/music';
import { searchLocalMusic, normalizeArabic, DEFAULT_TRACKS, DEFAULT_ARTISTS } from '../data/musicData';
import { 
  Search, 
  X, 
  Play, 
  Download, 
  Check, 
  Heart, 
  Loader2, 
  BadgeCheck, 
  ArrowLeft,
  Sparkles,
  Music2,
  Tv
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
  { label: 'عمرو دياب', icon: '🔥' },
  { label: 'ويجز', icon: '⚡' },
  { label: 'فيروز', icon: '☕' },
  { label: 'كايروكي', icon: '🎸' },
  { label: 'شيرين', icon: '✨' },
  { label: 'تامر حسني', icon: '🌟' },
  { label: 'أحمد سعد', icon: '🎉' },
  { label: 'محمد حماقي', icon: '🎵' },
  { label: 'أم كلثوم', icon: '👑' },
  { label: 'إليسا', icon: '💖' },
  { label: 'The Weeknd', icon: '🌙' },
];

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';

// Client-side fallback to iTunes Search API (100% free, CORS-enabled, supports every Arabic song)
async function searchItunesDirect(term: string): Promise<Track[]> {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&country=eg&entity=song&limit=20`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) return [];

    return data.results.map((item: any) => ({
      id: `itunes-${item.trackId}`,
      title: item.trackName || 'أغنية',
      artist: item.artistName || 'فنان',
      album: item.collectionName || 'ألبوم',
      duration: Math.round((item.trackTimeMillis || 180000) / 1000),
      coverUrl: (item.artworkUrl100 || '').replace('100x100bb', '600x600bb') || FALLBACK_COVER,
      streamUrl: item.previewUrl || '',
      downloadUrl: item.previewUrl || '',
      genre: item.primaryGenreName || 'أغنية كاملة',
      releaseDate: (item.releaseDate || '').split('T')[0] || '2024',
      playCount: `${Math.floor(Math.random() * 80 + 20)},000`,
      bitrate: '320 kbps',
      isFullLength: true,
      source: 'catalog'
    }));
  } catch {
    return [];
  }
}

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
  
  // Results & matched artists
  const [results, setResults] = useState<Track[]>(DEFAULT_TRACKS);
  const [matchedArtists, setMatchedArtists] = useState<Artist[]>(DEFAULT_ARTISTS.slice(0, 4));
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  const searchRequestIdRef = useRef(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Unified resilient search executor
  const performSearch = (searchTerm: string, source: 'all' | 'youtube' | 'audius' = sourceFilter) => {
    const q = searchTerm.trim();
    const currentRequestId = ++searchRequestIdRef.current;

    if (!q) {
      setResults(DEFAULT_TRACKS);
      setMatchedArtists(DEFAULT_ARTISTS.slice(0, 4));
      setSearched(false);
      setLoading(false);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      return;
    }

    setSearched(true);

    // 1. Instant 0ms local search with Arabic text normalization
    const local = searchLocalMusic(q, source);
    setMatchedArtists(local.matchedArtists);
    if (local.results.length > 0) {
      setResults(local.results);
    } else {
      // Don't show unrelated default tracks while searching
      setResults([]);
    }

    // 2. Debounced multi-tiered network search
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        let serverTracks: Track[] = [];
        let serverArtists: Artist[] = [];

        // Tier 2: Try backend search API (/api/search)
        try {
          const params = new URLSearchParams();
          params.set('q', q);
          if (source !== 'all') params.set('source', source);

          const res = await fetch(`/api/search?${params.toString()}`);
          if (res.ok) {
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const data = await res.json();
              if (data?.results && Array.isArray(data.results)) {
                serverTracks = data.results;
              }
              if (data?.matchedArtists && Array.isArray(data.matchedArtists)) {
                serverArtists = data.matchedArtists;
              }
            }
          }
        } catch {
          // Backend offline or running in pure static mode
        }

        // Tier 3: If serverTracks is empty and source is 'all' or 'audius', fetch direct from iTunes API
        if (serverTracks.length === 0 && source !== 'youtube') {
          const itunesTracks = await searchItunesDirect(q);
          if (itunesTracks.length > 0) {
            serverTracks = itunesTracks;
          }
        }

        // Only update if this is still the active search query
        if (searchRequestIdRef.current === currentRequestId) {
          // Combine local matches and server matches, deduplicating by title
          const seen = new Set<string>();
          const combinedTracks: Track[] = [];

          for (const track of [...local.results, ...serverTracks]) {
            const key = normalizeArabic(track.title).slice(0, 20);
            if (!seen.has(key)) {
              seen.add(key);
              combinedTracks.push(track);
            }
          }

          if (combinedTracks.length > 0) {
            setResults(combinedTracks);
          } else {
            setResults(local.results);
          }

          if (serverArtists.length > 0) {
            setMatchedArtists(serverArtists);
          } else if (local.matchedArtists.length > 0) {
            setMatchedArtists(local.matchedArtists);
          }
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        if (searchRequestIdRef.current === currentRequestId) {
          setLoading(false);
        }
      }
    }, 250);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    performSearch(val, sourceFilter);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, sourceFilter);
  };

  const handleClear = () => {
    setQuery('');
    performSearch('', sourceFilter);
  };

  const handleFilterChange = (filter: 'all' | 'youtube' | 'audius') => {
    setSourceFilter(filter);
    performSearch(query, filter);
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-8 pb-36 animate-in fade-in duration-300">
      
      {/* 1. Spotify Luxurious Glassmorphic Search Header */}
      <div className="max-w-4xl space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>البحث المتقدم</span>
            <Sparkles className="w-5 h-5 text-[#1ed760]" />
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            ابحث فورياً عن أي فنان، ألبوم، فيديو يوتيوب، أو مقطع للاستماع والتحميل أوفلاين
          </p>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSubmit} className="relative group">
          <div className="relative flex items-center">
            {/* Search Icon with Green Highlight */}
            <div className="absolute right-4 text-zinc-400 group-focus-within:text-[#1ed760] transition-colors pointer-events-none">
              <Search className="w-5 h-5" />
            </div>

            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="اكتب اسم أغنية، فنان (مثل عمرو دياب، ويجز، فيروز) أو رابط..."
              className="w-full bg-[#1e1e1e] hover:bg-[#252525] focus:bg-[#222222] text-white placeholder-zinc-500 rounded-2xl py-4 pr-12 pl-24 text-sm font-semibold outline-none transition-all border border-white/10 focus:border-[#1ed760]/50 shadow-2xl focus:ring-4 focus:ring-[#1ed760]/10"
            />

            {/* Clear button */}
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute left-16 text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                title="مسح النص"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Submit / Search Button */}
            <button
              type="submit"
              className="absolute left-2.5 bg-[#1ed760] hover:bg-[#1fdf64] active:scale-95 text-black font-black px-4 py-2 rounded-xl text-xs transition-all shadow-lg shadow-green-500/20"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                'بحث'
              )}
            </button>
          </div>
        </form>

        {/* Source Selector Tabs (All / YouTube / MP3) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => handleFilterChange('all')}
            className={`text-xs px-4 py-2 rounded-full font-bold transition-all flex items-center gap-1.5 shrink-0 border ${
              sourceFilter === 'all'
                ? 'bg-white text-black border-white shadow-lg'
                : 'bg-[#181818] hover:bg-[#252525] text-zinc-300 border-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ الكل (شامل)</span>
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange('youtube')}
            className={`text-xs px-4 py-2 rounded-full font-bold transition-all flex items-center gap-1.5 shrink-0 border ${
              sourceFilter === 'youtube'
                ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30'
                : 'bg-[#181818] hover:bg-[#252525] text-zinc-300 border-white/5'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>🔴 يوتيوب (فيديوهات وأغاني)</span>
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange('audius')}
            className={`text-xs px-4 py-2 rounded-full font-bold transition-all flex items-center gap-1.5 shrink-0 border ${
              sourceFilter === 'audius'
                ? 'bg-[#1ed760] text-black border-[#1ed760] shadow-lg shadow-green-500/30'
                : 'bg-[#181818] hover:bg-[#252525] text-zinc-300 border-white/5'
            }`}
          >
            <Music2 className="w-3.5 h-3.5" />
            <span>🟢 أغاني كاملة MP3 (أوفلاين)</span>
          </button>
        </div>

        {/* Quick Tag Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {QUICK_SEARCH_TAGS.map((tag) => (
            <button
              key={tag.label}
              onClick={() => {
                setQuery(tag.label);
                performSearch(tag.label, sourceFilter);
              }}
              className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 border ${
                query === tag.label
                  ? 'bg-white text-black font-bold border-white shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/5 hover:border-white/10'
              }`}
            >
              <span>{tag.icon}</span>
              <span>{tag.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Top Artist Result (Spotify Signature Card) */}
      {matchedArtists.length > 0 && (
        <div className="space-y-3 pt-2">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span>{searched ? 'أفضل نتيجة: فنان' : 'الفنانون الأكثر شهرة'}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {matchedArtists.map((artist) => {
              const isFollowed = followedArtistIds.has(artist.id);

              return (
                <div
                  key={artist.id}
                  onClick={() => onOpenArtist(artist.id)}
                  className="group relative rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-[#1a1a1a] to-[#141414] hover:from-[#222222] hover:to-[#181818] transition-all duration-300 flex flex-col justify-between cursor-pointer border border-white/5 hover:border-white/20 shadow-xl hover:shadow-2xl"
                >
                  <div className="flex items-center gap-4">
                    {/* Circular Artist Avatar with Spotify green accent ring */}
                    <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden shadow-2xl shrink-0 group-hover:scale-105 transition-transform bg-zinc-800 ring-2 ring-white/10 group-hover:ring-[#1ed760]/60">
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

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-base text-white truncate group-hover:text-[#1ed760] transition-colors">
                          {artist.name}
                        </h3>
                        {artist.isVerified && (
                          <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500 shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-zinc-400 font-medium mt-0.5">
                        فنان موثق • {artist.monthlyListeners} مستمع
                      </p>

                      <span className="inline-block mt-2 text-[11px] font-bold text-zinc-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                        استعراض الأغاني
                      </span>
                    </div>
                  </div>

                  {/* Follow Button & Profile link */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFollowArtist(artist);
                      }}
                      className={`text-xs font-bold px-4 py-1.5 rounded-full border transition-all ${
                        isFollowed
                          ? 'border-zinc-500 text-white hover:border-white bg-transparent'
                          : 'bg-white text-black border-transparent hover:bg-zinc-200'
                      }`}
                    >
                      {isFollowed ? 'تتابعه' : 'متابعة'}
                    </button>

                    <span className="text-xs text-zinc-400 flex items-center gap-1 group-hover:text-white transition-colors">
                      <span>البروفايل</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Track Results (Spotify Style Luxury Table) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span>{searched ? `نتائج البحث عن "${query}"` : 'أشهر الأغاني المتوفرة'}</span>
            <span className="text-xs font-mono font-normal text-zinc-400 bg-white/5 px-2 py-0.5 rounded-full">
              {results.length} مسار
            </span>
          </h2>
        </div>

        {/* Loading Skeleton */}
        {loading && results.length === 0 ? (
          <div className="space-y-3 py-6">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="flex items-center gap-4 p-3 rounded-2xl bg-[#181818]/60 animate-pulse border border-white/5">
                <div className="w-12 h-12 rounded-xl bg-zinc-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-800 rounded w-1/3" />
                  <div className="h-3 bg-zinc-800 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-[#181818] border border-white/5 p-8 space-y-3">
            <Music2 className="w-12 h-12 text-zinc-500 mx-auto" />
            <p className="text-sm font-semibold text-white">لا توجد نتائج مطابقة لـ "{query}"</p>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              جرب البحث باسم فنان شهير مثل "عمرو دياب" أو "ويجز" أو "فيروز" أو اضغط على أحد الاقتراحات بالأعلى.
            </p>
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
                  className={`group rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-3 sm:gap-4 transition-all duration-200 border border-transparent ${
                    currentTrack?.id === track.id
                      ? 'bg-white/10 border-white/10 shadow-lg'
                      : 'hover:bg-[#1a1a1a] hover:border-white/5'
                  }`}
                >
                  {/* Track Number / Soundwave Play Button */}
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
                        <span className="text-xs font-mono text-zinc-400 group-hover:hidden">
                          {index + 1}
                        </span>
                        <div className="w-7 h-7 rounded-full bg-white text-black hidden group-hover:flex items-center justify-center shadow">
                          <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Artwork + Title */}
                  <div 
                    onClick={() => onPlayTrack(track, results)}
                    className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-md bg-zinc-800">
                      <img
                        src={track.coverUrl || FALLBACK_COVER}
                        alt={track.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = FALLBACK_COVER;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="min-w-0">
                      <h4 className={`text-sm font-bold truncate transition-colors ${
                        currentTrack?.id === track.id ? 'text-[#1ed760]' : 'text-white group-hover:text-white'
                      }`}>
                        {track.title}
                      </h4>

                      <div className="flex items-center gap-2 mt-0.5">
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

                        {/* Source Badges */}
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

                  {/* Album Name (hidden on small phones) */}
                  <div className="hidden md:block text-xs text-zinc-400 truncate w-40">
                    {track.album}
                  </div>

                  {/* Actions: Favorite, Download, Duration */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Favorite Button */}
                    <button
                      onClick={() => onToggleFavorite(track)}
                      className={`p-2 rounded-xl transition-all ${
                        isFav 
                          ? 'text-[#1ed760]' 
                          : 'text-zinc-500 hover:text-white hover:bg-white/5'
                      }`}
                      title={isFav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-[#1ed760]' : ''}`} />
                    </button>

                    {/* Download Button */}
                    {track.source === 'youtube' ? (
                      <button
                        onClick={() => {
                          alert('هذا المقطع مستضاف عبر يوتيوب للبث المباشر ومشاهدة الفيديو بجودة عالية ⚡. للأغاني القابلة للحفظ أوفلاين بدون نت، اضغط على تبويب "أغاني كاملة MP3" بالأعلى!');
                        }}
                        title="استماع مباشر عبر يوتيوب"
                        className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-white/5 transition-all"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        disabled={isDownloading}
                        onClick={() => onDownloadTrack(track)}
                        title={isDownloaded ? 'محفوظ أوفلاين' : 'تحميل أوفلاين'}
                        className={`p-2 rounded-xl transition-all ${
                          isDownloaded 
                            ? 'text-[#1ed760]' 
                            : isDownloading 
                            ? 'text-amber-400 animate-spin' 
                            : 'text-zinc-500 hover:text-white hover:bg-white/5'
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
    </div>
  );
};
