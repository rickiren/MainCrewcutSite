import React from 'react';

export interface NeonTextStyle {
  glowColor: string;
  glowIntensity: number;
  textColor: string;
  secondaryGlowColor?: string;
  outline?: boolean;
}

/**
 * Creates CSS styles for neon glowing text effect
 */
export const getNeonTextStyle = (config: NeonTextStyle): React.CSSProperties => {
  const {
    glowColor,
    glowIntensity = 40,
    textColor = '#ffffff',
    secondaryGlowColor,
    outline = false,
  } = config;

  // Create multiple shadow layers for realistic neon glow
  const shadows = [
    // Inner glow (close to text)
    `0 0 ${glowIntensity * 0.5}px ${glowColor}`,
    // Main glow
    `0 0 ${glowIntensity}px ${glowColor}`,
    // Outer glow
    `0 0 ${glowIntensity * 2}px ${glowColor}`,
    // Secondary glow color if provided
    ...(secondaryGlowColor
      ? [
          `0 0 ${glowIntensity * 1.5}px ${secondaryGlowColor}`,
          `0 0 ${glowIntensity * 3}px ${secondaryGlowColor}`,
        ]
      : []),
    // Soft ambient glow
    `0 0 ${glowIntensity * 4}px ${glowColor}40`,
  ].join(', ');

  return {
    color: textColor,
    textShadow: shadows,
    fontWeight: 'bold',
    // Add text outline for better visibility
    ...(outline && {
      WebkitTextStroke: `1px ${glowColor}`,
      WebkitTextStrokeWidth: '2px',
    }),
    // Add subtle 3D effect with filter
    filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))',
  };
};

/**
 * Creates a neon glow effect with multiple color variations
 * Perfect for text like "For a Desktop Tool" with different colors
 */
export const getMultiColorNeonStyle = (
  segments: Array<{ text: string; glowColor: string; textColor?: string }>
): React.CSSProperties[] => {
  return segments.map((segment) =>
    getNeonTextStyle({
      glowColor: segment.glowColor,
      textColor: segment.textColor || '#ffffff',
      glowIntensity: 50,
      outline: true,
    })
  );
};

