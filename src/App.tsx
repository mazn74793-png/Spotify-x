import React, { useState, useEffect, useCallback } from 'react';
import { Track, DownloadedTrack, ActiveTab, StorageInfo, Artist } from './types/music';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { 
  downloadTrackToIndexedDB, 
  getAllDownloadedTracks, 
  deleteDownloadedTrack, 
  clearAllDownloadedTracks, 
  getStorageMetrics 
} from './services/db';

import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { HomeComponent } from './components/HomeComponent';
import { SearchComponent } from './components/SearchComponent';
import { LibraryComponent } from './components/LibraryComponent';
import { DeveloperDocsComponent } from './components/DeveloperDocsComponent';
import { PlayerComponent } from './components/PlayerComponent';
import { ArtistProfileModal } from './components/ArtistProfileModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { UserProfileModal } from './components/UserProfileModal';
import { OfflineBanner } from './components/OfflineBanner';
import { recordTrackPlay } from './services/recommendationEngine';
import confetti from 'canvas-confetti';
import { ListPlus } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Connectivity
  const isOnline = useOnlineStatus();

  // Audio Player State & Controls
  const {
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
    playbackRate,
    setPlaybackRate,
    jumpForward,
    jumpBackward,
    queue,
    queueIndex,
    playQueueIndex,
    removeFromQueue,
    addToQueueNext,
    playTrack,
    togglePlay,
    seek,
    playNext,
    playPrevious,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    setTimer,
    userProfile,
  } = useAudioPlayer();

  // Add to Queue with sleek toast feedback
  const handleAddToQueue = useCallback((track: Track) => {
    addToQueueNext(track);
    setToastMessage(`تمت إضافة "${track.title}" إلى قائمة التشغيل`);
    setTimeout(() => {
      setToastMessage((curr) => (curr?.includes(track.title) ? null : curr));
    }, 2500);
  }, [addToQueueNext]);

  // Smart Play Handler that feeds the recommendation engine
  const handlePlayTrack = useCallback((track: Track, queue: Track[] = []) => {
    recordTrackPlay(track);
    playTrack(track, queue);
  }, [playTrack]);

  // Downloads & IndexedDB State
  const [downloadedTracks, setDownloadedTracks] = useState<DownloadedTrack[]>([]);
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());
  const [downloadingIds, setDownloadingIds] = useState<Map<string, number>>(new Map());
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({ usedBytes: 0, totalBytes: 0, songsCount: 0 });

  // Favorites State (persisted in localStorage)
  const [favoriteTracks, setFavoriteTracks] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem('naghamat_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const favoriteIds = new Set(favoriteTracks.map(t => t.id));

  // Followed Artists State (persisted in localStorage)
  const [followedArtists, setFollowedArtists] = useState<Artist[]>(() => {
    try {
      const saved = localStorage.getItem('naghamat_followed_artists');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const followedArtistIds = new Set(followedArtists.map(a => a.id));

  // Sync favorites
  useEffect(() => {
    try {
      localStorage.setItem('naghamat_favorites', JSON.stringify(favoriteTracks));
    } catch (e) {
      console.warn('Failed to save favorites:', e);
    }
  }, [favoriteTracks]);

  // Sync followed artists
  useEffect(() => {
    try {
      localStorage.setItem('naghamat_followed_artists', JSON.stringify(followedArtists));
    } catch (e) {
      console.warn('Failed to save followed artists:', e);
    }
  }, [followedArtists]);

  // Load downloads from IndexedDB
  const refreshDownloads = useCallback(async () => {
    try {
      const tracks = await getAllDownloadedTracks();
      setDownloadedTracks(tracks);
      setDownloadedIds(new Set(tracks.map(t => t.id)));
      const metrics = await getStorageMetrics();
      setStorageInfo(metrics);
    } catch (err) {
      console.error('Error loading downloaded tracks:', err);
    }
  }, []);

  useEffect(() => {
    refreshDownloads();
  }, [refreshDownloads]);

  // Download Handler with celebration
  const handleDownloadTrack = async (track: Track) => {
    if (downloadingIds.has(track.id)) return;

    setDownloadingIds(prev => new Map(prev).set(track.id, 5));

    try {
      await downloadTrackToIndexedDB(track, (percentage) => {
        setDownloadingIds(prev => new Map(prev).set(track.id, percentage));
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#1ed760', '#ffffff', '#181818']
      });

      await refreshDownloads();
    } catch (err: any) {
      console.error('Download failed:', err);
    } finally {
      setDownloadingIds(prev => {
        const next = new Map(prev);
        next.delete(track.id);
        return next;
      });
    }
  };

  // Delete Track Handler
  const handleDeleteTrack = async (trackId: string) => {
    await deleteDownloadedTrack(trackId);
    await refreshDownloads();
  };

  // Clear All Downloads Handler
  const handleClearAllDownloads = async () => {
    await clearAllDownloadedTracks();
    await refreshDownloads();
  };

  // Toggle Favorite
  const handleToggleFavorite = (track: Track) => {
    setFavoriteTracks(prev => {
      const exists = prev.some(t => t.id === track.id);
      if (exists) {
        return prev.filter(t => t.id !== track.id);
      } else {
        return [track, ...prev];
      }
    });
  };

  // Toggle Follow Artist
  const handleToggleFollowArtist = (artist: Artist) => {
    setFollowedArtists(prev => {
      const exists = prev.some(a => a.id === artist.id);
      if (exists) {
        return prev.filter(a => a.id !== artist.id);
      } else {
        return [artist, ...prev];
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col font-sans selection:bg-[#1ed760] selection:text-black">
      {/* 1. Spotify Sleek Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOnline={isOnline}
        downloadsCount={downloadedTracks.length}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        userProfile={userProfile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* 2. Offline Connectivity Banner */}
      <OfflineBanner
        isOnline={isOnline}
        downloadsCount={downloadedTracks.length}
        onGoToLibrary={() => setActiveTab('library')}
      />

      {/* 3. Main Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 pt-6 pb-24">
        {activeTab === 'home' && (
          <HomeComponent
            onPlayTrack={handlePlayTrack}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            downloadedIds={downloadedIds}
            onDownloadTrack={handleDownloadTrack}
            onGoToSearch={() => setActiveTab('search')}
            onGoToLibrary={() => setActiveTab('library')}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
            onOpenArtist={(artistId) => setSelectedArtistId(artistId)}
            onAddToQueue={handleAddToQueue}
          />
        )}

        {activeTab === 'search' && (
          <SearchComponent
            onPlayTrack={handlePlayTrack}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            downloadedIds={downloadedIds}
            downloadingIds={downloadingIds}
            onDownloadTrack={handleDownloadTrack}
            favorites={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            onOpenArtist={(artistId) => setSelectedArtistId(artistId)}
            followedArtistIds={followedArtistIds}
            onToggleFollowArtist={handleToggleFollowArtist}
            onAddToQueue={handleAddToQueue}
          />
        )}

        {activeTab === 'library' && (
          <LibraryComponent
            downloadedTracks={downloadedTracks}
            storageInfo={storageInfo}
            onPlayTrack={handlePlayTrack}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onDeleteTrack={handleDeleteTrack}
            onClearAll={handleClearAllDownloads}
            onGoToSearch={() => setActiveTab('search')}
            followedArtists={followedArtists}
            onOpenArtist={(artistId) => setSelectedArtistId(artistId)}
            favoriteTracks={favoriteTracks}
            onAddToQueue={handleAddToQueue}
          />
        )}

        {activeTab === 'docs' && (
          <DeveloperDocsComponent />
        )}
      </main>

      {/* 4. Spotify Player Bar */}
      <PlayerComponent
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        isLoading={isLoading}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        repeatMode={repeatMode}
        isShuffle={isShuffle}
        isOfflinePlaying={isOfflinePlaying}
        sleepTimer={sleepTimer}
        downloadedIds={downloadedIds}
        downloadingIds={downloadingIds}
        playbackRate={playbackRate}
        onSetPlaybackRate={setPlaybackRate}
        onJumpForward={jumpForward}
        onJumpBackward={jumpBackward}
        queue={queue}
        queueIndex={queueIndex}
        onPlayQueueIndex={playQueueIndex}
        onRemoveFromQueue={removeFromQueue}
        userProfile={userProfile}
        onTogglePlay={togglePlay}
        onSeek={seek}
        onNext={playNext}
        onPrevious={playPrevious}
        onSetVolume={setVolume}
        onToggleMute={toggleMute}
        onToggleRepeat={toggleRepeat}
        onToggleShuffle={toggleShuffle}
        onDownloadTrack={handleDownloadTrack}
        onSetSleepTimer={setTimer}
        onOpenArtist={(artistId) => setSelectedArtistId(artistId)}
      />

      {/* 5. Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        downloadsCount={downloadedTracks.length}
      />

      {/* 6. Spotify Artist Profile Modal */}
      {selectedArtistId && (
        <ArtistProfileModal
          artistId={selectedArtistId}
          onClose={() => setSelectedArtistId(null)}
          onPlayTrack={handlePlayTrack}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          downloadedIds={downloadedIds}
          downloadingIds={downloadingIds}
          onDownloadTrack={handleDownloadTrack}
          favorites={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
          followedArtistIds={followedArtistIds}
          onToggleFollowArtist={handleToggleFollowArtist}
          onAddToQueue={handleAddToQueue}
        />
      )}

      {/* 7. PWA Install Prompt Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* 8. User Profile & Account Settings Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        favoritesCount={favoriteIds.size}
        followedCount={followedArtistIds.size}
        downloadsCount={downloadedTracks.length}
        storageUsedText={`${(storageInfo.usedBytes / (1024 * 1024)).toFixed(1)} MB`}
        onClearStorage={handleClearAllDownloads}
      />

      {/* 9. Sleek Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="bg-[#1ed760] text-black font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-black/10">
            <ListPlus className="w-4 h-4 text-black shrink-0" />
            <span className="truncate max-w-xs">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
