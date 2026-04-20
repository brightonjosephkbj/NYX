import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, StatusBar, Dimensions, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { useThemeStore } from '../store/themeStore';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import BackgroundAnimation from '../components/BackgroundAnimation';
import LyricsView from '../components/LyricsView';
import { getLyrics } from '../services/api';
import audioService from '../services/audioService';

const { width } = Dimensions.get('window');

export default function PlayerScreen({ navigation }: any) {
  const { theme } = useThemeStore();
  const { currentTrack, isPlaying, position, duration, setIsPlaying, setPosition } = usePlayerStore();
  const { toggleLike, isLiked } = useLibraryStore();
  const [tab, setTab] = useState<'player' | 'lyrics'>('player');
  const [lyrics, setLyrics] = useState('');

  useEffect(() => {
    if (currentTrack && tab === 'lyrics' && !lyrics) {
      getLyrics(currentTrack.artist, currentTrack.title).then(d => setLyrics(d?.synced || d?.plain || '')).catch(() => {});
    }
  }, [tab, currentTrack]);

  const togglePlay = async () => {
    if (isPlaying) { await audioService.pause(); setIsPlaying(false); }
    else { await audioService.resume(); setIsPlaying(true); }
  };

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  if (!currentTrack) {
    navigation.goBack();
    return null;
  }

  const liked = isLiked(currentTrack.id);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <BackgroundAnimation />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.iconBtn, { backgroundColor: theme.surface }]}>
          <Text style={{ color: theme.text, fontSize: 18 }}>⌄</Text>
        </TouchableOpacity>
        <View style={[styles.tabs2, { backgroundColor: theme.surface }]}>
          <TouchableOpacity onPress={() => setTab('player')} style={[styles.tab2, tab === 'player' && { backgroundColor: theme.primary + '33' }]}>
            <Text style={{ color: tab === 'player' ? theme.primary : theme.textMuted, fontSize: 11, fontWeight: '700' }}>PLAYER</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('lyrics')} style={[styles.tab2, tab === 'lyrics' && { backgroundColor: theme.primary + '33' }]}>
            <Text style={{ color: tab === 'lyrics' ? theme.primary : theme.textMuted, fontSize: 11, fontWeight: '700' }}>LYRICS</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => toggleLike(currentTrack.id)} style={[styles.iconBtn, { backgroundColor: theme.surface }]}>
          <Text style={{ color: liked ? '#FF2244' : theme.textMuted, fontSize: 18 }}>{liked ? '♥' : '♡'}</Text>
        </TouchableOpacity>
      </View>

      {tab === 'player' ? (
        <View style={styles.playerContent}>
          <View style={[styles.artwork, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {currentTrack.thumbnail ? (
              <Image source={{ uri: currentTrack.thumbnail }} style={styles.artworkImg} />
            ) : (
              <Text style={{ fontSize: 80, color: theme.primary }}>♪</Text>
            )}
          </View>
          <View style={styles.trackInfo}>
            <Text style={[styles.trackTitle, { color: theme.text }]} numberOfLines={2}>{currentTrack.title}</Text>
            <Text style={[styles.trackArtist, { color: theme.primary }]} numberOfLines={1}>{currentTrack.artist}</Text>
          </View>
          <View style={styles.sliderRow}>
            <Text style={[styles.time, { color: theme.textMuted }]}>{fmt(position)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration || 1}
              value={position}
              onSlidingComplete={async (v) => { await audioService.seekTo(v); setPosition(v); }}
              minimumTrackTintColor={theme.primary}
              maximumTrackTintColor={theme.border}
              thumbTintColor={theme.primary}
            />
            <Text style={[styles.time, { color: theme.textMuted }]}>{fmt(duration)}</Text>
          </View>
          <View style={styles.controls}>
            <TouchableOpacity style={styles.ctrlBtn}><Text style={{ color: theme.textMuted, fontSize: 22 }}>⏮</Text></TouchableOpacity>
            <TouchableOpacity onPress={togglePlay} style={[styles.playBtn, { backgroundColor: theme.primary, shadowColor: theme.primary }]}>
              <Text style={{ color: theme.bg, fontSize: 28, fontWeight: '900' }}>{isPlaying ? '⏸' : '▶'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctrlBtn}><Text style={{ color: theme.textMuted, fontSize: 22 }}>⏭</Text></TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <LyricsView lrc={lyrics} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 54, paddingBottom: 16 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  tabs2: { flexDirection: 'row', borderRadius: 20, overflow: 'hidden', padding: 3 },
  tab2: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 },
  playerContent: { flex: 1, paddingHorizontal: 30, paddingBottom: 40 },
  artwork: { width: width - 60, height: width - 60, borderRadius: 20, borderWidth: 1, overflow: 'hidden', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  artworkImg: { width: '100%', height: '100%' },
  trackInfo: { marginBottom: 20 },
  trackTitle: { fontSize: 20, fontWeight: '800', marginBottom: 6 },
  trackArtist: { fontSize: 14, fontWeight: '600' },
  sliderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  time: { fontSize: 11, width: 38 },
  slider: { flex: 1, marginHorizontal: 4 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
  ctrlBtn: { padding: 10 },
  playBtn: { width: 68, height: 68, borderRadius: 34, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowOpacity: 0.6, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
});
