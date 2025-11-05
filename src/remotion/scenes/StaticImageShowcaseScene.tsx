import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { StaticImageShowcaseProps } from '@/types/videoJSON';

interface StaticImageShowcaseSceneProps extends StaticImageShowcaseProps {
  backgroundColor: string;
  fontFamily: string;
}

export const StaticImageShowcaseScene: React.FC<StaticImageShowcaseSceneProps> = ({
  textureUrl,
  zoomEffect,
  overlayText,
  backgroundColor,
  fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Zoom animation
  const zoomStart = zoomEffect?.start || 1;
  const zoomEnd = zoomEffect?.end || 1;
  const zoomScale = interpolate(frame, [0, durationInFrames], [zoomStart, zoomEnd]);

  // Overlay text fade in
  const textOpacity = interpolate(frame, [0, 20], [0, 1]);

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
      {/* Image */}
      <div
        style={{
          transform: `scale(${zoomScale})`,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {textureUrl.startsWith('http') || textureUrl.startsWith('/') ? (
          <Img
            src={textureUrl}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              borderRadius: '16px',
              boxShadow: '0 20px 80px rgba(0, 0, 0, 0.5)',
            }}
          />
        ) : (
          <div
            style={{
              width: '80%',
              height: '80%',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '32px',
              fontFamily,
              padding: '40px',
              textAlign: 'center',
            }}
          >
            {textureUrl}
          </div>
        )}
      </div>

      {/* Overlay text */}
      {overlayText && (
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: textOpacity,
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#ffffff',
            fontFamily,
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
            textAlign: 'center',
            padding: '0 40px',
          }}
        >
          {overlayText}
        </div>
      )}
    </AbsoluteFill>
  );
};
