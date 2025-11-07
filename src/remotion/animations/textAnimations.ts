/**
 * Text Animation Functions for Remotion
 *
 * Comprehensive library of text reveal, in-place, and exit animations.
 * Each function returns styles for animating text at different granularities
 * (whole, line, word, character).
 *
 * USAGE EXAMPLE:
 * ```ts
 * const frame = useCurrentFrame();
 * const { fps } = useVideoConfig();
 *
 * const result = textAnimations.fadeIn(frame, fps, "Hello World", {
 *   unit: "character",
 *   staggerInFrames: 3,
 *   durationInFrames: 30,
 * });
 * ```
 */

import { spring, interpolate } from 'remotion';
import {
  AnimationResult,
  AnimationStyle,
  FadeAnimationConfig,
  SlideAnimationConfig,
  ScaleAnimationConfig,
  RotateAnimationConfig,
  TypewriterAnimationConfig,
  BlurAnimationConfig,
  BaseAnimationConfig,
} from '../types/animations';
import { splitText, getSegmentDelay } from '../utils/textSplitter';

// ═══════════════════════════════════════════════════════
// DEFAULT CONFIGURATIONS
// ═══════════════════════════════════════════════════════

const DEFAULT_SPRING_CONFIG = {
  damping: 100,
  stiffness: 200,
  mass: 1,
};

const DEFAULT_STAGGER = 3; // frames
const DEFAULT_DURATION = 30; // frames

// ═══════════════════════════════════════════════════════
// HELPER: Apply animation to segments
// ═══════════════════════════════════════════════════════

/**
 * Helper to calculate progress for a segment using spring or easing
 */
function calculateProgress(
  frame: number,
  fps: number,
  startFrame: number,
  durationInFrames: number,
  config: BaseAnimationConfig
): number {
  const frameInAnimation = frame - startFrame;

  if (frameInAnimation < 0) return 0;
  if (frameInAnimation >= durationInFrames) return 1;

  // Use custom easing if provided
  if (config.easing) {
    const linearProgress = frameInAnimation / durationInFrames;
    return config.easing(linearProgress);
  }

  // Otherwise use spring
  return spring({
    frame: frameInAnimation,
    fps,
    config: config.spring || DEFAULT_SPRING_CONFIG,
  });
}

// ═══════════════════════════════════════════════════════
// ANIMATION 1: FADE IN
// ═══════════════════════════════════════════════════════

/**
 * Fade In Animation
 *
 * Text fades from transparent to opaque.
 * Supports all animation units: whole, line, word, character.
 *
 * @example
 * ```ts
 * // Fade in word by word
 * const result = fadeIn(frame, fps, "Hello World", {
 *   unit: "word",
 *   staggerInFrames: 5,
 *   from: 0,
 *   to: 1,
 * });
 * ```
 */
export function fadeIn(
  frame: number,
  fps: number,
  text: string,
  config: FadeAnimationConfig = {}
): AnimationResult {
  const {
    unit = 'word',
    staggerInFrames = DEFAULT_STAGGER,
    durationInFrames = DEFAULT_DURATION,
    from = 0,
    to = 1,
  } = config;

  // Split text based on unit
  const segments = splitText(text, unit);

  // For whole text, return single style
  if (unit === 'whole') {
    const progress = calculateProgress(frame, fps, 0, durationInFrames, config);
    const opacity = interpolate(progress, [0, 1], [from, to]);

    return {
      style: { opacity },
      visible: true,
    };
  }

  // For split units, return array of styles
  return segments.map((segment) => {
    const startFrame = getSegmentDelay(segment, staggerInFrames, false);
    const progress = calculateProgress(frame, fps, startFrame, durationInFrames, config);
    const opacity = interpolate(progress, [0, 1], [from, to]);

    return {
      style: { opacity },
      visible: frame >= startFrame,
    };
  });
}

// ═══════════════════════════════════════════════════════
// ANIMATION 2: SLIDE UP (and other directions)
// ═══════════════════════════════════════════════════════

/**
 * Slide In Animation
 *
 * Text slides in from a direction (up, down, left, right) with optional fade.
 * Supports all animation units: whole, line, word, character.
 *
 * @example
 * ```ts
 * // Slide up character by character
 * const result = slideIn(frame, fps, "Hello World", {
 *   unit: "character",
 *   direction: "up",
 *   distance: 30,
 *   fade: true,
 * });
 * ```
 */
export function slideIn(
  frame: number,
  fps: number,
  text: string,
  config: SlideAnimationConfig = {}
): AnimationResult {
  const {
    unit = 'word',
    staggerInFrames = DEFAULT_STAGGER,
    durationInFrames = DEFAULT_DURATION,
    direction = 'up',
    distance = 20,
    fade = true,
  } = config;

  // Split text based on unit
  const segments = splitText(text, unit);

  // Calculate transform based on direction
  const getTransform = (progress: number): string => {
    const moveAmount = interpolate(progress, [0, 1], [distance, 0]);

    switch (direction) {
      case 'up':
        return `translateY(${moveAmount}px)`;
      case 'down':
        return `translateY(-${moveAmount}px)`;
      case 'left':
        return `translateX(${moveAmount}px)`;
      case 'right':
        return `translateX(-${moveAmount}px)`;
      default:
        return `translateY(${moveAmount}px)`;
    }
  };

  // For whole text, return single style
  if (unit === 'whole') {
    const progress = calculateProgress(frame, fps, 0, durationInFrames, config);
    const transform = getTransform(progress);
    const opacity = fade ? progress : 1;

    return {
      style: { transform, opacity },
      visible: true,
    };
  }

  // For split units, return array of styles
  return segments.map((segment) => {
    const startFrame = getSegmentDelay(segment, staggerInFrames, false);
    const progress = calculateProgress(frame, fps, startFrame, durationInFrames, config);
    const transform = getTransform(progress);
    const opacity = fade ? progress : 1;

    return {
      style: { transform, opacity },
      visible: frame >= startFrame,
    };
  });
}

// Convenience functions for each direction
export const slideUp = (frame: number, fps: number, text: string, config?: SlideAnimationConfig) =>
  slideIn(frame, fps, text, { ...config, direction: 'up' });

export const slideDown = (frame: number, fps: number, text: string, config?: SlideAnimationConfig) =>
  slideIn(frame, fps, text, { ...config, direction: 'down' });

export const slideLeft = (frame: number, fps: number, text: string, config?: SlideAnimationConfig) =>
  slideIn(frame, fps, text, { ...config, direction: 'left' });

export const slideRight = (frame: number, fps: number, text: string, config?: SlideAnimationConfig) =>
  slideIn(frame, fps, text, { ...config, direction: 'right' });

// ═══════════════════════════════════════════════════════
// ANIMATION 3: FLIP UP (3D Rotation)
// ═══════════════════════════════════════════════════════

/**
 * Flip Up Animation (3D Rotation on X-axis)
 *
 * Characters flip up from flat (rotateX -90deg) to upright (0deg).
 * This is the signature animation seen in "Desktop Tool" style reveals.
 * Works best with unit="character".
 *
 * @example
 * ```ts
 * // Classic character flip like "Desktop Tool"
 * const result = flipUp(frame, fps, "Hello World", {
 *   unit: "character",
 *   staggerInFrames: 2,
 *   fade: true,
 * });
 * ```
 */
export function flipUp(
  frame: number,
  fps: number,
  text: string,
  config: RotateAnimationConfig = {}
): AnimationResult {
  const {
    unit = 'character',
    staggerInFrames = 2, // Faster stagger for character flips
    durationInFrames = 20, // Shorter duration for snappier flips
    fade = true,
  } = config;

  const segments = splitText(text, unit);

  // For whole text
  if (unit === 'whole') {
    const progress = calculateProgress(frame, fps, 0, durationInFrames, config);
    const rotateX = interpolate(progress, [0, 1], [-90, 0]);
    const opacity = fade ? progress : 1;

    return {
      style: {
        transform: `perspective(500px) rotateX(${rotateX}deg)`,
        transformOrigin: 'center bottom',
        opacity,
      },
      visible: true,
    };
  }

  // For split units
  return segments.map((segment) => {
    const startFrame = getSegmentDelay(segment, staggerInFrames, false);
    const progress = calculateProgress(frame, fps, startFrame, durationInFrames, config);
    const rotateX = interpolate(progress, [0, 1], [-90, 0]);
    const opacity = fade ? progress : 1;

    return {
      style: {
        transform: `perspective(500px) rotateX(${rotateX}deg)`,
        transformOrigin: 'center bottom',
        opacity,
      },
      visible: frame >= startFrame,
    };
  });
}

/**
 * 3D Rotate Animation (Multiple Directions)
 *
 * Supports flipUp, flipDown, swingIn (Y-axis), and spinIn (Z-axis).
 *
 * @example
 * ```ts
 * const result = rotate3D(frame, fps, "Hello", {
 *   unit: "character",
 *   direction: "swingIn", // Rotate on Y-axis
 * });
 * ```
 */
export function rotate3D(
  frame: number,
  fps: number,
  text: string,
  config: RotateAnimationConfig = {}
): AnimationResult {
  const {
    unit = 'character',
    staggerInFrames = 2,
    durationInFrames = 20,
    direction = 'flipUp',
    fade = true,
  } = config;

  const segments = splitText(text, unit);

  const getTransform = (progress: number): string => {
    switch (direction) {
      case 'flipUp':
        const rotateX = interpolate(progress, [0, 1], [-90, 0]);
        return `perspective(500px) rotateX(${rotateX}deg)`;
      case 'flipDown':
        const rotateXDown = interpolate(progress, [0, 1], [90, 0]);
        return `perspective(500px) rotateX(${rotateXDown}deg)`;
      case 'swingIn':
        const rotateY = interpolate(progress, [0, 1], [90, 0]);
        return `perspective(500px) rotateY(${rotateY}deg)`;
      case 'spinIn':
        const rotateZ = interpolate(progress, [0, 1], [180, 0]);
        return `perspective(500px) rotateZ(${rotateZ}deg)`;
      default:
        return 'none';
    }
  };

  // For whole text
  if (unit === 'whole') {
    const progress = calculateProgress(frame, fps, 0, durationInFrames, config);
    const transform = getTransform(progress);
    const opacity = fade ? progress : 1;

    return {
      style: {
        transform,
        transformOrigin: 'center',
        opacity,
      },
      visible: true,
    };
  }

  // For split units
  return segments.map((segment) => {
    const startFrame = getSegmentDelay(segment, staggerInFrames, false);
    const progress = calculateProgress(frame, fps, startFrame, durationInFrames, config);
    const transform = getTransform(progress);
    const opacity = fade ? progress : 1;

    return {
      style: {
        transform,
        transformOrigin: 'center',
        opacity,
      },
      visible: frame >= startFrame,
    };
  });
}

// ═══════════════════════════════════════════════════════
// ANIMATION 4: SCALE (Zoom In/Out)
// ═══════════════════════════════════════════════════════

/**
 * Scale Animation
 *
 * Text scales from small to normal (zoom in) or large to normal (zoom out).
 * Supports all animation units.
 *
 * @example
 * ```ts
 * // Zoom in word by word
 * const result = scale(frame, fps, "Hello World", {
 *   unit: "word",
 *   from: 0,
 *   to: 1,
 *   fade: true,
 * });
 * ```
 */
export function scale(
  frame: number,
  fps: number,
  text: string,
  config: ScaleAnimationConfig = {}
): AnimationResult {
  const {
    unit = 'whole',
    staggerInFrames = DEFAULT_STAGGER,
    durationInFrames = DEFAULT_DURATION,
    from = 0,
    to = 1,
    fade = true,
  } = config;

  const segments = splitText(text, unit);

  // For whole text
  if (unit === 'whole') {
    const progress = calculateProgress(frame, fps, 0, durationInFrames, config);
    const scaleValue = interpolate(progress, [0, 1], [from, to]);
    const opacity = fade ? progress : 1;

    return {
      style: {
        transform: `scale(${scaleValue})`,
        opacity,
      },
      visible: true,
    };
  }

  // For split units
  return segments.map((segment) => {
    const startFrame = getSegmentDelay(segment, staggerInFrames, false);
    const progress = calculateProgress(frame, fps, startFrame, durationInFrames, config);
    const scaleValue = interpolate(progress, [0, 1], [from, to]);
    const opacity = fade ? progress : 1;

    return {
      style: {
        transform: `scale(${scaleValue})`,
        opacity,
      },
      visible: frame >= startFrame,
    };
  });
}

// ═══════════════════════════════════════════════════════
// ANIMATION 5: TYPEWRITER
// ═══════════════════════════════════════════════════════

/**
 * Typewriter Animation
 *
 * Characters appear instantly one by one, like typing.
 * Always uses character-level animation.
 * Optional blinking cursor.
 *
 * @example
 * ```ts
 * // Classic typewriter with cursor
 * const result = typewriter(frame, fps, "Hello World", {
 *   staggerInFrames: 4, // 4 frames per character
 *   cursor: true,
 *   cursorChar: "|",
 * });
 * ```
 */
export function typewriter(
  frame: number,
  fps: number,
  text: string,
  config: TypewriterAnimationConfig = {}
): AnimationResult {
  const {
    staggerInFrames = 4,
    durationInFrames = 1, // Instant appearance
    cursor = true,
    cursorChar = '|',
    cursorBlinkFrames = 15,
  } = config;

  // Always split by character for typewriter
  const segments = splitText(text, 'character');

  const results = segments.map((segment) => {
    const startFrame = getSegmentDelay(segment, staggerInFrames, false);
    const visible = frame >= startFrame;

    return {
      style: {
        opacity: visible ? 1 : 0,
      },
      visible,
    };
  });

  // Add cursor if enabled
  if (cursor) {
    const lastVisibleIndex = segments.findIndex((seg) => {
      const startFrame = getSegmentDelay(seg, staggerInFrames, false);
      return frame < startFrame;
    });

    const cursorVisible = lastVisibleIndex !== -1;
    const shouldShowCursor =
      cursorVisible && Math.floor(frame / cursorBlinkFrames) % 2 === 0;

    // Add cursor as a pseudo-segment
    if (cursorVisible) {
      results.push({
        style: {
          opacity: shouldShowCursor ? 1 : 0,
        },
        visible: true,
      });
    }
  }

  return results;
}

// ═══════════════════════════════════════════════════════
// BONUS: BLUR ANIMATION
// ═══════════════════════════════════════════════════════

/**
 * Blur Animation
 *
 * Text transitions from blurry to sharp (or vice versa).
 * Often combined with fade for smooth reveals.
 *
 * @example
 * ```ts
 * const result = blur(frame, fps, "Hello World", {
 *   unit: "word",
 *   from: 20, // Start blurry
 *   to: 0,    // End sharp
 *   fade: true,
 * });
 * ```
 */
export function blur(
  frame: number,
  fps: number,
  text: string,
  config: BlurAnimationConfig = {}
): AnimationResult {
  const {
    unit = 'word',
    staggerInFrames = DEFAULT_STAGGER,
    durationInFrames = DEFAULT_DURATION,
    from = 20,
    to = 0,
    fade = true,
  } = config;

  const segments = splitText(text, unit);

  // For whole text
  if (unit === 'whole') {
    const progress = calculateProgress(frame, fps, 0, durationInFrames, config);
    const blurAmount = interpolate(progress, [0, 1], [from, to]);
    const opacity = fade ? progress : 1;

    return {
      style: {
        filter: `blur(${blurAmount}px)`,
        opacity,
      },
      visible: true,
    };
  }

  // For split units
  return segments.map((segment) => {
    const startFrame = getSegmentDelay(segment, staggerInFrames, false);
    const progress = calculateProgress(frame, fps, startFrame, durationInFrames, config);
    const blurAmount = interpolate(progress, [0, 1], [from, to]);
    const opacity = fade ? progress : 1;

    return {
      style: {
        filter: `blur(${blurAmount}px)`,
        opacity,
      },
      visible: frame >= startFrame,
    };
  });
}

// ═══════════════════════════════════════════════════════
// EXPORT ALL ANIMATIONS
// ═══════════════════════════════════════════════════════

/**
 * Text Animations Library
 *
 * All available text animations organized by category
 */
export const textAnimations = {
  // Reveal animations
  fadeIn,
  slideIn,
  slideUp,
  slideDown,
  slideLeft,
  slideRight,
  scale,
  flipUp,
  rotate3D,
  typewriter,
  blur,
};

export default textAnimations;
