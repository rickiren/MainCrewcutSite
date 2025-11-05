// Video generator types

export interface ScriptLine {
  id: string;
  text: string;
  duration: number; // in seconds
  sceneType?: 'text' | 'textHighlight' | 'counter' | 'chart' | 'cta';
  sceneProps?: any; // Scene-specific properties
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
