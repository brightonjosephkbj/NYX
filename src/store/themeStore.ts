import { create } from 'zustand';
import { THEMES, ANIMATION_NAMES, Theme } from '../constants/themes';

interface ThemeStore {
  theme: Theme;
  themeIndex: number;
  animationIndex: number;
  animationName: string;
  setTheme: (index: number) => void;
  setAnimation: (index: number) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: THEMES[0],
  themeIndex: 0,
  animationIndex: 0,
  animationName: ANIMATION_NAMES[0],
  setTheme: (index) => set({ theme: THEMES[index], themeIndex: index }),
  setAnimation: (index) => set({ animationIndex: index, animationName: ANIMATION_NAMES[index] }),
}));
