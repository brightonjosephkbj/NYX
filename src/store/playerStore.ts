import { create } from 'zustand';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  thumbnail?: string;
  url: string;
  duration: number;
  isVideo: boolean;
  localPath?: string;
  lyrics?: string;
}

interface PlayerStore {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  position: number;
  duration: number;
  volume: number;
  isMinimized: boolean;
  showMiniPlayer: boolean;
  setCurrentTrack: (track: Track) => void;
  setQueue: (queue: Track[]) => void;
  setIsPlaying: (v: boolean) => void;
  setPosition: (v: number) => void;
  setDuration: (v: number) => void;
  setVolume: (v: number) => void;
  setMinimized: (v: boolean) => void;
  setShowMiniPlayer: (v: boolean) => void;
  clearPlayer: () => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  position: 0,
  duration: 0,
  volume: 1,
  isMinimized: false,
  showMiniPlayer: false,
  setCurrentTrack: (track) => set({ currentTrack: track, showMiniPlayer: true }),
  setQueue: (queue) => set({ queue }),
  setIsPlaying: (v) => set({ isPlaying: v }),
  setPosition: (v) => set({ position: v }),
  setDuration: (v) => set({ duration: v }),
  setVolume: (v) => set({ volume: v }),
  setMinimized: (v) => set({ isMinimized: v }),
  setShowMiniPlayer: (v) => set({ showMiniPlayer: v }),
  clearPlayer: () => set({ currentTrack: null, isPlaying: false, position: 0, showMiniPlayer: false }),
}));
