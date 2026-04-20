import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import BackgroundAnimation from '../components/BackgroundAnimation';
import TrackItem from '../components/TrackItem';
import { searchTracks, getInfo, getDownloadUrl } from '../services/api';
import { usePlayerStore, Track } from '../store/playerStore';
import { useDownloadStore, Download } from '../store/downloadStore';
import { useLibraryStore } from '../store/libraryStore';
import audioService from '../services/audioService';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

export default function SearchScreen({ navigation }: any) {
  const { theme } = useThemeStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const { setCurrentTrack, setIsPlaying } = usePlayerStore();
  const { addDownload, updateDownload } = useDownloadStore();
  const { addTrack } = useLibraryStore();

  const isUrl = (s: string) => s.startsWith('http://') || s.startsWith('https://');

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      if (isUrl(query)) {
        const info = await getInfo(query);
        setResults([{ ...info, url: query }]);
      } else {
        const data = await searchTracks(query);
        setResults(data?.results || []);
      }
    } catch { Alert.alert('Error', 'Search failed. Try again.'); }
    setLoading(false);
  };

  const playTrack = async (item: any) => {
    try {
      const info = isUrl(query) ? item : await getInfo(item.url || item.webpage_url);
      const audioFmt = (info.formats || []).find((f: any) => f.ext === 'm4a' && f.acodec !== 'none' && f.vcodec === 'none') || (info.formats || [])[0];
      if (!audioFmt) return Alert.alert('Error', 'No playable format found');
      const playUrl = getDownloadUrl(info.url || item.url, audioFmt.format_id);
      const track: Track = {
        id: item.id || Date.now().toString(),
        title: info.title || item.title,
        artist: info.uploader || item.artist || 'Unknown',
        thumbnail: info.thumbnail || item.thumbnail,
        url: playUrl,
        duration: info.duration || 0,
        isVideo: false,
      };
      setCurrentTrack(track);
      addTrack(track);
      await audioService.init();
      await audioService.play(playUrl, (status) => {
        if (status.isLoaded) {
          usePlayerStore.getState().setPosition(status.positionMillis || 0);
          usePlayerStore.getState().setDuration(status.durationMillis || 0);
          usePlayerStore.getState().setIsPlaying(status.isPlaying);
        }
      });
      setIsPlaying(true);
      navigation.navigate('Player');
    } catch (e: any) { Alert.alert('Playback Error', e.message || 'Could not play track'); }
  };

  const downloadTrack = async (item: any) => {
    try {
      const perms = await MediaLibrary.requestPermissionsAsync();
      if (!perms.granted) return Alert.alert('Permission needed', 'Allow media access to save downloads');
      const info = await getInfo(item.url || item.webpage_url || query);
      const fmt = (info.formats || []).find((f: any) => f.ext === 'mp3') || (info.formats || []).find((f: any) => f.acodec !== 'none' && f.vcodec === 'none') || (info.formats || [])[0];
      if (!fmt) return Alert.alert('Error', 'No downloadable format');
      const dlUrl = getDownloadUrl(info.url || item.url || query, fmt.format_id);
      const dlId = Date.now().toString();
      const dl: Download = {
        id: dlId, title: info.title || item.title, artist: info.uploader || 'Unknown',
        thumbnail: info.thumbnail, url: dlUrl, format: fmt.ext, quality: fmt.quality || 'auto',
        progress: 0, status: 'downloading', createdAt: Date.now(),
      };
      addDownload(dl);
      Alert.alert('Downloading', `"${dl.title}" added to downloads`);
      const dest = FileSystem.documentDirectory + `${dlId}.${fmt.ext}`;
      const cb = FileSystem.createDownloadResumable(dlUrl, dest, {}, (p) => {
        const pct = p.totalBytesExpectedToWrite > 0 ? p.totalBytesWritten / p.totalBytesExpectedToWrite : 0;
        updateDownload(dlId, { progress: pct });
      });
      const result = await cb.downloadAsync();
      if (result?.uri) {
        await MediaLibrary.saveToLibraryAsync(result.uri);
        updateDownload(dlId, { status: 'done', progress: 1, localPath: result.uri });
      }
    } catch (e: any) { Alert.alert('Download failed', e.message); }
  };

  const toTrack = (item: any): Track => ({
    id: item.id || Date.now().toString(),
    title: item.title || 'Unknown',
    artist: item.uploader || item.artist || 'Unknown',
    thumbnail: item.thumbnail,
    url: item.url || item.webpage_url || query,
    duration: item.duration || 0,
    isVideo: false,
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
      <BackgroundAnimation />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.primary }]}>SEARCH</Text>
      </View>
      <View style={[styles.inputRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Search or paste URL..."
          placeholderTextColor={theme.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={search}
          returnKeyType="search"
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={search} style={[styles.searchBtn, { backgroundColor: theme.primary + '22' }]}>
          <Text style={{ color: theme.primary, fontWeight: '700' }}>GO</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} size="large" />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <View>
              <TrackItem track={toTrack(item)} onPress={() => playTrack(item)} />
              <TouchableOpacity onPress={() => downloadTrack(item)} style={[styles.dlBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={{ color: theme.primary, fontSize: 12 }}>⬇ Download</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ color: theme.textMuted, fontSize: 40, marginBottom: 12 }}>◎</Text>
              <Text style={{ color: theme.textMuted }}>Search songs or paste a URL</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 54, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '900', letterSpacing: 4 },
  inputRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  input: { flex: 1, padding: 14, fontSize: 14 },
  searchBtn: { paddingHorizontal: 18, justifyContent: 'center' },
  dlBtn: { marginHorizontal: 12, marginTop: -2, marginBottom: 4, padding: 8, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  empty: { flex: 1, alignItems: 'center', paddingTop: 80 },
});
