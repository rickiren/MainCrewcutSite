import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { CounterProps } from '@/types/videoJSONExtended';

interface CounterSceneProps extends CounterProps {
  backgroundColor: string;
  primaryColor: string;
  fontFamily: string;
}

export const CounterScene: React.FC<CounterSceneProps> = ({
  value,
  startValue = 0,
  duration,
  format = 'number',
  prefix = '',
  suffix = '',
  decimals = 0,
  label,
  fontSize = 96,
  backgroundColor,
  primaryColor,
  fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Calculate current value based on frame
  const progress = Math.min(frame / Math.min(duration, durationInFrames), 1);
  const currentValue = startValue + (value - startValue) * progress;

  // Format the number
  let formattedValue = '';
  if (format === 'currency') {
    formattedValue = `$${currentValue.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  } else if (format === 'percentage') {
    formattedValue = `${currentValue.toFixed(decimals)}%`;
  } else if (format === 'decimal') {
    formattedValue = currentValue.toFixed(decimals);
  } else {
    formattedValue = Math.floor(currentValue).toLocaleString();
  }

  const displayValue = `${prefix}${formattedValue}${suffix}`;

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
      }}
    >
      <div
        style={{
          fontSize: `${fontSize}px`,
          fontWeight: 'bold',
          color: '#ffffff',
          fontFamily,
          background: `linear-gradient(135deg, ${primaryColor}, #ec4899)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 10px 40px rgba(147, 51, 234, 0.5)',
        }}
      >
        {displayValue}
      </div>
      {label && (
        <div
          style={{
            fontSize: `${fontSize / 3}px`,
            color: 'rgba(255, 255, 255, 0.8)',
            fontFamily,
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          {label}
        </div>
      )}
    </AbsoluteFill>
  );
};
