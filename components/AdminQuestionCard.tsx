import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Colors, Spacing, FontSize } from '../constants/theme';
import { Poll, PollScope } from '../types';

interface AdminQuestionCardProps {
  poll: Poll;
  onApprove?: () => void;
  onRegenerate?: () => void;
  onFlag?: () => void;
}

const SCOPE_CONFIG: Record<PollScope, { emoji: string; label: string; color: string }> = {
  national: { emoji: '🌎', label: 'NATIONAL', color: Colors.accent },
  state: { emoji: '🏛', label: 'STATE', color: Colors.purpleTint },
  local: { emoji: '📍', label: 'LOCAL', color: Colors.blueTint },
};

export default function AdminQuestionCard({
  poll,
  onApprove,
  onRegenerate,
  onFlag,
}: AdminQuestionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const scope = SCOPE_CONFIG[poll.scope];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => setExpanded(!expanded)}
      style={styles.card}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.scopeBadge, { borderColor: scope.color + '66' }]}>
          <Text style={styles.scopeEmoji}>{scope.emoji}</Text>
          <Text style={[styles.scopeLabel, { color: scope.color }]}>{scope.label}</Text>
        </View>
        <View style={[styles.categoryBadge]}>
          <Text style={styles.categoryText}>{poll.category.toUpperCase()}</Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </View>

      {/* Question */}
      <Text style={styles.question}>{poll.question}</Text>

      {/* Custom responses preview */}
      <View style={styles.responsesRow}>
        {poll.customResponses.slice(0, 3).map((r) => (
          <View key={r.id} style={styles.responseChip}>
            <Text style={styles.responseEmoji}>{r.emoji}</Text>
            <Text style={styles.responseText} numberOfLines={1}>{r.text}</Text>
          </View>
        ))}
        {poll.customResponses.length > 3 && (
          <Text style={styles.moreText}>+{poll.customResponses.length - 3} more</Text>
        )}
      </View>

      {/* Expanded section */}
      {expanded && (
        <Animated.View entering={FadeIn.duration(200)}>
          {/* All custom responses */}
          <View style={styles.expandedSection}>
            <Text style={styles.sectionTitle}>CUSTOM RESPONSES</Text>
            {poll.customResponses.map((r) => (
              <View key={r.id} style={styles.fullResponseRow}>
                <Text style={styles.fullResponseEmoji}>{r.emoji}</Text>
                <Text style={styles.fullResponseText}>{r.text}</Text>
                <Text style={styles.positionHint}>
                  ({r.mappedPosition.x.toFixed(1)}, {r.mappedPosition.y.toFixed(1)})
                </Text>
              </View>
            ))}
          </View>

          {/* Perspectives preview */}
          <View style={styles.expandedSection}>
            <Text style={styles.sectionTitle}>PERSPECTIVES</Text>
            {poll.perspectives.map((p) => (
              <View key={p.position} style={styles.perspectiveRow}>
                <View style={[styles.perspectiveDot, { backgroundColor: p.color }]} />
                <Text style={styles.perspectiveName}>{p.headline}</Text>
                <Text style={styles.perspectivePos}>
                  {p.position.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            ))}
          </View>

          {/* Common ground */}
          <View style={styles.expandedSection}>
            <Text style={styles.sectionTitle}>COMMON GROUND</Text>
            <Text style={styles.commonGroundText}>"{poll.commonGround.statement}"</Text>
            <Text style={styles.commonGroundPct}>{poll.commonGround.percent}% agreement</Text>
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.approveBtn} onPress={onApprove} activeOpacity={0.7}>
              <Text style={styles.approveBtnText}>✓ APPROVE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.regenBtn} onPress={onRegenerate} activeOpacity={0.7}>
              <Text style={styles.regenBtnText}>↻ REGEN</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.flagBtn} onPress={onFlag} activeOpacity={0.7}>
              <Text style={styles.flagBtnText}>⚠ FLAG</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: Spacing.md,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  scopeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  scopeEmoji: { fontSize: 12 },
  scopeLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  categoryText: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  chevron: { color: Colors.textMuted, fontSize: 12, marginLeft: 'auto' },
  question: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 12,
  },
  responsesRow: {
    gap: 6,
  },
  responseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  responseEmoji: { fontSize: 14 },
  responseText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    flex: 1,
  },
  moreText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontStyle: 'italic',
    marginTop: 2,
  },

  // Expanded
  expandedSection: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 10,
  },
  fullResponseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  fullResponseEmoji: { fontSize: 16, width: 24, textAlign: 'center' },
  fullResponseText: { color: Colors.textSecondary, fontSize: FontSize.sm, flex: 1 },
  positionHint: { color: Colors.textDark, fontSize: 10, fontVariant: ['tabular-nums'] },

  perspectiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  perspectiveDot: { width: 8, height: 8, borderRadius: 4 },
  perspectiveName: { color: Colors.textSecondary, fontSize: FontSize.sm, flex: 1 },
  perspectivePos: { color: Colors.textMuted, fontSize: 10, letterSpacing: 1 },

  commonGroundText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 6,
  },
  commonGroundPct: {
    color: Colors.greenTint,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  approveBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.greenTint,
    alignItems: 'center',
  },
  approveBtnText: { color: Colors.background, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  regenBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.accent + '22',
    borderWidth: 1,
    borderColor: Colors.accent + '55',
    alignItems: 'center',
  },
  regenBtnText: { color: Colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  flagBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: Colors.redTint + '22',
    borderWidth: 1,
    borderColor: Colors.redTint + '55',
    alignItems: 'center',
  },
  flagBtnText: { color: Colors.redTint, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
});
