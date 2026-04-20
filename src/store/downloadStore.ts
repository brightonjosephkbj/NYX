import { create } from 'zustand';

export interface Download {
  id: string;
  title: string;
  artist: string;
  thumbnail?: string;
  url: string;
  format: string;
  quality: string;
  progress: number;
  status: 'queued' | 'downloading' | 'done' | 'failed';
  localPath?: string;
  error?: string;
  createdAt: number;
}

interface DownloadStore {
  downloads: Download[];
  addDownload: (d: Download) => void;
  updateDownload: (id: string, updates: Partial<Download>) => void;
  removeDownload: (id: string) => void;
  clearCompleted: () => void;
}

export const useDownloadStore = create<DownloadStore>((set) => ({
  downloads: [],
  addDownload: (d) => set((s) => ({ downloads: [d, ...s.downloads] })),
  updateDownload: (id, updates) =>
    set((s) => ({ downloads: s.downloads.map((d) => d.id === id ? { ...d, ...updates } : d) })),
  removeDownload: (id) =>
    set((s) => ({ downloads: s.downloads.filter((d) => d.id !== id) })),
  clearCompleted: () =>
    set((s) => ({ downloads: s.downloads.filter((d) => d.status !== 'done') })),
}));
