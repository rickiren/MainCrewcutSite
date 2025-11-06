import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useMemo } from 'react';
import * as THREE from 'three';
import { AnimatedText } from './components/AnimatedText';
import type { AnimationType } from './components/AnimatedText';
import { LineAnimationConfig } from '@/types/video';

interface Scene3DPerspectiveProps {
  text: string;
  frame: number;
  duration: number;
  fps: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  animationSpeed: number;
  animationConfig?: LineAnimationConfig;
}

// Glass Card Component
const GlassCard: React.FC<{
  position: [number, number, number];
  rotation: [number, number, number];
  frame: number;
  fps: number;
  delay: number;
  color: string;
  animationSpeed: number;
}> = ({ position, rotation, frame, fps, delay, color, animationSpeed }) => {
  // Floating animation
  const floatProgress = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 100 / animationSpeed,
      stiffness: 50 * animationSpeed,
      mass: 1,
    },
  });

  const floatY = Math.sin(floatProgress * Math.PI * 2) * 0.3;

  // Rotation animation
  const rotateProgress = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 200,
      stiffness: 30,
      mass: 2,
    },
  });

  const additionalRotation = rotateProgress * Math.PI * 0.2;

  // Create glass material
  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      metalness: 0.1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.4,
      transmission: 0.9, // Glass-like transmission
      thickness: 0.5,
      envMapIntensity: 1.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
  }, [color]);

  return (
    <mesh
      position={[position[0], position[1] + floatY, position[2]]}
      rotation={[rotation[0], rotation[1] + additionalRotation, rotation[2]]}
      material={material}
    >
      <boxGeometry args={[2, 2.5, 0.1]} />
    </mesh>
  );
};

// 3D Scene Component
const Scene3D: React.FC<{
  frame: number;
  fps: number;
  duration: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  animationSpeed: number;
}> = ({ frame, fps, duration, primaryColor, secondaryColor, accentColor, animationSpeed }) => {
  // Camera rotation (180 degrees over scene duration)
  const cameraRotation = interpolate(
    frame,
    [0, duration],
    [0, Math.PI] // 180 degrees
  );

  const cameraRadius = 8;
  const cameraX = Math.sin(cameraRotation) * cameraRadius;
  const cameraZ = Math.cos(cameraRotation) * cameraRadius;
  const cameraY = 0;

  // Glass card positions (different depths and positions)
  const cards = useMemo(() => [
    {
      position: [-3, 0, -2] as [number, number, number],
      rotation: [0.2, 0.3, 0] as [number, number, number],
      delay: 0,
      color: primaryColor,
    },
    {
      position: [2, 1, 0] as [number, number, number],
      rotation: [-0.1, -0.4, 0.1] as [number, number, number],
      delay: 5,
      color: secondaryColor,
    },
    {
      position: [0, -1, 2] as [number, number, number],
      rotation: [0.15, 0, -0.2] as [number, number, number],
      delay: 10,
      color: accentColor,
    },
    {
      position: [-1, 2, 1] as [number, number, number],
      rotation: [-0.2, 0.5, 0.1] as [number, number, number],
      delay: 15,
      color: primaryColor,
    },
    {
      position: [3, -0.5, -1] as [number, number, number],
      rotation: [0.1, -0.2, -0.15] as [number, number, number],
      delay: 20,
      color: accentColor,
    },
  ], [primaryColor, secondaryColor, accentColor]);

  return (
    <>
      {/* Camera */}
      <perspectiveCamera
        position={[cameraX, cameraY, cameraZ]}
        fov={75}
        near={0.1}
        far={1000}
        // @ts-ignore
        lookAt={[0, 0, 0]}
      />

      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color={accentColor} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color={primaryColor} />

      {/* Glass Cards */}
      {cards.map((card, index) => (
        <GlassCard
          key={index}
          position={card.position}
          rotation={card.rotation}
          frame={frame}
          fps={fps}
          delay={card.delay}
          color={card.color}
          animationSpeed={animationSpeed}
        />
      ))}

      {/* Environment for reflections */}
      <mesh position={[0, 0, 0]} visible={false}>
        <sphereGeometry args={[50, 32, 32]} />
        <meshBasicMaterial color="#000000" side={THREE.BackSide} />
      </mesh>
    </>
  );
};

// Text Overlay Component - Now uses AnimatedText with configurable animations
const TextOverlay: React.FC<{
  text: string;
  frame: number;
  textColor: string;
  fontFamily: string;
  animationConfig?: LineAnimationConfig;
}> = ({ text, frame, textColor, fontFamily, animationConfig }) => {
  // Default animation if none provided
  const defaultConfig = animationConfig || {
    type: 'fadeIn',
    unit: 'word',
    staggerInFrames: 5,
    durationInFrames: 30,
  };

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <AnimatedText
        text={text}
        animation={defaultConfig.type as AnimationType}
        frame={frame}
        animationConfig={{
          unit: defaultConfig.unit,
          staggerInFrames: defaultConfig.staggerInFrames,
          durationInFrames: defaultConfig.durationInFrames,
          direction: defaultConfig.direction,
          distance: defaultConfig.distance,
          fade: defaultConfig.fade,
          from: defaultConfig.from,
          to: defaultConfig.to,
          cursor: defaultConfig.cursor,
        }}
        style={{
          fontSize: 72,
          fontWeight: 'bold',
          fontFamily,
          color: textColor,
          textShadow: '0 8px 32px rgba(0,0,0,0.8), 0 4px 16px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)',
          maxWidth: '90%',
        }}
      />
    </AbsoluteFill>
  );
};

// Main Scene Component
export const Scene3DPerspective: React.FC<Scene3DPerspectiveProps> = ({
  text,
  frame,
  duration,
  fps,
  primaryColor,
  secondaryColor,
  accentColor,
  textColor,
  animationSpeed,
  animationConfig,
}) => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* Background Gradient */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 50%, ${accentColor} 100%)`,
        }}
      />

      {/* 3D Scene */}
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [0, 0, 8], fov: 75 }}
        gl={{ alpha: true, antialias: true }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <Scene3D
          frame={frame}
          fps={fps}
          duration={duration}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          accentColor={accentColor}
          animationSpeed={animationSpeed}
        />
      </ThreeCanvas>

      {/* Text Overlay with configurable animations */}
      <TextOverlay
        text={text}
        frame={frame}
        textColor={textColor}
        fontFamily="Space Grotesk, sans-serif"
        animationConfig={animationConfig}
      />
    </AbsoluteFill>
  );
};
