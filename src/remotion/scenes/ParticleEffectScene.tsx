import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';
import { ParticleEffectProps } from '@/types/videoJSONExtended';
import { useMemo } from 'react';

interface ParticleEffectSceneProps extends ParticleEffectProps {
  backgroundColor: string;
  children?: React.ReactNode;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
}

export const ParticleEffectScene: React.FC<ParticleEffectSceneProps> = ({
  type,
  count,
  colors = ['#ff0080', '#7928ca', '#ff0080'],
  speed,
  size,
  direction = 'down',
  gravity = true,
  rotation: enableRotation = true,
  backgroundColor,
  children,
}) => {
  const frame = useCurrentFrame();

  // Generate particles (memoized)
  const particles = useMemo<Particle[]>(() => {
    const parts: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const seed = i;
      parts.push({
        id: i,
        x: random(seed) * 100,
        y: random(seed + 1000) * 100,
        size: size.min + random(seed + 2000) * (size.max - size.min),
        color: colors[Math.floor(random(seed + 3000) * colors.length)],
        velocityX: (random(seed + 4000) - 0.5) * speed * 0.5,
        velocityY: random(seed + 5000) * speed,
        rotation: random(seed + 6000) * 360,
        rotationSpeed: (random(seed + 7000) - 0.5) * 5,
      });
    }
    return parts;
  }, [count, colors, speed, size]);

  return (
    <AbsoluteFill style={{ backgroundColor, overflow: 'hidden' }}>
      {/* Background content */}
      {children}

      {/* Particles */}
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {particles.map((particle) => {
          // Calculate position based on frame
          let x = particle.x + particle.velocityX * frame * 0.1;
          let y = particle.y;

          if (direction === 'down') {
            y = particle.y + particle.velocityY * frame * 0.1;
            if (gravity) {
              y += frame * frame * 0.001; // Gravity acceleration
            }
          } else if (direction === 'up') {
            y = particle.y - particle.velocityY * frame * 0.1;
          } else if (direction === 'random') {
            y = particle.y + (particle.velocityY - 0.5) * frame * 0.1;
          }

          // Wrap around screen
          x = x % 100;
          y = y % 100;
          if (x < 0) x += 100;
          if (y < 0) y += 100;

          const currentRotation = enableRotation
            ? particle.rotation + particle.rotationSpeed * frame
            : 0;

          // Different shapes based on type
          if (type === 'confetti') {
            return (
              <rect
                key={particle.id}
                x={x}
                y={y}
                width={particle.size * 0.4}
                height={particle.size}
                fill={particle.color}
                transform={`rotate(${currentRotation} ${x} ${y})`}
                opacity={0.9}
              />
            );
          } else if (type === 'snow') {
            return (
              <circle
                key={particle.id}
                cx={x}
                cy={y}
                r={particle.size * 0.3}
                fill="#ffffff"
                opacity={0.8}
              />
            );
          } else if (type === 'rain') {
            return (
              <line
                key={particle.id}
                x1={x}
                y1={y}
                x2={x}
                y2={y + particle.size}
                stroke={particle.color}
                strokeWidth={particle.size * 0.1}
                opacity={0.6}
              />
            );
          } else {
            // Abstract/floating
            return (
              <circle
                key={particle.id}
                cx={x}
                cy={y}
                r={particle.size * 0.5}
                fill={particle.color}
                opacity={0.7}
              />
            );
          }
        })}
      </svg>
    </AbsoluteFill>
  );
};
