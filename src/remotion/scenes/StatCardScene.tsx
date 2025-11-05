import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { StatCardProps } from '@/types/videoJSON';

interface StatCardSceneProps extends StatCardProps {
  backgroundColor: string;
  fontFamily: string;
}

export const StatCardScene: React.FC<StatCardSceneProps> = ({
  title,
  cards,
  backgroundColor,
  fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleProgress = spring({
    frame,
    fps,
    config: {
      damping: 100,
      stiffness: 200,
    },
  });

  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleY = interpolate(titleProgress, [0, 1], [-50, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px',
      }}
    >
      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#ffffff',
          fontFamily,
          marginBottom: '60px',
          textAlign: 'center',
        }}
      >
        {title}
      </div>

      {/* Cards Grid */}
      <div
        style={{
          display: 'flex',
          gap: '40px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '1200px',
        }}
      >
        {cards.map((card, index) => {
          const cardDelay = 10 + index * 8;
          const cardProgress = spring({
            frame: frame - cardDelay,
            fps,
            config: {
              damping: 100,
              stiffness: 200,
            },
          });

          const cardOpacity = interpolate(cardProgress, [0, 1], [0, 1]);
          const cardScale = interpolate(cardProgress, [0, 1], [0.8, 1]);
          const cardY = interpolate(cardProgress, [0, 1], [50, 0]);

          return (
            <div
              key={index}
              style={{
                opacity: cardOpacity,
                transform: `translateY(${cardY}px) scale(${cardScale})`,
                background: `linear-gradient(135deg, ${card.gradient[0]}, ${card.gradient[1]})`,
                borderRadius: '24px',
                padding: '48px 40px',
                minWidth: '280px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div
                style={{
                  fontSize: '64px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  fontFamily,
                  marginBottom: '16px',
                  textAlign: 'center',
                }}
              >
                {card.value}
              </div>
              <div
                style={{
                  fontSize: '20px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontFamily,
                  textAlign: 'center',
                }}
              >
                {card.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
