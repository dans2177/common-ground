/**
 * Clamp a point (x, y) to the diamond boundary.
 * Diamond is defined by |x| + |y| <= halfSize (Manhattan distance).
 */
export function clampToDiamond(
  x: number,
  y: number,
  halfSize: number
): { x: number; y: number } {
  const manhattan = Math.abs(x) + Math.abs(y);
  if (manhattan <= halfSize) {
    return { x, y };
  }
  // Scale down proportionally to land on the diamond edge
  const scale = halfSize / manhattan;
  return { x: x * scale, y: y * scale };
}

/**
 * Convert pixel offset from center to normalized [-1, 1] coordinates.
 */
export function pixelToNormalized(
  px: number,
  py: number,
  halfSize: number
): { nx: number; ny: number } {
  return {
    nx: Math.max(-1, Math.min(1, px / halfSize)),
    ny: Math.max(-1, Math.min(1, py / halfSize)),
  };
}

/**
 * Convert normalized [-1, 1] coordinates to pixel offset from center.
 */
export function normalizedToPixel(
  nx: number,
  ny: number,
  halfSize: number
): { px: number; py: number } {
  return {
    px: nx * halfSize,
    py: ny * halfSize,
  };
}

/**
 * Convert normalized (x, y) position to a human-readable political label.
 * x: -1 (far left) to 1 (far right)
 * y: -1 (extreme/top) to 1 (moderate/bottom) — NOTE: inverted for screen coords
 *
 * In our diamond:
 *   Top point = Extreme Liberal  (x≈0, y negative in screen coords)
 *   Bottom point = Extreme Right (x≈0, y positive in screen coords)
 *   Left point = Left            (x negative)
 *   Right point = Right          (x positive)
 *   Center = Neutral
 */
export function positionToLabel(nx: number, ny: number): string {
  const dist = Math.sqrt(nx * nx + ny * ny);

  if (dist < 0.1) return 'Neutral';

  // Determine intensity
  let intensity: string;
  if (dist < 0.3) intensity = 'Slightly';
  else if (dist < 0.6) intensity = 'Moderately';
  else if (dist < 0.85) intensity = 'Strongly';
  else intensity = 'Extremely';

  // Determine horizontal component (left/right economics)
  let horizontal = '';
  if (nx < -0.15) horizontal = 'Left';
  else if (nx > 0.15) horizontal = 'Right';
  else horizontal = 'Center';

  // Determine vertical component (liberal/conservative social axis)
  // Negative Y = up = liberal, Positive Y = down = conservative
  let vertical = '';
  if (ny < -0.15) vertical = 'Liberal';
  else if (ny > 0.15) vertical = 'Conservative';

  // Build label
  if (vertical && horizontal !== 'Center') {
    return `${intensity} ${vertical}-${horizontal}`;
  } else if (vertical) {
    return `${intensity} ${vertical}`;
  } else if (horizontal !== 'Center') {
    return `${intensity} ${horizontal}`;
  }
  return `${intensity} Centrist`;
}

/**
 * Get the closest "take" key based on normalized position.
 */
export function positionToTakeKey(
  nx: number,
  ny: number
): 'neutral' | 'left' | 'right' | 'extreme_left' | 'extreme_right' {
  const dist = Math.sqrt(nx * nx + ny * ny);
  if (dist < 0.2) return 'neutral';

  // Angle from center: atan2(ny, nx)
  const angle = Math.atan2(ny, nx); // radians

  // Top = -π/2 (extreme liberal), Bottom = π/2 (extreme right)
  // Left = π (left), Right = 0 (right)
  if (angle > -Math.PI / 4 && angle <= Math.PI / 4) return 'right';
  if (angle > Math.PI / 4 && angle <= (3 * Math.PI) / 4) return 'extreme_right';
  if (angle > -(3 * Math.PI) / 4 && angle <= -Math.PI / 4) return 'extreme_left';
  return 'left';
}
