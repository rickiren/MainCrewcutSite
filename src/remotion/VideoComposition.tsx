import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ScriptLine, VideoStyle } from '@/types/video';
import { Scene3DPerspective } from './Scene3DPerspective';

interface VideoCompositionProps {
  scriptLines: ScriptLine[];
  style: VideoStyle;
}

export const VideoComposition: React.FC<VideoCompositionProps> = ({ scriptLines, style }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  let currentFrame = 0;
  let currentLineIndex = -1;
  let framesSinceLineStart = 0;

  // Find which line should be displayed at current frame
  for (let i = 0; i < scriptLines.length; i++) {
    const lineDurationInFrames = scriptLines[i].duration * fps;
    if (frame >= currentFrame && frame < currentFrame + lineDurationInFrames) {
      currentLineIndex = i;
      framesSinceLineStart = frame - currentFrame;
      break;
    }
    currentFrame += lineDurationInFrames;
  }

  if (currentLineIndex === -1) {
    return <AbsoluteFill style={{ backgroundColor: '#000' }} />;
  }

  const currentLine = scriptLines[currentLineIndex];
  const lineDurationInFrames = currentLine.duration * fps;

  // Use 3D scene if sceneType is '3d'
  if (style.sceneType === '3d') {
    return (
      <Scene3DPerspective
        text={currentLine.text}
        frame={framesSinceLineStart}
        duration={lineDurationInFrames}
        fps={fps}
        primaryColor={style.primaryColor}
        secondaryColor={style.secondaryColor}
        accentColor={style.accentColor}
        textColor={style.textColor}
        animationSpeed={style.animationSpeed}
      />
    );
  }

  // Otherwise use 2D scene
  return (
    <AbsoluteFill>
      {style.backgroundStyle === '3d-cards' ? (
        <Background3DCards frame={framesSinceLineStart} fps={fps} colors={style} />
      ) : style.backgroundStyle === 'gradient' ? (
        <BackgroundGradient colors={style} />
      ) : (
        <BackgroundSolid color={style.primaryColor} />
      )}

      <AnimatedTextScene
        text={currentLine.text}
        frame={framesSinceLineStart}
        duration={lineDurationInFrames}
        fps={fps}
        style={style}
      />
    </AbsoluteFill>
  );
};

// 3D Perspective Background with Animated Cards
const Background3DCards: React.FC<{
  frame: number;
  fps: number;
  colors: VideoStyle;
}> = ({ frame, fps, colors }) => {
  const cards = Array.from({ length: 8 });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${colors.primaryColor} 0%, ${colors.secondaryColor} 100%)`,
        perspective: '1000px',
      }}
    >
      {cards.map((_, i) => {
        const delay = i * 3;
        const progress = spring({
          frame: frame - delay,
          fps,
          config: {
            damping: 100,
            stiffness: 200,
            mass: 1,
          },
        });

        const rotateY = interpolate(progress, [0, 1], [-15, 15]);
        const translateZ = interpolate(progress, [0, 1], [-100, 100]);
        const opacity = interpolate(progress, [0, 0.3, 0.7, 1], [0, 0.6, 0.6, 0]);

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '300px',
              height: '200px',
              left: `${(i % 4) * 25}%`,
              top: `${Math.floor(i / 4) * 40}%`,
              background: colors.accentColor,
              borderRadius: '20px',
              transform: `rotateY(${rotateY}deg) translateZ(${translateZ}px)`,
              opacity,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Gradient Background
const BackgroundGradient: React.FC<{ colors: VideoStyle }> = ({ colors }) => {
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${colors.primaryColor} 0%, ${colors.secondaryColor} 50%, ${colors.accentColor} 100%)`,
      }}
    />
  );
};

// Solid Background
const BackgroundSolid: React.FC<{ color: string }> = ({ color }) => {
  return <AbsoluteFill style={{ backgroundColor: color }} />;
};

// Animated Text Scene with Spring Physics
const AnimatedTextScene: React.FC<{
  text: string;
  frame: number;
  duration: number;
  fps: number;
  style: VideoStyle;
}> = ({ text, frame, duration, fps, style }) => {
  // Entry animation
  const entryProgress = spring({
    frame,
    fps,
    config: {
      damping: 100 / style.animationSpeed,
      stiffness: 200 * style.animationSpeed,
      mass: 1,
    },
  });

  // Exit animation
  const exitStartFrame = duration - fps * 0.5; // Start exit 0.5s before end
  const exitProgress = spring({
    frame: frame - exitStartFrame,
    fps,
    config: {
      damping: 100,
      stiffness: 300,
    },
  });

  const scale = frame > exitStartFrame
    ? interpolate(exitProgress, [0, 1], [1, 0.8])
    : interpolate(entryProgress, [0, 1], [0.5, 1]);

  const opacity = frame > exitStartFrame
    ? interpolate(exitProgress, [0, 1], [1, 0])
    : interpolate(entryProgress, [0, 1], [0, 1]);

  const translateY = frame > exitStartFrame
    ? interpolate(exitProgress, [0, 1], [0, -50])
    : interpolate(entryProgress, [0, 1], [50, 0]);

  // Split text into words for gradient highlighting
  const words = text.split(' ');
  const wordDelay = 3; // frames between each word appearing

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          transform: `scale(${scale}) translateY(${translateY}px)`,
          opacity,
          textAlign: 'center',
          fontFamily: style.fontFamily,
          fontSize: '72px',
          fontWeight: 'bold',
          lineHeight: 1.3,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '16px',
          maxWidth: '90%',
        }}
      >
        {words.map((word, i) => {
          const wordProgress = spring({
            frame: frame - i * wordDelay,
            fps,
            config: {
              damping: 100,
              stiffness: 200,
            },
          });

          const wordOpacity = interpolate(wordProgress, [0, 1], [0, 1]);
          const wordScale = interpolate(wordProgress, [0, 1], [0.8, 1]);

          // Use gradient or solid text based on style
          const textStyleProps = style.textStyle === 'gradient'
            ? {
                background: `linear-gradient(135deg, ${style.accentColor}, ${style.secondaryColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                // Add fallback text shadow for depth even with gradient
                filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))',
              }
            : {
                color: style.textColor,
                textShadow: '0 4px 20px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4), 0 0 1px rgba(0,0,0,0.8)',
              };

          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                opacity: wordOpacity,
                transform: `scale(${wordScale})`,
                fontWeight: 'bold',
                ...textStyleProps,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
