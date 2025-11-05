import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { VideoJSONConfig, VideoScene } from '@/types/videoJSON';
import { TextRevealScene } from './scenes/TextRevealScene';
import { StatCardScene } from './scenes/StatCardScene';
import { CTAButtonScene } from './scenes/CTAButtonScene';
import { UIGridScene } from './scenes/UIGridScene';
import { StaticImageShowcaseScene } from './scenes/StaticImageShowcaseScene';
import { Simple3DTextScene } from './scenes/Simple3DTextScene';

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
    case 'textReveal':
      return (
        <TextRevealScene
          {...scene.props}
          {...commonProps}
        />
      );

    case 'statCard':
      return (
        <StatCardScene
          {...scene.props}
          {...commonProps}
        />
      );

    case 'ctaButton':
      return (
        <CTAButtonScene
          {...scene.props}
          {...commonProps}
        />
      );

    case 'uiGrid':
      return (
        <UIGridScene
          {...scene.props}
          {...commonProps}
        />
      );

    case 'staticImageShowcase':
      return (
        <StaticImageShowcaseScene
          {...scene.props}
          {...commonProps}
        />
      );

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

    // Add more scene types here as you build them
    case 'textWith3DBackground':
    case 'dashboardShowcase':
    case 'calendarFlip':
      return (
        <AbsoluteFill
          style={{
            backgroundColor: globalSettings.backgroundColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '48px',
            fontFamily: globalSettings.fontFamily,
          }}
        >
          Scene type "{scene.type}" coming soon!
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
