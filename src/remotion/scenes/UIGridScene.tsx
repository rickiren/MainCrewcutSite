import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { UIGridProps } from '@/types/videoJSON';

interface UIGridSceneProps extends UIGridProps {
  backgroundColor: string;
  primaryColor: string;
  fontFamily: string;
}

export const UIGridScene: React.FC<UIGridSceneProps> = ({
  centerText,
  textures,
  cameraAnimation,
  backgroundColor,
  primaryColor,
  fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Camera zoom animation
  const animationType = cameraAnimation?.type || 'static';
  let zoomScale = 1;

  if (animationType === 'dollyZoomIn') {
    zoomScale = interpolate(frame, [0, durationInFrames], [1.2, 1]);
  } else if (animationType === 'dollyZoomOut') {
    zoomScale = interpolate(frame, [0, durationInFrames], [1, 1.2]);
  }

  // Center text animation
  const textProgress = spring({
    frame,
    fps,
    config: {
      damping: 100,
      stiffness: 200,
    },
  });

  const textOpacity = interpolate(textProgress, [0, 1], [0, 1]);
  const textScale = interpolate(textProgress, [0, 1], [0.8, 1]);

  // Grid item positions (3x2 grid around center)
  const gridPositions = [
    { x: -35, y: -25 },
    { x: 0, y: -25 },
    { x: 35, y: -25 },
    { x: -35, y: 25 },
    { x: 0, y: 25 },
    { x: 35, y: 25 },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          transform: `scale(${zoomScale})`,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Grid items */}
        {textures.slice(0, 6).map((texture, index) => {
          const itemDelay = index * 5;
          const itemProgress = spring({
            frame: frame - itemDelay,
            fps,
            config: {
              damping: 100,
              stiffness: 200,
            },
          });

          const itemOpacity = interpolate(itemProgress, [0, 1], [0, 0.6]);
          const itemScale = interpolate(itemProgress, [0, 1], [0.5, 1]);

          const position = gridPositions[index] || { x: 0, y: 0 };

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: `${50 + position.x}%`,
                top: `${50 + position.y}%`,
                transform: `translate(-50%, -50%) scale(${itemScale})`,
                opacity: itemOpacity,
                width: '300px',
                height: '200px',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: '#1a1a2e',
              }}
            >
              {texture.startsWith('http') || texture.startsWith('/') ? (
                <Img
                  src={texture}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${primaryColor}, #ec4899)`,
                    fontSize: '14px',
                    color: '#ffffff',
                    padding: '20px',
                    textAlign: 'center',
                  }}
                >
                  {texture}
                </div>
              )}
            </div>
          );
        })}

        {/* Center text */}
        <div
          style={{
            position: 'absolute',
            opacity: textOpacity,
            transform: `scale(${textScale})`,
            fontSize: '96px',
            fontWeight: 'bold',
            color: '#ffffff',
            fontFamily,
            textAlign: 'center',
            zIndex: 10,
            textShadow: '0 10px 40px rgba(0, 0, 0, 0.8)',
          }}
        >
          {centerText}
        </div>
      </div>
    </AbsoluteFill>
  );
};
