import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { useDownloadStore } from '../store/downloadStore';
import { useLibraryStore } from '../store/libraryStore';

const BASE = 'https://wave-backend-mjjm.onrender.com';

export const downloadTrack = async (info: any, formatExt: string, quality: string, formatId: string) => {
  const { addDownload, updateDownload } = useDownloadStore.getState();

  // Request permissions first
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') throw new Error('Storage permission denied');

  const dlId = Date.now().toString();
  const pageUrl = info.webpage_url || info.url;
  const dlUrl = `${BASE}/download/file?url=${encodeURIComponent(pageUrl)}&format_id=${formatId}`;
  const filename = `NYX_${dlId}.${formatExt}`;
  const localUri = FileSystem.documentDirectory + filename;

  // Add to downloads list
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
    // Download with progress tracking
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

    // Save to media library (phone gallery/storage)
    const asset = await MediaLibrary.createAssetAsync(result.uri);

    // Try to move to Downloads folder
    try {
      const album = await MediaLibrary.getAlbumAsync('NYX Downloads');
      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      } else {
        await MediaLibrary.createAlbumAsync('NYX Downloads', asset, false);
      }
    } catch {}

    // Update download as complete with local path
    updateDownload(dlId, {
      status: 'done',
      progress: 1,
      localPath: asset.uri,
    });

    // Add to library with local path for playback
    useLibraryStore.getState().addTrack({
      id: dlId,
      title: info.title || 'Unknown',
      artist: info.uploader || info.channel || 'Unknown',
      thumbnail: info.thumbnail,
      url: asset.uri,
      localPath: asset.uri,
      duration: info.duration || 0,
      isVideo: formatExt === 'mp4' || formatExt === 'webm',
    });

    return { localPath: asset.uri, dlId };
  } catch (e: any) {
    updateDownload(dlId, { status: 'failed', error: e.message });
    throw e;
  }
};
