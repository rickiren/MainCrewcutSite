import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { VideoJSONConfig, VideoScene } from '@/types/videoJSON';
import { TextRevealScene } from './scenes/TextRevealScene';
import { StatCardScene } from './scenes/StatCardScene';
import { CTAButtonScene } from './scenes/CTAButtonScene';
import { UIGridScene } from './scenes/UIGridScene';
import { StaticImageShowcaseScene } from './scenes/StaticImageShowcaseScene';
import { Simple3DTextScene } from './scenes/Simple3DTextScene';
import { TextHighlightScene } from './scenes/TextHighlightScene';
import { CounterScene } from './scenes/CounterScene';
import { ParticleEffectScene } from './scenes/ParticleEffectScene';
import { GlitchTransitionScene } from './scenes/GlitchTransitionScene';
import { NeonEffectScene } from './scenes/NeonEffectScene';
import { ChartAnimatedScene } from './scenes/ChartAnimatedScene';
import { UIMockupScene } from './scenes/UIMockupScene';

interface JSONVideoCompositionProps {
  config: VideoJSONConfig;
}

export const JSONVideoComposition: React.FC<JSONVideoCompositionProps> = ({ config }) => {
  const frame = useCurrentFrame();

  // Calculate which scene should be displayed at current frame
  let currentSceneIndex = -1;
  let currentSceneStartFrame = 0;
  let accumulatedFrames = 0;

  for (let i = 0; i < config.scenes.length; i++) {
    const scene = config.scenes[i];
    if (frame >= accumulatedFrames && frame < accumulatedFrames + scene.durationInFrames) {
      currentSceneIndex = i;
      currentSceneStartFrame = accumulatedFrames;
      break;
    }
    accumulatedFrames += scene.durationInFrames;
  }

  // No scene found - show black
  if (currentSceneIndex === -1) {
    return (
      <AbsoluteFill style={{ backgroundColor: config.globalSettings.backgroundColor }} />
    );
  }

  const currentScene = config.scenes[currentSceneIndex];
  const frameInScene = frame - currentSceneStartFrame;

  // Render the appropriate scene component
  return (
    <AbsoluteFill>
      {renderScene(currentScene, frameInScene, config)}
    </AbsoluteFill>
  );
};

// Scene renderer - maps scene type to component
function renderScene(scene: VideoScene, frameInScene: number, config: VideoJSONConfig): React.ReactNode {
  const { globalSettings } = config;
  const commonProps = {
    backgroundColor: globalSettings.backgroundColor,
    primaryColor: globalSettings.primaryColor,
    secondaryColor: globalSettings.secondaryColor || '#764ba2',
    accentColor: globalSettings.accentColor || '#f093fb',
    fontFamily: globalSettings.fontFamily,
  };

  switch (scene.type) {
    // ==================== TEXT EFFECTS ====================
    case 'textReveal':
      return <TextRevealScene {...scene.props} {...commonProps} />;

    case 'textHighlight':
      return <TextHighlightScene {...scene.props} {...commonProps} />;

    // ==================== 3D/CAMERA EFFECTS ====================
    case 'staticImageShowcase':
      return <StaticImageShowcaseScene {...scene.props} {...commonProps} />;

    case 'uiGrid':
      return <UIGridScene {...scene.props} {...commonProps} />;

    case 'simple3DText':
      return (
        <Simple3DTextScene
          text={scene.props.text || ''}
          frame={frameInScene}
          duration={scene.durationInFrames}
          fps={config.fps}
          primaryColor={commonProps.primaryColor}
          secondaryColor={commonProps.secondaryColor}
          accentColor={commonProps.accentColor}
          textColor={scene.props.textColor || '#FFFFFF'}
          animationSpeed={scene.props.animationSpeed || 1}
        />
      );

    // ==================== UI MOCKUPS ====================
    case 'uiMockup':
      return (
        <UIMockupScene
          {...scene.props}
          {...commonProps}
          frame={frameInScene}
        />
      );

    case 'glassmorphicCard':
      // Alias for uiMockup with single card
      return (
        <UIMockupScene
          {...scene.props}
          {...commonProps}
          frame={frameInScene}
        />
      );

    // ==================== DATA VISUALIZATION ====================
    case 'statCard':
      return <StatCardScene {...scene.props} {...commonProps} />;

    case 'chartAnimated':
      return <ChartAnimatedScene {...scene.props} {...commonProps} />;

    case 'counter':
      return <CounterScene {...scene.props} {...commonProps} />;

    // ==================== TRANSITIONS ====================
    case 'glitchTransition':
      return <GlitchTransitionScene {...scene.props} {...commonProps} />;

    // ==================== CTAs ====================
    case 'ctaButton':
      return <CTAButtonScene {...scene.props} {...commonProps} />;

    // ==================== VISUAL EFFECTS ====================
    case 'particleEffect':
      return <ParticleEffectScene {...scene.props} {...commonProps} />;

    case 'neonEffect':
      return <NeonEffectScene {...scene.props} {...commonProps} />;

    // ==================== COMING SOON ====================
    case 'textWith3DBackground':
    case 'kineticText':
    case 'text3D':
    case 'textPath':
    case 'dashboardShowcase':
    case 'productShowcase':
    case 'environment3D':
    case 'progressBar':
    case 'timeline':
    case 'mapAnimation':
    case 'calendarFlip':
    case 'morphTransition':
    case 'wipeReveal':
    case 'shatterTransition':
    case 'zoomThrough':
    case 'displacementTransition':
    case 'rotationTransition':
    case 'ctaText':
    case 'ctaForm':
    case 'ctaQRCode':
    case 'lightRays':
    case 'logoReveal':
    case 'loadingAnimation':
    case 'hologramEffect':
    case 'parallaxLayers':
    case 'bokehEffect':
    case 'filmEffect':
    case 'mirrorEffect':
      return (
        <AbsoluteFill
          style={{
            backgroundColor: globalSettings.backgroundColor,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            color: '#ffffff',
            fontSize: '36px',
            fontFamily: globalSettings.fontFamily,
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '48px', opacity: 0.5 }}>🎬</div>
          <div>Scene type: <span style={{ color: commonProps.primaryColor }}>{scene.type}</span></div>
          <div style={{ fontSize: '24px', opacity: 0.7 }}>Coming soon!</div>
          <div style={{ fontSize: '16px', opacity: 0.5, maxWidth: '600px' }}>
            This scene type is defined and ready to be implemented. Check the videoJSONExtended.ts file for prop types.
          </div>
        </AbsoluteFill>
      );

    default:
      return (
        <AbsoluteFill
          style={{
            backgroundColor: globalSettings.backgroundColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ff0000',
            fontSize: '32px',
          }}
        >
          Unknown scene type: {scene.type}
        </AbsoluteFill>
      );
  }
}
