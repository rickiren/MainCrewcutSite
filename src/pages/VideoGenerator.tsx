import { useState, useMemo } from 'react';
import { Player } from '@remotion/player';
import { VideoComposition } from '@/remotion/VideoComposition';
import { ScriptEditor } from '@/components/video-generator/ScriptEditor';
import { StyleCustomizer } from '@/components/video-generator/StyleCustomizer';
import { ScriptLine, VideoStyle, VIDEO_FORMATS, VideoFormat } from '@/types/video';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Play, Loader2 } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { renderMedia } from '@remotion/renderer';

const VideoGenerator = () => {
  const [scriptLines, setScriptLines] = useState<ScriptLine[]>([
    { id: '1', text: 'Welcome to Video Generator', duration: 3 },
    { id: '2', text: 'Create amazing animated videos', duration: 3 },
    { id: '3', text: 'With just a few clicks', duration: 3 },
  ]);

  const [videoStyle, setVideoStyle] = useState<VideoStyle>({
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    accentColor: '#f093fb',
    fontFamily: 'Space Grotesk, sans-serif',
    animationSpeed: 1,
    backgroundStyle: '3d-cards',
    textStyle: 'solid',
    textColor: '#FFFFFF',
  });

  const [selectedFormat, setSelectedFormat] = useState<string>('instagram-reel');
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);

  const format = VIDEO_FORMATS[selectedFormat];

  // Calculate total duration in frames
  const durationInFrames = useMemo(() => {
    const totalSeconds = scriptLines.reduce((sum, line) => sum + line.duration, 0);
    return Math.ceil(totalSeconds * format.fps);
  }, [scriptLines, format.fps]);

  const handleRender = async () => {
    setIsRendering(true);
    setRenderProgress(0);

    try {
      // Note: Rendering on the client side with Remotion requires a backend setup
      // For now, we'll simulate the rendering process
      // In production, you'd want to use @remotion/lambda or a custom backend

      // Simulate rendering progress
      for (let i = 0; i <= 100; i += 10) {
        setRenderProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // In a real implementation, you would call your rendering backend here
      alert(
        'Rendering complete! In production, this would generate an MP4 file.\n\n' +
        'To implement real rendering:\n' +
        '1. Set up @remotion/lambda for cloud rendering\n' +
        '2. Or use @remotion/renderer with a Node.js backend\n' +
        '3. Configure your rendering pipeline'
      );
    } catch (error) {
      console.error('Rendering error:', error);
      alert('Rendering failed. Please check the console for details.');
    } finally {
      setIsRendering(false);
      setRenderProgress(0);
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Video Generator
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create stunning animated videos with 3D effects, spring animations, and gradient text.
              Perfect for Instagram Reels, YouTube, and social media.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel - Preview */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Live Preview</h2>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(VIDEO_FORMATS).map(([key, fmt]) => (
                        <SelectItem key={key} value={key}>
                          {fmt.name} ({fmt.width}x{fmt.height})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-black rounded-lg overflow-hidden">
                  {scriptLines.length > 0 ? (
                    <Player
                      component={VideoComposition}
                      inputProps={{
                        scriptLines,
                        style: videoStyle,
                      }}
                      durationInFrames={durationInFrames}
                      fps={format.fps}
                      compositionWidth={format.width}
                      compositionHeight={format.height}
                      style={{
                        width: '100%',
                        aspectRatio: `${format.width}/${format.height}`,
                      }}
                      controls
                      loop
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[600px] text-white">
                      <p>Add script lines to see preview</p>
                    </div>
                  )}
                </div>

                {/* Render Button */}
                <div className="mt-6 space-y-4">
                  <Button
                    onClick={handleRender}
                    disabled={isRendering || scriptLines.length === 0}
                    size="lg"
                    className="w-full"
                  >
                    {isRendering ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Rendering... {renderProgress}%
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Render & Download
                      </>
                    )}
                  </Button>

                  {isRendering && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${renderProgress}%` }}
                      />
                    </div>
                  )}

                  <div className="text-sm text-gray-500 text-center">
                    <p>Format: {format.name}</p>
                    <p>Duration: {(durationInFrames / format.fps).toFixed(1)}s</p>
                    <p>Frames: {durationInFrames} @ {format.fps}fps</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Editor */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <Tabs defaultValue="script" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="script">Script</TabsTrigger>
                    <TabsTrigger value="style">Style</TabsTrigger>
                  </TabsList>

                  <TabsContent value="script" className="mt-6">
                    <ScriptEditor
                      scriptLines={scriptLines}
                      onChange={setScriptLines}
                    />
                  </TabsContent>

                  <TabsContent value="style" className="mt-6">
                    <StyleCustomizer
                      style={videoStyle}
                      onChange={setVideoStyle}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Tips Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-3">Pro Tips</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Keep text short and impactful (5-10 words per scene)</li>
                  <li>• Use 3-5 second durations for optimal engagement</li>
                  <li>• Test different color presets for your brand</li>
                  <li>• Preview before rendering to save time</li>
                  <li>• Choose format based on your platform</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default VideoGenerator;
