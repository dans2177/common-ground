import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../constants/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface Particle {
  id: number;
  startX: number;
  startY: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

const PARTICLE_COLORS = [
  Colors.accent + '15',
  Colors.accent + '0A',
  Colors.blueTint + '10',
  Colors.accentDim,
];

// Generate random particles
const particles: Particle[] = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  startX: Math.random() * SCREEN_W,
  startY: Math.random() * SCREEN_H,
  size: 2 + Math.random() * 4,
  delay: Math.random() * 4000,
  duration: 6000 + Math.random() * 8000,
  color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
}));

function FloatingDot({ particle }: { particle: Particle }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      particle.delay,
      withRepeat(
        withTiming(-SCREEN_H * 0.4, {
          duration: particle.duration,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      )
    );
    opacity.value = withDelay(
      particle.delay,
      withRepeat(
        withTiming(1, { duration: particle.duration / 2 }),
        -1,
        true
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value * 0.6,
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          left: particle.startX,
          top: particle.startY,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: particle.color,
        },
        style,
      ]}
    />
  );
}

export default function FloatingParticles() {
  return (
    <>
      {particles.map((p) => (
        <FloatingDot key={p.id} particle={p} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
  },
});
