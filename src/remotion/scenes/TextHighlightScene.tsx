import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { TextHighlightProps } from '@/types/videoJSONExtended';

interface TextHighlightSceneProps extends TextHighlightProps {
  backgroundColor: string;
  primaryColor: string;
  fontFamily: string;
}

export const TextHighlightScene: React.FC<TextHighlightSceneProps> = ({
  segments,
  layout = 'center',
  backgroundColor,
  primaryColor,
  fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: layout === 'vertical' ? 'column' : 'row',
        gap: layout === 'horizontal' ? '20px' : '10px',
        padding: '80px',
        flexWrap: 'wrap',
      }}
    >
      {segments.map((segment, index) => {
        const delay = segment.animation?.delay || index * 5;
        const progress = spring({
          frame: frame - delay,
          fps,
          config: {
            damping: 100,
            stiffness: 200,
          },
        });

        let transform = '';
        let opacity = 1;

        if (segment.animation?.type === 'fadeIn') {
          opacity = interpolate(progress, [0, 1], [0, 1]);
        } else if (segment.animation?.type === 'slideUp') {
          opacity = interpolate(progress, [0, 1], [0, 1]);
          const translateY = interpolate(progress, [0, 1], [50, 0]);
          transform = `translateY(${translateY}px)`;
        } else if (segment.animation?.type === 'scale') {
          opacity = interpolate(progress, [0, 1], [0, 1]);
          const scale = interpolate(progress, [0, 1], [0.5, 1]);
          transform = `scale(${scale})`;
        } else if (segment.animation?.type === 'rotate') {
          opacity = interpolate(progress, [0, 1], [0, 1]);
          const rotate = interpolate(progress, [0, 1], [180, 0]);
          transform = `rotate(${rotate}deg)`;
        }

        // Style based on segment style
        let textStyle: React.CSSProperties = {
          color: segment.color || '#ffffff',
        };

        if (segment.style === 'gradient' && segment.gradient) {
          textStyle = {
            background: `linear-gradient(135deg, ${segment.gradient[0]}, ${segment.gradient[1]})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          };
        } else if (segment.style === 'metallic') {
          textStyle = {
            background: `linear-gradient(135deg, ${primaryColor}, #ffffff, ${primaryColor})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))',
          };
        } else if (segment.style === 'glow') {
          textStyle = {
            color: segment.color || '#ffffff',
            textShadow: `0 0 40px ${segment.color || primaryColor}, 0 0 20px ${segment.color || primaryColor}`,
          };
        }

        return (
          <span
            key={index}
            style={{
              opacity,
              transform,
              fontSize: '72px',
              fontWeight: 'bold',
              fontFamily,
              ...textStyle,
              transition: 'all 0.3s ease',
            }}
          >
            {segment.text}
          </span>
        );
      })}
    </AbsoluteFill>
  );
};
