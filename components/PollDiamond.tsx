import React, { useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, PanResponder } from 'react-native';
import Svg, { Polygon, Line, Circle, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  interpolate,
  useAnimatedProps,
} from 'react-native-reanimated';
import { Colors } from '../constants/theme';
import { ResultDot } from '../types';
import { clampToDiamond, pixelToNormalized } from '../utils/diamondMath';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface PollDiamondProps {
  size: number;
  interactive?: boolean;
  onPositionChange?: (nx: number, ny: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  resultDots?: ResultDot[];
  showLabels?: boolean;
  labels?: { top: string; bottom: string; left: string; right: string };
  initialX?: number;
  initialY?: number;
}

export default function PollDiamond({
  size,
  interactive = false,
  onPositionChange,
  onDragStart,
  onDragEnd,
  resultDots,
  showLabels = true,
  labels,
  initialX = 0,
  initialY = 0,
}: PollDiamondProps) {
  const halfSize = size / 2;
  const diamondRadius = halfSize * 0.82; // diamond fits within this
  const center = halfSize;

  // Diamond corner points (before rotation — we draw axis-aligned then rotate the group)
  // Since we rotate the group 45deg, we draw a square and the rotation makes it a diamond
  const sqHalf = diamondRadius / Math.SQRT2; // half-side of the inner square
  // Actually, let's draw the diamond directly as a polygon (points at N/E/S/W)
  const points = [
    `${center},${center - diamondRadius}`, // top
    `${center + diamondRadius},${center}`, // right
    `${center},${center + diamondRadius}`, // bottom
    `${center - diamondRadius},${center}`, // left
  ].join(' ');

  // Marker position (pixel offset from center)
  const markerX = useSharedValue(initialX * diamondRadius);
  const markerY = useSharedValue(initialY * diamondRadius);

  // Pulsing glow
  const glowOpacity = useSharedValue(0.4);
  const glowScale = useSharedValue(1);

  useEffect(() => {
    if (interactive) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 800 }),
          withTiming(0.3, { duration: 800 })
        ),
        -1,
        true
      );
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    }
  }, [interactive]);

  const panStartX = useRef(0);
  const panStartY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const onDragStartRef = useRef(onDragStart);
  const onDragEndRef = useRef(onDragEnd);
  const onPositionChangeRef = useRef(onPositionChange);
  onDragStartRef.current = onDragStart;
  onDragEndRef.current = onDragEnd;
  onPositionChangeRef.current = onPositionChange;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 2 || Math.abs(g.dy) > 2,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: () => {
        panStartX.current = currentX.current;
        panStartY.current = currentY.current;
        onDragStartRef.current?.();
      },
      onPanResponderMove: (_, gesture) => {
        const rawX = panStartX.current + gesture.dx;
        const rawY = panStartY.current + gesture.dy;
        const clamped = clampToDiamond(rawX, rawY, diamondRadius);
        currentX.current = clamped.x;
        currentY.current = clamped.y;
        markerX.value = clamped.x;
        markerY.value = clamped.y;
        if (onPositionChangeRef.current) {
          const { nx, ny } = pixelToNormalized(clamped.x, clamped.y, diamondRadius);
          onPositionChangeRef.current(nx, ny);
        }
      },
      onPanResponderRelease: () => {
        markerX.value = withSpring(markerX.value, { damping: 15, stiffness: 150 });
        markerY.value = withSpring(markerY.value, { damping: 15, stiffness: 150 });
        onDragEndRef.current?.();
      },
    })
  ).current;

  const markerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: markerX.value },
      { translateY: markerY.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [
      { translateX: markerX.value },
      { translateY: markerY.value },
      { scale: glowScale.value },
    ],
  }));

  // Grid lines for the diamond interior (concentric diamond rings)
  const gridRings = [0.33, 0.66];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* SVG Diamond */}
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer glow */}
        <Polygon
          points={points}
          fill="none"
          stroke={Colors.accentGlow}
          strokeWidth={8}
          opacity={0.3}
        />

        {/* Diamond fill with border */}
        <Polygon
          points={points}
          fill={Colors.diamondFill}
          stroke={Colors.diamondStroke}
          strokeWidth={2}
          opacity={0.9}
        />

        {/* Inner grid rings */}
        {gridRings.map((scale, i) => {
          const r = diamondRadius * scale;
          const ringPoints = [
            `${center},${center - r}`,
            `${center + r},${center}`,
            `${center},${center + r}`,
            `${center - r},${center}`,
          ].join(' ');
          return (
            <Polygon
              key={i}
              points={ringPoints}
              fill="none"
              stroke={Colors.diamondGridLine}
              strokeWidth={1}
              opacity={0.5}
            />
          );
        })}

        {/* Cross axes */}
        <Line
          x1={center - diamondRadius}
          y1={center}
          x2={center + diamondRadius}
          y2={center}
          stroke={Colors.diamondAxisLine}
          strokeWidth={1}
          strokeDasharray="4,4"
        />
        <Line
          x1={center}
          y1={center - diamondRadius}
          x2={center}
          y2={center + diamondRadius}
          stroke={Colors.diamondAxisLine}
          strokeWidth={1}
          strokeDasharray="4,4"
        />

        {/* Center dot */}
        <Circle
          cx={center}
          cy={center}
          r={3}
          fill={Colors.textMuted}
          opacity={0.6}
        />

        {/* Result dots */}
        {resultDots?.map((dot, index) => (
          <ResultDotCircle
            key={dot.label}
            cx={center + dot.x * diamondRadius}
            cy={center + dot.y * diamondRadius}
            color={dot.color}
            delay={index * 200}
          />
        ))}
      </Svg>

      {/* Labels */}
      {showLabels && (
        <>
          <View style={[styles.label, styles.labelTop]}>
            <Text style={styles.labelText}>{labels?.top ?? 'Liberal'}</Text>
          </View>
          <View style={[styles.label, styles.labelBottom]}>
            <Text style={styles.labelText}>{labels?.bottom ?? 'Conservative'}</Text>
          </View>
          <View style={[styles.label, styles.labelLeft]}>
            <Text style={styles.labelText}>{labels?.left ?? 'Left'}</Text>
          </View>
          <View style={[styles.label, styles.labelRight]}>
            <Text style={styles.labelText}>{labels?.right ?? 'Right'}</Text>
          </View>
        </>
      )}

      {/* Interactive marker overlay */}
      {interactive && (
        <View {...panResponder.panHandlers} style={[styles.markerArea, { width: size, height: size }]}>
            {/* Glow ring */}
            <Animated.View
              style={[
                styles.glowRing,
                {
                  left: center - 24,
                  top: center - 24,
                },
                glowStyle,
              ]}
            />
            {/* Main marker */}
            <Animated.View
              style={[
                styles.marker,
                {
                  left: center - 14,
                  top: center - 14,
                },
                markerStyle,
              ]}
            >
              <View style={styles.markerInner} />
            </Animated.View>
        </View>
      )}
    </View>
  );
}

// Animated result dot with staggered fade-in
function ResultDotCircle({
  cx,
  cy,
  color,
  delay,
}: {
  cx: number;
  cy: number;
  color: string;
  delay: number;
}) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 12, stiffness: 180 })
    );
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    opacity: opacity.value,
    r: interpolate(scale.value, [0, 1], [2, 8]),
  }));

  return (
    <>
      {/* Outer glow */}
      <AnimatedCircle
        cx={cx}
        cy={cy}
        fill={color}
        animatedProps={useAnimatedProps(() => ({
          opacity: opacity.value * 0.3,
          r: interpolate(scale.value, [0, 1], [4, 16]),
        }))}
      />
      {/* Main dot */}
      <AnimatedCircle cx={cx} cy={cy} fill={color} animatedProps={animatedProps} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerArea: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  marker: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },
  markerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
  },
  glowRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accentGlow,
    borderWidth: 2,
    borderColor: Colors.accentDim,
  },
  label: {
    position: 'absolute',
    alignItems: 'center',
  },
  labelTop: {
    top: -2,
    alignSelf: 'center',
    left: '50%',
    transform: [{ translateX: -30 }],
  },
  labelBottom: {
    bottom: -2,
    alignSelf: 'center',
    left: '50%',
    transform: [{ translateX: -30 }],
  },
  labelLeft: {
    left: -8,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  labelRight: {
    right: -8,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  labelText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
