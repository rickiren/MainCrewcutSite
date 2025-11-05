import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from 'remotion';
import { GlitchTransitionProps } from '@/types/videoJSONExtended';

interface GlitchTransitionSceneProps extends GlitchTransitionProps {
  backgroundColor: string;
  content?: React.ReactNode;
}

export const GlitchTransitionScene: React.FC<GlitchTransitionSceneProps> = ({
  intensity,
  layers,
  rgbSplit,
  scanLines,
  staticNoise,
  displacementAmount = 10,
  backgroundColor,
  content,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Glitch intensity over time
  const glitchProgress = Math.sin((frame / durationInFrames) * Math.PI);
  const currentIntensity = intensity * glitchProgress;

  // RGB split offsets
  const rOffset = rgbSplit ? random(frame) * displacementAmount * currentIntensity : 0;
  const gOffset = rgbSplit ? random(frame + 100) * displacementAmount * currentIntensity : 0;
  const bOffset = rgbSplit ? random(frame + 200) * displacementAmount * currentIntensity : 0;

  // Displacement
  const displacement = random(frame + 300) * displacementAmount * currentIntensity;

  return (
    <AbsoluteFill style={{ backgroundColor, position: 'relative', overflow: 'hidden' }}>
      {/* Content with glitch layers */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
        }}
      >
        {content}
      </div>

      {/* RGB Split Layers */}
      {rgbSplit && (
        <>
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              mixBlendMode: 'screen',
              transform: `translateX(${rOffset}px)`,
              filter: 'brightness(1) saturate(2)',
              opacity: currentIntensity,
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'red',
                mixBlendMode: 'multiply',
              }}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              mixBlendMode: 'screen',
              transform: `translateX(${-bOffset}px)`,
              opacity: currentIntensity,
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'cyan',
                mixBlendMode: 'multiply',
              }}
            />
          </div>
        </>
      )}

      {/* Scan Lines */}
      {scanLines && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)',
            pointerEvents: 'none',
            opacity: currentIntensity,
          }}
        />
      )}

      {/* Static Noise */}
      {staticNoise && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${random(frame)}' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
            opacity: currentIntensity * 0.3,
            mixBlendMode: 'overlay',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Horizontal glitch bars */}
      {Array.from({ length: Math.floor(currentIntensity * 10) }).map((_, i) => {
        const y = random(frame + i) * 100;
        const height = random(frame + i + 1000) * 5;
        const xOffset = (random(frame + i + 2000) - 0.5) * displacement;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${xOffset}px`,
              top: `${y}%`,
              width: '100%',
              height: `${height}%`,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              mixBlendMode: 'difference',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
