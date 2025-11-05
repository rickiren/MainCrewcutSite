import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { NeonEffectProps } from '@/types/videoJSONExtended';

interface NeonEffectSceneProps extends NeonEffectProps {
  backgroundColor: string;
}

export const NeonEffectScene: React.FC<NeonEffectSceneProps> = ({
  elements,
  flickerEffect = false,
  pulseEffect = false,
  trailEffect = false,
  backgroundColor,
}) => {
  const frame = useCurrentFrame();

  const flicker = flickerEffect ? (Math.random() > 0.95 ? 0.3 : 1) : 1;
  const pulse = pulseEffect ? 0.8 + Math.sin(frame * 0.1) * 0.2 : 1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="100%" height="100%" style={{ position: 'absolute' }}>
        <defs>
          {/* Glow filter */}
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {elements.map((element, index) => {
          const [x, y] = element.position || [50, 50];
          const opacity = flicker * pulse;

          if (element.type === 'text') {
            return (
              <text
                key={index}
                x={`${x}%`}
                y={`${y}%`}
                fill={element.color}
                stroke={element.color}
                strokeWidth={element.thickness}
                filter="url(#neonGlow)"
                fontSize="48"
                fontFamily="Arial, sans-serif"
                fontWeight="bold"
                textAnchor="middle"
                style={{
                  opacity,
                  textShadow: `0 0 ${element.glowIntensity}px ${element.color}, 0 0 ${element.glowIntensity * 2}px ${element.color}`,
                }}
              >
                {element.content}
              </text>
            );
          } else if (element.type === 'line') {
            // Parse line coordinates from content
            const coords = element.content.split(',').map(Number);
            if (coords.length === 4) {
              return (
                <line
                  key={index}
                  x1={coords[0]}
                  y1={coords[1]}
                  x2={coords[2]}
                  y2={coords[3]}
                  stroke={element.color}
                  strokeWidth={element.thickness}
                  filter="url(#neonGlow)"
                  style={{ opacity }}
                />
              );
            }
          } else if (element.type === 'shape') {
            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={`${y}%`}
                r="40"
                fill="none"
                stroke={element.color}
                strokeWidth={element.thickness}
                filter="url(#neonGlow)"
                style={{ opacity }}
              />
            );
          }
          return null;
        })}
      </svg>
    </AbsoluteFill>
  );
};
