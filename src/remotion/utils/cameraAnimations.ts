import { interpolate } from 'remotion';

export interface CameraAnimationConfig {
  type: 'zoom' | 'pan' | 'rotate' | 'orbit' | 'dolly' | 'combined';
  intensity?: number;
  direction?: 'in' | 'out' | 'left' | 'right' | 'up' | 'down';
  startFrame?: number;
  duration?: number;
  enabled?: boolean;
}

export interface CameraTransform {
  scale: number;
  translateX: number;
  translateY: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
}

/**
 * Creates continuous camera motion animations
 * Returns transform values for continuous motion
 */
export const getCameraAnimation = (
  frame: number,
  lineDuration: number,
  fps: number,
  config: CameraAnimationConfig = { type: 'combined', enabled: true }
): CameraTransform => {
  if (!config.enabled) {
    return { scale: 1, translateX: 0, translateY: 0, rotateX: 0, rotateY: 0, rotateZ: 0 };
  }

  const normalizedFrame = frame / (lineDuration * fps);

  const {
    type = 'combined',
    intensity = 1,
    direction = 'in',
  } = config;

  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let rotateX = 0;
  let rotateY = 0;
  let rotateZ = 0;

  // Continuous subtle zoom in/out
  if (type === 'zoom' || type === 'combined') {
    const zoomCycle = Math.sin(normalizedFrame * Math.PI * 2) * 0.1 * intensity;
    scale = 1 + zoomCycle;
  }

  // Continuous panning
  if (type === 'pan' || type === 'combined') {
    const panX = Math.sin(normalizedFrame * Math.PI * 1.5) * 20 * intensity;
    const panY = Math.cos(normalizedFrame * Math.PI * 1.2) * 15 * intensity;
    translateX = panX;
    translateY = panY;
  }

  // Continuous rotation (orbit effect)
  if (type === 'orbit' || type === 'combined') {
    rotateX = Math.sin(normalizedFrame * Math.PI * 0.8) * 3 * intensity;
    rotateY = Math.cos(normalizedFrame * Math.PI * 0.6) * 5 * intensity;
    rotateZ = Math.sin(normalizedFrame * Math.PI * 0.4) * 2 * intensity;
  }

  // Dolly effect (zoom with translate)
  if (type === 'dolly') {
    const dollyProgress = normalizedFrame;
    scale = 1 + Math.sin(dollyProgress * Math.PI) * 0.15 * intensity;
    // Note: translateZ doesn't work in 2D transforms, using scale instead
  }

  return {
    scale,
    translateX,
    translateY,
    rotateX,
    rotateY,
    rotateZ,
  };
};

/**
 * Creates smooth transition between lines
 * Applies camera movement during transition
 */
export const getLineTransition = (
  currentFrame: number,
  lineStartFrame: number,
  lineDuration: number,
  fps: number,
  transitionDuration: number = 0.5, // in seconds
  transitionType: 'zoom' | 'slide' | 'rotate' | 'fade' = 'zoom'
): CameraTransform & { opacity: number } => {
  const transitionFrames = transitionDuration * fps;
  const frameInLine = currentFrame - lineStartFrame;

  // Transition in (first part of line)
  const transitionIn = Math.min(frameInLine / transitionFrames, 1);
  // Transition out (last part of line)
  const transitionOut = Math.max(
    (lineDuration * fps - frameInLine) / transitionFrames,
    0
  );

  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let rotateX = 0;
  let rotateY = 0;
  let rotateZ = 0;
  let opacity = 1;

  if (transitionType === 'zoom') {
    // Zoom in at start, zoom out at end
    const zoomIn = interpolate(transitionIn, [0, 1], [0.8, 1], {
      extrapolateRight: 'clamp',
    });
    const zoomOut = interpolate(transitionOut, [0, 1], [1, 1.2], {
      extrapolateLeft: 'clamp',
    });
    scale = zoomIn * zoomOut;
  }

  if (transitionType === 'slide') {
    // Slide in from side, slide out to opposite side
    translateX = interpolate(transitionIn, [0, 1], [-100, 0], {
      extrapolateRight: 'clamp',
    });
    translateX += interpolate(transitionOut, [0, 1], [0, 100], {
      extrapolateLeft: 'clamp',
    });
  }

  if (transitionType === 'rotate') {
    // Rotate in, rotate out
    rotateY = interpolate(transitionIn, [0, 1], [-30, 0], {
      extrapolateRight: 'clamp',
    });
    rotateY += interpolate(transitionOut, [0, 1], [0, 30], {
      extrapolateLeft: 'clamp',
    });
  }

  // Fade effect
  opacity = interpolate(transitionIn, [0, 1], [0, 1], {
    extrapolateRight: 'clamp',
  });
  opacity *= interpolate(transitionOut, [0, 1], [1, 0], {
    extrapolateLeft: 'clamp',
  });

  return {
    scale,
    translateX,
    translateY,
    rotateX,
    rotateY,
    rotateZ,
    opacity,
  };
};

