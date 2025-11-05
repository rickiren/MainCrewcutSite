import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CTAButtonProps } from '@/types/videoJSON';

interface CTAButtonSceneProps extends CTAButtonProps {
  backgroundColor: string;
  primaryColor: string;
  fontFamily: string;
}

export const CTAButtonScene: React.FC<CTAButtonSceneProps> = ({
  preText,
  buttonText,
  effect,
  backgroundColor,
  primaryColor,
  fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Text animation
  const textProgress = spring({
    frame,
    fps,
    config: {
      damping: 100,
      stiffness: 200,
    },
  });

  const textOpacity = interpolate(textProgress, [0, 1], [0, 1]);
  const textY = interpolate(textProgress, [0, 1], [30, 0]);

  // Button animation
  const buttonProgress = spring({
    frame: frame - 15,
    fps,
    config: {
      damping: 100,
      stiffness: 200,
    },
  });

  const buttonOpacity = interpolate(buttonProgress, [0, 1], [0, 1]);
  const buttonScale = interpolate(buttonProgress, [0, 1], [0.8, 1]);

  // Effect animations
  let effectTransform = '';
  if (effect?.type === 'wobble') {
    const intensity = effect.intensity || 0.02;
    const wobble = Math.sin((frame / fps) * Math.PI * 2) * intensity;
    effectTransform = `rotate(${wobble}rad)`;
  } else if (effect?.type === 'pulse') {
    const intensity = effect.intensity || 0.1;
    const pulse = 1 + Math.sin((frame / fps) * Math.PI * 4) * intensity;
    effectTransform = `scale(${pulse})`;
  }

  const glowIntensity = effect?.type === 'glow'
    ? Math.sin((frame / fps) * Math.PI * 3) * 0.5 + 0.5
    : 1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '40px',
      }}
    >
      {/* Pre-text */}
      <div
        style={{
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
          fontSize: '36px',
          fontWeight: '600',
          color: '#ffffff',
          fontFamily,
          textAlign: 'center',
          maxWidth: '800px',
        }}
      >
        {preText}
      </div>

      {/* CTA Button */}
      <div
        style={{
          opacity: buttonOpacity,
          transform: `scale(${buttonScale}) ${effectTransform}`,
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, #ec4899)`,
            padding: '24px 64px',
            borderRadius: '16px',
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#ffffff',
            fontFamily,
            cursor: 'pointer',
            boxShadow: `0 20px 60px rgba(147, 51, 234, ${0.4 * glowIntensity})`,
            border: '2px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {buttonText}
        </div>
      </div>

      {/* Glow effect background */}
      {effect?.type === 'glow' && (
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
            opacity: 0.3 * glowIntensity,
            filter: 'blur(80px)',
            pointerEvents: 'none',
          }}
        />
      )}
    </AbsoluteFill>
  );
};
