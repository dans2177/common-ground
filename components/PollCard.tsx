import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Pressable } from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Polygon, Line, Circle } from 'react-native-svg';
import { Colors, Spacing, FontSize } from '../constants/theme';
import { Poll, PollScope } from '../types';

const SCOPE_EMOJI: Record<PollScope, string> = {
  national: '🌎',
  state: '🏛',
  local: '📍',
};

interface PollCardProps {
  poll: Poll;
  index: number;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function MiniDiamond({ size = 56 }: { size?: number }) {
  const half = size / 2;
  const r = half * 0.8;
  const points = [
    `${half},${half - r}`,
    `${half + r},${half}`,
    `${half},${half + r}`,
    `${half - r},${half}`,
  ].join(' ');

  const gridR = r * 0.5;
  const gridPoints = [
    `${half},${half - gridR}`,
    `${half + gridR},${half}`,
    `${half},${half + gridR}`,
    `${half - gridR},${half}`,
  ].join(' ');

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Polygon points={points} fill="none" stroke={Colors.accent + '40'} strokeWidth={1.5} />
      <Polygon points={gridPoints} fill="none" stroke={Colors.accent + '20'} strokeWidth={0.5} />
      <Line x1={half - r} y1={half} x2={half + r} y2={half} stroke={Colors.accent + '15'} strokeWidth={0.5} />
      <Line x1={half} y1={half - r} x2={half} y2={half + r} stroke={Colors.accent + '15'} strokeWidth={0.5} />
      <Circle cx={half} cy={half} r={2.5} fill={Colors.accent} opacity={0.7} />
    </Svg>
  );
}

export default function PollCard({ poll, index, onPress }: PollCardProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  const accentColors = [Colors.accent, Colors.blueTint, Colors.purpleTint, Colors.greenTint];
  const cardAccentColor = accentColors[index % accentColors.length];

  const isHot = index === 0;

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(100 + index * 80).springify()}>
      <AnimatedPressable
        style={[styles.card, animStyle]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {/* Top accent strip */}
        <View style={[styles.accentStrip, { backgroundColor: cardAccentColor }]} />

        <View style={styles.cardInner}>
          {/* Header row */}
          <View style={styles.headerRow}>
            <View style={styles.badges}>
              <View style={styles.scopeBadge}>
                <Text style={styles.scopeEmoji}>{SCOPE_EMOJI[poll.scope]}</Text>
                <Text style={styles.scopeLabel}>{poll.scope.toUpperCase()}</Text>
              </View>
              <View style={[styles.categoryBadge, { borderColor: cardAccentColor + '66' }]}>
                <Text style={[styles.categoryText, { color: cardAccentColor }]}>
                  {poll.category.toUpperCase()}
                </Text>
              </View>
              {isHot && (
                <View style={styles.hotBadge}>
                  <Text style={styles.hotText}>HOT</Text>
                </View>
              )}
            </View>
            <Text style={styles.voteCount}>
              {poll.voteCount.toLocaleString()}
            </Text>
          </View>

          {/* Question */}
          <Text style={styles.question} numberOfLines={3}>
            {poll.question}
          </Text>

          {/* Footer */}
          <View style={styles.footer}>
            <MiniDiamond />
            <View style={styles.ctaWrap}>
              <Text style={styles.ctaText}>VOTE NOW</Text>
              <View style={[styles.ctaArrow, { backgroundColor: cardAccentColor }]}>
                <Text style={styles.ctaArrowText}>→</Text>
              </View>
            </View>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: 'hidden',
  },
  accentStrip: {
    height: 3,
    width: '100%',
  },
  cardInner: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scopeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: Colors.accent + '18',
    borderWidth: 1,
    borderColor: Colors.accent + '40',
  },
  scopeEmoji: {
    fontSize: 10,
  },
  scopeLabel: {
    color: Colors.accent,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  hotBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: Colors.redTint + '20',
    borderWidth: 1,
    borderColor: Colors.redTint + '40',
  },
  hotText: {
    color: Colors.redTint,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  voteCount: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontVariant: ['tabular-nums'],
  },
  question: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ctaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ctaText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  ctaArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaArrowText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '900',
  },
});
