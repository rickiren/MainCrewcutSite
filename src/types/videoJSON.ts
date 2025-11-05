// JSON-based video configuration types

export interface VideoJSONConfig {
  videoId: string;
  aspectRatio: string; // e.g., "16/9", "9/16", "1/1"
  fps: number;
  durationInFrames: number;
  globalSettings: {
    backgroundColor: string;
    primaryColor: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily: string;
  };
  scenes: VideoScene[];
}

export interface VideoScene {
  id: string;
  type: SceneType;
  durationInFrames: number;
  props: any; // Type varies by scene type
}

export type SceneType =
  | 'textReveal'
  | 'textWith3DBackground'
  | 'dashboardShowcase'
  | 'calendarFlip'
  | 'staticImageShowcase'
  | 'uiGrid'
  | 'statCard'
  | 'ctaButton'
  | 'simple3DText'; // Our existing 3D scene

// Scene-specific prop types

export interface TextRevealProps {
  textLines: Array<{ text: string; style?: string }>;
  animation: {
    type: 'fadeIn' | 'slideUp' | 'scale';
    staggerInFrames?: number;
  };
  effects?: {
    glow?: { color: string; radius: number };
    lensflare?: { color: string; opacity: number };
  };
}

export interface TextWith3DBackgroundProps {
  textLines: Array<{ text: string; style?: string }>;
  backgroundObjects?: Array<{
    textureUrl: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale?: [number, number, number];
  }>;
}

export interface DashboardShowcaseProps {
  textureUrl: string;
  cameraAnimation: {
    initialPosition: [number, number, number];
    finalPosition: [number, number, number];
    initialRotation: [number, number, number];
    finalRotation: [number, number, number];
  };
  overlayText?: {
    text: string;
    position: 'left' | 'right' | 'center' | 'top' | 'bottom';
  };
}

export interface CalendarFlipProps {
  text: string;
  pageCount: number;
  flipSpeed: number;
}

export interface StaticImageShowcaseProps {
  textureUrl: string;
  zoomEffect?: {
    start: number;
    end: number;
  };
  overlayText?: string;
}

export interface UIGridProps {
  centerText: string;
  textures: string[];
  cameraAnimation?: {
    type: 'dollyZoomIn' | 'dollyZoomOut' | 'orbit' | 'static';
  };
}

export interface StatCardProps {
  title: string;
  cards: Array<{
    label: string;
    value: string;
    gradient: [string, string];
  }>;
}

export interface CTAButtonProps {
  preText: string;
  buttonText: string;
  effect?: {
    type: 'wobble' | 'pulse' | 'glow';
    intensity?: number;
  };
}

// Validation helpers

export const validateVideoConfig = (config: any): config is VideoJSONConfig => {
  if (!config.videoId || typeof config.videoId !== 'string') return false;
  if (!config.aspectRatio || typeof config.aspectRatio !== 'string') return false;
  if (!config.fps || typeof config.fps !== 'number') return false;
  if (!config.durationInFrames || typeof config.durationInFrames !== 'number') return false;
  if (!config.globalSettings) return false;
  if (!Array.isArray(config.scenes)) return false;

  return config.scenes.every((scene: any) =>
    scene.id && scene.type && scene.durationInFrames && scene.props
  );
};

export const getAspectRatioDimensions = (aspectRatio: string, baseWidth = 1920): { width: number; height: number } => {
  const ratios: Record<string, { width: number; height: number }> = {
    '16/9': { width: 1920, height: 1080 },
    '9/16': { width: 1080, height: 1920 },
    '1/1': { width: 1080, height: 1080 },
    '4/5': { width: 1080, height: 1350 },
    '21/9': { width: 2560, height: 1080 },
  };

  return ratios[aspectRatio] || ratios['16/9'];
};
