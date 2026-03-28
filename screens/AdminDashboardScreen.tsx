import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Spacing, FontSize } from '../constants/theme';
import { RootStackParamList } from '../types';
import {
  ADMIN_STATS,
  CITY_QUESTION_SETS,
  FAKE_POLLING_RESULTS,
  CityQuestionSet,
} from '../data/adminMockData';

type Props = NativeStackScreenProps<RootStackParamList, 'Admin'>;

const screenWidth = Dimensions.get('window').width;

// ─── Tiny bar chart component ─────────────────────────────────────
function MiniBar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <View style={barStyles.row}>
      <Text style={barStyles.label}>{label}</Text>
      <View style={barStyles.track}>
        <View style={[barStyles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={barStyles.count}>{value}</Text>
    </View>
  );
}

// ─── Status badge ──────────────────────────────────────────────────
function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <View style={[badgeStyles.wrap, { backgroundColor: ok ? Colors.greenTint + '20' : Colors.redTint + '20' }]}>
      <View style={[badgeStyles.dot, { backgroundColor: ok ? Colors.greenTint : Colors.redTint }]} />
      <Text style={[badgeStyles.text, { color: ok ? Colors.greenTint : Colors.redTint }]}>
        {ok ? 'READY' : 'NEEDS REVIEW'}
      </Text>
    </View>
  );
}

// ─── Sentiment badge ───────────────────────────────────────────────
function SentimentBadge({ level }: { level: 'mild' | 'moderate' | 'spicy' }) {
  const config = {
    mild: { emoji: '🟢', color: Colors.greenTint, label: 'MILD' },
    moderate: { emoji: '🟡', color: Colors.yellowTint, label: 'MODERATE' },
    spicy: { emoji: '🔴', color: Colors.redTint, label: 'SPICY' },
  };
  const c = config[level];
  return (
    <View style={[sentimentStyles.wrap, { borderColor: c.color + '40' }]}>
      <Text style={sentimentStyles.emoji}>{c.emoji}</Text>
      <Text style={[sentimentStyles.label, { color: c.color }]}>{c.label}</Text>
    </View>
  );
}

// ─── City card (expandable) ────────────────────────────────────────
function CityCard({ city }: { city: CityQuestionSet }) {
  const [expanded, setExpanded] = useState(false);
  const maxCat = Math.max(...city.categories.map((c) => c.count));

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => setExpanded(!expanded)}
      style={cityStyles.card}
    >
      <View style={cityStyles.header}>
        <View style={{ flex: 1 }}>
          <Text style={cityStyles.name}>{city.city}, {city.state}</Text>
          <Text style={cityStyles.count}>{city.questionsReady} questions ready</Text>
        </View>
        <SentimentBadge level={city.avgSentiment} />
        <Text style={cityStyles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </View>

      {/* Relevance bar */}
      <View style={cityStyles.relevanceRow}>
        <Text style={cityStyles.relevanceLabel}>Local Relevance</Text>
        <View style={cityStyles.relevanceTrack}>
          <View
            style={[
              cityStyles.relevanceFill,
              { width: `${city.localRelevance}%` },
            ]}
          />
        </View>
        <Text style={cityStyles.relevancePct}>{city.localRelevance}%</Text>
      </View>

      {expanded && (
        <Animated.View entering={FadeIn.duration(200)}>
          {/* Category breakdown */}
          <View style={cityStyles.catSection}>
            <Text style={cityStyles.subhead}>CATEGORY MIX</Text>
            {city.categories.map((cat) => (
              <MiniBar key={cat.name} value={cat.count} max={maxCat} color={cat.color} label={cat.name} />
            ))}
          </View>

          {/* Sample questions */}
          <View style={cityStyles.sampleSection}>
            <Text style={cityStyles.subhead}>SAMPLE QUESTIONS</Text>
            {city.sampleQuestions.map((q, i) => (
              <View key={i} style={cityStyles.sampleRow}>
                <Text style={cityStyles.sampleBullet}>◆</Text>
                <Text style={cityStyles.sampleText}>{q}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
}

// ─── Trend sparkline (simple text chart) ───────────────────────────
function TrendChart() {
  const data = ADMIN_STATS.dailyTrend;
  const maxQ = Math.max(...data.map((d) => d.questions));
  return (
    <View style={trendStyles.wrap}>
      <Text style={trendStyles.title}>7-DAY GENERATION TREND</Text>
      {data.map((d) => (
        <View key={d.day} style={trendStyles.row}>
          <Text style={trendStyles.day}>{d.day}</Text>
          <View style={trendStyles.barWrap}>
            <View
              style={[
                trendStyles.barAll,
                { width: `${(d.questions / maxQ) * 100}%` },
              ]}
            />
            <View
              style={[
                trendStyles.barApproved,
                { width: `${(d.approved / maxQ) * 100}%` },
              ]}
            />
          </View>
          <Text style={trendStyles.nums}>
            {d.approved}/{d.questions}
          </Text>
        </View>
      ))}
      <View style={trendStyles.legend}>
        <View style={trendStyles.legendItem}>
          <View style={[trendStyles.legendDot, { backgroundColor: Colors.accent + '40' }]} />
          <Text style={trendStyles.legendText}>Generated</Text>
        </View>
        <View style={trendStyles.legendItem}>
          <View style={[trendStyles.legendDot, { backgroundColor: Colors.accent }]} />
          <Text style={trendStyles.legendText}>Approved</Text>
        </View>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════
export default function AdminDashboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const stats = ADMIN_STATS;
  const polling = FAKE_POLLING_RESULTS;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HERO STAT ── */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.heroCard}>
          <StatusBadge ok={stats.flaggedCount < 50} />
          <Text style={styles.heroNumber}>{stats.totalQuestionsReady}</Text>
          <Text style={styles.heroLabel}>QUESTIONS READY FOR TOMORROW</Text>
          <View style={styles.heroMeta}>
            <Text style={styles.heroMetaText}>
              AI generated at {new Date(stats.aiGeneratedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.heroMetaDot}>·</Text>
            <Text style={styles.heroMetaText}>{stats.aiModel}</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{stats.approvalRate}%</Text>
              <Text style={styles.heroStatLabel}>APPROVED</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatValue, { color: stats.flaggedCount > 40 ? Colors.redTint : Colors.greenTint }]}>
                {stats.flaggedCount}
              </Text>
              <Text style={styles.heroStatLabel}>FLAGGED</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{stats.avgReadability}</Text>
              <Text style={styles.heroStatLabel}>READABILITY</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{stats.citiesCovered}</Text>
              <Text style={styles.heroStatLabel}>CITIES</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── GLOBAL CATEGORY BREAKDOWN ── */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>GLOBAL CATEGORY MIX</Text>
          {stats.categoryBreakdown.map((cat) => (
            <MiniBar
              key={cat.name}
              value={cat.count}
              max={Math.max(...stats.categoryBreakdown.map((c) => c.count))}
              color={cat.color}
              label={cat.name}
            />
          ))}
        </Animated.View>

        {/* ── 7 DAY TREND ── */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <TrendChart />
        </Animated.View>

        {/* ── LIVE POLLING SNAPSHOT ── */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>TODAY'S POLLING SNAPSHOT</Text>
          <View style={styles.pollingGrid}>
            <View style={styles.pollingCell}>
              <Text style={styles.pollingValue}>{(polling.totalVotesToday / 1000).toFixed(1)}K</Text>
              <Text style={styles.pollingLabel}>TOTAL VOTES</Text>
            </View>
            <View style={styles.pollingCell}>
              <Text style={styles.pollingValue}>{polling.peakHour}</Text>
              <Text style={styles.pollingLabel}>PEAK HOUR</Text>
            </View>
            <View style={styles.pollingCell}>
              <Text style={styles.pollingValue}>{polling.avgTimeToVote}</Text>
              <Text style={styles.pollingLabel}>AVG VOTE TIME</Text>
            </View>
            <View style={styles.pollingCell}>
              <Text style={styles.pollingValue}>{polling.completionRate}%</Text>
              <Text style={styles.pollingLabel}>COMPLETION</Text>
            </View>
          </View>

          {/* Sentiment distribution */}
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>SENTIMENT DISTRIBUTION</Text>
          <View style={styles.sentimentBar}>
            {Object.entries(polling.sentimentDistribution).map(([key, val]) => {
              const colors: Record<string, string> = {
                left: Colors.blueTint,
                centerLeft: '#6BAADD',
                center: Colors.textSecondary,
                centerRight: '#DD7A6B',
                right: Colors.redTint,
              };
              return (
                <View
                  key={key}
                  style={[
                    styles.sentimentSlice,
                    {
                      flex: val,
                      backgroundColor: colors[key] || Colors.textMuted,
                    },
                  ]}
                />
              );
            })}
          </View>
          <View style={styles.sentimentLegend}>
            <Text style={[styles.sentimentLegendItem, { color: Colors.blueTint }]}>L {polling.sentimentDistribution.left}%</Text>
            <Text style={[styles.sentimentLegendItem, { color: '#6BAADD' }]}>CL {polling.sentimentDistribution.centerLeft}%</Text>
            <Text style={[styles.sentimentLegendItem, { color: Colors.textSecondary }]}>C {polling.sentimentDistribution.center}%</Text>
            <Text style={[styles.sentimentLegendItem, { color: '#DD7A6B' }]}>CR {polling.sentimentDistribution.centerRight}%</Text>
            <Text style={[styles.sentimentLegendItem, { color: Colors.redTint }]}>R {polling.sentimentDistribution.right}%</Text>
          </View>

          <View style={styles.engagementRow}>
            <Text style={styles.engagementLabel}>🔥 Most engaged:</Text>
            <Text style={styles.engagementValue}>{polling.mostEngaged}</Text>
          </View>
          <View style={styles.engagementRow}>
            <Text style={styles.engagementLabel}>💤 Least engaged:</Text>
            <Text style={styles.engagementValue}>{polling.leastEngaged}</Text>
          </View>
        </Animated.View>

        {/* ── SEGMENTED BY CITY ── */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>QUESTIONS BY CITY</Text>
          <Text style={styles.sectionSubtitle}>
            Tap a city to see category breakdown & sample questions
          </Text>
          {CITY_QUESTION_SETS.map((city) => (
            <CityCard key={city.city} city={city} />
          ))}
        </Animated.View>

        {/* ── SUMMARY ── */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>AI GENERATION SUMMARY</Text>
          <Text style={styles.summaryText}>
            {stats.totalQuestionsReady} questions generated across {stats.citiesCovered} cities.{' '}
            {stats.approvalRate}% passed the content filter ({stats.flaggedCount} flagged for review).{' '}
            Average readability score: {stats.avgReadability}/10.{'\n\n'}
            Category balance looks healthy — Local ({stats.categoryBreakdown.find((c) => c.name === 'Local')?.count}) and Politics ({stats.categoryBreakdown.find((c) => c.name === 'Politics')?.count}) lead, 
            with Fun/Lifestyle ({stats.categoryBreakdown.find((c) => c.name === 'Fun / Lifestyle')?.count}) adding levity.{'\n\n'}
            Sentiment across cities ranges from mild (Sioux Falls) to spicy (Austin, Portland).{' '}
            All sets have 85%+ local relevance scores. No crazy stuff detected — questions are opinionated but fair.
          </Text>
          <StatusBadge ok={true} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════

const barStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  label: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600', width: 90 },
  track: { flex: 1, height: 8, backgroundColor: Colors.surfaceBorder, borderRadius: 4, marginHorizontal: 8 },
  fill: { height: 8, borderRadius: 4 },
  count: { color: Colors.textMuted, fontSize: 11, fontWeight: '700', width: 28, textAlign: 'right', fontVariant: ['tabular-nums'] },
});

const badgeStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
});

const sentimentStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, gap: 4 },
  emoji: { fontSize: 10 },
  label: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
});

const cityStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: 16,
    marginBottom: 12,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { color: Colors.textPrimary, fontSize: 16, fontWeight: '800' },
  count: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  chevron: { color: Colors.textMuted, fontSize: 12 },
  relevanceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 },
  relevanceLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  relevanceTrack: { flex: 1, height: 4, backgroundColor: Colors.surfaceBorder, borderRadius: 2 },
  relevanceFill: { height: 4, borderRadius: 2, backgroundColor: Colors.accent },
  relevancePct: { color: Colors.accent, fontSize: 11, fontWeight: '800', fontVariant: ['tabular-nums'] },
  catSection: { marginTop: 16 },
  subhead: { color: Colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 8 },
  sampleSection: { marginTop: 16 },
  sampleRow: { flexDirection: 'row', marginBottom: 6, gap: 6, paddingRight: 8 },
  sampleBullet: { color: Colors.accent, fontSize: 10, marginTop: 2 },
  sampleText: { color: Colors.textSecondary, fontSize: 13, flex: 1, lineHeight: 18 },
});

const trendStyles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  title: { color: Colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  day: { color: Colors.textMuted, fontSize: 11, fontWeight: '600', width: 32 },
  barWrap: { flex: 1, height: 10, marginHorizontal: 8, position: 'relative' },
  barAll: { position: 'absolute', height: 10, borderRadius: 5, backgroundColor: Colors.accent + '30' },
  barApproved: { position: 'absolute', height: 10, borderRadius: 5, backgroundColor: Colors.accent },
  nums: { color: Colors.textMuted, fontSize: 10, fontVariant: ['tabular-nums'], width: 52, textAlign: 'right' },
  legend: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: Colors.textMuted, fontSize: 10 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },

  // Hero card
  heroCard: {
    margin: 20,
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.accent + '30',
    alignItems: 'center',
  },
  heroNumber: {
    fontSize: 64,
    fontWeight: '900',
    color: Colors.accent,
    marginTop: 8,
    fontVariant: ['tabular-nums'],
  },
  heroLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
    marginTop: 4,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  heroMetaText: { color: Colors.textMuted, fontSize: 11 },
  heroMetaDot: { color: Colors.textDark, fontSize: 11 },
  heroDivider: {
    width: '80%',
    height: 1,
    backgroundColor: Colors.surfaceBorder,
    marginVertical: 16,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatValue: { color: Colors.textPrimary, fontSize: 20, fontWeight: '900', fontVariant: ['tabular-nums'] },
  heroStatLabel: { color: Colors.textMuted, fontSize: 8, fontWeight: '700', letterSpacing: 1.5, marginTop: 2 },
  heroStatDivider: { width: 1, height: 28, backgroundColor: Colors.surfaceBorder },

  // Sections
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: 16,
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 12,
  },
  sectionSubtitle: {
    color: Colors.textDark,
    fontSize: 12,
    marginBottom: 14,
    marginTop: -4,
  },

  // Polling
  pollingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pollingCell: {
    width: (screenWidth - 80) / 2 - 5,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  pollingValue: { color: Colors.textPrimary, fontSize: 18, fontWeight: '900', fontVariant: ['tabular-nums'] },
  pollingLabel: { color: Colors.textMuted, fontSize: 8, fontWeight: '700', letterSpacing: 1.5, marginTop: 4 },

  // Sentiment bar
  sentimentBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  sentimentSlice: {},
  sentimentLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  sentimentLegendItem: {
    fontSize: 10,
    fontWeight: '700',
  },
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  engagementLabel: { color: Colors.textMuted, fontSize: 12 },
  engagementValue: { color: Colors.textPrimary, fontSize: 12, fontWeight: '700' },

  // Summary card
  summaryCard: {
    margin: 20,
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.greenTint + '30',
  },
  summaryTitle: {
    color: Colors.greenTint,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 10,
  },
  summaryText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
});
