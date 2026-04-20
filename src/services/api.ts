import axios from 'axios';

const BASE = 'https://wave-backend-mjjm.onrender.com';

const api = axios.create({ baseURL: BASE, timeout: 30000 });

export const getInfo = (url: string) =>
  api.get('/download/info', { params: { url } }).then(r => r.data);

export const searchTracks = (q: string, platform = 'youtube') =>
  api.get('/search', { params: { q, platform } }).then(r => r.data);

export const getTrending = () =>
  api.get('/trending').then(r => r.data);

export const getLyrics = (artist: string, track: string) =>
  api.get('/lyrics', { params: { artist, track } }).then(r => r.data);

export const askARIA = (message: string, history: any[] = []) =>
  api.post('/aria/chat', { message, history }).then(r => r.data);

export const getDownloadUrl = (url: string, formatId: string) =>
  `${BASE}/download/file?url=${encodeURIComponent(url)}&format_id=${formatId}`;

export default api;
