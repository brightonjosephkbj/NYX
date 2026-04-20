import { create } from 'zustand';

interface ProfileStore {
  name: string;
  avatar: string | null;
  setName: (n: string) => void;
  setAvatar: (uri: string) => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  name: 'NYX User',
  avatar: null,
  setName: (name) => set({ name }),
  setAvatar: (avatar) => set({ avatar }),
}));
