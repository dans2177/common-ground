import React from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import Svg, { Polygon, Line, Circle } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import CountdownTimer from '../components/CountdownTimer';
import PollCard from '../components/PollCard';
import { usePolls } from '../hooks/usePolls';
import { Colors, Spacing, FontSize } from '../constants/theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

// Static diamond logo — no spinning, clean and fast
function LogoDiamond() {
  const s = 52;
  const half = s / 2;
  const r = half * 0.85;
  const points = [
    `${half},${half - r}`,
    `${half + r},${half}`,
    `${half},${half + r}`,
    `${half - r},${half}`,
  ].join(' ');
  const innerR = r * 0.45;
  const innerPoints = [
    `${half},${half - innerR}`,
    `${half + innerR},${half}`,
    `${half},${half + innerR}`,
    `${half - innerR},${half}`,
  ].join(' ');

  return (
    <View style={logoStyles.wrap}>
      <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <Polygon points={points} fill="none" stroke={Colors.accent} strokeWidth={2} />
        <Polygon points={innerPoints} fill="none" stroke={Colors.accent + '50'} strokeWidth={1} />
        <Line x1={half - r} y1={half} x2={half + r} y2={half} stroke={Colors.accent + '30'} strokeWidth={0.5} />
        <Line x1={half} y1={half - r} x2={half} y2={half + r} stroke={Colors.accent + '30'} strokeWidth={0.5} />
        <Circle cx={half} cy={half} r={3} fill={Colors.accent} />
      </Svg>
    </View>
  );
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <View style={statStyles.pill}>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={sectionStyles.row}>
      <View style={sectionStyles.line} />
      <Text style={sectionStyles.text}>{title}</Text>
      <View style={sectionStyles.line} />
    </View>
  );
}

// Show admin button in dev/local mode
const IS_DEV = __DEV__ || Platform.OS === 'web';

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { polls, loading } = usePolls();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* ── ADMIN BUTTON (dev only) ── */}
      {IS_DEV && (
        <TouchableOpacity
          style={[styles.adminButton, { top: insets.top + 8 }]}
          onPress={() => navigation.navigate('Admin')}
          activeOpacity={0.7}
        >
          <View style={styles.adminDot} />
          <Text style={styles.adminText}>ADMIN</Text>
        </TouchableOpacity>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ── */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <LogoDiamond />
          <View style={styles.titleRow}>
            <Text style={styles.brandName}>COMMON</Text>
            <Text style={styles.brandNameAccent}>GROUND</Text>
          </View>
          <Text style={styles.tagline}>Where every voice lands.</Text>
        </Animated.View>

        {/* ── DATE + COUNTDOWN ── */}
        <View style={styles.countdownWrap}>
          <View style={styles.dateBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              }).toUpperCase()}
            </Text>
          </View>
          <CountdownTimer />
        </View>

        {/* ── STATS ROW ── */}
        <View style={styles.statsRow}>
          <StatPill value={loading ? '—' : `${(polls.reduce((s, p) => s + p.voteCount, 0) / 1000).toFixed(1)}K`} label="VOTES TODAY" />
          <StatPill value={loading ? '—' : String(polls.length)} label="POLLS LIVE" />
          <StatPill value="#2" label="TRENDING" />
        </View>

        {/* ── POLLS SECTION ── */}
        <SectionHeader title="TODAY'S POLLS" />

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Colors.accent} size="small" />
            <Text style={styles.loadingText}>Loading polls...</Text>
          </View>
        ) : polls.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No polls yet</Text>
            <Text style={styles.emptySubtitle}>Check back soon — new polls drop at midnight EST.</Text>
          </View>
        ) : (
          polls.map((poll, index) => (
            <PollCard
              key={poll.id}
              poll={poll}
              index={index}
              onPress={() => navigation.navigate('Poll', { pollId: poll.id })}
            />
          ))
        )}

        {/* ── FOOTER ── */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Text style={styles.footerText}>
            New polls drop daily at midnight EST
          </Text>
          <Text style={styles.footerVersion}>v0.1.0 · Phoenix, AZ</Text>
        </View>

        <View style={{ height: insets.bottom + 30 }} />
      </ScrollView>
    </View>
  );
}

const logoStyles = StyleSheet.create({
  wrap: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
});

const statStyles = StyleSheet.create({
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  value: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  label: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 2,
  },
});

const sectionStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
    gap: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.surfaceBorder,
  },
  text: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titleRow: {
    alignItems: 'center',
  },
  brandName: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 8,
  },
  brandNameAccent: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.accent,
    letterSpacing: 8,
    marginTop: -6,
  },
  tagline: {
    color: Colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 8,
    letterSpacing: 1,
  },
  countdownWrap: {
    marginBottom: 16,
    gap: 12,
    alignItems: 'center',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.greenTint,
  },
  dateText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 20,
  },
  footerDivider: {
    width: 40,
    height: 2,
    backgroundColor: Colors.surfaceBorder,
    borderRadius: 1,
    marginBottom: 12,
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  footerVersion: {
    color: Colors.textDark,
    fontSize: 10,
    marginTop: 4,
    letterSpacing: 1,
  },
  adminButton: {
    position: 'absolute',
    left: 16,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent + '18',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.accent + '40',
    gap: 5,
  },
  adminDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  adminText: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
