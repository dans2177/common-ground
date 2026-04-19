import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Spacing, FontSize } from '../constants/theme';
import { RootStackParamList, OnboardingQuestion, OnboardingOption, OnboardingProfile } from '../types';
import ONBOARDING_QUESTIONS, { computeProfile } from '../data/onboardingQuestions';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const CATEGORY_META: Record<string, { emoji: string; label: string; color: string }> = {
  identity: { emoji: '👤', label: 'WHO YOU ARE', color: Colors.blueTint },
  values: { emoji: '💎', label: 'WHAT YOU VALUE', color: Colors.purpleTint },
  priorities: { emoji: '🎯', label: 'WHAT MATTERS', color: Colors.accent },
  style: { emoji: '🎭', label: 'HOW YOU SHOW UP', color: Colors.greenTint },
};

// ─── Animated option tile ──────────────────────────────
function OptionTile({
  option,
  selected,
  onPress,
  index,
  accentColor,
}: {
  option: OnboardingOption;
  selected: boolean;
  onPress: () => void;
  index: number;
  accentColor: string;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.duration(300).delay(60 + index * 50).springify().damping(14)}
    >
      <Animated.View style={animStyle}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPress}
          onPressIn={() => {
            scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
          }}
          onPressOut={() => {
            scale.value = withSpring(1, { damping: 12, stiffness: 200 });
          }}
          style={[
            styles.optionTile,
            selected && { borderColor: accentColor, backgroundColor: accentColor + '14' },
          ]}
        >
          <Text style={styles.optionEmoji}>{option.emoji}</Text>
          <Text
            style={[
              styles.optionLabel,
              selected && { color: Colors.textPrimary },
            ]}
          >
            {option.label}
          </Text>
          {selected && (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={[styles.checkDot, { backgroundColor: accentColor }]}
            >
              <Text style={styles.checkMark}>✓</Text>
            </Animated.View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Progress dots ─────────────────────────────────────
function ProgressBar({
  current,
  total,
  categoryColor,
}: {
  current: number;
  total: number;
  categoryColor: string;
}) {
  const pct = ((current + 1) / total) * 100;

  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: `${pct}%`,
              backgroundColor: categoryColor,
            },
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        {current + 1} of {total}
      </Text>
    </View>
  );
}

// ─── Results summary card ──────────────────────────────
function ProfileSummary({ profile }: { profile: OnboardingProfile['dimensions'] }) {
  const bars: { key: string; label: string; value: number; range: [number, number]; color: string; leftLabel: string; rightLabel: string }[] = [
    { key: 'authority', label: 'Authority', value: profile.authority, range: [-1, 1], color: Colors.redTint, leftLabel: 'Liberty', rightLabel: 'Order' },
    { key: 'economics', label: 'Economics', value: profile.economics, range: [-1, 1], color: Colors.blueTint, leftLabel: 'Collective', rightLabel: 'Individual' },
    { key: 'change', label: 'Change', value: profile.change, range: [-1, 1], color: Colors.purpleTint, leftLabel: 'Traditional', rightLabel: 'Progressive' },
    { key: 'engagement', label: 'Engagement', value: profile.engagement, range: [-1, 1], color: Colors.accent, leftLabel: 'Observer', rightLabel: 'Activist' },
    { key: 'empathy', label: 'Care', value: profile.empathy, range: [0, 1], color: Colors.greenTint, leftLabel: 'Low', rightLabel: 'High' },
    { key: 'fairness', label: 'Fairness', value: profile.fairness, range: [0, 1], color: Colors.yellowTint, leftLabel: 'Low', rightLabel: 'High' },
  ];

  return (
    <View style={styles.summaryWrap}>
      <Animated.View entering={FadeInDown.duration(400).springify()}>
        <Text style={styles.summaryEmoji}>🧠</Text>
        <Text style={styles.summaryTitle}>Your Political DNA</Text>
        <Text style={styles.summarySubtext}>
          This isn't a label. It's a starting point.
        </Text>
      </Animated.View>

      {bars.map((bar, i) => {
        const [min, max] = bar.range;
        const normalizedPct = ((bar.value - min) / (max - min)) * 100;

        return (
          <Animated.View
            key={bar.key}
            entering={FadeInDown.duration(350).delay(200 + i * 80).springify()}
            style={styles.barRow}
          >
            <View style={styles.barLabels}>
              <Text style={styles.barLeftLabel}>{bar.leftLabel}</Text>
              <Text style={styles.barLabel}>{bar.label}</Text>
              <Text style={styles.barRightLabel}>{bar.rightLabel}</Text>
            </View>
            <View style={styles.barTrack}>
              {/* Center line for bipolar scales */}
              {min < 0 && <View style={styles.barCenter} />}
              <View
                style={[
                  styles.barMarker,
                  {
                    left: `${normalizedPct}%`,
                    backgroundColor: bar.color,
                  },
                ]}
              />
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════
export default function OnboardingScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const previewMode = route.params?.previewMode ?? false;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [finished, setFinished] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const scrollRef = useRef<ScrollView>(null);

  const questions = ONBOARDING_QUESTIONS;
  const question = questions[step];
  const catMeta = CATEGORY_META[question?.category ?? 'identity'];
  const isLast = step === questions.length - 1;

  const currentAnswer = question ? answers[question.id] : undefined;
  const hasAnswer = currentAnswer !== undefined &&
    (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : currentAnswer !== '');

  // ── Handlers ──────────────────────────────────────────
  const handleSelect = useCallback(
    (optionId: string) => {
      if (!question) return;

      if (question.type === 'pick-many') {
        setAnswers((prev) => {
          const current = (prev[question.id] as string[]) || [];
          const next = current.includes(optionId)
            ? current.filter((id) => id !== optionId)
            : [...current, optionId];
          return { ...prev, [question.id]: next };
        });
      } else {
        setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
      }
    },
    [question],
  );

  const handleNext = useCallback(() => {
    if (!hasAnswer) return;

    if (isLast) {
      setFinished(true);
      return;
    }

    setDirection('forward');
    setStep((s) => s + 1);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [hasAnswer, isLast]);

  const handleBack = useCallback(() => {
    if (step === 0) return;
    setDirection('back');
    setStep((s) => s - 1);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [step]);

  const handleFinish = useCallback(() => {
    if (previewMode) {
      navigation.goBack();
      return;
    }
    // In real app: save profile to storage / backend
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }, [previewMode, navigation]);

  const isSelected = useCallback(
    (optionId: string) => {
      if (!question) return false;
      if (question.type === 'pick-many') {
        return ((answers[question.id] as string[]) || []).includes(optionId);
      }
      return answers[question.id] === optionId;
    },
    [question, answers],
  );

  // ── Finished state — show profile ─────────────────────
  if (finished) {
    const profile = computeProfile(answers);

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView
          contentContainerStyle={styles.finishScroll}
          showsVerticalScrollIndicator={false}
        >
          {previewMode && (
            <Animated.View entering={FadeIn.duration(300)} style={styles.previewBanner}>
              <Text style={styles.previewBannerText}>👁 ADMIN PREVIEW</Text>
            </Animated.View>
          )}

          <ProfileSummary profile={profile} />

          <Animated.View entering={FadeInUp.duration(400).delay(600)}>
            <TouchableOpacity
              style={styles.finishButton}
              onPress={handleFinish}
              activeOpacity={0.8}
            >
              <Text style={styles.finishButtonText}>
                {previewMode ? 'BACK TO ADMIN' : 'LET\'S GO →'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.finishSubtext}>
              Your answers shape what you see. You can retake this anytime.
            </Text>
          </Animated.View>

          <View style={{ height: insets.bottom + 40 }} />
        </ScrollView>
      </View>
    );
  }

  // ── Question UI ───────────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        {step > 0 ? (
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}

        <ProgressBar current={step} total={questions.length} categoryColor={catMeta.color} />

        {previewMode && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.skipBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.skipBtnText}>EXIT</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Category badge */}
        <Animated.View
          key={`cat-${step}`}
          entering={FadeIn.duration(250)}
          style={[styles.catBadge, { borderColor: catMeta.color + '55' }]}
        >
          <Text style={styles.catEmoji}>{catMeta.emoji}</Text>
          <Text style={[styles.catLabel, { color: catMeta.color }]}>{catMeta.label}</Text>
        </Animated.View>

        {/* Question text */}
        <Animated.View key={`q-${step}`} entering={FadeInDown.duration(350).springify()}>
          <Text style={styles.questionText}>{question.text}</Text>
          {question.subtext && (
            <Text style={styles.subtextText}>{question.subtext}</Text>
          )}
        </Animated.View>

        {/* Pick-many hint */}
        {question.type === 'pick-many' && (
          <Animated.View entering={FadeIn.duration(300).delay(100)} style={styles.hintRow}>
            <Text style={styles.hintText}>tap all that apply</Text>
            {Array.isArray(currentAnswer) && currentAnswer.length > 0 && (
              <View style={[styles.hintCount, { backgroundColor: catMeta.color }]}>
                <Text style={styles.hintCountText}>{(currentAnswer as string[]).length}</Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* Options */}
        <View style={styles.optionsWrap}>
          {question.options.map((opt, i) => (
            <OptionTile
              key={`${step}-${opt.id}`}
              option={opt}
              selected={isSelected(opt.id)}
              onPress={() => handleSelect(opt.id)}
              index={i}
              accentColor={catMeta.color}
            />
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom action */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            { backgroundColor: hasAnswer ? catMeta.color : Colors.surfaceLight },
          ]}
          onPress={handleNext}
          activeOpacity={hasAnswer ? 0.8 : 1}
          disabled={!hasAnswer}
        >
          <Text
            style={[
              styles.nextButtonText,
              { color: hasAnswer ? Colors.background : Colors.textDark },
            ]}
          >
            {isLast ? 'SEE MY RESULTS' : 'NEXT →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: Colors.textSecondary,
    fontSize: 18,
    fontWeight: '600',
    marginTop: -1,
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.redTint + '22',
    borderWidth: 1,
    borderColor: Colors.redTint + '44',
  },
  skipBtnText: {
    color: Colors.redTint,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  // Progress
  progressWrap: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.surfaceLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    color: Colors.textDark,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  // Category badge
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 20,
  },
  catEmoji: {
    fontSize: 12,
  },
  catLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },

  // Question
  questionText: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtextText: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
    fontStyle: 'italic',
  },

  // Hint
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  hintText: {
    color: Colors.textDark,
    fontSize: 12,
    fontStyle: 'italic',
  },
  hintCount: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintCountText: {
    color: Colors.background,
    fontSize: 11,
    fontWeight: '800',
  },

  // Options
  optionsWrap: {
    marginTop: 20,
    gap: 10,
  },
  optionTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  optionEmoji: {
    fontSize: 22,
    width: 32,
    textAlign: 'center',
  },
  optionLabel: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
  checkDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: Colors.background,
    fontSize: 13,
    fontWeight: '800',
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
  },
  nextButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },

  // Finish screen
  finishScroll: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  previewBanner: {
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Colors.accent + '22',
    borderWidth: 1,
    borderColor: Colors.accent + '44',
    marginBottom: 16,
  },
  previewBannerText: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  finishButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  finishButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  finishSubtext: {
    color: Colors.textDark,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },

  // Profile summary
  summaryWrap: {
    paddingTop: 20,
  },
  summaryEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  summarySubtext: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 28,
    fontStyle: 'italic',
  },

  // Bar rows
  barRow: {
    marginBottom: 20,
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  barLeftLabel: {
    color: Colors.textDark,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    width: 80,
  },
  barLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
  },
  barRightLabel: {
    color: Colors.textDark,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    width: 80,
    textAlign: 'right',
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceLight,
    position: 'relative',
  },
  barCenter: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1.5,
    backgroundColor: Colors.surfaceBorder,
    marginLeft: -0.75,
  },
  barMarker: {
    position: 'absolute',
    top: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: -6,
    borderWidth: 2,
    borderColor: Colors.background,
  },
});
