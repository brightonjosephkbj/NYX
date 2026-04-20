import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { usePlayerStore } from '../store/playerStore';

interface LyricLine {
  time: number;
  text: string;
}

function parseLRC(lrc: string): LyricLine[] {
  const lines: LyricLine[] = [];
  const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;
  lrc.split('\n').forEach(line => {
    const m = line.match(regex);
    if (m) {
      const time = parseInt(m[1]) * 60 + parseInt(m[2]) + parseInt(m[3]) / 1000;
      lines.push({ time, text: m[4].trim() });
    }
  });
  return lines.sort((a, b) => a.time - b.time);
}

interface Props {
  lrc: string;
}

export default function LyricsView({ lrc }: Props) {
  const { theme } = useThemeStore();
  const position = usePlayerStore(s => s.position);
  const scrollRef = useRef<ScrollView>(null);

  const lines = useMemo(() => parseLRC(lrc), [lrc]);

  const currentIndex = useMemo(() => {
    const posS = position / 1000;
    let idx = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].time <= posS) idx = i;
      else break;
    }
    return idx;
  }, [position, lines]);

  useEffect(() => {
    if (lines.length > 0) {
      scrollRef.current?.scrollTo({ y: currentIndex * 44, animated: true });
    }
  }, [currentIndex]);

  if (!lrc || lines.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{ color: theme.textMuted, fontSize: 14 }}>No lyrics available</Text>
      </View>
    );
  }

  return (
    <ScrollView ref={scrollRef} style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={{ paddingVertical: 100 }}>
        {lines.map((line, i) => (
          <Text
            key={i}
            style={[
              styles.line,
              { color: i === currentIndex ? theme.primary : theme.textMuted,
                fontSize: i === currentIndex ? 17 : 14,
                fontWeight: i === currentIndex ? '700' : '400' }
            ]}
          >
            {line.text}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  line: { textAlign: 'center', marginVertical: 10, lineHeight: 24 },
});
