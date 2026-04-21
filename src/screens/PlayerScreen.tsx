import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, StatusBar, Dimensions, ScrollView, Alert } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
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
  const { currentTrack, isPlaying, position, duration, setIsPlaying, setPosition, setDuration } = usePlayerStore();
  const { toggleLike, isLiked } = useLibraryStore();
  const [tab, setTab] = useState<'player' | 'lyrics'>('player');
  const [lyrics, setLyrics] = useState('');
  const videoRef = useRef<Video>(null);
  const [videoStatus, setVideoStatus] = useState<AVPlaybackStatus | null>(null);

  useEffect(() => {
    if (currentTrack && tab === 'lyrics' && !lyrics) {
      getLyrics(currentTrack.artist, currentTrack.title)
        .then(d => setLyrics(d?.synced || d?.plain || ''))
        .catch(() => {});
    }
  }, [tab, currentTrack]);

  const togglePlay = async () => {
    if (currentTrack?.isVideo) {
      if (isPlaying) { await videoRef.current?.pauseAsync(); setIsPlaying(false); }
      else { await videoRef.current?.playAsync(); setIsPlaying(true); }
    } else {
      if (isPlaying) { await audioService.pause(); setIsPlaying(false); }
      else { await audioService.resume(); setIsPlaying(true); }
    }
  };

  const seekTo = async (ms: number) => {
    if (currentTrack?.isVideo) { await videoRef.current?.setPositionAsync(ms); }
    else { await audioService.seekTo(ms); }
    setPosition(ms);
  };

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  if (!currentTrack) { navigation.goBack(); return null; }

  const liked = isLiked(currentTrack.id);
  const progress = duration > 0 ? position / duration : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <BackgroundAnimation />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.iconBtn, { backgroundColor: theme.surface }]}>
          <Text style={{ color: theme.text, fontSize: 16 }}>↓</Text>
        </TouchableOpacity>
        <View style={[styles.tabPill, { backgroundColor: theme.surface }]}>
          {(['player', 'lyrics'] as const).map(t => (
            <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tabBtn, tab === t && { backgroundColor: theme.primary + '33' }]}>
              <Text style={{ color: tab === t ? theme.primary : theme.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>{t.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={() => toggleLike(currentTrack.id)} style={[styles.iconBtn, { backgroundColor: theme.surface }]}>
          <Text style={{ fontSize: 18 }}>{liked ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      {tab === 'player' ? (
        <View style={styles.playerBody}>
          {currentTrack.isVideo ? (
            <Video
              ref={videoRef}
              source={{ uri: currentTrack.url }}
              style={styles.video}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={isPlaying}
              onPlaybackStatusUpdate={(s) => {
                if (s.isLoaded) {
                  setPosition(s.positionMillis || 0);
                  setDuration(s.durationMillis || 0);
                  setIsPlaying(s.isPlaying);
                }
              }}
            />
          ) : (
            <View style={[styles.artwork, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {currentTrack.thumbnail ? (
                <Image source={{ uri: currentTrack.thumbnail }} style={styles.artImg} />
              ) : (
                <Text style={{ fontSize: 80 }}>🎵</Text>
              )}
            </View>
          )}

          <View style={styles.trackInfo}>
            <Text style={[styles.trackTitle, { color: theme.text }]} numberOfLines={2}>{currentTrack.title}</Text>
            <Text style={[styles.trackArtist, { color: theme.primary }]} numberOfLines={1}>{currentTrack.artist}</Text>
          </View>

          <View style={styles.seekBar}>
            <Text style={[styles.timeText, { color: theme.textMuted }]}>{fmt(position)}</Text>
            <TouchableOpacity
              style={[styles.progressContainer, { backgroundColor: theme.surfaceAlt }]}
              onPress={(e) => {
                const tapX = e.nativeEvent.locationX;
                const barWidth = width - 40 - 80;
                const ratio = Math.max(0, Math.min(1, tapX / barWidth));
                seekTo(ratio * duration);
              }}
              activeOpacity={1}
            >
              <View style={[styles.progressFill, { width: `${(progress * 100).toFixed(1)}%` as any, backgroundColor: theme.primary }]} />
              <View style={[styles.progressThumb, { backgroundColor: theme.primary, left: `${(progress * 100).toFixed(1)}%` as any }]} />
            </TouchableOpacity>
            <Text style={[styles.timeText, { color: theme.textMuted }]}>{fmt(duration)}</Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity style={styles.ctrlBtn} onPress={() => seekTo(Math.max(0, position - 10000))}>
              <Text style={{ color: theme.textMuted, fontSize: 24 }}>⏮</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={togglePlay} style={[styles.playBtn, { backgroundColor: theme.primary, shadowColor: theme.primary }]}>
              <Text style={{ color: theme.bg, fontSize: 26, fontWeight: '900' }}>{isPlaying ? '⏸' : '▶'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctrlBtn} onPress={() => seekTo(Math.min(duration, position + 10000))}>
              <Text style={{ color: theme.textMuted, fontSize: 24 }}>⏭</Text>
            </TouchableOpacity>
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
  tabPill: { flexDirection: 'row', borderRadius: 20, overflow: 'hidden', padding: 3 },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 },
  playerBody: { flex: 1, paddingHorizontal: 24, paddingBottom: 40 },
  video: { width: width - 48, height: (width - 48) * 0.56, borderRadius: 16, alignSelf: 'center', marginBottom: 20, backgroundColor: '#000' },
  artwork: { width: width - 48, height: width - 48, borderRadius: 20, borderWidth: 1, overflow: 'hidden', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  artImg: { width: '100%', height: '100%' },
  trackInfo: { marginBottom: 20 },
  trackTitle: { fontSize: 20, fontWeight: '800', marginBottom: 6, lineHeight: 26 },
  trackArtist: { fontSize: 14, fontWeight: '600' },
  seekBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 28, gap: 8 },
  timeText: { fontSize: 11, width: 36, textAlign: 'center' },
  progressContainer: { flex: 1, height: 4, borderRadius: 2, overflow: 'visible', position: 'relative' },
  progressFill: { height: '100%', borderRadius: 2 },
  progressThumb: { position: 'absolute', width: 14, height: 14, borderRadius: 7, top: -5, marginLeft: -7 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 28 },
  ctrlBtn: { padding: 10 },
  playBtn: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowOpacity: 0.6, shadowRadius: 16, shadowOffset: { width: 0, height: 4 } },
});
