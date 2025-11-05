import { Composition } from 'remotion';
import { VideoComposition } from './VideoComposition';
import { ScriptLine, VideoStyle } from '@/types/video';

// Default props for the composition
export const defaultScriptLines: ScriptLine[] = [
  { id: '1', text: 'Welcome to Video Generator', duration: 3 },
  { id: '2', text: 'Create amazing animated videos', duration: 3 },
  { id: '3', text: 'With just a few clicks', duration: 3 },
];

export const defaultVideoStyle: VideoStyle = {
  primaryColor: '#667eea',
  secondaryColor: '#764ba2',
  accentColor: '#f093fb',
  fontFamily: 'Space Grotesk, sans-serif',
  animationSpeed: 1,
  backgroundStyle: '3d-cards',
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoComposition"
        component={VideoComposition}
        durationInFrames={300} // Will be calculated dynamically
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          scriptLines: defaultScriptLines,
          style: defaultVideoStyle,
        }}
      />
    </>
  );
};
