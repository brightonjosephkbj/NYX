import { create } from 'zustand';
import { Track } from './playerStore';

interface LibraryStore {
  tracks: Track[];
  liked: string[];
  recentlyPlayed: Track[];
  addTrack: (t: Track) => void;
  removeTrack: (id: string) => void;
  toggleLike: (id: string) => void;
  addToRecent: (t: Track) => void;
  isLiked: (id: string) => boolean;
}

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  tracks: [],
  liked: [],
  recentlyPlayed: [],
  addTrack: (t) => set((s) => ({ tracks: s.tracks.find(x=>x.id===t.id) ? s.tracks : [t,...s.tracks] })),
  removeTrack: (id) => set((s) => ({ tracks: s.tracks.filter(t=>t.id!==id) })),
  toggleLike: (id) => set((s) => ({
    liked: s.liked.includes(id) ? s.liked.filter(x=>x!==id) : [id,...s.liked]
  })),
  addToRecent: (t) => set((s) => ({
    recentlyPlayed: [t, ...s.recentlyPlayed.filter(x=>x.id!==t.id)].slice(0,50)
  })),
  isLiked: (id) => get().liked.includes(id),
}));
