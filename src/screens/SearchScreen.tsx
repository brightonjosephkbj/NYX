import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, StatusBar, ActivityIndicator, Alert, Modal } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import BackgroundAnimation from '../components/BackgroundAnimation';
import { getInfo, searchTracks } from '../services/api';
import { usePlayerStore, Track } from '../store/playerStore';
import { useDownloadStore, Download } from '../store/downloadStore';
import { useLibraryStore } from '../store/libraryStore';
import audioService from '../services/audioService';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

const BASE = 'https://wave-backend-mjjm.onrender.com';

const FORMATS = [
  { label: 'MP3 Audio', icon: '🎵', ext: 'mp3', audioOnly: true },
  { label: 'MP4 Video', icon: '🎬', ext: 'mp4', audioOnly: false },
  { label: 'AAC Audio', icon: '🎧', ext: 'm4a', audioOnly: true },
  { label: 'WEBM', icon: '📹', ext: 'webm', audioOnly: false },
];

const QUALITIES = [
  { label: 'Best Available', value: 'best' },
  { label: '1080p', value: '1080' },
  { label: '720p', value: '720' },
  { label: '480p', value: '480' },
  { label: '360p', value: '360' },
  { label: '128 kbps', value: '128k' },
  { label: '320 kbps', value: '320k' },
];

const PLATFORMS = ['YouTube', 'TikTok', 'Instagram', 'SoundCloud', 'Twitter/X', 'Facebook', 'Other'];

export default function SearchScreen({ navigation }: any) {
  const { theme } = useThemeStore();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchedInfo, setFetchedInfo] = useState<any>(null);
  const [formatIndex, setFormatIndex] = useState(0);
  const [qualityIndex, setQualityIndex] = useState(0);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const { setCurrentTrack, setIsPlaying } = usePlayerStore();
  const { addDownload, updateDownload } = useDownloadStore();
  const { addTrack } = useLibraryStore();

  const isUrl = (s: string) => s.startsWith('http://') || s.startsWith('https://');

  const fetchInfo = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setFetchedInfo(null);
    try {
      const info = await getInfo(query);
      setFetchedInfo(info);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || 'Could not fetch media info');
    }
    setLoading(false);
  };

  const getBestFormat = (formats: any[], audioOnly: boolean) => {
    if (!formats || formats.length === 0) return null;
    const q = QUALITIES[qualityIndex].value;
    if (audioOnly) {
      if (q === '320k') return formats.find(f => f.acodec !== 'none' && f.vcodec === 'none' && f.abr >= 300) || formats.find(f => f.acodec !== 'none' && f.vcodec === 'none');
      return formats.find(f => f.ext === 'm4a' && f.vcodec === 'none') || formats.find(f => f.acodec !== 'none' && f.vcodec === 'none') || formats[formats.length - 1];
    }
    if (q === '1080') return formats.find(f => f.height === 1080 && f.acodec !== 'none') || formats.find(f => f.height === 1080) || formats.find(f => f.format_id === '18');
    if (q === '720') return formats.find(f => f.height === 720 && f.acodec !== 'none') || formats.find(f => f.height === 720) || formats.find(f => f.format_id === '18');
    if (q === '480') return formats.find(f => f.height === 480 && f.acodec !== 'none') || formats.find(f => f.height === 480) || formats.find(f => f.format_id === '18');
    return formats.find(f => f.format_id === '18') || formats.find(f => f.acodec !== 'none' && f.vcodec !== 'none') || formats[formats.length - 1];
  };

  const downloadNow = async () => {
    if (!fetchedInfo) return Alert.alert('Fetch first', 'Paste a URL and press the search icon first');
    try {
      const perms = await MediaLibrary.requestPermissionsAsync();
      if (!perms.granted) return Alert.alert('Permission needed', 'Allow media access to save downloads');
      const fmt = getBestFormat(fetchedInfo.formats || [], FORMATS[formatIndex].audioOnly);
      if (!fmt) return Alert.alert('Error', 'No matching format found');
      const dlUrl = `${BASE}/download/file?url=${encodeURIComponent(fetchedInfo.webpage_url || query)}&format_id=${fmt.format_id}`;
      const dlId = Date.now().toString();
      const ext = FORMATS[formatIndex].ext;
      const dl: Download = {
        id: dlId,
        title: fetchedInfo.title || 'Unknown',
        artist: fetchedInfo.uploader || fetchedInfo.channel || 'Unknown',
        thumbnail: fetchedInfo.thumbnail,
        url: dlUrl,
        format: ext,
        quality: QUALITIES[qualityIndex].label,
        progress: 0,
        status: 'downloading',
        createdAt: Date.now(),
      };
      addDownload(dl);
      Alert.alert('Downloading! 🎵', `"${dl.title}"\nSaving as ${ext.toUpperCase()}`);
      const dest = FileSystem.documentDirectory + `${dlId}.${ext}`;
      const cb = FileSystem.createDownloadResumable(dlUrl, dest, {}, (p) => {
        const pct = p.totalBytesExpectedToWrite > 0 ? p.totalBytesWritten / p.totalBytesExpectedToWrite : 0;
        updateDownload(dlId, { progress: pct });
      });
      const result = await cb.downloadAsync();
      if (result?.uri) {
        await MediaLibrary.saveToLibraryAsync(result.uri);
        updateDownload(dlId, { status: 'done', progress: 1, localPath: result.uri });
      }
    } catch (e: any) {
      Alert.alert('Download failed', e.message);
    }
  };

  const addToQueue = () => {
    if (!fetchedInfo) return Alert.alert('Fetch first', 'Paste a URL and press search first');
    const fmt = getBestFormat(fetchedInfo.formats || [], FORMATS[formatIndex].audioOnly);
    if (!fmt) return;
    const dlUrl = `${BASE}/download/file?url=${encodeURIComponent(fetchedInfo.webpage_url || query)}&format_id=${fmt.format_id}`;
    const dl: Download = {
      id: Date.now().toString(),
      title: fetchedInfo.title || 'Unknown',
      artist: fetchedInfo.uploader || 'Unknown',
      thumbnail: fetchedInfo.thumbnail,
      url: dlUrl,
      format: FORMATS[formatIndex].ext,
      quality: QUALITIES[qualityIndex].label,
      progress: 0,
      status: 'queued',
      createdAt: Date.now(),
    };
    addDownload(dl);
    Alert.alert('Added to Queue ✅', fetchedInfo.title);
  };

  const playNow = async () => {
    if (!fetchedInfo) return;
    try {
      const fmt = getBestFormat(fetchedInfo.formats || [], true);
      if (!fmt) return Alert.alert('Error', 'No playable format');
      const streamUrl = `${BASE}/download/file?url=${encodeURIComponent(fetchedInfo.webpage_url || query)}&format_id=${fmt.format_id}`;
      const track: Track = {
        id: fetchedInfo.id || Date.now().toString(),
        title: fetchedInfo.title || 'Unknown',
        artist: fetchedInfo.uploader || fetchedInfo.channel || 'Unknown',
        thumbnail: fetchedInfo.thumbnail,
        url: streamUrl,
        duration: fetchedInfo.duration || 0,
        isVideo: false,
      };
      setCurrentTrack(track);
      addTrack(track);
      await audioService.init();
      await audioService.play(streamUrl, (status) => {
        if (status.isLoaded) {
          usePlayerStore.getState().setPosition(status.positionMillis || 0);
          usePlayerStore.getState().setDuration(status.durationMillis || 0);
          usePlayerStore.getState().setIsPlaying(status.isPlaying);
        }
      });
      setIsPlaying(true);
      navigation.navigate('Player');
    } catch (e: any) {
      Alert.alert('Playback Error', e.message);
    }
  };

  const DropdownModal = ({ visible, items, selected, onSelect, onClose }: any) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <View style={[styles.modalBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {items.map((item: any, i: number) => (
            <TouchableOpacity key={i} onPress={() => { onSelect(i); onClose(); }}
              style={[styles.modalItem, i === selected && { backgroundColor: theme.primary + '22' }]}>
              <Text style={{ color: i === selected ? theme.primary : theme.text, fontSize: 14 }}>
                {item.icon ? `${item.icon}  ` : ''}{item.label}
              </Text>
              {i === selected && <Text style={{ color: theme.primary }}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <BackgroundAnimation />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Download Media</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>Paste a URL from any supported platform</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.urlRow, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
            <Text style={{ color: theme.textMuted, fontSize: 16, marginRight: 8 }}>🔗</Text>
            <TextInput
              style={[styles.urlInput, { color: theme.text }]}
              placeholder="Paste video or audio URL here..."
              placeholderTextColor={theme.textMuted}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={fetchInfo} style={[styles.fetchBtn, { backgroundColor: theme.primary + '22' }]}>
              {loading ? <ActivityIndicator color={theme.primary} size="small" /> : <Text style={{ color: theme.primary, fontSize: 18 }}>🔍</Text>}
            </TouchableOpacity>
          </View>

          {fetchedInfo && (
            <View style={[styles.resultPreview, { backgroundColor: theme.surfaceAlt, borderColor: theme.primary + '44' }]}>
              <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '700' }} numberOfLines={2}>{fetchedInfo.title}</Text>
              <Text style={{ color: theme.textMuted, fontSize: 11, marginTop: 2 }}>{fetchedInfo.uploader || fetchedInfo.channel || 'Unknown'} • {Math.floor((fetchedInfo.duration || 0) / 60)}:{String(Math.floor((fetchedInfo.duration || 0) % 60)).padStart(2, '0')}</Text>
              <TouchableOpacity onPress={playNow} style={[styles.playBtn, { backgroundColor: theme.primary + '22', borderColor: theme.primary + '44' }]}>
                <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '700' }}>▶ Play Now</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.dropdownRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.dropLabel, { color: theme.textMuted }]}>FORMAT</Text>
              <TouchableOpacity onPress={() => setShowFormatModal(true)} style={[styles.dropdown, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
                <Text style={{ color: theme.text, fontSize: 13 }}>{FORMATS[formatIndex].icon}  {FORMATS[formatIndex].label}</Text>
                <Text style={{ color: theme.textMuted }}>▾</Text>
              </TouchableOpacity>
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.dropLabel, { color: theme.textMuted }]}>QUALITY</Text>
              <TouchableOpacity onPress={() => setShowQualityModal(true)} style={[styles.dropdown, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
                <Text style={{ color: theme.text, fontSize: 13 }}>{QUALITIES[qualityIndex].label}</Text>
                <Text style={{ color: theme.textMuted }}>▾</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity onPress={downloadNow} style={[styles.downloadBtn, { backgroundColor: theme.primary }]}>
              <Text style={{ color: theme.bg, fontWeight: '800', fontSize: 14 }}>⬇  Download Now</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={addToQueue} style={[styles.queueBtn, { borderColor: theme.border, backgroundColor: theme.surfaceAlt }]}>
              <Text style={{ color: theme.text, fontSize: 13, fontWeight: '600' }}>+  Queue</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.platformSection}>
          <Text style={[styles.platformLabel, { color: theme.textMuted }]}>SUPPORTED PLATFORMS</Text>
          <View style={styles.chips}>
            {PLATFORMS.map((p, i) => (
              <View key={i} style={[styles.chip, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                <Text style={{ color: theme.textMuted, fontSize: 12 }}>{p}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <DropdownModal visible={showFormatModal} items={FORMATS} selected={formatIndex} onSelect={setFormatIndex} onClose={() => setShowFormatModal(false)} />
      <DropdownModal visible={showQualityModal} items={QUALITIES} selected={qualityIndex} onSelect={setQualityIndex} onClose={() => setShowQualityModal(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 64, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: '900' },
  subtitle: { fontSize: 13, marginTop: 4 },
  card: { marginHorizontal: 16, borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 24 },
  urlRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, marginBottom: 14 },
  urlInput: { flex: 1, paddingVertical: 14, fontSize: 13 },
  fetchBtn: { padding: 10, borderRadius: 10 },
  resultPreview: { borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 14 },
  playBtn: { marginTop: 8, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start' },
  dropdownRow: { flexDirection: 'row', marginBottom: 14 },
  dropLabel: { fontSize: 10, letterSpacing: 1.5, fontWeight: '700', marginBottom: 6 },
  dropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1 },
  actionRow: { flexDirection: 'row', gap: 10 },
  downloadBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  queueBtn: { padding: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  platformSection: { paddingHorizontal: 20 },
  platformLabel: { fontSize: 10, letterSpacing: 1.5, fontWeight: '700', marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  modalOverlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'center', padding: 40 },
  modalBox: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#ffffff11' },
});
