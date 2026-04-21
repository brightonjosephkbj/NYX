import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useThemeStore } from '../store/themeStore';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore, Track } from '../store/playerStore';
import BackgroundAnimation from '../components/BackgroundAnimation';
import TrackItem from '../components/TrackItem';
import audioService from '../services/audioService';

export default function LibraryScreen({ navigation }: any) {
  const { theme } = useThemeStore();
  const { tracks, liked, recentlyPlayed, addTrack } = useLibraryStore();
  const { setCurrentTrack, setIsPlaying } = usePlayerStore();
  const [tab, setTab] = useState<'all' | 'liked' | 'recent' | 'phone'>('phone');
  const [phoneTracks, setPhoneTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadPhoneTracks(); }, []);

  const loadPhoneTracks = async () => {
    setLoading(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') { setLoading(false); return; }
      const audio = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: 200,
        sortBy: MediaLibrary.SortBy.modificationTime,
      });
      const video = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.video,
        first: 100,
        sortBy: MediaLibrary.SortBy.modificationTime,
      });
      const allAssets = [...audio.assets, ...video.assets];
      const mapped: Track[] = allAssets.map(a => ({
        id: a.id,
        title: a.filename.replace(/\.[^/.]+$/, ''),
        artist: 'Local File',
        url: a.uri,
        localPath: a.uri,
        duration: a.duration || 0,
        isVideo: a.mediaType === 'video',
        thumbnail: a.mediaType === 'video' ? a.uri : undefined,
      }));
      setPhoneTracks(mapped);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const play = async (track: Track) => {
    setCurrentTrack(track);
    await audioService.init();
    await audioService.play(track.localPath || track.url, (status) => {
      if (status.isLoaded) {
        usePlayerStore.getState().setPosition(status.positionMillis || 0);
        usePlayerStore.getState().setDuration(status.durationMillis || 0);
        usePlayerStore.getState().setIsPlaying(status.isPlaying);
      }
    });
    setIsPlaying(true);
    useLibraryStore.getState().addToRecent(track);
    navigation.navigate('Player');
  };

  const data = tab === 'liked' ? tracks.filter(t => liked.includes(t.id))
    : tab === 'recent' ? recentlyPlayed
    : tab === 'phone' ? phoneTracks
    : tracks;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
      <BackgroundAnimation />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.primary }]}>LIBRARY</Text>
        <TouchableOpacity onPress={loadPhoneTracks} style={[styles.refreshBtn, { borderColor: theme.border }]}>
          <Text style={{ color: theme.textMuted, fontSize: 11 }}>↺ REFRESH</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.tabs, { backgroundColor: theme.surface }]}>
        {(['phone', 'all', 'liked', 'recent'] as const).map(t => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && { backgroundColor: theme.primary + '22' }]}>
            <Text style={{ color: tab === t ? theme.primary : theme.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 }}>
              {t === 'phone' ? '📱 PHONE' : t.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} size="large" /> : (
        <FlatList
          data={data}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <TrackItem track={item} onPress={() => play(item)} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ color: theme.textMuted, fontSize: 36, marginBottom: 12 }}>🎵</Text>
              <Text style={{ color: theme.textMuted, textAlign: 'center' }}>
                {tab === 'phone' ? 'No audio/video files found\non your phone' : 'No tracks yet'}
              </Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 54, paddingBottom: 16 },
  title: { fontSize: 22, fontWeight: '900', letterSpacing: 4 },
  refreshBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  tabs: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, borderRadius: 12, overflow: 'hidden' },
  tab: { flex: 1, padding: 10, alignItems: 'center' },
  empty: { flex: 1, alignItems: 'center', paddingTop: 80 },
});
