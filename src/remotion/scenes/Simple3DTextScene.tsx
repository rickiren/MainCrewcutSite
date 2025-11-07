import { Scene3DPerspective } from '../Scene3DPerspective';

interface Simple3DTextSceneProps {
  text: string;
  frame: number;
  duration: number;
  fps: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  animationSpeed: number;
}

// Wrapper for our existing 3D scene to work with JSON configs
export const Simple3DTextScene: React.FC<Simple3DTextSceneProps> = (props) => {
  return <Scene3DPerspective {...props} />;
};
