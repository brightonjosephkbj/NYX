import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { useDownloadStore } from '../store/downloadStore';
import { useLibraryStore } from '../store/libraryStore';

const BASE = 'http://localhost:8766';

export const downloadTrack = async (info: any, formatExt: string, quality: string, formatId: string) => {
  const { addDownload, updateDownload } = useDownloadStore.getState();

  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') throw new Error('Storage permission denied');

  const dlId = Date.now().toString();
  const pageUrl = info.webpage_url || info.url;
  const dlUrl = `${BASE}/download/file?url=${encodeURIComponent(pageUrl)}&format_id=${formatId}`;

  // Save to documentDirectory — expo-av can play file:// URIs here
  const filename = `NYX_${dlId}.${formatExt}`;
  const localUri = FileSystem.documentDirectory + filename;

  addDownload({
    id: dlId,
    title: info.title || 'Unknown',
    artist: info.uploader || info.channel || 'Unknown',
    thumbnail: info.thumbnail,
    url: dlUrl,
    format: formatExt,
    quality,
    progress: 0,
    status: 'downloading',
    createdAt: Date.now(),
  });

  try {
    const downloadResumable = FileSystem.createDownloadResumable(
      dlUrl,
      localUri,
      {},
      (progress) => {
        const pct = progress.totalBytesExpectedToWrite > 0
          ? progress.totalBytesWritten / progress.totalBytesExpectedToWrite
          : 0;
        updateDownload(dlId, { progress: pct });
      }
    );

    const result = await downloadResumable.downloadAsync();
    if (!result?.uri) throw new Error('Download failed - no file created');

    // file:// URI — playable by expo-av
    const playableUri = result.uri;

    // Also copy to media library so it appears in gallery
    try {
      const asset = await MediaLibrary.createAssetAsync(result.uri);
      const album = await MediaLibrary.getAlbumAsync('NYX Downloads');
      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      } else {
        await MediaLibrary.createAlbumAsync('NYX Downloads', asset, false);
      }
    } catch {}

    // Store the file:// URI — NOT content:// 
    updateDownload(dlId, {
      status: 'done',
      progress: 1,
      localPath: playableUri,
    });

    // Add to library with playable file:// URI
    useLibraryStore.getState().addTrack({
      id: dlId,
      title: info.title || 'Unknown',
      artist: info.uploader || info.channel || 'Unknown',
      thumbnail: info.thumbnail,
      url: playableUri,
      localPath: playableUri,
      duration: info.duration || 0,
      isVideo: formatExt === 'mp4' || formatExt === 'webm',
    });

    return { localPath: playableUri, dlId };
  } catch (e: any) {
    updateDownload(dlId, { status: 'failed', error: e.message });
    // Cleanup failed file
    try { await FileSystem.deleteAsync(localUri, { idempotent: true }); } catch {}
    throw e;
  }
};
