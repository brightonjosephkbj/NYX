import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, StyleSheet, StatusBar, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useThemeStore } from '../store/themeStore';
import { useProfileStore } from '../store/profileStore';
import { THEMES, ANIMATION_NAMES } from '../constants/themes';
import BackgroundAnimation from '../components/BackgroundAnimation';

export default function SettingsScreen({ navigation }: any) {
  const { theme, themeIndex, animationIndex, setTheme, setAnimation } = useThemeStore();
  const { name, avatar, setName, setAvatar } = useProfileStore();
  const [editName, setEditName] = useState(name);
  const [section, setSection] = useState<'profile' | 'themes' | 'animations' | 'about'>('profile');

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission needed');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1] });
    if (!result.canceled) setAvatar(result.assets[0].uri);
  };

  const saveName = () => { setName(editName); Alert.alert('Saved!', 'Profile updated.'); };

  const sections = ['profile', 'themes', 'animations', 'about'] as const;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
      <BackgroundAnimation />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.surface }]}>
          <Text style={{ color: theme.text }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.primary }]}>SETTINGS</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={[styles.segmented, { backgroundColor: theme.surface }]}>
        {sections.map(s => (
          <TouchableOpacity key={s} onPress={() => setSection(s)} style={[styles.segment, section === s && { backgroundColor: theme.primary + '33' }]}>
            <Text style={{ color: section === s ? theme.primary : theme.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 }}>{s.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        {section === 'profile' && (
          <View>
            <TouchableOpacity onPress={pickAvatar} style={[styles.avatarBtn, { borderColor: theme.primary }]}>
              {avatar ? <Image source={{ uri: avatar }} style={styles.avatar} /> : (
                <View style={[styles.avatar, { backgroundColor: theme.surface, justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ fontSize: 40, color: theme.primary }}>◉</Text>
                </View>
              )}
              <View style={[styles.avatarEdit, { backgroundColor: theme.primary }]}><Text style={{ color: theme.bg, fontSize: 12 }}>✎</Text></View>
            </TouchableOpacity>
            <Text style={[styles.label, { color: theme.textMuted }]}>DISPLAY NAME</Text>
            <TextInput
              style={[styles.nameInput, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
              value={editName}
              onChangeText={setEditName}
              placeholder="Your name"
              placeholderTextColor={theme.textMuted}
            />
            <TouchableOpacity onPress={saveName} style={[styles.saveBtn, { backgroundColor: theme.primary }]}>
              <Text style={{ color: theme.bg, fontWeight: '800', letterSpacing: 1 }}>SAVE PROFILE</Text>
            </TouchableOpacity>
          </View>
        )}

        {section === 'themes' && (
          <View>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>CHOOSE THEME ({themeIndex + 1}/19)</Text>
            <View style={styles.grid}>
              {THEMES.map((t, i) => (
                <TouchableOpacity key={t.id} onPress={() => setTheme(i)} style={[styles.themeCard, { backgroundColor: t.surface, borderColor: i === themeIndex ? t.primary : t.border, borderWidth: i === themeIndex ? 2 : 1 }]}>
                  <View style={[styles.themeColor, { backgroundColor: t.primary }]} />
                  <Text style={{ color: t.text, fontSize: 9, fontWeight: '700', textAlign: 'center', marginTop: 4 }}>{t.name}</Text>
                  {i === themeIndex && <Text style={{ color: t.primary, fontSize: 10, textAlign: 'center' }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {section === 'animations' && (
          <View>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>BACKGROUND ANIMATION ({animationIndex + 1}/19)</Text>
            {ANIMATION_NAMES.map((name, i) => (
              <TouchableOpacity key={i} onPress={() => setAnimation(i)} style={[styles.animRow, { backgroundColor: theme.surface, borderColor: i === animationIndex ? theme.primary : theme.border }]}>
                <View style={[styles.animDot, { backgroundColor: i === animationIndex ? theme.primary : theme.textMuted }]} />
                <Text style={{ color: i === animationIndex ? theme.primary : theme.text, fontWeight: i === animationIndex ? '700' : '400' }}>{name}</Text>
                {i === animationIndex && <Text style={{ color: theme.primary, marginLeft: 'auto' as any }}>◉</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {section === 'about' && (
          <View style={styles.about}>
            <Text style={[styles.appName, { color: theme.primary }]}>N.Y.X</Text>
            <Text style={[styles.appSub, { color: theme.textMuted }]}>Network Your Xtreme</Text>
            <Text style={[styles.appVer, { color: theme.textMuted }]}>Version 1.0.0</Text>
            {[['Universal Downloader', '1400+ sites supported'], ['AI Assistant', 'Powered by Gemini'], ['Synced Lyrics', 'Via LRCLIB'], ['Background Play', 'Stays active when minimized']].map(([k, v]) => (
              <View key={k} style={[styles.infoRow, { borderBottomColor: theme.border }]}>
                <Text style={{ color: theme.text, fontWeight: '600' }}>{k}</Text>
                <Text style={{ color: theme.textMuted, fontSize: 12 }}>{v}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 54, paddingBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '900', letterSpacing: 4 },
  segmented: { flexDirection: 'row', marginHorizontal: 16, borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  segment: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  avatarBtn: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, alignSelf: 'center', marginBottom: 20, overflow: 'visible' },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarEdit: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 10, letterSpacing: 2, fontWeight: '700', marginBottom: 8 },
  nameInput: { padding: 14, borderRadius: 12, borderWidth: 1, fontSize: 16, marginBottom: 16 },
  saveBtn: { padding: 14, borderRadius: 12, alignItems: 'center' },
  sectionLabel: { fontSize: 10, letterSpacing: 2, fontWeight: '700', marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  themeCard: { width: '30%', padding: 10, borderRadius: 10, alignItems: 'center' },
  themeColor: { width: 28, height: 28, borderRadius: 14 },
  animRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8, gap: 12 },
  animDot: { width: 8, height: 8, borderRadius: 4 },
  about: { alignItems: 'center', paddingTop: 20 },
  appName: { fontSize: 48, fontWeight: '900', letterSpacing: 8 },
  appSub: { fontSize: 12, letterSpacing: 3, marginTop: 4 },
  appVer: { fontSize: 11, marginTop: 8, marginBottom: 30 },
  infoRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1 },
});
