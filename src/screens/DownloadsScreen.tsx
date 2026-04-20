import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useDownloadStore } from '../store/downloadStore';
import BackgroundAnimation from '../components/BackgroundAnimation';

export default function DownloadsScreen() {
  const { theme } = useThemeStore();
  const { downloads, removeDownload, clearCompleted } = useDownloadStore();

  const statusColor = (s: string) => {
    if (s === 'done') return '#00FF88';
    if (s === 'failed') return '#FF2244';
    if (s === 'downloading') return theme.primary;
    return theme.textMuted;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
      <BackgroundAnimation />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.primary }]}>DOWNLOADS</Text>
        {downloads.some(d => d.status === 'done') && (
          <TouchableOpacity onPress={clearCompleted} style={[styles.clearBtn, { borderColor: theme.border }]}>
            <Text style={{ color: theme.textMuted, fontSize: 11 }}>CLEAR DONE</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={downloads}
        keyExtractor={d => d.id}
        renderItem={({ item }) => (
          <View style={[styles.item, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
              <Text style={[styles.itemArtist, { color: theme.textMuted }]}>{item.artist} • {item.format.toUpperCase()}</Text>
              {item.status === 'downloading' && (
                <View style={[styles.progressBg, { backgroundColor: theme.surfaceAlt }]}>
                  <View style={[styles.progressFill, { width: `${(item.progress * 100).toFixed(0)}%` as any, backgroundColor: theme.primary }]} />
                </View>
              )}
              <Text style={{ color: statusColor(item.status), fontSize: 11, marginTop: 4, fontWeight: '700', letterSpacing: 1 }}>{item.status.toUpperCase()}{item.status === 'downloading' ? ` ${(item.progress * 100).toFixed(0)}%` : ''}</Text>
            </View>
            <TouchableOpacity onPress={() => removeDownload(item.id)} style={[styles.removeBtn, { backgroundColor: theme.surfaceAlt }]}>
              <Text style={{ color: theme.textMuted }}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: theme.textMuted, fontSize: 40, marginBottom: 12 }}>⬇</Text>
            <Text style={{ color: theme.textMuted }}>No downloads yet</Text>
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
  clearBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  item: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, marginVertical: 4, padding: 14, borderRadius: 12, borderWidth: 1 },
  itemInfo: { flex: 1, marginRight: 10 },
  itemTitle: { fontSize: 13, fontWeight: '600' },
  itemArtist: { fontSize: 11, marginTop: 2 },
  progressBg: { height: 3, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  removeBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, alignItems: 'center', paddingTop: 80 },
});
