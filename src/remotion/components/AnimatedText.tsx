/**
 * AnimatedText Component
 *
 * Easy-to-use React component for animated text in Remotion.
 * Wraps the textAnimations library with a simple declarative API.
 *
 * USAGE:
 * ```tsx
 * <AnimatedText
 *   text="Hello World"
 *   animation="flipUp"
 *   animationConfig={{
 *     unit: "character",
 *     staggerInFrames: 2,
 *   }}
 *   style={{ fontSize: 72, fontWeight: 'bold' }}
 * />
 * ```
 */

import React, { CSSProperties } from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import {
  fadeIn,
  slideUp,
  slideDown,
  slideLeft,
  slideRight,
  slideIn,
  scale,
  flipUp,
  rotate3D,
  typewriter,
  blur,
} from '../animations/textAnimations';
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
import { splitText } from '../utils/textSplitter';

// ═══════════════════════════════════════════════════════
// ANIMATION TYPE MAPPING
// ═══════════════════════════════════════════════════════

export type AnimationType =
  | 'fadeIn'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'scale'
  | 'flipUp'
  | 'rotate3D'
  | 'typewriter'
  | 'blur';

type AnimationConfigMap = {
  fadeIn: FadeAnimationConfig;
  slideUp: SlideAnimationConfig;
  slideDown: SlideAnimationConfig;
  slideLeft: SlideAnimationConfig;
  slideRight: SlideAnimationConfig;
  scale: ScaleAnimationConfig;
  flipUp: RotateAnimationConfig;
  rotate3D: RotateAnimationConfig;
  typewriter: TypewriterAnimationConfig;
  blur: BlurAnimationConfig;
};

// ═══════════════════════════════════════════════════════
// COMPONENT PROPS
// ═══════════════════════════════════════════════════════

export interface AnimatedTextProps<T extends AnimationType = AnimationType> {
  /**
   * The text to animate
   */
  text: string;

  /**
   * Animation type to use
   * @default "fadeIn"
   */
  animation?: T;

  /**
   * Configuration for the selected animation
   */
  animationConfig?: AnimationConfigMap[T];

  /**
   * Base CSS styles for the text container
   */
  style?: CSSProperties;

  /**
   * CSS styles for individual text segments
   */
  segmentStyle?: CSSProperties;

  /**
   * Additional CSS class for the container
   */
  className?: string;

  /**
   * Custom renderer for text segments
   */
  renderSegment?: (content: string, style: CSSProperties, index: number) => React.ReactNode;

  /**
   * Text alignment
   * @default "center"
   */
  align?: 'left' | 'center' | 'right';

  /**
   * Vertical alignment
   * @default "center"
   */
  verticalAlign?: 'top' | 'center' | 'bottom';
}

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════

/**
 * AnimatedText Component
 *
 * Renders animated text using the specified animation type.
 * Automatically handles text splitting and style application.
 */
export const AnimatedText = <T extends AnimationType = AnimationType>({
  text,
  animation = 'fadeIn' as T,
  animationConfig,
  style = {},
  segmentStyle = {},
  className = '',
  renderSegment,
  align = 'center',
  verticalAlign = 'center',
}: AnimatedTextProps<T>) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Get animation function
  const animationFunction = getAnimationFunction(animation);

  // Get animation result
  const result = animationFunction(frame, fps, text, animationConfig as any);

  // Determine alignment styles
  const alignmentStyles: CSSProperties = {
    display: 'flex',
    alignItems:
      verticalAlign === 'top'
        ? 'flex-start'
        : verticalAlign === 'bottom'
        ? 'flex-end'
        : 'center',
    justifyContent:
      align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
  };

  // Handle "whole" unit (single style)
  if (!Array.isArray(result)) {
    const { style: animStyle, visible } = result as AnimationStyle;

    if (!visible) return null;

    return (
      <AbsoluteFill style={{ ...alignmentStyles, ...style }} className={className}>
        <div style={{ ...animStyle, ...segmentStyle }}>{text}</div>
      </AbsoluteFill>
    );
  }

  // Handle split units (array of styles)
  const unit = (animationConfig as BaseAnimationConfig)?.unit || 'word';
  const segments = splitText(text, unit);

  // Filter out invisible segments
  const visibleSegments = segments.filter((_, i) => {
    const styleObj = result[i];
    return styleObj && styleObj.visible;
  });

  return (
    <AbsoluteFill style={{ ...alignmentStyles, ...style }} className={className}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: unit === 'word' ? '0' : undefined,
          textAlign: align,
        }}
      >
        {segments.map((segment, index) => {
          const styleObj = result[index];
          if (!styleObj || !styleObj.visible) return null;

          const combinedStyle: CSSProperties = {
            display: 'inline-block',
            ...segmentStyle,
            ...styleObj.style,
          };

          // Use custom renderer if provided
          if (renderSegment) {
            return (
              <React.Fragment key={index}>
                {renderSegment(segment.content, combinedStyle, index)}
              </React.Fragment>
            );
          }

          // Default rendering
          // Preserve spaces as non-breaking spaces
          const content =
            segment.isSpace && segment.content === ' ' ? '\u00A0' : segment.content;

          return (
            <span key={index} style={combinedStyle}>
              {content}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════
// HELPER: Get animation function by name
// ═══════════════════════════════════════════════════════

function getAnimationFunction(
  animation: AnimationType
): (frame: number, fps: number, text: string, config?: any) => AnimationResult {
  switch (animation) {
    case 'fadeIn':
      return fadeIn;
    case 'slideUp':
      return slideUp;
    case 'slideDown':
      return slideDown;
    case 'slideLeft':
      return slideLeft;
    case 'slideRight':
      return slideRight;
    case 'scale':
      return scale;
    case 'flipUp':
      return flipUp;
    case 'rotate3D':
      return rotate3D;
    case 'typewriter':
      return typewriter;
    case 'blur':
      return blur;
    default:
      return fadeIn;
  }
}

// ═══════════════════════════════════════════════════════
// PRESET COMPONENTS (Convenience)
// ═══════════════════════════════════════════════════════

/**
 * FadeInText - Preset component for fade in animation
 */
export const FadeInText: React.FC<
  Omit<AnimatedTextProps<'fadeIn'>, 'animation'>
> = (props) => <AnimatedText {...props} animation="fadeIn" />;

/**
 * SlideUpText - Preset component for slide up animation
 */
export const SlideUpText: React.FC<
  Omit<AnimatedTextProps<'slideUp'>, 'animation'>
> = (props) => <AnimatedText {...props} animation="slideUp" />;

/**
 * FlipUpText - Preset component for flip up animation (like "Desktop Tool")
 */
export const FlipUpText: React.FC<
  Omit<AnimatedTextProps<'flipUp'>, 'animation'>
> = (props) => <AnimatedText {...props} animation="flipUp" />;

/**
 * TypewriterText - Preset component for typewriter animation
 */
export const TypewriterText: React.FC<
  Omit<AnimatedTextProps<'typewriter'>, 'animation'>
> = (props) => <AnimatedText {...props} animation="typewriter" />;

/**
 * ScaleText - Preset component for scale animation
 */
export const ScaleText: React.FC<
  Omit<AnimatedTextProps<'scale'>, 'animation'>
> = (props) => <AnimatedText {...props} animation="scale" />;

// ═══════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════

export default AnimatedText;
