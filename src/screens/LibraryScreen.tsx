import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import BackgroundAnimation from '../components/BackgroundAnimation';
import TrackItem from '../components/TrackItem';
import audioService from '../services/audioService';

export default function LibraryScreen({ navigation }: any) {
  const { theme } = useThemeStore();
  const { tracks, liked, recentlyPlayed } = useLibraryStore();
  const { setCurrentTrack, setIsPlaying } = usePlayerStore();
  const [tab, setTab] = useState<'all' | 'liked' | 'recent'>('all');

  const data = tab === 'liked' ? tracks.filter(t => liked.includes(t.id)) : tab === 'recent' ? recentlyPlayed : tracks;

  const play = async (track: any) => {
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

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
      <BackgroundAnimation />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.primary }]}>LIBRARY</Text>
        <Text style={[styles.count, { color: theme.textMuted }]}>{tracks.length} tracks</Text>
      </View>
      <View style={[styles.tabs, { backgroundColor: theme.surface }]}>
        {(['all', 'liked', 'recent'] as const).map(t => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && { backgroundColor: theme.primary + '22' }]}>
            <Text style={{ color: tab === t ? theme.primary : theme.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1 }}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TrackItem track={item} onPress={() => play(item)} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: theme.textMuted, fontSize: 40, marginBottom: 12 }}>▤</Text>
            <Text style={{ color: theme.textMuted }}>No tracks yet. Download some!</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 54, paddingBottom: 16 },
  title: { fontSize: 22, fontWeight: '900', letterSpacing: 4 },
  count: { fontSize: 12 },
  tabs: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, borderRadius: 12, overflow: 'hidden' },
  tab: { flex: 1, padding: 12, alignItems: 'center' },
  empty: { flex: 1, alignItems: 'center', paddingTop: 80 },
});
