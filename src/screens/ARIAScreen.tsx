import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, StatusBar, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import BackgroundAnimation from '../components/BackgroundAnimation';
import { askARIA } from '../services/api';

interface Message { id: string; role: 'user' | 'assistant'; content: string; }

export default function ARIAScreen() {
  const { theme } = useThemeStore();
  const [messages, setMessages] = useState<Message[]>([{ id: '0', role: 'assistant', content: "I'm ARIA — NYX's AI assistant. Ask me anything about music, downloads, or recommendations! 🎵" }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const { reply } = await askARIA(userMsg.content, history);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: "Sorry, I'm having trouble connecting. Try again." }]);
    }
    setLoading(false);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
      <BackgroundAnimation />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.primary }]}>A.R.I.A</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>AI MUSIC ASSISTANT</Text>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.role === 'user' ? [styles.userBubble, { backgroundColor: theme.primary + '22', borderColor: theme.primary + '44' }] : [styles.ariaBubble, { backgroundColor: theme.surface, borderColor: theme.border }]]}>
              {item.role === 'assistant' && <Text style={[styles.ariaLabel, { color: theme.primary }]}>◈ ARIA</Text>}
              <Text style={[styles.bubbleText, { color: theme.text }]}>{item.content}</Text>
            </View>
          )}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />
        {loading && <ActivityIndicator color={theme.primary} style={{ marginBottom: 8 }} />}
        <View style={[styles.inputRow, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Ask ARIA anything..."
            placeholderTextColor={theme.textMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={send}
            returnKeyType="send"
            multiline
            maxLength={500}
          />
          <TouchableOpacity onPress={send} disabled={loading} style={[styles.sendBtn, { backgroundColor: theme.primary }]}>
            <Text style={{ color: theme.bg, fontWeight: '800', fontSize: 16 }}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 54, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '900', letterSpacing: 4 },
  subtitle: { fontSize: 10, letterSpacing: 3, marginTop: 2 },
  bubble: { padding: 12, borderRadius: 14, marginBottom: 10, borderWidth: 1, maxWidth: '90%' },
  userBubble: { alignSelf: 'flex-end' },
  ariaBubble: { alignSelf: 'flex-start' },
  ariaLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, borderTopWidth: 1, gap: 8 },
  input: { flex: 1, maxHeight: 100, fontSize: 14, padding: 10 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
});
