import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors, FontSize, Spacing } from '../constants/theme';

interface CountdownTimerProps {
  /** Target time as ISO string or Date */
  targetTime?: Date;
  label?: string;
}

function getTimeRemaining(target: Date) {
  const now = new Date();
  const diff = Math.max(0, target.getTime() - now.getTime());
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { hours, minutes, seconds, total: diff };
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export default function CountdownTimer({
  targetTime,
  label = 'POLLS CLOSE IN',
}: CountdownTimerProps) {
  // Default: midnight tonight
  const target =
    targetTime ??
    (() => {
      const d = new Date();
      d.setHours(23, 59, 59, 999);
      return d;
    })();

  const [time, setTime] = useState(getTimeRemaining(target));

  // Colon blink
  const colonOpacity = useSharedValue(1);

  // Urgency pulse when < 1 hour
  const urgencyScale = useSharedValue(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeRemaining(target));
    }, 1000);
    return () => clearInterval(interval);
  }, [target]);

  useEffect(() => {
    colonOpacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 500, easing: Easing.ease }),
        withTiming(1, { duration: 500, easing: Easing.ease })
      ),
      -1, true
    );
  }, []);

  useEffect(() => {
    if (time.hours === 0) {
      urgencyScale.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1, true
      );
    }
  }, [time.hours]);

  const colonStyle = useAnimatedStyle(() => ({
    opacity: colonOpacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: urgencyScale.value }],
  }));

  const isUrgent = time.hours === 0;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.timerRow}>
        <View style={styles.digitBlock}>
          <Text style={[styles.digit, isUrgent && styles.digitUrgent]}>
            {pad(time.hours)}
          </Text>
          <Text style={styles.digitLabel}>HRS</Text>
        </View>

        <Animated.Text style={[styles.colon, colonStyle]}>:</Animated.Text>

        <View style={styles.digitBlock}>
          <Text style={[styles.digit, isUrgent && styles.digitUrgent]}>
            {pad(time.minutes)}
          </Text>
          <Text style={styles.digitLabel}>MIN</Text>
        </View>

        <Animated.Text style={[styles.colon, colonStyle]}>:</Animated.Text>

        <View style={styles.digitBlock}>
          <Text style={[styles.digit, isUrgent && styles.digitUrgent]}>
            {pad(time.seconds)}
          </Text>
          <Text style={styles.digitLabel}>SEC</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.accentDim,
  },
  label: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: Spacing.sm,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  digitBlock: {
    alignItems: 'center',
    minWidth: 52,
  },
  digit: {
    color: Colors.textPrimary,
    fontSize: 32,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  digitUrgent: {
    color: Colors.redTint,
  },
  digitLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: -2,
  },
  colon: {
    color: Colors.accent,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 10,
  },
});
