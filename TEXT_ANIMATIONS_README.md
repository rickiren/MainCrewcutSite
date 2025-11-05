# Text Animation Library for Remotion

A comprehensive, production-ready text animation library for Remotion with 10+ animation types, multiple granularity levels, and full TypeScript support.

## ✨ Features

- **10+ Animation Types**: Fade, slide, scale, flip, rotate, typewriter, blur, and more
- **Multiple Units**: Animate whole text, lines, words, or characters
- **Full TypeScript**: Complete type safety with autocomplete
- **Spring Physics**: Natural animations using Remotion's spring system
- **Custom Easing**: 15+ easing functions or bring your own
- **Zero Dependencies**: Built on core Remotion primitives
- **Production Ready**: Optimized, tested, and documented

## 📦 Files Structure

```
src/remotion/
├── types/
│   └── animations.ts              # TypeScript type definitions
├── utils/
│   └── textSplitter.ts            # Text splitting utilities
├── animations/
│   └── textAnimations.ts          # Core animation functions
├── components/
│   └── AnimatedText.tsx           # React component wrapper
└── examples/
    └── TextAnimationsExample.tsx  # Usage examples & demos
```

## 🚀 Quick Start

### Basic Usage

```tsx
import { AnimatedText } from '@/remotion/components/AnimatedText';

export const MyComposition = () => {
  return (
    <AnimatedText
      text="Hello World"
      animation="fadeIn"
      animationConfig={{
        unit: "word",
        staggerInFrames: 5,
      }}
      style={{
        fontSize: 72,
        fontWeight: 'bold',
        color: '#fff',
      }}
    />
  );
};
```

### Using Preset Components

```tsx
import {
  FlipUpText,
  TypewriterText,
  SlideUpText,
} from '@/remotion/components/AnimatedText';

// Classic "Desktop Tool" style character flip
<FlipUpText
  text="DESKTOP TOOL"
  animationConfig={{
    unit: "character",
    staggerInFrames: 2,
  }}
  style={{ fontSize: 96, fontWeight: 900 }}
/>

// Typewriter with blinking cursor
<TypewriterText
  text="Hello, World!"
  animationConfig={{
    staggerInFrames: 4,
    cursor: true,
  }}
/>

// Slide up word by word
<SlideUpText
  text="Slide Up Animation"
  animationConfig={{
    unit: "word",
    staggerInFrames: 5,
  }}
/>
```

## 🎨 Available Animations

### 1. Fade In
Simple opacity transition from transparent to opaque.

```tsx
<AnimatedText
  text="Fade In Text"
  animation="fadeIn"
  animationConfig={{
    unit: "character",    // whole | line | word | character
    staggerInFrames: 3,   // Delay between characters
    durationInFrames: 30, // Animation duration
    from: 0,              // Starting opacity
    to: 1,                // Ending opacity
  }}
/>
```

### 2. Slide (Up/Down/Left/Right)
Text slides in from a direction with optional fade.

```tsx
<AnimatedText
  text="Slide Up"
  animation="slideUp"
  animationConfig={{
    unit: "word",
    direction: "up",      // up | down | left | right
    distance: 30,         // Pixels to slide
    fade: true,           // Include fade effect
  }}
/>

// Or use direction-specific shortcuts
<AnimatedText animation="slideDown" ... />
<AnimatedText animation="slideLeft" ... />
<AnimatedText animation="slideRight" ... />
```

### 3. Flip Up (3D Rotation)
**The signature "Desktop Tool" animation!**

Characters flip up from flat (rotateX -90°) to upright (0°).

```tsx
<AnimatedText
  text="DESKTOP TOOL"
  animation="flipUp"
  animationConfig={{
    unit: "character",
    staggerInFrames: 2,
    durationInFrames: 20,
    fade: true,
  }}
  style={{
    fontSize: 96,
    fontWeight: 900,
    letterSpacing: '0.05em',
  }}
/>
```

### 4. 3D Rotate
Multiple 3D rotation axes.

```tsx
<AnimatedText
  text="Swing In"
  animation="rotate3D"
  animationConfig={{
    unit: "character",
    direction: "swingIn",  // flipUp | flipDown | swingIn | spinIn
    staggerInFrames: 2,
  }}
/>
```

**Directions:**
- `flipUp`: Rotate on X-axis from -90° (like cards flipping up)
- `flipDown`: Rotate on X-axis from +90° (like cards flipping down)
- `swingIn`: Rotate on Y-axis from 90° (like door opening)
- `spinIn`: Rotate on Z-axis from 180° (like spinning coin)

### 5. Scale (Zoom)
Text scales from small/large to normal size.

```tsx
<AnimatedText
  text="Zoom In"
  animation="scale"
  animationConfig={{
    unit: "whole",
    from: 0,              // Start small (zoom in)
    to: 1,                // End at normal size
    fade: true,
  }}
/>

// Zoom out effect
animationConfig={{
  from: 2,                // Start large
  to: 1,                  // End at normal
}}
```

### 6. Typewriter
Classic typing effect with optional blinking cursor.

```tsx
<AnimatedText
  text="Hello, World!"
  animation="typewriter"
  animationConfig={{
    staggerInFrames: 4,       // Frames per character
    cursor: true,             // Show blinking cursor
    cursorChar: "|",          // Cursor character
    cursorBlinkFrames: 15,    // Blink speed
  }}
/>
```

**Note:** Typewriter always uses character-level animation.

### 7. Blur
Text transitions from blurry to sharp (or vice versa).

```tsx
<AnimatedText
  text="Blur to Focus"
  animation="blur"
  animationConfig={{
    unit: "word",
    from: 20,             // Starting blur (px)
    to: 0,                // Ending blur (sharp)
    fade: true,           // Combine with fade
  }}
/>
```

## ⚙️ Configuration Options

### Animation Units

Control how text is split for animation:

- **`whole`**: Animate entire text as one block
- **`line`**: Animate line by line (for multi-line text)
- **`word`**: Animate word by word
- **`character`**: Animate character by character

```tsx
animationConfig={{
  unit: "character",
}}
```

### Timing

- **`staggerInFrames`**: Delay between each unit starting (default: 3)
- **`durationInFrames`**: How long each unit animates (default: 30)

```tsx
animationConfig={{
  staggerInFrames: 5,    // 5 frames between words
  durationInFrames: 25,  // Each word animates for 25 frames
}}
```

### Spring Physics

By default, animations use Remotion's spring physics for natural motion.

```tsx
animationConfig={{
  spring: {
    damping: 100,        // Higher = less bouncy
    stiffness: 200,      // Higher = faster
    mass: 1,             // Higher = more inertia
  },
}}
```

### Custom Easing

Override spring with custom easing curves:

```tsx
import { Easing } from '@/remotion/types/animations';

animationConfig={{
  easing: Easing.easeOutBounce,
}}
```

**Available Easing Functions:**
- `linear`
- `easeInQuad`, `easeOutQuad`, `easeInOutQuad`
- `easeInCubic`, `easeOutCubic`, `easeInOutCubic`
- `easeInExpo`, `easeOutExpo`, `easeInOutExpo`
- `easeInBack`, `easeOutBack`
- `easeInElastic`, `easeOutElastic`
- `easeInBounce`, `easeOutBounce`

## 🎯 Component Props

### AnimatedText Props

```tsx
interface AnimatedTextProps {
  // Required
  text: string;

  // Animation
  animation?: AnimationType;
  animationConfig?: AnimationConfig;

  // Styling
  style?: CSSProperties;           // Container styles
  segmentStyle?: CSSProperties;    // Individual segment styles
  className?: string;

  // Layout
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'center' | 'bottom';

  // Advanced
  renderSegment?: (content, style, index) => ReactNode;
}
```

### Preset Components

Pre-configured for common use cases:

```tsx
// Available presets
<FadeInText {...props} />
<SlideUpText {...props} />
<FlipUpText {...props} />
<TypewriterText {...props} />
<ScaleText {...props} />
```

## 📚 Advanced Usage

### Custom Segment Rendering

Take full control of how segments are rendered:

```tsx
<AnimatedText
  text="Custom Render"
  animation="fadeIn"
  animationConfig={{ unit: "character" }}
  renderSegment={(content, style, index) => (
    <span
      key={index}
      style={{
        ...style,
        color: `hsl(${index * 30}, 80%, 60%)`, // Rainbow effect
      }}
    >
      {content}
    </span>
  )}
/>
```

### Combining Animations

Use Remotion's `<Sequence>` to chain animations:

```tsx
<AbsoluteFill>
  {/* Title appears first */}
  <Sequence from={0} durationInFrames={60}>
    <FlipUpText
      text="TITLE"
      animationConfig={{ unit: "character" }}
      verticalAlign="top"
    />
  </Sequence>

  {/* Subtitle follows */}
  <Sequence from={30} durationInFrames={80}>
    <SlideUpText
      text="Subtitle text"
      verticalAlign="center"
    />
  </Sequence>

  {/* Call to action last */}
  <Sequence from={120} durationInFrames={60}>
    <ScaleText
      text="Take Action"
      verticalAlign="bottom"
    />
  </Sequence>
</AbsoluteFill>
```

### Using Animation Functions Directly

For maximum control, use the animation functions directly:

```tsx
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { textAnimations } from '@/remotion/animations/textAnimations';
import { splitText } from '@/remotion/utils/textSplitter';

export const CustomAnimation = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const result = textAnimations.flipUp(frame, fps, "Hello", {
    unit: "character",
    staggerInFrames: 2,
  });

  const segments = splitText("Hello", "character");

  return (
    <div>
      {Array.isArray(result) &&
        segments.map((segment, i) => {
          const { style, visible } = result[i];
          if (!visible) return null;
          return (
            <span key={i} style={style}>
              {segment.content}
            </span>
          );
        })}
    </div>
  );
};
```

## 🎬 Examples

See `src/remotion/examples/TextAnimationsExample.tsx` for comprehensive examples including:

- **FadeInExample**: All fade variations
- **SlideExample**: All slide directions
- **FlipUpExample**: 3D rotations including "Desktop Tool" style
- **ScaleExample**: Zoom in/out effects
- **TypewriterExample**: Typing effects with cursor
- **BlurExample**: Blur to focus transitions
- **CombinedExample**: Multiple animations in sequence
- **TextAnimationsDemo**: Master composition with all examples

### Running Examples

1. Import the example composition into your Remotion project
2. Register it with `registerRoot()`
3. Preview in Remotion Player or Studio

```tsx
// In your remotion.config.ts or Root.tsx
import { TextAnimationsDemo } from './remotion/examples/TextAnimationsExample';

<Composition
  id="TextAnimationsDemo"
  component={TextAnimationsDemo}
  durationInFrames={2100}  // 70 seconds at 30fps
  fps={30}
  width={1920}
  height={1080}
/>
```

## 📖 API Reference

### Text Splitting

```tsx
import { splitText, getSegmentDelay } from '@/remotion/utils/textSplitter';

// Split text into segments
const segments = splitText("Hello World", "word");
// Returns: [
//   { content: "Hello", index: 0, isSpace: false, position: 0 },
//   { content: " ", index: 1, isSpace: true, position: 5 },
//   { content: "World", index: 2, isSpace: false, position: 6 }
// ]

// Get animation start frame for a segment
const delay = getSegmentDelay(segment, 5, false);
```

### Animation Functions

All animation functions follow this signature:

```tsx
function animationName(
  frame: number,
  fps: number,
  text: string,
  config?: AnimationConfig
): AnimationResult
```

**Returns:**
- For `unit: "whole"`: Single `AnimationStyle` object
- For split units: Array of `AnimationStyle` objects

**AnimationStyle:**
```tsx
interface AnimationStyle {
  style: CSSProperties;  // Styles to apply
  visible: boolean;      // Whether to render this segment
}
```

## 🔧 TypeScript Support

Full type safety with autocomplete:

```tsx
import type {
  AnimationType,
  AnimationUnit,
  FadeAnimationConfig,
  SlideAnimationConfig,
  // ... and more
} from '@/remotion/types/animations';
```

## ⚡ Performance Tips

1. **Use appropriate units**: Character-level animation is more expensive than word/whole
2. **Optimize stagger**: Larger stagger = fewer concurrent animations
3. **Consider complexity**: 3D rotations are more expensive than fades
4. **Reuse components**: Define animation configs once, reuse multiple times

```tsx
// Good: Reuse config
const flipConfig = {
  unit: "character" as const,
  staggerInFrames: 2,
  durationInFrames: 20,
};

<FlipUpText text="Title 1" animationConfig={flipConfig} />
<FlipUpText text="Title 2" animationConfig={flipConfig} />
```

## 🎨 Styling Best Practices

### Font Rendering

For crisp text rendering:

```tsx
style={{
  fontSize: 72,
  fontWeight: 'bold',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
}}
```

### 3D Animations

For 3D rotations, ensure proper perspective:

```tsx
// Automatically applied by flipUp/rotate3D
transform: 'perspective(500px) rotateX(-90deg)'
```

### Text Shadows

Add depth to text:

```tsx
style={{
  color: '#fff',
  textShadow: '0 4px 20px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)',
}}
```

## 🚧 Future Enhancements (Not Yet Implemented)

The following animation types are planned but not yet implemented:

### Mask Reveal Animations
- Horizontal wipe
- Vertical wipe
- Circular expand

### Decoder/Matrix Effect
- Characters cycle through random letters
- Settle on correct character

### Exit Animations
- fadeOut
- slideOut (4 directions)
- scaleOut
- disintegrate (particle effect)

### In-Place Animations
- Glow/pulse (sine wave)
- Jitter/shake (random position)
- Wobble/wave (sine through text)
- Color change (cycling colors)

## 🤝 Contributing

This library is part of the MainCrewcutSite project. To add new animations:

1. Add type definitions to `src/remotion/types/animations.ts`
2. Implement animation function in `src/remotion/animations/textAnimations.ts`
3. Add to AnimatedText component mapping
4. Create example in `TextAnimationsExample.tsx`
5. Document in this README

## 📝 License

Part of the MainCrewcutSite project.

## 🙏 Credits

Built with:
- [Remotion](https://www.remotion.dev/) - Video rendering framework
- [React](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety

Inspired by:
- "Desktop Tool" video text animations
- Classic motion graphics techniques
- Modern web animation libraries

---

**Made with ❤️ for beautiful video text animations**
