// Video generator types

/**
 * Text animation type for script lines
 */
export type TextAnimationType =
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

/**
 * Animation unit - how text is split for animation
 */
export type TextAnimationUnit = 'whole' | 'line' | 'word' | 'character';

/**
 * Per-line animation configuration
 */
export interface LineAnimationConfig {
  type: TextAnimationType;
  unit: TextAnimationUnit;
  staggerInFrames?: number;
  durationInFrames?: number;
  // Animation-specific options
  direction?: 'up' | 'down' | 'left' | 'right' | 'flipUp' | 'flipDown' | 'swingIn' | 'spinIn';
  distance?: number;
  fade?: boolean;
  from?: number;
  to?: number;
  cursor?: boolean;
}

export interface ScriptLine {
  id: string;
  text: string;
  duration: number; // in seconds
  sceneType?: 'text' | 'textHighlight' | 'counter' | 'chart' | 'cta' | 'uiMockup';
  sceneProps?: any; // Scene-specific properties

  // Text animation configuration
  animation?: LineAnimationConfig;
}

export interface VideoStyle {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  animationSpeed: number; // 0.5 - 2.0
  backgroundStyle: '3d-cards' | 'gradient' | 'solid';
  textStyle: 'solid' | 'gradient';
  textColor: string;
  sceneType: '2d' | '3d'; // Toggle between 2D and 3D scenes

  // Default text animation (applies to lines without custom animation)
  defaultAnimation?: LineAnimationConfig;

  // Camera animation settings
  cameraAnimation?: {
    enabled: boolean;
    type: 'zoom' | 'pan' | 'rotate' | 'orbit' | 'dolly' | 'combined';
    intensity?: number;
    transitionType?: 'zoom' | 'slide' | 'rotate' | 'fade';
  };

  // Text style settings
  textStyle?: 'solid' | 'gradient' | 'neon' | 'neonMulti';
  neonConfig?: {
    glowColor: string;
    glowIntensity?: number;
    secondaryGlowColor?: string;
    outline?: boolean;
  };

  // Global effects
  globalEffects?: {
    particles?: {
      enabled: boolean;
      type: 'confetti' | 'snow' | 'rain' | 'floating';
      count: number;
      colors?: string[];
      speed: number;
    };
    glitch?: {
      enabled: boolean;
      intensity: number;
      rgbSplit: boolean;
      scanLines: boolean;
    };
    neon?: {
      enabled: boolean;
      glowIntensity: number;
      flickerEffect: boolean;
    };
    film?: {
      enabled: boolean;
      grainIntensity: number;
      vignette: boolean;
    };
  };
}

export interface VideoFormat {
  name: string;
  width: number;
  height: number;
  fps: number;
}

export const VIDEO_FORMATS: Record<string, VideoFormat> = {
  'instagram-reel': {
    name: 'Instagram Reel',
    width: 1080,
    height: 1920,
    fps: 30,
  },
  'square': {
    name: 'Square',
    width: 1080,
    height: 1080,
    fps: 30,
  },
  'youtube': {
    name: 'YouTube',
    width: 1920,
    height: 1080,
    fps: 30,
  },
};

export interface RenderProgress {
  isRendering: boolean;
  progress: number; // 0-100
  currentFrame: number;
  totalFrames: number;
}
