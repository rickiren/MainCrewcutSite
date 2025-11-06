import { CSSProperties } from 'react';

/**
 * Glassmorphism utility functions for creating frosted glass effects
 */

export interface GlassmorphicStyleOptions {
  opacity?: number;
  blur?: number;
  borderColor?: string;
  borderWidth?: number;
  backgroundColor?: string;
  shadowColor?: string;
  shadowIntensity?: number;
}

/**
 * Creates a glassmorphic style with frosted glass effect
 */
export const glassmorphicStyle = (options: GlassmorphicStyleOptions = {}): CSSProperties => {
  const {
    opacity = 0.3,
    blur = 10,
    borderColor = 'rgba(255, 255, 255, 0.2)',
    borderWidth = 1,
    backgroundColor,
    shadowColor = 'rgba(31, 38, 135, 0.37)',
    shadowIntensity = 0.37,
  } = options;

  const bgColor = backgroundColor || `rgba(255, 255, 255, ${opacity})`;

  return {
    background: bgColor,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    border: `${borderWidth}px solid ${borderColor}`,
    boxShadow: `0 8px 32px 0 ${shadowColor.replace('0.37', shadowIntensity.toString())}`,
  };
};

/**
 * Creates a glassmorphic card with rounded corners
 */
export const glassmorphicCard = (
  options: GlassmorphicStyleOptions & { borderRadius?: number; padding?: number } = {}
): CSSProperties => {
  const { borderRadius = 24, padding = 32, ...glassOptions } = options;

  return {
    ...glassmorphicStyle(glassOptions),
    borderRadius: `${borderRadius}px`,
    padding: `${padding}px`,
  };
};

/**
 * Creates a colored glassmorphic style (for colored glass effects)
 */
export const coloredGlassmorphicStyle = (
  color: string,
  opacity: number = 0.2,
  blur: number = 15
): CSSProperties => {
  const rgbaColor = hexToRgba(color, opacity);

  return {
    background: rgbaColor,
    backdropFilter: `blur(${blur}px) saturate(180%)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(180%)`,
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  };
};

/**
 * Helper to convert hex color to rgba
 */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

