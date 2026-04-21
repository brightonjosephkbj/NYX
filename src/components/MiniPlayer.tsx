import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { usePlayerStore } from '../store/playerStore';
import audioService from '../services/audioService';

const { width } = Dimensions.get('window');

interface Props { onPress: () => void; }

export default function MiniPlayer({ onPress }: Props) {
  const { theme } = useThemeStore();
  const { currentTrack, isPlaying, position, duration, setIsPlaying, showMiniPlayer } = usePlayerStore();

  if (!showMiniPlayer || !currentTrack) return null;

  const progress = duration > 0 ? position / duration : 0;

  const togglePlay = async (e: any) => {
    e.stopPropagation();
    if (isPlaying) { await audioService.pause(); setIsPlaying(false); }
    else { await audioService.resume(); setIsPlaying(true); }
  };

  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, { backgroundColor: theme.surface, borderTopColor: theme.border }]} activeOpacity={0.9}>
      <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
        <View style={[styles.progressFill, { width: `${(progress * 100).toFixed(1)}%` as any, backgroundColor: theme.primary }]} />
      </View>
      <View style={styles.content}>
        {currentTrack.thumbnail
          ? <Image source={{ uri: currentTrack.thumbnail }} style={styles.thumb} />
          : <View style={[styles.thumb, { backgroundColor: theme.surfaceAlt, justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ fontSize: 18 }}>{currentTrack.isVideo ? '🎬' : '🎵'}</Text>
            </View>
        }
        <View style={styles.info}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={[styles.artist, { color: theme.textMuted }]} numberOfLines={1}>{currentTrack.artist}</Text>
        </View>
        <TouchableOpacity onPress={togglePlay} style={[styles.playBtn, { backgroundColor: theme.primary }]}>
          <Text style={{ color: '#000', fontSize: 16, fontWeight: '900' }}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={(e) => { e.stopPropagation(); usePlayerStore.getState().clearPlayer(); audioService.stop(); }} style={styles.closeBtn}>
          <Text style={{ color: theme.textMuted, fontSize: 14 }}>✕</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { borderTopWidth: 1 },
  progressBar: { height: 2, width: '100%' },
  progressFill: { height: '100%' },
  content: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, height: 62 },
  thumb: { width: 44, height: 44, borderRadius: 8 },
  info: { flex: 1, marginHorizontal: 10 },
  title: { fontSize: 13, fontWeight: '600' },
  artist: { fontSize: 11, marginTop: 1 },
  playBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  closeBtn: { padding: 8 },
});
