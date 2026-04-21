import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, StatusBar, ActivityIndicator, Alert, Modal } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import BackgroundAnimation from '../components/BackgroundAnimation';
import { getInfo, searchTracks, getStreamUrl } from '../services/api';
import { usePlayerStore, Track } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import audioService from '../services/audioService';
import { downloadTrack } from '../services/downloadService';

const FORMATS = [
  { label: 'MP3 Audio', icon: '🎵', ext: 'mp3', audioOnly: true },
  { label: 'MP4 Video', icon: '🎬', ext: 'mp4', audioOnly: false },
  { label: 'AAC Audio', icon: '🎧', ext: 'm4a', audioOnly: true },
  { label: 'WEBM Video', icon: '📹', ext: 'webm', audioOnly: false },
];

const QUALITIES = [
  { label: 'Best Available', value: 'best' },
  { label: '1080p', value: '1080' },
  { label: '720p', value: '720' },
  { label: '480p', value: '480' },
  { label: '360p', value: '360' },
  { label: '320 kbps', value: '320k' },
  { label: '128 kbps', value: '128k' },
];

const PLATFORMS = ['YouTube', 'TikTok', 'Instagram', 'SoundCloud', 'Twitter/X', 'Facebook', 'Other'];

export default function SearchScreen({ navigation }: any) {
  const { theme } = useThemeStore();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [fetchedInfo, setFetchedInfo] = useState<any>(null);
  const [formatIndex, setFormatIndex] = useState(0);
  const [qualityIndex, setQualityIndex] = useState(0);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const { setCurrentTrack, setIsPlaying } = usePlayerStore();
  const { addTrack } = useLibraryStore();

  const getBestFormat = (formats: any[], audioOnly: boolean, qualityVal: string) => {
    if (!formats?.length) return null;
    if (audioOnly) {
      const m4a = formats.find(f => f.ext === 'm4a' && f.vcodec === 'none' && f.acodec !== 'none');
      const webm = formats.find(f => f.ext === 'webm' && f.vcodec === 'none' && f.acodec !== 'none');
      const anyAudio = formats.find(f => f.vcodec === 'none' && f.acodec !== 'none');
      return m4a || webm || anyAudio || formats.find(f => f.format_id === '18') || formats[formats.length - 1];
    }
    const h = parseInt(qualityVal);
    if (!isNaN(h)) {
      const withAudio = formats.find(f => f.height === h && f.acodec !== 'none');
      const videoOnly = formats.find(f => f.height === h);
      return withAudio || videoOnly || formats.find(f => f.format_id === '18') || formats[formats.length - 1];
    }
    return formats.find(f => f.format_id === '18') || formats.find(f => f.acodec !== 'none') || formats[formats.length - 1];
  };

  const fetchInfo = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setFetchedInfo(null);
    try {
      const info = await getInfo(query.trim());
      setFetchedInfo(info);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e.message || 'Could not fetch media info');
    }
    setLoading(false);
  };

  const playNow = async () => {
    if (!fetchedInfo) return;
    try {
      setLoading(true);
      const fmt = getBestFormat(fetchedInfo.formats, true, 'best');
      if (!fmt) { Alert.alert('Error', 'No playable format'); setLoading(false); return; }
      const streamUrl = getStreamUrl(fetchedInfo.webpage_url || query, fmt.format_id);
      const track: Track = {
        id: fetchedInfo.id || Date.now().toString(),
        title: fetchedInfo.title,
        artist: fetchedInfo.uploader,
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
      setLoading(false);
      navigation.navigate('Player');
    } catch (e: any) {
      setLoading(false);
      Alert.alert('Playback Error', e.message);
    }
  };

  const startDownload = async () => {
    if (!fetchedInfo) return Alert.alert('Fetch first', 'Paste a URL and tap 🔍 first');
    if (downloading) return;
    const fmt = getBestFormat(fetchedInfo.formats, FORMATS[formatIndex].audioOnly, QUALITIES[qualityIndex].value);
    if (!fmt) return Alert.alert('Error', 'No matching format found for selected quality');
    setDownloading(true);
    try {
      await downloadTrack(fetchedInfo, FORMATS[formatIndex].ext, QUALITIES[qualityIndex].label, fmt.format_id);
      Alert.alert('✅ Downloaded!', `"${fetchedInfo.title}" saved to your phone in NYX Downloads album`);
    } catch (e: any) {
      Alert.alert('Download Failed', e.message);
    }
    setDownloading(false);
  };

  const addToQueue = () => {
    if (!fetchedInfo) return Alert.alert('Fetch first', 'Paste a URL and tap 🔍 first');
    Alert.alert('Added to Queue', `"${fetchedInfo.title}" will download when you tap Download Now`);
  };

  const DropdownModal = ({ visible, items, selected, onSelect, onClose }: any) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <View style={[styles.modalBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {items.map((item: any, i: number) => (
            <TouchableOpacity key={i} onPress={() => { onSelect(i); onClose(); }}
              style={[styles.modalItem, { borderBottomColor: theme.border }, i === selected && { backgroundColor: theme.primary + '22' }]}>
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
          {/* URL Input */}
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
            <TouchableOpacity onPress={fetchInfo} style={[styles.fetchBtn, { backgroundColor: theme.primary }]}>
              {loading
                ? <ActivityIndicator color="#000" size="small" />
                : <Text style={{ fontSize: 16 }}>🔍</Text>
              }
            </TouchableOpacity>
          </View>

          {/* Result Preview */}
          {fetchedInfo && (
            <View style={[styles.preview, { backgroundColor: theme.surfaceAlt, borderColor: theme.primary + '55' }]}>
              <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '700' }} numberOfLines={2}>{fetchedInfo.title}</Text>
              <Text style={{ color: theme.textMuted, fontSize: 11, marginTop: 2 }}>
                {fetchedInfo.uploader} • {Math.floor((fetchedInfo.duration || 0) / 60)}:{String(Math.floor((fetchedInfo.duration || 0) % 60)).padStart(2, '0')}
              </Text>
              <TouchableOpacity onPress={playNow} style={[styles.playNowBtn, { backgroundColor: theme.primary + '22', borderColor: theme.primary + '55' }]}>
                <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '700' }}>▶ Play Now</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Format & Quality */}
          <View style={styles.dropRow}>
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

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={startDownload} disabled={downloading}
              style={[styles.dlBtn, { backgroundColor: downloading ? theme.textMuted : theme.primary }]}>
              {downloading
                ? <><ActivityIndicator color="#000" size="small" /><Text style={{ color: '#000', fontWeight: '800', fontSize: 13, marginLeft: 8 }}>Downloading...</Text></>
                : <Text style={{ color: '#000', fontWeight: '800', fontSize: 14 }}>⬇  Download Now</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity onPress={addToQueue} style={[styles.queueBtn, { borderColor: theme.border, backgroundColor: theme.surfaceAlt }]}>
              <Text style={{ color: theme.text, fontSize: 13 }}>+  Queue</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Platforms */}
        <View style={styles.platforms}>
          <Text style={[styles.dropLabel, { color: theme.textMuted, marginBottom: 12 }]}>SUPPORTED PLATFORMS</Text>
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
  urlRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingLeft: 12, marginBottom: 14, overflow: 'hidden' },
  urlInput: { flex: 1, paddingVertical: 14, fontSize: 13 },
  fetchBtn: { width: 52, height: 52, justifyContent: 'center', alignItems: 'center' },
  preview: { borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 14 },
  playNowBtn: { marginTop: 8, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start' },
  dropRow: { flexDirection: 'row', marginBottom: 14 },
  dropLabel: { fontSize: 10, letterSpacing: 1.5, fontWeight: '700', marginBottom: 6 },
  dropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1 },
  actionRow: { flexDirection: 'row', gap: 10 },
  dlBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  queueBtn: { padding: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  platforms: { paddingHorizontal: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  modalOverlay: { flex: 1, backgroundColor: '#00000099', justifyContent: 'center', padding: 40 },
  modalBox: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5 },
});
