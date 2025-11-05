import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ChartAnimatedProps } from '@/types/videoJSONExtended';

interface ChartAnimatedSceneProps extends ChartAnimatedProps {
  backgroundColor: string;
  primaryColor: string;
  fontFamily: string;
}

export const ChartAnimatedScene: React.FC<ChartAnimatedSceneProps> = ({
  type,
  data,
  title,
  animationDuration = 60,
  gridLines = true,
  showValues = true,
  maxValue,
  backgroundColor,
  primaryColor,
  fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: {
      damping: 100,
      stiffness: 200,
    },
  });

  const chartMax = maxValue || Math.max(...data.map((d) => d.value));
  const colors = data.map((d) => d.color || primaryColor);

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
      {title && (
        <div
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#ffffff',
            fontFamily,
            marginBottom: '60px',
          }}
        >
          {title}
        </div>
      )}

      <div style={{ width: '80%', height: '500px', position: 'relative' }}>
        {type === 'bar' && (
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', gap: '20px' }}>
            {data.map((item, index) => {
              const barHeight = (item.value / chartMax) * 100 * progress;
              return (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  {showValues && (
                    <div
                      style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#ffffff',
                        fontFamily,
                      }}
                    >
                      {Math.round(item.value * progress)}
                    </div>
                  )}
                  <div
                    style={{
                      width: '100%',
                      height: `${barHeight}%`,
                      background: `linear-gradient(180deg, ${colors[index]}, ${colors[index]}dd)`,
                      borderRadius: '8px 8px 0 0',
                      boxShadow: `0 0 20px ${colors[index]}66`,
                      transition: 'height 0.3s ease',
                    }}
                  />
                  <div
                    style={{
                      fontSize: '16px',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontFamily,
                      textAlign: 'center',
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {type === 'line' && (
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grid lines */}
            {gridLines &&
              [0, 25, 50, 75, 100].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={100 - y}
                  x2="100"
                  y2={100 - y}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="0.2"
                />
              ))}

            {/* Line path */}
            <polyline
              fill="none"
              stroke={primaryColor}
              strokeWidth="1"
              points={data
                .map((item, index) => {
                  const x = (index / (data.length - 1)) * 100;
                  const y = 100 - (item.value / chartMax) * 100 * progress;
                  return `${x},${y}`;
                })
                .join(' ')}
              style={{
                filter: `drop-shadow(0 0 5px ${primaryColor})`,
              }}
            />

            {/* Data points */}
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - (item.value / chartMax) * 100 * progress;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill={colors[index]}
                  style={{
                    filter: `drop-shadow(0 0 3px ${colors[index]})`,
                  }}
                />
              );
            })}
          </svg>
        )}

        {type === 'pie' && (
          <svg width="100%" height="100%" viewBox="-50 -50 100 100">
            {data.map((item, index) => {
              const total = data.reduce((sum, d) => sum + d.value, 0);
              const startAngle = data
                .slice(0, index)
                .reduce((sum, d) => sum + (d.value / total) * 360, 0);
              const endAngle = startAngle + (item.value / total) * 360 * progress;

              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;

              const x1 = 40 * Math.cos(startRad);
              const y1 = 40 * Math.sin(startRad);
              const x2 = 40 * Math.cos(endRad);
              const y2 = 40 * Math.sin(endRad);

              const largeArc = endAngle - startAngle > 180 ? 1 : 0;

              return (
                <path
                  key={index}
                  d={`M 0 0 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={colors[index]}
                  style={{
                    filter: `drop-shadow(0 0 5px ${colors[index]})`,
                  }}
                />
              );
            })}
          </svg>
        )}
      </div>
    </AbsoluteFill>
  );
};
