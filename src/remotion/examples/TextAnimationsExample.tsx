/**
 * Text Animations Example & Demo
 *
 * This file demonstrates all available text animations with usage examples.
 * Use this as a reference for implementing text animations in your videos.
 *
 * To use in Remotion:
 * 1. Import this composition into your Remotion Root
 * 2. Register it with registerRoot()
 * 3. Preview in Remotion Player or Studio
 */

import { AbsoluteFill, Sequence } from 'remotion';
import {
  AnimatedText,
  FadeInText,
  SlideUpText,
  FlipUpText,
  TypewriterText,
  ScaleText,
} from '../components/AnimatedText';

// ═══════════════════════════════════════════════════════
// EXAMPLE 1: FADE IN ANIMATIONS
// ═══════════════════════════════════════════════════════

export const FadeInExample: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1a2e' }}>
      {/* Fade in - Whole text at once */}
      <Sequence from={0} durationInFrames={60}>
        <AnimatedText
          text="Fade In (Whole)"
          animation="fadeIn"
          animationConfig={{
            unit: 'whole',
            durationInFrames: 30,
          }}
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: '#fff',
          }}
        />
      </Sequence>

      {/* Fade in - Word by word */}
      <Sequence from={70} durationInFrames={90}>
        <AnimatedText
          text="Fade In Word By Word"
          animation="fadeIn"
          animationConfig={{
            unit: 'word',
            staggerInFrames: 5,
            durationInFrames: 20,
          }}
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: '#fff',
          }}
        />
      </Sequence>

      {/* Fade in - Character by character */}
      <Sequence from={170} durationInFrames={120}>
        <AnimatedText
          text="Character By Character"
          animation="fadeIn"
          animationConfig={{
            unit: 'character',
            staggerInFrames: 3,
            durationInFrames: 15,
          }}
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: '#fff',
          }}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════
// EXAMPLE 2: SLIDE ANIMATIONS (All Directions)
// ═══════════════════════════════════════════════════════

export const SlideExample: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#16213e' }}>
      {/* Slide Up */}
      <Sequence from={0} durationInFrames={60}>
        <SlideUpText
          text="Slide Up"
          animationConfig={{
            unit: 'word',
            staggerInFrames: 4,
            distance: 30,
            fade: true,
          }}
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: '#00d4ff',
          }}
          verticalAlign="top"
        />
      </Sequence>

      {/* Slide Down */}
      <Sequence from={70} durationInFrames={60}>
        <AnimatedText
          text="Slide Down"
          animation="slideDown"
          animationConfig={{
            unit: 'word',
            staggerInFrames: 4,
            distance: 30,
            fade: true,
          }}
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: '#ff6b6b',
          }}
          verticalAlign="center"
        />
      </Sequence>

      {/* Slide Left */}
      <Sequence from={140} durationInFrames={60}>
        <AnimatedText
          text="Slide Left"
          animation="slideLeft"
          animationConfig={{
            unit: 'character',
            staggerInFrames: 2,
            distance: 20,
            fade: true,
          }}
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: '#4ecdc4',
          }}
          align="right"
        />
      </Sequence>

      {/* Slide Right */}
      <Sequence from={210} durationInFrames={60}>
        <AnimatedText
          text="Slide Right"
          animation="slideRight"
          animationConfig={{
            unit: 'character',
            staggerInFrames: 2,
            distance: 20,
            fade: true,
          }}
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: '#ffe66d',
          }}
          align="left"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════
// EXAMPLE 3: FLIP UP (3D) - "Desktop Tool" Style
// ═══════════════════════════════════════════════════════

export const FlipUpExample: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f0f1e',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* Classic FlipUp - Character by character */}
      <Sequence from={0} durationInFrames={90}>
        <FlipUpText
          text="DESKTOP TOOL"
          animationConfig={{
            unit: 'character',
            staggerInFrames: 2,
            durationInFrames: 20,
            fade: true,
          }}
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: '#fff',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        />
      </Sequence>

      {/* FlipUp - Word by word */}
      <Sequence from={100} durationInFrames={90}>
        <AnimatedText
          text="Flip Word By Word"
          animation="flipUp"
          animationConfig={{
            unit: 'word',
            staggerInFrames: 8,
            durationInFrames: 25,
            fade: true,
          }}
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: '#fff',
          }}
        />
      </Sequence>

      {/* 3D Swing In (Y-axis rotation) */}
      <Sequence from={200} durationInFrames={90}>
        <AnimatedText
          text="Swing In Effect"
          animation="rotate3D"
          animationConfig={{
            unit: 'character',
            direction: 'swingIn',
            staggerInFrames: 2,
            durationInFrames: 20,
            fade: true,
          }}
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: '#ffd93d',
          }}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════
// EXAMPLE 4: SCALE (Zoom In/Out)
// ═══════════════════════════════════════════════════════

export const ScaleExample: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#1e1e2e' }}>
      {/* Scale - Whole text zoom in */}
      <Sequence from={0} durationInFrames={60}>
        <ScaleText
          text="ZOOM IN"
          animationConfig={{
            unit: 'whole',
            from: 0,
            to: 1,
            durationInFrames: 40,
            fade: true,
          }}
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: '#ff6b9d',
          }}
        />
      </Sequence>

      {/* Scale - Word by word zoom */}
      <Sequence from={70} durationInFrames={90}>
        <AnimatedText
          text="Scale Word By Word"
          animation="scale"
          animationConfig={{
            unit: 'word',
            from: 0,
            to: 1,
            staggerInFrames: 6,
            durationInFrames: 25,
            fade: true,
          }}
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: '#00f5ff',
          }}
        />
      </Sequence>

      {/* Scale - Zoom out effect */}
      <Sequence from={170} durationInFrames={60}>
        <AnimatedText
          text="Zoom Out"
          animation="scale"
          animationConfig={{
            unit: 'whole',
            from: 2,
            to: 1,
            durationInFrames: 40,
            fade: false,
          }}
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: '#c0fdfb',
          }}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════
// EXAMPLE 5: TYPEWRITER
// ═══════════════════════════════════════════════════════

export const TypewriterExample: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0a0a0a',
        fontFamily: 'monospace',
      }}
    >
      {/* Classic typewriter with cursor */}
      <Sequence from={0} durationInFrames={120}>
        <TypewriterText
          text="Hello, World!"
          animationConfig={{
            staggerInFrames: 4,
            cursor: true,
            cursorChar: '|',
            cursorBlinkFrames: 15,
          }}
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: '#00ff00',
          }}
          verticalAlign="top"
        />
      </Sequence>

      {/* Fast typewriter */}
      <Sequence from={130} durationInFrames={90}>
        <TypewriterText
          text="Fast typing effect..."
          animationConfig={{
            staggerInFrames: 2,
            cursor: true,
          }}
          style={{
            fontSize: 56,
            color: '#fff',
          }}
          verticalAlign="center"
        />
      </Sequence>

      {/* Slow dramatic typewriter */}
      <Sequence from={230} durationInFrames={180}>
        <TypewriterText
          text="Dramatic reveal."
          animationConfig={{
            staggerInFrames: 10,
            cursor: true,
            cursorChar: '_',
          }}
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: '#ff0066',
          }}
          verticalAlign="bottom"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════
// EXAMPLE 6: BLUR ANIMATION
// ═══════════════════════════════════════════════════════

export const BlurExample: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#2d3561',
        background: 'linear-gradient(135deg, #2d3561 0%, #c05c7e 100%)',
      }}
    >
      {/* Blur to focus - whole */}
      <Sequence from={0} durationInFrames={60}>
        <AnimatedText
          text="Blur to Focus"
          animation="blur"
          animationConfig={{
            unit: 'whole',
            from: 30,
            to: 0,
            durationInFrames: 40,
            fade: true,
          }}
          style={{
            fontSize: 80,
            fontWeight: 'bold',
            color: '#fff',
          }}
        />
      </Sequence>

      {/* Blur in word by word */}
      <Sequence from={70} durationInFrames={90}>
        <AnimatedText
          text="Word By Word Focus"
          animation="blur"
          animationConfig={{
            unit: 'word',
            from: 20,
            to: 0,
            staggerInFrames: 6,
            durationInFrames: 25,
            fade: true,
          }}
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: '#ffd93d',
          }}
        />
      </Sequence>

      {/* Character by character blur */}
      <Sequence from={170} durationInFrames={120}>
        <AnimatedText
          text="Sharp Characters"
          animation="blur"
          animationConfig={{
            unit: 'character',
            from: 15,
            to: 0,
            staggerInFrames: 3,
            durationInFrames: 20,
            fade: true,
          }}
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: '#6bcfff',
          }}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════
// EXAMPLE 7: COMBINING ANIMATIONS
// ═══════════════════════════════════════════════════════

export const CombinedExample: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)',
      }}
    >
      {/* Title: FlipUp */}
      <Sequence from={0} durationInFrames={90}>
        <FlipUpText
          text="TEXT ANIMATIONS"
          animationConfig={{
            unit: 'character',
            staggerInFrames: 2,
            durationInFrames: 20,
          }}
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: '#fff',
            letterSpacing: '0.1em',
          }}
          verticalAlign="top"
        />
      </Sequence>

      {/* Subtitle: SlideUp */}
      <Sequence from={30} durationInFrames={80}>
        <SlideUpText
          text="for Remotion"
          animationConfig={{
            unit: 'word',
            staggerInFrames: 5,
            distance: 20,
          }}
          style={{
            fontSize: 48,
            fontWeight: 600,
            color: '#a78bfa',
          }}
          verticalAlign="center"
        />
      </Sequence>

      {/* Call to action: Scale */}
      <Sequence from={120} durationInFrames={60}>
        <ScaleText
          text="Build Amazing Videos"
          animationConfig={{
            unit: 'whole',
            from: 0.5,
            to: 1,
            durationInFrames: 35,
          }}
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: '#fbbf24',
          }}
          verticalAlign="bottom"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════
// MASTER DEMO COMPOSITION (All examples in sequence)
// ═══════════════════════════════════════════════════════

export const TextAnimationsDemo: React.FC = () => {
  const exampleDuration = 300; // 10 seconds each at 30fps

  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={exampleDuration}>
        <FadeInExample />
      </Sequence>

      <Sequence from={exampleDuration} durationInFrames={exampleDuration}>
        <SlideExample />
      </Sequence>

      <Sequence from={exampleDuration * 2} durationInFrames={exampleDuration}>
        <FlipUpExample />
      </Sequence>

      <Sequence from={exampleDuration * 3} durationInFrames={exampleDuration}>
        <ScaleExample />
      </Sequence>

      <Sequence from={exampleDuration * 4} durationInFrames={exampleDuration}>
        <TypewriterExample />
      </Sequence>

      <Sequence from={exampleDuration * 5} durationInFrames={exampleDuration}>
        <BlurExample />
      </Sequence>

      <Sequence from={exampleDuration * 6} durationInFrames={exampleDuration}>
        <CombinedExample />
      </Sequence>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════
// USAGE GUIDE (Comments)
// ═══════════════════════════════════════════════════════

/**
 * QUICK START GUIDE
 * =================
 *
 * 1. BASIC USAGE
 * --------------
 * ```tsx
 * import { AnimatedText } from '@/remotion/components/AnimatedText';
 *
 * <AnimatedText
 *   text="Hello World"
 *   animation="fadeIn"
 *   animationConfig={{
 *     unit: "word",
 *     staggerInFrames: 5,
 *   }}
 *   style={{ fontSize: 72, color: '#fff' }}
 * />
 * ```
 *
 * 2. PRESET COMPONENTS
 * -------------------
 * Use pre-configured components for common animations:
 *
 * ```tsx
 * import { FlipUpText, TypewriterText } from '@/remotion/components/AnimatedText';
 *
 * <FlipUpText
 *   text="DESKTOP TOOL"
 *   animationConfig={{
 *     unit: "character",
 *     staggerInFrames: 2,
 *   }}
 * />
 *
 * <TypewriterText
 *   text="Hello, World!"
 *   animationConfig={{
 *     cursor: true,
 *     staggerInFrames: 4,
 *   }}
 * />
 * ```
 *
 * 3. ANIMATION UNITS
 * -----------------
 * - "whole": Animate entire text as one unit
 * - "word": Animate word by word
 * - "character": Animate character by character
 * - "line": Animate line by line (for multi-line text)
 *
 * 4. STAGGER & DURATION
 * --------------------
 * - staggerInFrames: Delay between each unit (default: 3)
 * - durationInFrames: How long each unit animates (default: 30)
 *
 * 5. CUSTOM EASING
 * ---------------
 * ```tsx
 * import { Easing } from '@/remotion/types/animations';
 *
 * <AnimatedText
 *   text="Bouncy Text"
 *   animation="slideUp"
 *   animationConfig={{
 *     unit: "word",
 *     easing: Easing.easeOutBounce,
 *   }}
 * />
 * ```
 *
 * 6. AVAILABLE ANIMATIONS
 * ----------------------
 * - fadeIn: Simple opacity animation
 * - slideUp/Down/Left/Right: Slide from direction
 * - scale: Zoom in/out
 * - flipUp: 3D rotation (X-axis)
 * - rotate3D: 3D rotation (custom axis)
 * - typewriter: Character-by-character reveal
 * - blur: Blur to focus
 *
 * 7. CUSTOM STYLING
 * ----------------
 * - style: Container styles (fontSize, color, etc.)
 * - segmentStyle: Styles for individual segments
 * - align: Text alignment (left, center, right)
 * - verticalAlign: Vertical position (top, center, bottom)
 */
