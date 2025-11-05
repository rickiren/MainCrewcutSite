/**
 * Text Animation Type Definitions for Remotion
 *
 * Comprehensive type system for text reveal, in-place, and exit animations.
 * Supports animation at whole, line, word, and character levels.
 */

import { CSSProperties } from 'react';

// ═══════════════════════════════════════════════════════
// ANIMATION UNITS
// ═══════════════════════════════════════════════════════

/**
 * Unit of text to animate
 * - whole: Animate entire text block as one unit
 * - line: Animate line by line
 * - word: Animate word by word
 * - character: Animate character by character
 */
export type AnimationUnit = 'whole' | 'line' | 'word' | 'character';

/**
 * Direction for slide/pan animations
 */
export type SlideDirection = 'up' | 'down' | 'left' | 'right';

/**
 * Direction for 3D rotation animations
 */
export type RotateDirection = 'flipUp' | 'flipDown' | 'swingIn' | 'spinIn';

/**
 * Easing function type
 */
export type EasingFunction = (t: number) => number;

// ═══════════════════════════════════════════════════════
// ANIMATION CONFIGURATION
// ═══════════════════════════════════════════════════════

/**
 * Base configuration for all text animations
 */
export interface BaseAnimationConfig {
  /**
   * Unit of text to animate (whole, line, word, character)
   * @default "word"
   */
  unit?: AnimationUnit;

  /**
   * Delay in frames between each unit starting its animation
   * @default 3
   */
  staggerInFrames?: number;

  /**
   * Duration of the animation in frames (for each unit)
   * @default 30
   */
  durationInFrames?: number;

  /**
   * Custom easing function
   * If not provided, uses spring physics
   */
  easing?: EasingFunction;

  /**
   * Spring configuration (if easing is not provided)
   */
  spring?: {
    damping?: number;
    stiffness?: number;
    mass?: number;
  };
}

/**
 * Configuration for fade animations
 */
export interface FadeAnimationConfig extends BaseAnimationConfig {
  /**
   * Starting opacity (0-1)
   * @default 0
   */
  from?: number;

  /**
   * Ending opacity (0-1)
   * @default 1
   */
  to?: number;
}

/**
 * Configuration for slide animations
 */
export interface SlideAnimationConfig extends BaseAnimationConfig {
  /**
   * Direction to slide from
   * @default "up"
   */
  direction?: SlideDirection;

  /**
   * Distance to slide in pixels
   * @default 20
   */
  distance?: number;

  /**
   * Include fade effect
   * @default true
   */
  fade?: boolean;
}

/**
 * Configuration for scale animations
 */
export interface ScaleAnimationConfig extends BaseAnimationConfig {
  /**
   * Starting scale (0+)
   * @default 0
   */
  from?: number;

  /**
   * Ending scale
   * @default 1
   */
  to?: number;

  /**
   * Include fade effect
   * @default true
   */
  fade?: boolean;
}

/**
 * Configuration for rotate/flip animations
 */
export interface RotateAnimationConfig extends BaseAnimationConfig {
  /**
   * Direction/axis to rotate
   * @default "flipUp"
   */
  direction?: RotateDirection;

  /**
   * Include fade effect
   * @default true
   */
  fade?: boolean;
}

/**
 * Configuration for typewriter animations
 */
export interface TypewriterAnimationConfig extends Omit<BaseAnimationConfig, 'unit'> {
  /**
   * Show blinking cursor
   * @default true
   */
  cursor?: boolean;

  /**
   * Cursor character
   * @default "|"
   */
  cursorChar?: string;

  /**
   * Cursor blink speed in frames
   * @default 15
   */
  cursorBlinkFrames?: number;
}

/**
 * Configuration for blur animations
 */
export interface BlurAnimationConfig extends BaseAnimationConfig {
  /**
   * Starting blur amount in pixels
   * @default 20
   */
  from?: number;

  /**
   * Ending blur amount in pixels
   * @default 0
   */
  to?: number;

  /**
   * Include fade effect
   * @default true
   */
  fade?: boolean;
}

// ═══════════════════════════════════════════════════════
// ANIMATION RESULT TYPES
// ═══════════════════════════════════════════════════════

/**
 * Result from animation function for a single unit
 */
export interface AnimationStyle {
  style: CSSProperties;
  visible: boolean; // Whether this unit should be rendered
}

/**
 * Result from animation function
 * - For "whole" unit: single style
 * - For split units: array of styles (one per unit)
 */
export type AnimationResult = AnimationStyle | AnimationStyle[];

// ═══════════════════════════════════════════════════════
// TEXT SEGMENT (from splitter)
// ═══════════════════════════════════════════════════════

/**
 * A segment of text from the splitter
 */
export interface TextSegment {
  /**
   * The text content
   */
  content: string;

  /**
   * Index of this segment
   */
  index: number;

  /**
   * Whether this is a space character
   */
  isSpace: boolean;

  /**
   * Original position in unsplit text
   */
  position: number;
}

// ═══════════════════════════════════════════════════════
// ANIMATION FUNCTION TYPE
// ═══════════════════════════════════════════════════════

/**
 * Type for animation functions
 */
export type AnimationFunction<T extends BaseAnimationConfig = BaseAnimationConfig> = (
  frame: number,
  fps: number,
  text: string,
  config?: T
) => AnimationResult;

// ═══════════════════════════════════════════════════════
// PREDEFINED EASING FUNCTIONS
// ═══════════════════════════════════════════════════════

/**
 * Common easing functions
 */
export const Easing = {
  linear: (t: number) => t,

  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  easeInExpo: (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInOutExpo: (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return Math.pow(2, 10 * (2 * t - 1)) / 2;
    return (2 - Math.pow(2, -10 * (2 * t - 1))) / 2;
  },

  easeInBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },

  easeInElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  easeOutElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },

  easeInBounce: (t: number) => 1 - Easing.easeOutBounce(1 - t),
  easeOutBounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
};
