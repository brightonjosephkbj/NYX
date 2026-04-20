import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { usePlayerStore } from '../store/playerStore';
import audioService from '../services/audioService';

interface Props {
  onPress: () => void;
}

export default function MiniPlayer({ onPress }: Props) {
  const { theme } = useThemeStore();
  const { currentTrack, isPlaying, setIsPlaying, showMiniPlayer } = usePlayerStore();

  if (!showMiniPlayer || !currentTrack) return null;

  const togglePlay = async () => {
    if (isPlaying) { await audioService.pause(); setIsPlaying(false); }
    else { await audioService.resume(); setIsPlaying(true); }
  };

  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, { backgroundColor: theme.surface, borderTopColor: theme.border, borderTopWidth: 1 }]}>
      {currentTrack.thumbnail ? (
        <Image source={{ uri: currentTrack.thumbnail }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, { backgroundColor: theme.surfaceAlt, justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: theme.primary }}>♪</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{currentTrack.title}</Text>
        <Text style={[styles.artist, { color: theme.textMuted }]} numberOfLines={1}>{currentTrack.artist}</Text>
      </View>
      <TouchableOpacity onPress={togglePlay} style={[styles.btn, { backgroundColor: theme.primaryGlow }]}>
        <Text style={[styles.btnText, { color: theme.primary }]}>{isPlaying ? '⏸' : '▶'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, height: 64 },
  thumb: { width: 44, height: 44, borderRadius: 8 },
  info: { flex: 1, marginHorizontal: 12 },
  title: { fontSize: 13, fontWeight: '600' },
  artist: { fontSize: 11, marginTop: 2 },
  btn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  btnText: { fontSize: 18 },
});
