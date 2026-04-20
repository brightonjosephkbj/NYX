import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { Track } from '../store/playerStore';

interface Props {
  track: Track;
  onPress: () => void;
  onLongPress?: () => void;
  showMenu?: boolean;
}

export default function TrackItem({ track, onPress, onLongPress }: Props) {
  const { theme } = useThemeStore();

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress} style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {track.thumbnail ? (
        <Image source={{ uri: track.thumbnail }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, { backgroundColor: theme.surfaceAlt, justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: theme.primary, fontSize: 20 }}>{track.isVideo ? '▶' : '♪'}</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{track.title}</Text>
        <Text style={[styles.artist, { color: theme.textMuted }]} numberOfLines={1}>{track.artist}</Text>
      </View>
      <Text style={[styles.dur, { color: theme.textMuted }]}>{fmt(track.duration)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', padding: 10, marginHorizontal: 12, marginVertical: 4, borderRadius: 12, borderWidth: 1 },
  thumb: { width: 50, height: 50, borderRadius: 8 },
  info: { flex: 1, marginHorizontal: 12 },
  title: { fontSize: 14, fontWeight: '600' },
  artist: { fontSize: 12, marginTop: 2 },
  dur: { fontSize: 11 },
});
