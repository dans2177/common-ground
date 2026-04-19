import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Share,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import PollDiamond from '../components/PollDiamond';
import { usePoll, useResults } from '../hooks/usePolls';
import { Colors, Spacing, FontSize } from '../constants/theme';
import { positionToLabel } from '../utils/diamondMath';
import { RootStackParamList, ResultDot } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DIAMOND_SIZE = Math.min(SCREEN_WIDTH - 80, 320);

export default function ResultsScreen({ navigation, route }: Props) {
  const { pollId, voteX, voteY, selectedVibeId } = route.params;
  const { poll, loading: pollLoading } = usePoll(pollId);
  const { dots: baseDots, loading: dotsLoading } = useResults(pollId);

  const loading = pollLoading || dotsLoading;

  // Merge user's actual vote position into the "Your Vote" dot
  const resultDots: ResultDot[] = baseDots.map((dot) =>
    dot.label === 'Your Vote' ? { ...dot, x: voteX, y: voteY } : dot
  );

  const handleShare = async () => {
    if (!poll) return;
    try {
      await Share.share({
        message: `I voted on "${poll.question}" on Common Ground! My position: ${positionToLabel(voteX, voteY)}. See where you land.`,
      });
    } catch {
      // User cancelled
    }
  };

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
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.headerBadge}>
        <Text style={styles.headerBadgeText}>RESULTS</Text>
      </Animated.View>

      <Animated.Text
        entering={FadeIn.duration(400).delay(100)}
        style={styles.question}
      >
        {poll.question}
      </Animated.Text>

      {/* Diamond with results */}
      <Animated.View
        entering={FadeIn.duration(400).delay(100)}
        style={styles.diamondWrap}
      >
        <PollDiamond
          size={DIAMOND_SIZE}
          interactive={false}
          resultDots={resultDots}
          showLabels={true}
        />
      </Animated.View>

      {/* Your Position */}
      <Animated.View
        entering={FadeInUp.duration(300).delay(200)}
        style={styles.yourPosition}
      >
        <Text style={styles.yourPositionLabel}>YOUR POSITION</Text>
        <Text style={styles.yourPositionValue}>
          {positionToLabel(voteX, voteY)}
        </Text>
      </Animated.View>

      {/* Selected Vibe */}
      {selectedVibeId && poll.customResponses && (() => {
        const vibe = poll.customResponses.find(r => r.id === selectedVibeId);
        if (!vibe) return null;
        return (
          <Animated.View
            entering={FadeInUp.duration(300).delay(250)}
            style={styles.vibeResult}
          >
            <Text style={styles.vibeResultEmoji}>{vibe.emoji}</Text>
            <Text style={styles.vibeResultText}>{vibe.text}</Text>
            <Text style={styles.vibeResultStat}>
              You and ~{Math.floor(Math.random() * 25 + 15)}% chose this vibe
            </Text>
          </Animated.View>
        );
      })()}

      {/* Legend */}
      <Animated.View
        entering={FadeInUp.duration(400).delay(300)}
        style={styles.legendWrap}
      >
        <Text style={styles.legendTitle}>BREAKDOWN</Text>
        {resultDots.map((dot, i) => (
          <View key={dot.label} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: dot.color }]} />
            <Text style={styles.legendLabel}>{dot.label}</Text>
            <Text style={styles.legendPos}>
              {positionToLabel(dot.x, dot.y)}
            </Text>
          </View>
        ))}
      </Animated.View>

      {/* Insight card */}
      <Animated.View
        entering={FadeInUp.duration(400).delay(400)}
        style={styles.insightCard}
      >
        <View style={styles.insightBadge}>
          <Text style={styles.insightBadgeText}>i</Text>
        </View>
        <Text style={styles.insightTitle}>INSIGHT</Text>
        <Text style={styles.insightText}>
          Your view aligns closest with the{' '}
          <Text style={{ color: Colors.greenTint, fontWeight: '700' }}>
            Friends Average
          </Text>
          . Phoenix leans slightly different — see how your city compares!
        </Text>
      </Animated.View>

      {/* Stats row */}
      <Animated.View
        entering={FadeInUp.duration(300).delay(450)}
        style={styles.statsRow}
      >
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {poll.voteCount.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Total Votes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>42%</Text>
          <Text style={styles.statLabel}>Agree w/ You</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>#3</Text>
          <Text style={styles.statLabel}>Trending</Text>
        </View>
      </Animated.View>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          activeOpacity={0.8}
        >
          <Text style={styles.shareButtonText}>SHARE RESULT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.popToTop()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>BACK TO FEED</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    alignItems: 'center',
  },
  errorText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
  headerBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 10,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.accent,
    marginBottom: Spacing.md,
  },
  headerBadgeText: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    fontWeight: '900',
    letterSpacing: 3,
  },
  question: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  diamondWrap: {
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  yourPosition: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  yourPositionLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  yourPositionValue: {
    color: Colors.accent,
    fontSize: FontSize.xl,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  vibeResult: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.accent + '44',
    marginBottom: Spacing.lg,
  },
  vibeResultEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  vibeResultText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  vibeResultStat: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  legendWrap: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.lg,
  },
  legendTitle: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: Spacing.md,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  legendLabel: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    flex: 1,
  },
  legendPos: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
  },
  insightCard: {
    width: '100%',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 14,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.accentDim,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  insightBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent + '22',
    borderWidth: 1,
    borderColor: Colors.accent + '44',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  insightBadgeText: {
    color: Colors.accent,
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  insightTitle: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  insightText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 20,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.xl,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '900',
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.surfaceBorder,
  },
  backButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
  },
  backButtonText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '800',
    letterSpacing: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: Spacing.lg,
  },
  shareButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: 'center',
  },
  shareButtonText: {
    color: Colors.background,
    fontSize: FontSize.sm,
    fontWeight: '800',
    letterSpacing: 2,
  },
  bottomSpacer: {
    height: 40,
  },
});
