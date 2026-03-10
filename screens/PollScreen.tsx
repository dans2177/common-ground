import React, { useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import PollDiamond from '../components/PollDiamond';
import { usePoll, useVote } from '../hooks/usePolls';
import { Colors, Spacing, FontSize } from '../constants/theme';
import { positionToLabel, positionToTakeKey } from '../utils/diamondMath';
import { RootStackParamList, Position, PerspectiveCard } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Poll'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DIAMOND_SIZE = Math.min(SCREEN_WIDTH - 80, 300);

// ─── Perspective Card ────────────────────────────────────
function PerspectiveView({
  perspective,
  index,
  expanded,
  onToggle,
}: {
  perspective: PerspectiveCard;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.duration(350).delay(100 + index * 80).springify()}
    >
      <Animated.View style={animStyle}>
        <Pressable
          style={[pStyles.card, { borderLeftColor: perspective.color }]}
          onPress={onToggle}
          onPressIn={() => {
            scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
          }}
          onPressOut={() => {
            scale.value = withSpring(1, { damping: 12, stiffness: 200 });
          }}
        >
          <View style={pStyles.header}>
            <View style={[pStyles.iconBadge, { backgroundColor: perspective.color + '22', borderColor: perspective.color + '55' }]}>
              <Text style={[pStyles.iconLetter, { color: perspective.color }]}>{perspective.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[pStyles.headline, { color: perspective.color }]}>
                {perspective.headline}
              </Text>
              <Text style={pStyles.position}>
                {perspective.position.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            <Text style={pStyles.chevron}>{expanded ? '▾' : '▸'}</Text>
          </View>

          <Text style={pStyles.belief}>"{perspective.coreBelief}"</Text>

          {expanded && (
            <Animated.View entering={FadeIn.duration(300)}>
              <View style={pStyles.section}>
                <View style={pStyles.sectionHeader}>
                  <View style={[pStyles.sectionBadge, { backgroundColor: Colors.blueTint + '22' }]}>
                    <Text style={[pStyles.sectionBadgeText, { color: Colors.blueTint }]}>?</Text>
                  </View>
                  <Text style={pStyles.sectionTitle}>THEIR ARGUMENT</Text>
                </View>
                <Text style={pStyles.sectionText}>{perspective.argument}</Text>
              </View>

              <View style={[pStyles.section, pStyles.fearSection]}>
                <View style={pStyles.sectionHeader}>
                  <View style={[pStyles.sectionBadge, { backgroundColor: Colors.redTint + '22' }]}>
                    <Text style={[pStyles.sectionBadgeText, { color: Colors.redTint }]}>!</Text>
                  </View>
                  <Text style={pStyles.sectionTitle}>WHAT THEY FEAR</Text>
                </View>
                <Text style={pStyles.sectionText}>{perspective.fear}</Text>
              </View>
            </Animated.View>
          )}
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Common Ground Card ──────────────────────────────────
function CommonGroundCard({
  statement,
  percent,
  sharedValues,
}: {
  statement: string;
  percent: number;
  sharedValues: string[];
}) {
  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(300).springify()}
      style={cgStyles.card}
    >
      <View style={cgStyles.header}>
        <View style={cgStyles.iconBadge}>
          <Text style={cgStyles.iconLetter}>CG</Text>
        </View>
        <Text style={cgStyles.title}>THE COMMON GROUND</Text>
      </View>

      <View style={cgStyles.meterWrap}>
        <View style={cgStyles.meterBg}>
          <Animated.View
            entering={SlideInRight.duration(600).delay(500)}
            style={[cgStyles.meterFill, { width: `${percent}%` }]}
          />
        </View>
        <Text style={cgStyles.meterText}>{percent}% of people agree</Text>
      </View>

      <Text style={cgStyles.statement}>"{statement}"</Text>

      <View style={cgStyles.valuesWrap}>
        <Text style={cgStyles.valuesLabel}>SHARED VALUES</Text>
        {sharedValues.map((val, i) => (
          <Animated.View
            key={i}
            entering={FadeInDown.duration(250).delay(400 + i * 100)}
            style={cgStyles.valueRow}
          >
            <View style={cgStyles.valueDot} />
            <Text style={cgStyles.valueText}>{val}</Text>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );
}

// ─── Section Divider ─────────────────────────────────────
function SectionDivider({ label, delay }: { label: string; delay: number }) {
  return (
    <Animated.View entering={FadeIn.duration(300).delay(delay)} style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>{label}</Text>
      <View style={styles.dividerLine} />
    </Animated.View>
  );
}

// ─── Main Screen ─────────────────────────────────────────
export default function PollScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { poll, loading } = usePoll(route.params.pollId);
  const { vote, submitting } = useVote();
  const [posLabel, setPosLabel] = useState('Neutral');
  const [currentTake, setCurrentTake] = useState<Position>('neutral');
  const [hasVoted, setHasVoted] = useState(false);
  const [votePos, setVotePos] = useState({ x: 0, y: 0 });
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const buttonScale = useSharedValue(1);

  const handlePositionChange = useCallback((nx: number, ny: number) => {
    setPosLabel(positionToLabel(nx, ny));
    setCurrentTake(positionToTakeKey(nx, ny));
    setVotePos({ x: nx, y: ny });
  }, []);

  const handleVote = async () => {
    if (hasVoted || submitting) return;
    setHasVoted(true);

    buttonScale.value = withSequence(
      withSpring(0.9, { damping: 10 }),
      withSpring(1.08, { damping: 8 }),
      withSpring(1, { damping: 12 })
    );

    await vote(route.params.pollId, votePos.x, votePos.y);

    setTimeout(() => {
      navigation.navigate('Results', {
        pollId: route.params.pollId,
        voteX: votePos.x,
        voteY: votePos.y,
      });
    }, 600);
  };

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  if (!poll) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Poll not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 30 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── QUESTION ── */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.topSection}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{poll.category.toUpperCase()}</Text>
        </View>
        <Text style={styles.question}>{poll.question}</Text>
        <Text style={styles.voterCount}>
          {poll.voteCount.toLocaleString()} voices heard
        </Text>
      </Animated.View>

      {/* ── UNDERSTAND EACH SIDE ── */}
      <SectionDivider label="UNDERSTAND EACH SIDE" delay={50} />
      <Animated.Text entering={FadeIn.duration(300).delay(80)} style={styles.subtitle}>
        Tap each perspective to understand what drives their view.
      </Animated.Text>

      {poll.perspectives.map((persp, index) => (
        <PerspectiveView
          key={persp.position}
          perspective={persp}
          index={index}
          expanded={expandedCard === index}
          onToggle={() => setExpandedCard(expandedCard === index ? null : index)}
        />
      ))}

      {/* ── THE COMMON GROUND ── */}
      <SectionDivider label="WHERE WE MEET" delay={250} />
      <CommonGroundCard
        statement={poll.commonGround.statement}
        percent={poll.commonGround.percent}
        sharedValues={poll.commonGround.sharedValues}
      />

      {/* ── NOW PLACE YOUR VOICE ── */}
      <SectionDivider label="PLACE YOUR VOICE" delay={400} />
      <Animated.Text entering={FadeIn.duration(300).delay(450)} style={styles.subtitle}>
        Drag the marker to where you stand. No wrong answers.
      </Animated.Text>

      <Animated.View entering={FadeIn.duration(500).delay(500)} style={styles.diamondWrap}>
        <PollDiamond
          size={DIAMOND_SIZE}
          interactive={!hasVoted}
          onPositionChange={handlePositionChange}
          onDragStart={() => scrollRef.current?.setNativeProps({ scrollEnabled: false })}
          onDragEnd={() => scrollRef.current?.setNativeProps({ scrollEnabled: true })}
          showLabels={true}
          labels={{
            top: poll.perspectives.find(p => p.position === 'extreme_left')?.headline ?? 'Abolitionist',
            bottom: poll.perspectives.find(p => p.position === 'extreme_right')?.headline ?? 'Strategist',
            left: poll.perspectives.find(p => p.position === 'left')?.headline ?? 'Peacemaker',
            right: poll.perspectives.find(p => p.position === 'right')?.headline ?? 'Protector',
          }}
        />
      </Animated.View>

      <Animated.View entering={FadeIn.duration(300).delay(550)} style={styles.readoutWrap}>
        <Text style={styles.readoutLabel}>YOUR POSITION</Text>
        <Text style={styles.readoutValue}>{posLabel}</Text>
        <View style={styles.readoutDivider} />
      </Animated.View>

      <Animated.View entering={FadeIn.duration(300).delay(600)} style={styles.takeWrap}>
        <Text style={styles.takeHeader}>THIS TAKE</Text>
        <Text style={styles.takeText}>"{poll.takes[currentTake]}"</Text>
      </Animated.View>

      {/* Vote button */}
      <Animated.View style={[styles.buttonWrap, buttonAnimStyle]}>
        <TouchableOpacity
          style={[styles.voteButton, hasVoted && styles.voteButtonDone]}
          onPress={handleVote}
          activeOpacity={0.8}
          disabled={hasVoted}
        >
          <Text style={styles.voteButtonText}>
            {hasVoted ? '✓ VOICE RECORDED' : 'LOCK IN MY VOICE'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {hasVoted && (
        <Animated.Text entering={FadeIn.duration(400)} style={styles.afterVoteText}>
          Finding where you land among everyone else...
        </Animated.Text>
      )}
    </ScrollView>
  );
}

// ─── Perspective Styles ──────────────────────────────────
const pStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLetter: {
    fontSize: 16,
    fontWeight: '900',
  },
  headline: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  position: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 2,
  },
  chevron: { color: Colors.textMuted, fontSize: 16 },
  belief: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  section: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sectionBadge: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '900',
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  sectionText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  fearSection: {
    backgroundColor: Colors.surfaceLight,
    marginLeft: -18,
    marginRight: -18,
    marginBottom: -18,
    paddingHorizontal: 18,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
});

// ─── Common Ground Styles ────────────────────────────────
const cgStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.greenTint + '40',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.greenTint + '22',
    borderWidth: 1,
    borderColor: Colors.greenTint + '55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLetter: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.greenTint,
    letterSpacing: 0.5,
  },
  title: {
    color: Colors.greenTint,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 3,
  },
  meterWrap: { marginBottom: 16 },
  meterBg: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  meterFill: {
    height: '100%',
    backgroundColor: Colors.greenTint,
    borderRadius: 4,
  },
  meterText: {
    color: Colors.greenTint,
    fontSize: 12,
    fontWeight: '700',
  },
  statement: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 18,
  },
  valuesWrap: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
  },
  valuesLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 10,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  valueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.greenTint,
  },
  valueText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
});

// ─── Main Styles ─────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  errorText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.accentGlow,
    borderWidth: 1,
    borderColor: Colors.accentDim,
    marginBottom: 14,
  },
  categoryText: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  question: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  voterCount: {
    color: Colors.textMuted,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.surfaceBorder,
  },
  dividerText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  diamondWrap: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  readoutWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  readoutLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  readoutValue: {
    color: Colors.accent,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  readoutDivider: {
    width: 40,
    height: 2,
    backgroundColor: Colors.accentDim,
    borderRadius: 1,
    marginTop: 8,
  },
  takeWrap: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 18,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 24,
  },
  takeHeader: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  takeText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  buttonWrap: {
    width: '100%',
    marginBottom: 12,
  },
  voteButton: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  voteButtonDone: {
    backgroundColor: Colors.greenTint,
  },
  voteButtonText: {
    color: Colors.background,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 3,
  },
  afterVoteText: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
  },
});
