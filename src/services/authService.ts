import { UserProfile } from '../types/music';

const USER_STORAGE_KEY = 'naghamat_user_profile';

const DEFAULT_USER: UserProfile = {
  id: 'usr-vip-001',
  name: 'عاشق الموسيقى',
  email: 'listener@naghamat.app',
  avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Amr_Abdul_Baset_Diab.jpg',
  isVip: true,
  memberSince: '2024',
  audioQuality: '320k',
  equalizerPreset: 'tarab',
  backgroundPlayEnabled: true,
  totalListeningMinutes: 142
};

const listeners = new Set<(user: UserProfile) => void>();

export function getUserProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_USER;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_USER, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Error reading user profile from storage:', e);
  }
  return DEFAULT_USER;
}

export function saveUserProfile(updated: Partial<UserProfile>): UserProfile {
  const current = getUserProfile();
  const next: UserProfile = { ...current, ...updated };
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(next));
  } catch (e) {
    console.warn('Error saving user profile to storage:', e);
  }
  listeners.forEach(cb => cb(next));
  return next;
}

export function addListeningTime(minutes: number): UserProfile {
  const current = getUserProfile();
  return saveUserProfile({
    totalListeningMinutes: (current.totalListeningMinutes || 0) + minutes
  });
}

export function subscribeUserProfile(callback: (user: UserProfile) => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
