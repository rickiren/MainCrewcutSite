import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ScriptLine, VideoStyle } from '@/types/video';
import { Scene3DPerspective } from './Scene3DPerspective';
import { ParticleEffectScene } from './scenes/ParticleEffectScene';
import { GlitchTransitionScene } from './scenes/GlitchTransitionScene';

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

  // Render main scene content
  let mainContent: React.ReactNode;

  if (style.sceneType === '3d') {
    mainContent = (
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
  } else {
    mainContent = (
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
  }

  // Apply global effects as overlays
  const effects = style.globalEffects;

  return (
    <AbsoluteFill>
      {/* Main content */}
      {mainContent}

      {/* Particle Effect Overlay */}
      {effects?.particles?.enabled && (
        <ParticleEffectScene
          type={effects.particles.type}
          count={effects.particles.count}
          colors={effects.particles.colors || [style.accentColor, style.primaryColor, style.secondaryColor]}
          speed={effects.particles.speed}
          size={{ min: 2, max: 8 }}
          direction="down"
          gravity={true}
          rotation={true}
          backgroundColor="transparent"
        />
      )}

      {/* Glitch Effect Overlay */}
      {effects?.glitch?.enabled && (
        <GlitchTransitionScene
          intensity={effects.glitch.intensity}
          layers={3}
          rgbSplit={effects.glitch.rgbSplit}
          scanLines={effects.glitch.scanLines}
          staticNoise={true}
          displacementAmount={10}
          backgroundColor="transparent"
        />
      )}

      {/* Film Grain Effect */}
      {effects?.film?.enabled && (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          {/* Film grain */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              opacity: effects.film.grainIntensity,
              mixBlendMode: 'overlay',
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
            }}
          />

          {/* Vignette */}
          {effects.film.vignette && (
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle, transparent 0%, transparent 50%, rgba(0,0,0,0.6) 100%)',
              }}
            />
          )}
        </AbsoluteFill>
      )}

      {/* Neon Glow Effect (applied to entire composition) */}
      {effects?.neon?.enabled && (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              opacity: effects.neon.flickerEffect ? (Math.random() > 0.95 ? 0.3 : 1) : 1,
              boxShadow: `inset 0 0 ${effects.neon.glowIntensity * 2}px ${style.accentColor}`,
              mixBlendMode: 'screen',
            }}
          />
        </AbsoluteFill>
      )}
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
