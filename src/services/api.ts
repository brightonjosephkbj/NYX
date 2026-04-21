import axios from 'axios';

const BASE = 'https://wave-backend-mjjm.onrender.com';

const api = axios.create({ baseURL: BASE, timeout: 30000 });

export const getInfo = async (url: string) => {
  const res = await api.get('/download/info', { params: { url } });
  const d = res.data;
  // Normalize fields across different platforms
  return {
    ...d,
    title: d.title || d.fulltitle || d.track || 'Unknown',
    uploader: d.uploader || d.channel || d.creator || d.artist || 'Unknown',
    duration: d.duration || 0,
    thumbnail: d.thumbnail || d.thumbnails?.[0]?.url || null,
    webpage_url: d.webpage_url || d.original_url || url,
    formats: d.formats || [],
  };
};

export const searchTracks = (q: string, platform = 'youtube') =>
  api.get('/search', { params: { q, platform } }).then(r => r.data);

export const getTrending = () =>
  api.get('/trending').then(r => r.data);

export const getLyrics = (artist: string, track: string) =>
  api.get('/lyrics', { params: { artist, track } }).then(r => r.data);

export const askARIA = (message: string, history: any[] = []) =>
  api.post('/aria/chat', { message, history }).then(r => r.data);

export const getStreamUrl = (pageUrl: string, formatId: string) =>
  `${BASE}/download/file?url=${encodeURIComponent(pageUrl)}&format_id=${formatId}`;

export default api;
