import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, Image } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useDownloadStore } from '../store/downloadStore';
import BackgroundAnimation from '../components/BackgroundAnimation';

export default function DownloadsScreen() {
  const { theme } = useThemeStore();
  const { downloads, removeDownload, clearCompleted } = useDownloadStore();

  const completed = downloads.filter(d => d.status === 'done').length;
  const inProgress = downloads.filter(d => d.status === 'downloading').length;
  const failed = downloads.filter(d => d.status === 'failed').length;

  const statusColor = (s: string) => {
    if (s === 'done') return '#00FF88';
    if (s === 'failed') return '#FF2244';
    if (s === 'downloading') return theme.primary;
    return theme.textMuted;
  };

  const statusLabel = (s: string, p: number) => {
    if (s === 'downloading') return `DOWNLOADING ${(p * 100).toFixed(0)}%`;
    if (s === 'done') return 'COMPLETED';
    if (s === 'failed') return 'FAILED';
    return 'QUEUED';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
      <BackgroundAnimation />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.primary }]}>DOWNLOADS</Text>
        {completed > 0 && (
          <TouchableOpacity onPress={clearCompleted} style={[styles.clearBtn, { borderColor: theme.border }]}>
            <Text style={{ color: theme.textMuted, fontSize: 10, fontWeight: '700' }}>CLEAR DONE</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsRow}>
        {[
          { label: 'Completed', value: completed, color: '#00FF88' },
          { label: 'In Progress', value: inProgress, color: theme.primary },
          { label: 'Failed', value: failed, color: '#FF2244' },
        ].map((s, i) => (
          <View key={i} style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={{ color: s.color, fontSize: 22, fontWeight: '900' }}>{s.value}</Text>
            <Text style={{ color: theme.textMuted, fontSize: 10, marginTop: 2 }}>{s.label}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={downloads}
        keyExtractor={d => d.id}
        renderItem={({ item }) => (
          <View style={[styles.item, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {item.thumbnail ? (
              <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, { backgroundColor: theme.surfaceAlt, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 20 }}>{item.format === 'mp4' || item.format === 'webm' ? '🎬' : '🎵'}</Text>
              </View>
            )}
            <View style={styles.itemInfo}>
              <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
              <Text style={[styles.itemMeta, { color: theme.textMuted }]}>{item.artist} • {item.format.toUpperCase()} • {item.quality}</Text>
              {item.status === 'downloading' && (
                <View style={{ marginTop: 6 }}>
                  <View style={[styles.progressBg, { backgroundColor: theme.surfaceAlt }]}>
                    <View style={[styles.progressFill, { width: `${(item.progress * 100).toFixed(0)}%` as any, backgroundColor: theme.primary }]} />
                  </View>
                  <Text style={{ color: theme.primary, fontSize: 10, marginTop: 3, fontWeight: '700' }}>
                    {(item.progress * 100).toFixed(1)}%
                  </Text>
                </View>
              )}
              {item.status !== 'downloading' && (
                <Text style={{ color: statusColor(item.status), fontSize: 10, marginTop: 4, fontWeight: '700', letterSpacing: 0.5 }}>
                  {statusLabel(item.status, item.progress)}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={() => removeDownload(item.id)} style={[styles.removeBtn, { backgroundColor: theme.surfaceAlt }]}>
              <Text style={{ color: theme.textMuted, fontSize: 12 }}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>⬇️</Text>
            <Text style={{ color: theme.textMuted }}>No downloads yet</Text>
            <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 4 }}>Paste a URL in Search to download</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 54, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '900', letterSpacing: 4 },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  statCard: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, marginVertical: 4, padding: 12, borderRadius: 14, borderWidth: 1 },
  thumb: { width: 52, height: 52, borderRadius: 10 },
  itemInfo: { flex: 1, marginHorizontal: 12 },
  itemTitle: { fontSize: 13, fontWeight: '600' },
  itemMeta: { fontSize: 11, marginTop: 2 },
  progressBg: { height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 2 },
  progressFill: { height: '100%', borderRadius: 2 },
  removeBtn: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, alignItems: 'center', paddingTop: 80 },
});
