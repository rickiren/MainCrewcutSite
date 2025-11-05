// Comprehensive video scene types and props

// ============================================
// TEXT EFFECTS
// ============================================

export interface TextHighlightProps {
  segments: Array<{
    text: string;
    style?: 'regular' | 'gradient' | 'metallic' | 'glow';
    color?: string;
    gradient?: [string, string];
    animation?: {
      type: 'fadeIn' | 'slideUp' | 'scale' | 'rotate';
      delay?: number;
    };
  }>;
  layout?: 'horizontal' | 'vertical' | 'center';
}

export interface KineticTextProps {
  words: Array<{
    text: string;
    startPosition: [number, number]; // x, y percentages
    endPosition: [number, number];
    path?: 'straight' | 'curved' | 'bounce';
    delay?: number;
  }>;
  physics?: {
    gravity?: number;
    velocity?: number;
    bounce?: number;
  };
}

export interface Text3DProps {
  text: string;
  depth: number; // Extrusion depth
  material?: {
    type: 'standard' | 'metallic' | 'glass';
    color: string;
    roughness?: number;
    metalness?: number;
  };
  rotation?: {
    x: number;
    y: number;
    z: number;
  };
  cameraAnimation?: {
    orbit?: boolean;
    zoom?: boolean;
  };
}

export interface TextPathProps {
  text: string;
  pathType: 'circle' | 'wave' | 'spiral' | 'custom';
  pathData?: string; // SVG path data for custom
  radius?: number; // For circle
  amplitude?: number; // For wave
  animateProgress?: boolean;
}

// ============================================
// 3D/CAMERA EFFECTS
// ============================================

export interface ProductShowcaseProps {
  modelUrl?: string; // 3D model file
  fallbackColor?: string; // Color if no model
  rotation: {
    axis: 'x' | 'y' | 'z' | 'all';
    speed: number;
    bounceBack?: boolean;
  };
  lighting?: {
    ambient: number;
    directional: number;
    spotlights?: Array<{
      position: [number, number, number];
      color: string;
      intensity: number;
    }>;
  };
  cameraPath?: Array<{
    position: [number, number, number];
    lookAt: [number, number, number];
    duration: number;
  }>;
}

export interface Environment3DProps {
  objects: Array<{
    type: 'sphere' | 'box' | 'cylinder' | 'plane' | 'custom';
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
    color: string;
    material?: 'standard' | 'glass' | 'metal';
    animation?: {
      type: 'rotate' | 'float' | 'scale' | 'none';
      speed?: number;
    };
  }>;
  cameraPath: Array<{
    position: [number, number, number];
    lookAt: [number, number, number];
    frameDuration: number;
  }>;
  environmentLighting?: {
    skyColor: string;
    groundColor: string;
    ambientIntensity: number;
  };
}

// ============================================
// DATA VISUALIZATION
// ============================================

export interface ChartAnimatedProps {
  type: 'bar' | 'line' | 'pie' | 'area' | 'donut';
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  animationDuration?: number;
  gridLines?: boolean;
  showValues?: boolean;
  maxValue?: number;
}

export interface CounterProps {
  value: number;
  startValue?: number;
  duration: number; // in frames
  format?: 'number' | 'currency' | 'percentage' | 'decimal';
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label?: string;
  fontSize?: number;
}

export interface TimelineProps {
  events: Array<{
    date: string;
    title: string;
    description?: string;
    icon?: string;
    color?: string;
  }>;
  orientation?: 'horizontal' | 'vertical';
  animateProgress?: boolean;
  highlightCurrent?: boolean;
}

export interface ProgressBarProps {
  type: 'linear' | 'circular' | 'ring' | 'multi';
  progress: number; // 0-100
  bars?: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  thickness?: number;
  showPercentage?: boolean;
  animationCurve?: 'linear' | 'easeIn' | 'easeOut' | 'spring';
}

export interface MapAnimationProps {
  mapImageUrl: string;
  paths?: Array<{
    points: Array<[number, number]>; // lat, long or x, y
    color: string;
    thickness: number;
    animateDraw: boolean;
  }>;
  markers?: Array<{
    position: [number, number];
    label: string;
    icon?: string;
    pulseEffect?: boolean;
  }>;
  zoomSequence?: Array<{
    center: [number, number];
    scale: number;
    duration: number;
  }>;
}

// ============================================
// TRANSITIONS
// ============================================

export interface MorphTransitionProps {
  fromShape: 'circle' | 'square' | 'triangle' | 'custom';
  toShape: 'circle' | 'square' | 'triangle' | 'custom';
  customFrom?: string; // SVG path
  customTo?: string; // SVG path
  color: string;
  morphStyle?: 'smooth' | 'liquid' | 'elastic';
}

export interface WipeRevealProps {
  direction: 'left' | 'right' | 'top' | 'bottom' | 'circular' | 'diagonal';
  revealContent?: string; // Text or image
  maskShape?: 'rectangle' | 'circle' | 'custom';
  customMask?: string; // SVG path
  featherEdge?: boolean;
}

export interface ShatterTransitionProps {
  pieceCount: number;
  explosionForce: number;
  gravity: boolean;
  rotateShards: boolean;
  fadeOut: boolean;
  shatterPattern?: 'random' | 'grid' | 'radial';
}

export interface GlitchTransitionProps {
  intensity: number; // 0-1
  layers: number;
  rgbSplit: boolean;
  scanLines: boolean;
  staticNoise: boolean;
  displacementAmount?: number;
}

export interface ZoomThroughProps {
  targetElement?: string; // What to zoom through
  startScale: number;
  endScale: number;
  rotationAmount?: number;
  tunnelEffect?: boolean;
  portalColor?: string;
}

export interface DisplacementTransitionProps {
  type: 'wave' | 'ripple' | 'vortex' | 'texture';
  intensity: number;
  frequency?: number;
  textureUrl?: string;
  direction?: 'horizontal' | 'vertical' | 'radial';
}

export interface RotationTransitionProps {
  type: 'cube' | 'flip' | 'carousel' | 'book';
  axis: 'x' | 'y' | 'z';
  speed: number;
  faces?: number; // For carousel
  perspective?: number;
}

// ============================================
// CTA (Call to Action)
// ============================================

export interface CTAFormProps {
  title: string;
  fields: Array<{
    placeholder: string;
    type: 'text' | 'email' | 'phone';
    icon?: string;
  }>;
  submitButton: {
    text: string;
    color: string;
  };
  animateFields?: boolean;
  staggerDelay?: number;
}

export interface CTAQRCodeProps {
  url: string;
  size?: number;
  backgroundColor?: string;
  foregroundColor?: string;
  scanAnimation?: boolean;
  instructionText?: string;
  logoUrl?: string; // Center logo
}

// ============================================
// VISUAL EFFECTS
// ============================================

export interface ParticleEffectProps {
  type: 'confetti' | 'snow' | 'rain' | 'floating' | 'abstract';
  count: number;
  colors?: string[];
  speed: number;
  size: {
    min: number;
    max: number;
  };
  direction?: 'up' | 'down' | 'random';
  gravity?: boolean;
  rotation?: boolean;
}

export interface LightRaysProps {
  type: 'godRays' | 'spotlight' | 'beams';
  rayCount?: number;
  origin: [number, number]; // x, y percentages
  color: string;
  opacity: number;
  length: number;
  angle: number;
  animated?: boolean;
  pulseSpeed?: number;
}

export interface LogoRevealProps {
  logoUrl: string;
  revealStyle: 'fade' | 'wipe' | 'build' | 'morph' | 'particles';
  backgroundColor?: string;
  glowColor?: string;
  holdDuration?: number; // Frames to hold logo
  soundEffect?: boolean;
}

export interface LoadingAnimationProps {
  type: 'spinner' | 'dots' | 'bars' | 'progress' | 'custom';
  color: string;
  size: number;
  speed: number;
  text?: string;
  technicalStyle?: boolean; // Hacker/terminal aesthetic
}

export interface HologramEffectProps {
  targetContent: string; // Text or image
  scanLineCount: number;
  scanSpeed: number;
  flickerIntensity: number; // 0-1
  baseOpacity: number; // 0-1
  glitchFrequency?: number;
  color?: string;
}

export interface ParallaxLayersProps {
  layers: Array<{
    content: string; // Image URL or color
    depth: number; // Lower = background, higher = foreground
    speed: number; // Multiplier for movement
    blur?: number;
  }>;
  cameraMovement: {
    horizontal: number;
    vertical: number;
  };
}

export interface BokehEffectProps {
  focalPoint: [number, number]; // x, y percentages
  blurIntensity: number;
  bokehShapes?: 'circle' | 'hexagon' | 'octagon';
  lightPositions?: Array<[number, number]>;
  lightColors?: string[];
  depthOfField: number;
}

export interface FilmEffectProps {
  grainIntensity: number; // 0-1
  vignette: {
    intensity: number;
    size: number;
  };
  colorGrading?: {
    temperature: number; // -1 to 1
    tint: number; // -1 to 1
    contrast: number; // 0-2
    saturation: number; // 0-2
  };
  lensDistortion?: number;
  scratches?: boolean;
  dustSpots?: boolean;
}

export interface NeonEffectProps {
  elements: Array<{
    type: 'text' | 'shape' | 'line';
    content: string;
    color: string;
    thickness: number;
    glowIntensity: number;
    position?: [number, number];
  }>;
  flickerEffect?: boolean;
  pulseEffect?: boolean;
  trailEffect?: boolean;
}

export interface MirrorEffectProps {
  type: 'mirror' | 'kaleidoscope' | 'duplicate';
  axis?: 'horizontal' | 'vertical' | 'both';
  segments?: number; // For kaleidoscope
  sourceContent: string; // Image or video
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay';
}

// ============================================
// Extended existing types
// ============================================

export interface TextRevealPropsExtended {
  textLines: Array<{ text: string; style?: string }>;
  animation: {
    type: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'zoomIn' | 'zoomOut' | 'rotateIn' | 'typewriter' | 'characterStagger';
    staggerInFrames?: number;
    typewriterSpeed?: number; // Characters per frame
  };
  effects?: {
    glow?: { color: string; radius: number };
    lensflare?: { color: string; opacity: number };
    shadow?: { color: string; blur: number; offset: [number, number] };
  };
}
