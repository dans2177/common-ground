import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Spacing, FontSize } from '../constants/theme';
import { CustomResponse } from '../types';

interface VibeCardProps {
  response: CustomResponse;
  selected: boolean;
  onSelect: (response: CustomResponse) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function VibeCard({ response, selected, onSelect }: VibeCardProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[
        styles.card,
        selected && styles.cardSelected,
        animStyle,
      ]}
      onPress={() => onSelect(response)}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      }}
    >
      <Text style={styles.emoji}>{response.emoji}</Text>
      <Text
        style={[styles.text, selected && styles.textSelected]}
        numberOfLines={2}
      >
        {response.text}
      </Text>
      {selected && <View style={styles.checkBadge}><Text style={styles.checkText}>✓</Text></View>}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: Spacing.md,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
    gap: 12,
  },
  cardSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentGlow,
  },
  emoji: {
    fontSize: 22,
    width: 32,
    textAlign: 'center',
  },
  text: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    lineHeight: 19,
  },
  textSelected: {
    color: Colors.textPrimary,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: Colors.background,
    fontSize: 13,
    fontWeight: '900',
  },
});
