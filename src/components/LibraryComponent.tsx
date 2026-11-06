import React, { useState } from 'react';
import { Track, DownloadedTrack, StorageInfo, Artist } from '../types/music';
import { 
  Download, 
  Trash2, 
  Play, 
  HardDrive, 
  Search, 
  Users, 
  Heart, 
  BadgeCheck, 
  Clock, 
  ArrowLeft,
  FolderDown,
  UserCheck
} from 'lucide-react';
import { exportAudioToDevice } from '../services/db';

interface LibraryComponentProps {
  downloadedTracks: DownloadedTrack[];
  storageInfo: StorageInfo;
  onPlayTrack: (track: Track, queue: Track[]) => void;
  currentTrack: Track | null;
  isPlaying: boolean;
  onDeleteTrack: (trackId: string) => void;
  onClearAll: () => void;
  onGoToSearch: () => void;
  followedArtists: Artist[];
  onOpenArtist: (artistId: string) => void;
  favoriteTracks: Track[];
}

export const LibraryComponent: React.FC<LibraryComponentProps> = ({
  downloadedTracks,
  storageInfo,
  onPlayTrack,
  currentTrack,
  isPlaying,
  onDeleteTrack,
  onClearAll,
  onGoToSearch,
  followedArtists,
  onOpenArtist,
  favoriteTracks,
}) => {
  const [subTab, setSubTab] = useState<'downloads' | 'artists' | 'favorites'>('downloads');
  const [filterQuery, setFilterQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredDownloads = downloadedTracks.filter(t => 
    t.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
    t.artist.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const filteredArtists = followedArtists.filter(a =>
    a.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    (a.englishName && a.englishName.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${Math.round(bytes / 1024)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6 pb-32">
      {/* 1. Spotify Library Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            مكتبتك الموسيقية
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            جميع أغانيك المحملة أوفلاين والفنانون الذين تتابعهم في مكان واحد
          </p>
        </div>

        {/* Storage pill */}
        <div className="bg-[#181818] border border-white/5 rounded-2xl px-4 py-2 flex items-center gap-3 self-start sm:self-auto">
          <HardDrive className="w-4 h-4 text-[#1ed760]" />
          <div className="text-xs">
            <span className="text-zinc-400">الذاكرة المستخدمة: </span>
            <span className="font-bold text-white font-mono">{formatSize(storageInfo.usedBytes)}</span>
          </div>
        </div>
      </div>

      {/* 2. Sub-Tabs Filter: Downloads vs Followed Artists vs Favorites */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <button
          onClick={() => setSubTab('downloads')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
            subTab === 'downloads'
              ? 'bg-white text-black'
              : 'bg-[#181818] hover:bg-[#282828] text-zinc-300'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>التحميلات ({downloadedTracks.length})</span>
        </button>

        <button
          onClick={() => setSubTab('artists')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
            subTab === 'artists'
              ? 'bg-white text-black'
              : 'bg-[#181818] hover:bg-[#282828] text-zinc-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>الفنانون المتابعون ({followedArtists.length})</span>
        </button>

        <button
          onClick={() => setSubTab('favorites')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
            subTab === 'favorites'
              ? 'bg-white text-black'
              : 'bg-[#181818] hover:bg-[#282828] text-zinc-300'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>المفضلة ({favoriteTracks.length})</span>
        </button>
      </div>

      {/* 3. Search Filter in Library */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder={subTab === 'artists' ? 'ابحث في الفنانين المتابعين...' : 'ابحث في أغانيك...'}
            className="w-full bg-[#181818] border border-transparent focus:border-white/20 rounded-full py-2 pr-9 pl-4 text-xs text-white placeholder-zinc-500 outline-none transition-all"
          />
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute right-3.5 top-2.5" />
        </div>

        {subTab === 'downloads' && downloadedTracks.length > 0 && (
          <div>
            {showClearConfirm ? (
              <div className="flex items-center gap-2 bg-rose-950/80 border border-rose-800 p-1.5 rounded-xl text-xs">
                <span className="text-rose-200">حذف الكل؟</span>
                <button
                  onClick={() => {
                    onClearAll();
                    setShowClearConfirm(false);
                  }}
                  className="px-2 py-1 rounded-lg bg-rose-600 text-white font-bold"
                >
                  نعم
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2 py-1 rounded-lg bg-zinc-800 text-zinc-300"
                >
                  إلغاء
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-400 hover:text-rose-400 hover:bg-rose-950/20 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف الكل</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4. Tab Content: Followed Artists */}
      {subTab === 'artists' && (
        <div>
          {followedArtists.length === 0 ? (
            <div className="py-20 text-center rounded-2xl bg-[#181818] p-8 space-y-3">
              <Users className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-white">لم تقم بمتابعة أي فنان بعد</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                ابحث عن فنانك المفضل واضغط على زر "متابعة" لتصل إلى بروفايله وجميع أغانيه هنا في مكتبتك مباشرة.
              </p>
              <button
                onClick={onGoToSearch}
                className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow"
              >
                تصفح الفنانين
              </button>
            </div>
          ) : filteredArtists.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-xs">
              لم يتم العثور على فنانين مطابقين لـ "{filterQuery}"
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredArtists.map((artist) => (
                <div
                  key={artist.id}
                  onClick={() => onOpenArtist(artist.id)}
                  className="group rounded-2xl p-4 bg-[#181818] hover:bg-[#282828] transition-all flex flex-col items-center text-center cursor-pointer border border-white/5"
                >
                  <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-xl mb-3 group-hover:scale-105 transition-transform bg-zinc-800">
                    <img
                      src={artist.avatarUrl}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <h4 className="font-bold text-sm text-white truncate group-hover:text-[#1ed760] transition-colors">
                      {artist.name}
                    </h4>
                    {artist.isVerified && (
                      <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500 shrink-0" />
                    )}
                  </div>

                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    فنان • {artist.followersCount}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Tab Content: Downloaded Tracks (Offline) */}
      {subTab === 'downloads' && (
        <div>
          {downloadedTracks.length === 0 ? (
            <div className="py-20 text-center rounded-2xl bg-[#181818] p-8 space-y-3">
              <FolderDown className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-white">لا توجد أغانٍ محملة حالياً</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                اضغط على زر التحميل بجانب أي أغنية لحفظها في ذاكرة جهازك والاستماع إليها أوفلاين في أي وقت بدون إنترنت.
              </p>
              <button
                onClick={onGoToSearch}
                className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow"
              >
                استكشف الأغاني
              </button>
            </div>
          ) : filteredDownloads.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-xs">
              لم يتم العثور على أغانٍ محملة مطابقة لـ "{filterQuery}"
            </div>
          ) : (
            <div className="space-y-1">
              {filteredDownloads.map((track, index) => {
                const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;

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
                      onClick={() => onPlayTrack(track, filteredDownloads)}
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
                      onClick={() => onPlayTrack(track, filteredDownloads)}
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
                        <p 
                          onClick={(e) => {
                            if (track.artistId) {
                              e.stopPropagation();
                              onOpenArtist(track.artistId);
                            }
                          }}
                          className={`text-xs truncate ${
                            track.artistId ? 'text-zinc-400 hover:text-white hover:underline' : 'text-zinc-400'
                          }`}
                        >
                          {track.artist}
                        </p>
                      </div>
                    </div>

                    {/* File Size */}
                    <div className="hidden sm:block text-xs text-zinc-400 font-mono">
                      {formatSize(track.fileSize)}
                    </div>

                    {/* Duration & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Export MP3 to device storage */}
                      <button
                        onClick={() => exportAudioToDevice(track)}
                        title="حفظ ملف MP3 على جهازك"
                        className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                      >
                        <HardDrive className="w-4 h-4" />
                      </button>

                      {/* Delete from offline storage */}
                      <button
                        onClick={() => onDeleteTrack(track.id)}
                        title="حذف من الذاكرة"
                        className="p-1.5 text-zinc-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

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

      {/* 6. Tab Content: Favorites */}
      {subTab === 'favorites' && (
        <div>
          {favoriteTracks.length === 0 ? (
            <div className="py-20 text-center rounded-2xl bg-[#181818] p-8 space-y-3">
              <Heart className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-white">لا توجد أغانٍ مفضلة بعد</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                اضغط على علامة القلب بجانب أي أغنية لإضافتها إلى قائمة الأغاني المفضلة.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {favoriteTracks.map((track, index) => {
                const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;

                return (
                  <div
                    key={track.id}
                    className={`group rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-3 sm:gap-4 transition-colors ${
                      currentTrack?.id === track.id
                        ? 'bg-white/10'
                        : 'hover:bg-[#1f1f1f]'
                    }`}
                  >
                    <div 
                      onClick={() => onPlayTrack(track, favoriteTracks)}
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

                    <div 
                      onClick={() => onPlayTrack(track, favoriteTracks)}
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
                        <p 
                          onClick={(e) => {
                            if (track.artistId) {
                              e.stopPropagation();
                              onOpenArtist(track.artistId);
                            }
                          }}
                          className={`text-xs truncate ${
                            track.artistId ? 'text-zinc-400 hover:text-white hover:underline' : 'text-zinc-400'
                          }`}
                        >
                          {track.artist}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-mono text-zinc-400 w-12 text-left">
                      {formatDuration(track.duration)}
                    </span>
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
