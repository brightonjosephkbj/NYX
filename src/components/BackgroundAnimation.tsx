import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, Easing, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../store/themeStore';

const { width, height } = Dimensions.get('window');

const Particle = ({ color, delay }: any) => {
  const x = useRef(new Animated.Value(Math.random() * width)).current;
  const y = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const size = Math.random() * 4 + 1;
  useEffect(() => {
    const animate = () => {
      x.setValue(Math.random() * width);
      y.setValue(height + 10);
      Animated.parallel([
        Animated.timing(y, { toValue: -10, duration: 5000 + Math.random() * 5000, easing: Easing.linear, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.9, duration: 800, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 800, delay: 2500, useNativeDriver: true }),
        ]),
      ]).start(() => animate());
    };
    setTimeout(animate, delay);
  }, []);
  return <Animated.View style={{ position: 'absolute', width: size, height: size, borderRadius: size, backgroundColor: color, transform: [{ translateX: x }, { translateY: y }], opacity }} />;
};

const PulseRing = ({ color, delay, size }: any) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;
  useEffect(() => {
    const animate = () => {
      scale.setValue(0); opacity.setValue(0.7);
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: 2500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ]).start(() => setTimeout(animate, delay));
    };
    setTimeout(animate, delay);
  }, []);
  return <Animated.View style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: 1.5, borderColor: color, top: height / 2 - size / 2, left: width / 2 - size / 2, transform: [{ scale }], opacity }} />;
};

const StarField = ({ color }: any) => {
  const stars = useMemo(() => Array.from({ length: 80 }, (_, i) => ({ id: i, x: Math.random() * width, y: Math.random() * height, size: Math.random() * 2.5 + 0.5, delay: Math.random() * 3000 })), []);
  return (
    <>{stars.map(s => { const op = useRef(new Animated.Value(Math.random())).current; useEffect(() => { Animated.loop(Animated.sequence([Animated.timing(op, { toValue: 1, duration: 1500 + s.delay, useNativeDriver: true }), Animated.timing(op, { toValue: 0.1, duration: 1500 + s.delay, useNativeDriver: true })])).start(); }, []); return <Animated.View key={s.id} style={{ position: 'absolute', width: s.size, height: s.size, borderRadius: s.size, backgroundColor: color, left: s.x, top: s.y, opacity: op }} />; })}</>
  );
};

const BarsAnimation = ({ color }: any) => {
  const bars = Array.from({ length: 24 }, () => { const h = useRef(new Animated.Value(Math.random() * 50 + 10)).current; useEffect(() => { const animate = () => Animated.timing(h, { toValue: Math.random() * 80 + 10, duration: 200 + Math.random() * 400, useNativeDriver: false }).start(animate); animate(); }, []); return h; });
  return <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'flex-end', opacity: 0.12 }}>{bars.map((h, i) => <Animated.View key={i} style={{ flex: 1, marginHorizontal: 1, height: h, backgroundColor: color, borderTopLeftRadius: 2, borderTopRightRadius: 2 }} />)}</View>;
};

const MatrixRain = ({ color }: any) => {
  const cols = Array.from({ length: 10 }, (_, i) => { const y = useRef(new Animated.Value(-100)).current; useEffect(() => { const animate = () => { y.setValue(-100); Animated.timing(y, { toValue: height + 100, duration: 3000 + Math.random() * 4000, easing: Easing.linear, useNativeDriver: true }).start(animate); }; setTimeout(animate, i * 400); }, []); return { y, x: (width / 10) * i }; });
  return <>{cols.map((c, i) => <Animated.Text key={i} style={{ position: 'absolute', left: c.x, color: color, opacity: 0.2, fontSize: 12, transform: [{ translateY: c.y }] }}>{'01\n10\n01\n11\n00\n10'}</Animated.Text>)}</>;
};

const GeometricShapes = ({ color }: any) => {
  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(rotation, { toValue: 1, duration: 10000, easing: Easing.linear, useNativeDriver: true })).start();
    Animated.loop(Animated.sequence([Animated.timing(scale, { toValue: 1.2, duration: 3000, useNativeDriver: true }), Animated.timing(scale, { toValue: 0.8, duration: 3000, useNativeDriver: true })])).start();
  }, []);
  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <View style={{ position: 'absolute', top: height / 2 - 100, left: width / 2 - 100, opacity: 0.08 }}>
      {[80, 130, 180].map((s, i) => <Animated.View key={i} style={{ position: 'absolute', width: s, height: s, borderWidth: 1, borderColor: color, left: 100 - s / 2, top: 100 - s / 2, transform: [{ rotate: spin }, { scale }], borderRadius: i === 2 ? s / 2 : 4 }} />)}
    </View>
  );
};

const GlitchEffect = ({ color }: any) => {
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([Animated.timing(x, { toValue: 8, duration: 50, useNativeDriver: true }), Animated.timing(x, { toValue: -8, duration: 50, useNativeDriver: true }), Animated.timing(x, { toValue: 0, duration: 50, useNativeDriver: true }), Animated.delay(3000)])).start();
  }, []);
  return <Animated.View style={{ position: 'absolute', width: '100%', height: 2, backgroundColor: color, top: height * 0.3, opacity: 0.3, transform: [{ translateX: x }] }} />;
};

export default function BackgroundAnimation() {
  const { theme, animationIndex } = useThemeStore();
  const color = theme.primary;
  const gradColors = theme.gradients as [string, string];

  const renderAnimation = () => {
    switch (animationIndex) {
      case 0: return Array.from({ length: 30 }, (_, i) => <Particle key={i} color={color} delay={i * 200} />);
      case 1: return [80, 150, 220, 290, 360].map((s, i) => <PulseRing key={i} color={color} delay={i * 500} size={s} />);
      case 2: return <StarField color={color} />;
      case 3: return <StarField color={color} />;
      case 4: return [60, 120, 180, 240].map((s, i) => <PulseRing key={i} color={color} delay={i * 600} size={s} />);
      case 5: return <MatrixRain color={color} />;
      case 6: return Array.from({ length: 20 }, (_, i) => <Particle key={i} color={color} delay={i * 300} />);
      case 7: return Array.from({ length: 15 }, (_, i) => <Particle key={i} color={color} delay={i * 250} />);
      case 8: return [100, 180, 260].map((s, i) => <PulseRing key={i} color={color} delay={i * 400} size={s} />);
      case 9: return <GeometricShapes color={color} />;
      case 10: return Array.from({ length: 25 }, (_, i) => <Particle key={i} color={color} delay={i * 180} />);
      case 11: return [60, 100, 140, 180].map((s, i) => <PulseRing key={i} color={color} delay={i * 300} size={s} />);
      case 12: return <GeometricShapes color={color} />;
      case 13: return <GlitchEffect color={color} />;
      case 14: return <MatrixRain color={color} />;
      case 15: return Array.from({ length: 20 }, (_, i) => <Particle key={i} color={color} delay={i * 220} />);
      case 16: return <GlitchEffect color={color} />;
      case 17: return <BarsAnimation color={color} />;
      case 18: return null;
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
