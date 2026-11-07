import { Track } from '../types/music';
import { normalizeArabic } from '../data/musicData';

export interface ListeningHistoryItem {
  track: Track;
  playedAt: number;
  playCount: number;
}

export interface UserMusicTaste {
  topArtists: { name: string; count: number }[];
  topGenres: { genre: string; count: number }[];
  totalPlays: number;
}

const STORAGE_KEY_HISTORY = 'naghamat_smart_history';
const STORAGE_KEY_COUNTS = 'naghamat_play_counts';

// 1. Record a track play in user's smart listening profile
export function recordTrackPlay(track: Track): void {
  if (!track || !track.id) return;

  try {
    // 1. Update chronological history
    const rawHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
    let history: ListeningHistoryItem[] = rawHistory ? JSON.parse(rawHistory) : [];

    const existingIndex = history.findIndex(item => item.track.id === track.id);
    if (existingIndex > -1) {
      const current = history[existingIndex];
      current.playCount += 1;
      current.playedAt = Date.now();
      current.track = track; // update metadata
      // Move to front
      history.splice(existingIndex, 1);
      history.unshift(current);
    } else {
      history.unshift({
        track,
        playedAt: Date.now(),
        playCount: 1
      });
    }

    // Keep top 60 history items
    if (history.length > 60) {
      history = history.slice(0, 60);
    }
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));

    // 2. Update artist and genre frequency metrics
    const rawCounts = localStorage.getItem(STORAGE_KEY_COUNTS);
    const counts = rawCounts ? JSON.parse(rawCounts) : { artists: {}, genres: {} };

    const artistKey = normalizeArabic(track.artist || 'فنان');
    counts.artists[artistKey] = (counts.artists[artistKey] || 0) + 1;

    const genreKey = track.genre || 'عام';
    counts.genres[genreKey] = (counts.genres[genreKey] || 0) + 1;

    localStorage.setItem(STORAGE_KEY_COUNTS, JSON.stringify(counts));
  } catch (err) {
    console.warn('Could not record smart play:', err);
  }
}

// 2. Get user's recently played tracks
export function getRecentlyPlayedTracks(): Track[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return [];
    const history: ListeningHistoryItem[] = JSON.parse(raw);
    return history.map(item => item.track);
  } catch {
    return [];
  }
}

// 3. Get tracks user played more than once ("On Repeat / الأكثر تكراراً")
export function getOnRepeatTracks(): Track[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return [];
    const history: ListeningHistoryItem[] = JSON.parse(raw);
    return history
      .filter(item => item.playCount >= 2)
      .sort((a, b) => b.playCount - a.playCount)
      .map(item => item.track);
  } catch {
    return [];
  }
}

// 4. Analyze user taste profile to recommend songs
export function getUserTasteProfile(): UserMusicTaste {
  try {
    const rawCounts = localStorage.getItem(STORAGE_KEY_COUNTS);
    if (!rawCounts) return { topArtists: [], topGenres: [], totalPlays: 0 };
    const counts = JSON.parse(rawCounts);

    const topArtists = Object.entries(counts.artists || {})
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topGenres = Object.entries(counts.genres || {})
      .map(([genre, count]) => ({ genre, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const totalPlays = topArtists.reduce((acc, a) => acc + a.count, 0);

    return { topArtists, topGenres, totalPlays };
  } catch {
    return { topArtists: [], topGenres: [], totalPlays: 0 };
  }
}

// 5. Smart recommendation generator based on listening history
export function getSmartRecommendations(allAvailableTracks: Track[]): {
  recommended: Track[];
  headline: string;
  subheadline: string;
} {
  const taste = getUserTasteProfile();
  const recent = getRecentlyPlayedTracks();
  const recentIds = new Set(recent.map(t => t.id));

  // If user has listened to specific artists, recommend tracks by those artists or similar genres
  if (taste.topArtists.length > 0) {
    const favoriteArtist = taste.topArtists[0].name;

    // Filter available tracks matching top artist or genre
    const artistMatches = allAvailableTracks.filter(t => {
      const normArtist = normalizeArabic(t.artist);
      return normArtist.includes(favoriteArtist) || favoriteArtist.includes(normArtist);
    });

    const genreMatches = allAvailableTracks.filter(t => {
      if (taste.topGenres.length === 0) return false;
      return t.genre && t.genre === taste.topGenres[0].genre;
    });

    // Combine prioritizing unplayed or less played tracks
    const combined = [...artistMatches, ...genreMatches];
    const unique = combined.filter((track, index, self) => 
      index === self.findIndex(t => t.id === track.id)
    );

    if (unique.length > 0) {
      return {
        recommended: unique.slice(0, 8),
        headline: 'مبني على ذوقك واستماعك',
        subheadline: `بناءً على تفضيلك لأعمال ${taste.topArtists[0].name} والتصنيفات المقربة لك`
      };
    }
  }

  // Fallback if no history yet
  return {
    recommended: allAvailableTracks.slice(0, 6),
    headline: 'اقتراحات مميزة لك',
    subheadline: 'مختارات من أشهر الأغاني ذات التقييم العالي لتناسب ذوقك'
  };
}
