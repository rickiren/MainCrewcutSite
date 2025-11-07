// Types for Kick Overlay Generator

export type OverlayElementType =
  | 'webcam'
  | 'chat'
  | 'alerts'
  | 'label'
  | 'image'
  | 'donation-goal'
  | 'subscriber-count'
  | 'follower-count'
  | 'recent-events'
  | 'custom-box';

export interface OverlayElement {
  id: string;
  type: OverlayElementType;
  label: string;
  position: {
    x: number; // percentage
    y: number; // percentage
  };
  size: {
    width: number; // percentage
    height: number; // percentage
  };
  style: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
    opacity?: number;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: number;
    textColor?: string;
    textAlign?: 'left' | 'center' | 'right';
    shadow?: {
      enabled: boolean;
      x: number;
      y: number;
      blur: number;
      color: string;
    };
  };
  content?: string; // For labels and custom text
  imageUrl?: string; // For image elements
  animation?: {
    enabled: boolean;
    type: 'none' | 'fade' | 'slide' | 'pulse' | 'bounce';
    duration?: number;
  };
  zIndex?: number;
}

export interface OverlayTheme {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
  defaultElementStyle: Partial<OverlayElement['style']>;
  previewElements?: OverlayElement[]; // Pre-configured elements for this theme
}

export interface OverlayConfig {
  id: string;
  name: string;
  description?: string;
  canvas: {
    width: number; // pixels
    height: number; // pixels
    backgroundColor: string;
    backgroundImage?: string;
    backgroundBlur?: number;
  };
  elements: OverlayElement[];
  theme: OverlayTheme;
  htmlTemplate?: string; // Raw HTML template for exact design preservation
  cssTemplate?: string; // Raw CSS template for exact design preservation
  metadata?: {
    createdAt: string;
    updatedAt: string;
    author?: string;
  };
}

export interface DecorativeElement {
  id: string;
  name: string;
  category: 'frame' | 'shape' | 'animation' | 'effect' | 'icon';
  thumbnail: string;
  url?: string; // For image-based elements
  svg?: string; // For SVG-based elements
  style?: Partial<OverlayElement['style']>;
}

// Preset themes
export const OVERLAY_THEMES: OverlayTheme[] = [
  {
    id: 'neon-cyberpunk',
    name: 'Neon Cyberpunk',
    description: 'Futuristic neon style with vibrant colors',
    colors: {
      primary: '#ff006e',
      secondary: '#8338ec',
      accent: '#00f5ff',
      background: 'rgba(10, 10, 35, 0.9)',
      text: '#ffffff',
      border: '#00f5ff',
    },
    fonts: {
      primary: 'Orbitron, sans-serif',
      secondary: 'Rajdhani, sans-serif',
    },
    defaultElementStyle: {
      borderWidth: 2,
      borderRadius: 8,
      borderStyle: 'solid',
      opacity: 0.95,
      shadow: {
        enabled: true,
        x: 0,
        y: 0,
        blur: 20,
        color: '#00f5ff',
      },
    },
  },
  {
    id: 'minimalist-dark',
    name: 'Minimalist Dark',
    description: 'Clean and simple dark theme',
    colors: {
      primary: '#ffffff',
      secondary: '#a0a0a0',
      accent: '#4a9eff',
      background: 'rgba(20, 20, 20, 0.85)',
      text: '#ffffff',
      border: '#404040',
    },
    fonts: {
      primary: 'Inter, sans-serif',
      secondary: 'Inter, sans-serif',
    },
    defaultElementStyle: {
      borderWidth: 1,
      borderRadius: 4,
      borderStyle: 'solid',
      opacity: 0.9,
      shadow: {
        enabled: true,
        x: 0,
        y: 4,
        blur: 12,
        color: 'rgba(0, 0, 0, 0.5)',
      },
    },
  },
  {
    id: 'gaming-pro',
    name: 'Gaming Pro',
    description: 'Bold gaming style with strong contrasts',
    colors: {
      primary: '#ff4655',
      secondary: '#ffd700',
      accent: '#00ff88',
      background: 'rgba(15, 15, 25, 0.9)',
      text: '#ffffff',
      border: '#ff4655',
    },
    fonts: {
      primary: 'Montserrat, sans-serif',
      secondary: 'Roboto, sans-serif',
    },
    defaultElementStyle: {
      borderWidth: 3,
      borderRadius: 12,
      borderStyle: 'solid',
      opacity: 0.95,
      shadow: {
        enabled: true,
        x: 0,
        y: 6,
        blur: 20,
        color: 'rgba(255, 70, 85, 0.6)',
      },
    },
  },
  {
    id: 'glass-modern',
    name: 'Glass Modern',
    description: 'Glassmorphic design with subtle transparency',
    colors: {
      primary: '#ffffff',
      secondary: '#e0e0e0',
      accent: '#667eea',
      background: 'rgba(255, 255, 255, 0.1)',
      text: '#ffffff',
      border: 'rgba(255, 255, 255, 0.3)',
    },
    fonts: {
      primary: 'Poppins, sans-serif',
      secondary: 'Poppins, sans-serif',
    },
    defaultElementStyle: {
      borderWidth: 1,
      borderRadius: 16,
      borderStyle: 'solid',
      opacity: 0.8,
      shadow: {
        enabled: true,
        x: 0,
        y: 8,
        blur: 32,
        color: 'rgba(0, 0, 0, 0.2)',
      },
    },
  },
];

// Default canvas sizes for streaming platforms
export const CANVAS_PRESETS = {
  '1080p': { width: 1920, height: 1080, name: '1080p (Full HD)' },
  '720p': { width: 1280, height: 720, name: '720p (HD)' },
  '4k': { width: 3840, height: 2160, name: '4K (Ultra HD)' },
  'vertical': { width: 1080, height: 1920, name: 'Vertical (Mobile)' },
};

// Element presets
export const ELEMENT_PRESETS: Record<OverlayElementType, Partial<OverlayElement>> = {
  webcam: {
    type: 'webcam',
    label: 'Webcam',
    size: { width: 20, height: 35 },
    position: { x: 75, y: 60 },
    style: {
      borderRadius: 12,
      borderWidth: 3,
      borderStyle: 'solid',
    },
  },
  chat: {
    type: 'chat',
    label: 'Chat',
    size: { width: 25, height: 60 },
    position: { x: 5, y: 35 },
    style: {
      borderRadius: 8,
      opacity: 0.9,
    },
  },
  alerts: {
    type: 'alerts',
    label: 'Alerts',
    size: { width: 30, height: 15 },
    position: { x: 35, y: 5 },
    style: {
      borderRadius: 12,
      opacity: 0.95,
    },
  },
  label: {
    type: 'label',
    label: 'Custom Label',
    content: 'Live on Kick',
    size: { width: 15, height: 5 },
    position: { x: 5, y: 5 },
    style: {
      fontSize: 24,
      fontWeight: 700,
      textAlign: 'center',
      borderRadius: 8,
    },
  },
  image: {
    type: 'image',
    label: 'Image',
    size: { width: 10, height: 10 },
    position: { x: 85, y: 5 },
    style: {
      borderRadius: 0,
      opacity: 1,
    },
  },
  'donation-goal': {
    type: 'donation-goal',
    label: 'Donation Goal',
    size: { width: 20, height: 8 },
    position: { x: 40, y: 85 },
    style: {
      borderRadius: 8,
      fontSize: 16,
    },
  },
  'subscriber-count': {
    type: 'subscriber-count',
    label: 'Subscriber Count',
    size: { width: 12, height: 6 },
    position: { x: 5, y: 85 },
    style: {
      borderRadius: 6,
      fontSize: 18,
      fontWeight: 600,
    },
  },
  'follower-count': {
    type: 'follower-count',
    label: 'Follower Count',
    size: { width: 12, height: 6 },
    position: { x: 18, y: 85 },
    style: {
      borderRadius: 6,
      fontSize: 18,
      fontWeight: 600,
    },
  },
  'recent-events': {
    type: 'recent-events',
    label: 'Recent Events',
    size: { width: 20, height: 25 },
    position: { x: 75, y: 10 },
    style: {
      borderRadius: 8,
      fontSize: 14,
    },
  },
  'custom-box': {
    type: 'custom-box',
    label: 'Custom Box',
    size: { width: 15, height: 15 },
    position: { x: 40, y: 40 },
    style: {
      borderRadius: 8,
      opacity: 0.8,
    },
  },
};
