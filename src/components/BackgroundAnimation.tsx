import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, Easing, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../store/themeStore';

const { width, height } = Dimensions.get('window');

const Particle = ({ color, delay }: { color: string; delay: number }) => {
  const x = useRef(new Animated.Value(Math.random() * width)).current;
  const y = useRef(new Animated.Value(Math.random() * height)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const size = Math.random() * 4 + 1;

  useEffect(() => {
    const animate = () => {
      x.setValue(Math.random() * width);
      y.setValue(height + 10);
      Animated.parallel([
        Animated.timing(y, { toValue: -10, duration: 6000 + Math.random() * 4000, easing: Easing.linear, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.8, duration: 1000, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 1000, delay: 3000, useNativeDriver: true }),
        ]),
      ]).start(() => animate());
    };
    const t = setTimeout(animate, delay);
    return () => clearTimeout(t);
  }, []);

  return (
    <Animated.View style={{ position: 'absolute', width: size, height: size, borderRadius: size, backgroundColor: color, transform: [{ translateX: x }, { translateY: y }], opacity }} />
  );
};

const PulseCircle = ({ color, delay, size }: { color: string; delay: number; size: number }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const animate = () => {
      scale.setValue(0);
      opacity.setValue(0.6);
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: 3000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ]).start(() => setTimeout(animate, delay));
    };
    setTimeout(animate, delay);
  }, []);

  return (
    <Animated.View style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: 1, borderColor: color, top: height / 2 - size / 2, left: width / 2 - size / 2, transform: [{ scale }], opacity }} />
  );
};

const StarField = ({ color }: { color: string }) => {
  const stars = useMemo(() => Array.from({ length: 60 }, (_, i) => ({ id: i, x: Math.random() * width, y: Math.random() * height, size: Math.random() * 2.5 + 0.5 })), []);
  const twinkle = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(twinkle, { toValue: 1, duration: 2000, useNativeDriver: true }),
      Animated.timing(twinkle, { toValue: 0.3, duration: 2000, useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <>
      {stars.map(s => (
        <Animated.View key={s.id} style={{ position: 'absolute', width: s.size, height: s.size, borderRadius: s.size, backgroundColor: color, left: s.x, top: s.y, opacity: twinkle }} />
      ))}
    </>
  );
};

const BarsAnimation = ({ color }: { color: string }) => {
  const bars = Array.from({ length: 20 }, (_, i) => {
    const h = useRef(new Animated.Value(Math.random() * 60 + 10)).current;
    useEffect(() => {
      const animate = () => {
        Animated.timing(h, { toValue: Math.random() * 80 + 10, duration: 300 + Math.random() * 300, useNativeDriver: false }).start(animate);
      };
      animate();
    }, []);
    return h;
  });
  const barW = width / 20;
  return (
    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'flex-end', opacity: 0.15 }}>
      {bars.map((h, i) => (
        <Animated.View key={i} style={{ width: barW - 2, marginHorizontal: 1, height: h, backgroundColor: color, borderTopLeftRadius: 2, borderTopRightRadius: 2 }} />
      ))}
    </View>
  );
};

export default function BackgroundAnimation() {
  const { theme, animationIndex } = useThemeStore();
  const color = theme.primary;
  const gradColors = theme.gradients as [string, string];

  const renderAnimation = () => {
    switch (animationIndex) {
      case 0: return Array.from({ length: 25 }, (_, i) => <Particle key={i} color={color} delay={i * 200} />);
      case 1: return [80, 160, 240, 320, 400].map((s, i) => <PulseCircle key={i} color={color} delay={i * 600} size={s} />);
      case 2: return <StarField color={color} />;
      case 3: return <StarField color={color} />;
      case 17: return <BarsAnimation color={color} />;
      default: return null;
    }
  };

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <LinearGradient colors={gradColors} style={StyleSheet.absoluteFillObject} />
      {renderAnimation()}
    </View>
  );
}
