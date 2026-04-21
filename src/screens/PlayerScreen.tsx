import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, StatusBar, Dimensions, PanResponder } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useThemeStore } from '../store/themeStore';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import BackgroundAnimation from '../components/BackgroundAnimation';
import LyricsView from '../components/LyricsView';
import { getLyrics } from '../services/api';
import audioService from '../services/audioService';

const { width, height } = Dimensions.get('window');

export default function PlayerScreen({ navigation }: any) {
  const { theme } = useThemeStore();
  const { currentTrack, isPlaying, position, duration, setIsPlaying, setPosition, setDuration } = usePlayerStore();
  const { toggleLike, isLiked } = useLibraryStore();
  const [tab, setTab] = useState<'player' | 'lyrics'>('player');
  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    if (currentTrack?.isVideo) {
      audioService.stop();
    }
  }, [currentTrack]);

  useEffect(() => {
    if (currentTrack && tab === 'lyrics' && !lyrics) {
      getLyrics(currentTrack.artist, currentTrack.title)
        .then(d => setLyrics(d?.synced || d?.plain || ''))
        .catch(() => setLyrics(''));
    }
  }, [tab, currentTrack]);

  const togglePlay = async () => {
    if (currentTrack?.isVideo) {
      if (isPlaying) { await videoRef.current?.pauseAsync(); }
      else { await videoRef.current?.playAsync(); }
    } else {
      if (isPlaying) { await audioService.pause(); setIsPlaying(false); }
      else { await audioService.resume(); setIsPlaying(true); }
    }
  };

  const seekTo = async (ratio: number) => {
    const ms = ratio * duration;
    if (currentTrack?.isVideo) { await videoRef.current?.setPositionAsync(ms); }
    else { await audioService.seekTo(ms); setPosition(ms); }
  };

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  if (!currentTrack) { navigation.goBack(); return null; }

  const progress = duration > 0 ? position / duration : 0;
  const liked = isLiked(currentTrack.id);
  const barWidth = width - 48 - 80;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <BackgroundAnimation />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.iconBtn, { backgroundColor: theme.surface }]}>
          <Text style={{ color: theme.text, fontSize: 18 }}>↓</Text>
        </TouchableOpacity>
        <View style={[styles.tabPill, { backgroundColor: theme.surface }]}>
          {(['player', 'lyrics'] as const).map(t => (
            <TouchableOpacity key={t} onPress={() => setTab(t)}
              style={[styles.tabBtn, tab === t && { backgroundColor: theme.primary + '33' }]}>
              <Text style={{ color: tab === t ? theme.primary : theme.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>{t.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={() => toggleLike(currentTrack.id)} style={[styles.iconBtn, { backgroundColor: theme.surface }]}>
          <Text style={{ fontSize: 18 }}>{liked ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      {tab === 'lyrics' ? (
        <View style={{ flex: 1 }}><LyricsView lrc={lyrics} /></View>
      ) : (
        <View style={styles.body}>
          {/* Artwork / Video */}
          {currentTrack.isVideo ? (
            <View style={styles.videoContainer}>
              <Video
                ref={videoRef}
                source={{ uri: currentTrack.url }}
                style={styles.video}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={true}
                useNativeControls={false}
                onPlaybackStatusUpdate={(s) => {
                  if (s.isLoaded) {
                    setPosition(s.positionMillis || 0);
                    setDuration(s.durationMillis || 0);
                    setIsPlaying(s.isPlaying);
                  }
                }}
                onError={(e) => console.log('Video error:', e)}
              />
            </View>
          ) : (
            <View style={[styles.artwork, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {currentTrack.thumbnail
                ? <Image source={{ uri: currentTrack.thumbnail }} style={styles.artImg} />
                : <Text style={{ fontSize: 80 }}>🎵</Text>
              }
            </View>
          )}

          {/* Track Info */}
          <View style={styles.info}>
            <Text style={[styles.trackTitle, { color: theme.text }]} numberOfLines={2}>{currentTrack.title}</Text>
            <Text style={[styles.trackArtist, { color: theme.primary }]} numberOfLines={1}>{currentTrack.artist}</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressRow}>
            <Text style={[styles.timeText, { color: theme.textMuted }]}>{fmt(position)}</Text>
            <TouchableOpacity
              activeOpacity={1}
              style={[styles.progressBg, { backgroundColor: theme.surfaceAlt }]}
              onPress={(e) => {
                const ratio = Math.max(0, Math.min(1, e.nativeEvent.locationX / barWidth));
                seekTo(ratio);
              }}
            >
              <View style={[styles.progressFill, { width: `${(progress * 100).toFixed(1)}%` as any, backgroundColor: theme.primary }]} />
              <View style={[styles.thumb, { backgroundColor: theme.primary, left: `${Math.min(95, progress * 100).toFixed(1)}%` as any }]} />
            </TouchableOpacity>
            <Text style={[styles.timeText, { color: theme.textMuted }]}>{fmt(duration)}</Text>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity onPress={() => seekTo(Math.max(0, (position - 10000) / duration))} style={styles.ctrlBtn}>
              <Text style={{ color: theme.textMuted, fontSize: 28 }}>⏮</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={togglePlay} style={[styles.playBtn, { backgroundColor: theme.primary, shadowColor: theme.primary }]}>
              <Text style={{ color: '#000', fontSize: 28, fontWeight: '900' }}>{isPlaying ? '⏸' : '▶'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => seekTo(Math.min(1, (position + 10000) / duration))} style={styles.ctrlBtn}>
              <Text style={{ color: theme.textMuted, fontSize: 28 }}>⏭</Text>
            </TouchableOpacity>
          </View>

          {/* Extra Controls */}
          <View style={styles.extraControls}>
            <TouchableOpacity style={[styles.extraBtn, { borderColor: theme.border }]}>
              <Text style={{ color: theme.textMuted, fontSize: 12 }}>🔀 Shuffle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.extraBtn, { borderColor: theme.border }]}>
              <Text style={{ color: theme.textMuted, fontSize: 12 }}>🔁 Repeat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.extraBtn, { borderColor: theme.border }]}>
              <Text style={{ color: theme.textMuted, fontSize: 12 }}>📋 Queue</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 54, paddingBottom: 12 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  tabPill: { flexDirection: 'row', borderRadius: 20, overflow: 'hidden', padding: 3 },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 },
  body: { flex: 1, paddingHorizontal: 24, paddingBottom: 30 },
  videoContainer: { width: width - 48, height: (width - 48) * 0.56, borderRadius: 16, overflow: 'hidden', alignSelf: 'center', marginBottom: 20, backgroundColor: '#000' },
  video: { width: '100%', height: '100%' },
  artwork: { width: width - 48, height: width - 48, borderRadius: 20, borderWidth: 1, overflow: 'hidden', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  artImg: { width: '100%', height: '100%' },
  info: { marginBottom: 20 },
  trackTitle: { fontSize: 20, fontWeight: '800', marginBottom: 6, lineHeight: 26 },
  trackArtist: { fontSize: 14, fontWeight: '600' },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 8 },
  timeText: { fontSize: 11, width: 36, textAlign: 'center' },
  progressBg: { flex: 1, height: 4, borderRadius: 2, position: 'relative', overflow: 'visible' },
  progressFill: { height: '100%', borderRadius: 2 },
  thumb: { position: 'absolute', width: 14, height: 14, borderRadius: 7, top: -5, marginLeft: -7 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32, marginBottom: 24 },
  ctrlBtn: { padding: 8 },
  playBtn: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', elevation: 12, shadowOpacity: 0.7, shadowRadius: 20, shadowOffset: { width: 0, height: 4 } },
  extraControls: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  extraBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
});
