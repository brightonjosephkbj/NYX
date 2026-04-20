import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import BackgroundAnimation from '../components/BackgroundAnimation';
import { getTrending } from '../services/api';

export default function HomeScreen({ navigation }: any) {
  const { theme } = useThemeStore();
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrending().then(d => { setTrending(d?.results || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
      <BackgroundAnimation />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.textMuted }]}>WELCOME TO</Text>
            <Text style={[styles.appName, { color: theme.primary }]}>N.Y.X</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={[styles.settingsBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={{ color: theme.primary, fontSize: 18 }}>⚙</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Search')} style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={{ color: theme.textMuted, fontSize: 14 }}>◎  Search songs, artists, URLs...</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>TRENDING</Text>
        {loading ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: 30 }} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {trending.slice(0, 10).map((item: any, i: number) => (
              <TouchableOpacity key={i} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                {item.thumbnail ? (
                  <Image source={{ uri: item.thumbnail }} style={styles.cardImg} />
                ) : (
                  <View style={[styles.cardImg, { backgroundColor: theme.surfaceAlt }]} />
                )}
                <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
                <Text style={[styles.cardArtist, { color: theme.textMuted }]} numberOfLines={1}>{item.artist || item.uploader || ''}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <Text style={[styles.sectionTitle, { color: theme.text }]}>QUICK ACTIONS</Text>
        <View style={styles.actions}>
          {[{ icon: '⬇', label: 'Download', screen: 'Downloads' }, { icon: '◎', label: 'Search', screen: 'Search' }, { icon: '▤', label: 'Library', screen: 'Library' }, { icon: '◈', label: 'Ask ARIA', screen: 'ARIA' }].map((a, i) => (
            <TouchableOpacity key={i} onPress={() => navigation.navigate(a.screen)} style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.primary + '44' }]}>
              <Text style={{ fontSize: 26, color: theme.primary }}>{a.icon}</Text>
              <Text style={{ color: theme.textMuted, fontSize: 11, marginTop: 4, fontWeight: '600', letterSpacing: 0.5 }}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 54, paddingBottom: 16 },
  greeting: { fontSize: 11, letterSpacing: 2, fontWeight: '600' },
  appName: { fontSize: 32, fontWeight: '900', letterSpacing: 4 },
  settingsBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  searchBar: { marginHorizontal: 16, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 24 },
  sectionTitle: { fontSize: 11, letterSpacing: 2, fontWeight: '800', marginHorizontal: 20, marginBottom: 14, marginTop: 8 },
  card: { width: 140, marginRight: 12, padding: 10, borderRadius: 12, borderWidth: 1 },
  cardImg: { width: '100%', height: 100, borderRadius: 8, marginBottom: 8 },
  cardTitle: { fontSize: 12, fontWeight: '600' },
  cardArtist: { fontSize: 11, marginTop: 2 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, marginBottom: 12 },
  actionBtn: { width: '47%', padding: 18, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
});
