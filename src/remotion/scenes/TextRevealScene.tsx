import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { TextRevealProps } from '@/types/videoJSON';

interface TextRevealSceneProps extends TextRevealProps {
  backgroundColor: string;
  primaryColor: string;
  fontFamily: string;
}

export const TextRevealScene: React.FC<TextRevealSceneProps> = ({
  textLines,
  animation,
  effects,
  backgroundColor,
  primaryColor,
  fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const stagger = animation.staggerInFrames || 5;

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {textLines.map((line, index) => {
        const startFrame = index * stagger;
        const progress = spring({
          frame: frame - startFrame,
          fps,
          config: {
            damping: 100,
            stiffness: 200,
          },
        });

        let opacity = 1;
        let translateY = 0;
        let scale = 1;

        if (animation.type === 'fadeIn') {
          opacity = interpolate(progress, [0, 1], [0, 1]);
        } else if (animation.type === 'slideUp') {
          opacity = interpolate(progress, [0, 1], [0, 1]);
          translateY = interpolate(progress, [0, 1], [50, 0]);
        } else if (animation.type === 'scale') {
          opacity = interpolate(progress, [0, 1], [0, 1]);
          scale = interpolate(progress, [0, 1], [0.5, 1]);
        }

        const textStyle =
          line.style === 'metallic'
            ? {
                background: `linear-gradient(135deg, ${primaryColor}, #ffffff, ${primaryColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 20px rgba(147, 51, 234, 0.5))',
              }
            : {
                color: '#ffffff',
              };

        const glowStyle = effects?.glow
          ? {
              textShadow: `0 0 ${effects.glow.radius}px ${effects.glow.color}`,
            }
          : {};

        return (
          <div
            key={index}
            style={{
              opacity,
              transform: `translateY(${translateY}px) scale(${scale})`,
              fontSize: '72px',
              fontWeight: 'bold',
              fontFamily,
              textAlign: 'center',
              ...textStyle,
              ...glowStyle,
            }}
          >
            {line.text}
          </div>
        );
      })}

      {/* Lens flare effect */}
      {effects?.lensflare && (
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            width: '400px',
            height: '400px',
            background: `radial-gradient(circle, ${effects.lensflare.color} 0%, transparent 70%)`,
            opacity: effects.lensflare.opacity,
            filter: 'blur(50px)',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}
        />
      )}
    </AbsoluteFill>
  );
};
