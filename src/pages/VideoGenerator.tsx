import React, { useState, useMemo, useEffect } from 'react';
import { Player } from '@remotion/player';
import { VideoComposition } from '@/remotion/VideoComposition';
import { JSONVideoComposition } from '@/remotion/JSONVideoComposition';
import { ScriptEditor } from '@/components/video-generator/ScriptEditor';
import { StyleCustomizer } from '@/components/video-generator/StyleCustomizer';
import { VideoAIChat } from '@/components/video-generator/VideoAIChat';
import { JSONEditor } from '@/components/video-generator/JSONEditor';
import { EffectsPanel } from '@/components/video-generator/EffectsPanel';
import { AnimationPanel } from '@/components/video-generator/AnimationPanel';
import { UITemplateSelector } from '@/components/video-generator/UITemplateSelector';
import { ScriptLine, VideoStyle, VIDEO_FORMATS, VideoFormat } from '@/types/video';
import { VideoJSONConfig, getAspectRatioDimensions } from '@/types/videoJSON';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Play, Loader2, FileJson, Edit3, ArrowLeft, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { renderMedia } from '@remotion/renderer';

// Debug wrapper for Player to track mount/unmount
const DebugPlayer: React.FC<any> = ({ playerKey, ...props }) => {
  useEffect(() => {
    console.log('🎥 Player MOUNTED with key:', playerKey);
    return () => {
      console.log('💀 Player UNMOUNTED with key:', playerKey);
    };
  }, [playerKey]);

  return <Player {...props} />;
};

const VideoGenerator = () => {
  const [mode, setMode] = useState<'simple' | 'json'>('simple');
  const [jsonConfig, setJsonConfig] = useState<VideoJSONConfig | null>(null);

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
    sceneType: '3d',
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

  // Force Player to re-render when inputs change
  // Use a counter-based approach for reliable updates
  const [updateCounter, setUpdateCounter] = useState(0);

  // Increment counter whenever video config changes
  useEffect(() => {
    console.log('🔄 Video config changed, updating player...', {
      counter: updateCounter,
      scriptLinesCount: scriptLines.length,
      defaultAnimation: videoStyle.defaultAnimation,
      sceneType: videoStyle.sceneType,
      format: selectedFormat
    });
    setUpdateCounter(prev => prev + 1);
  }, [scriptLines, videoStyle, selectedFormat]);

  const playerKey = `video-${updateCounter}`;

  console.log('🎬 Rendering VideoGenerator with key:', playerKey);

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

  const handleAIUpdate = (updates: {
    scriptLines?: ScriptLine[];
    style?: Partial<VideoStyle>;
  }) => {
    if (updates.scriptLines) {
      setScriptLines(updates.scriptLines);
    }
    if (updates.style) {
      setVideoStyle((prev) => ({ ...prev, ...updates.style }));
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <Link to="/apps" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Apps
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <Video className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AI Video Generator</h1>
                <p className="text-gray-600 mt-1">
                  Create stunning animated videos with neon glow effects, 3D camera movements, and glassmorphic UI scenes.
                </p>
              </div>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={mode === 'simple' ? 'default' : 'outline'}
                onClick={() => setMode('simple')}
                className="flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Simple Mode
              </Button>
              <Button
                variant={mode === 'json' ? 'default' : 'outline'}
                onClick={() => setMode('json')}
                className="flex items-center gap-2"
              >
                <FileJson className="w-4 h-4" />
                JSON Mode
              </Button>
            </div>
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
                  {mode === 'json' && jsonConfig ? (
                    <Player
                      key={JSON.stringify(jsonConfig)}
                      component={JSONVideoComposition}
                      inputProps={{
                        config: jsonConfig,
                      }}
                      durationInFrames={jsonConfig.durationInFrames}
                      fps={jsonConfig.fps}
                      compositionWidth={getAspectRatioDimensions(jsonConfig.aspectRatio).width}
                      compositionHeight={getAspectRatioDimensions(jsonConfig.aspectRatio).height}
                      style={{
                        width: '100%',
                        aspectRatio: jsonConfig.aspectRatio.replace('/', ' / '),
                      }}
                      controls
                      loop
                    />
                  ) : mode === 'simple' && scriptLines.length > 0 ? (
                    <DebugPlayer
                      key={playerKey}
                      playerKey={playerKey}
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
                      <p>
                        {mode === 'json'
                          ? 'Paste and preview JSON to see your video'
                          : 'Add script lines to see preview'}
                      </p>
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
                {mode === 'json' ? (
                  <JSONEditor onConfigUpdate={setJsonConfig} />
                ) : (
                  <Tabs defaultValue="script" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="script">Script</TabsTrigger>
                      <TabsTrigger value="ui-templates">UI Templates</TabsTrigger>
                      <TabsTrigger value="animation">Animation</TabsTrigger>
                      <TabsTrigger value="style">Style</TabsTrigger>
                      <TabsTrigger value="effects">Effects</TabsTrigger>
                    </TabsList>

                    <TabsContent value="script" className="mt-6">
                      <ScriptEditor
                        scriptLines={scriptLines}
                        onChange={setScriptLines}
                      />
                    </TabsContent>

                    <TabsContent value="ui-templates" className="mt-6">
                      <UITemplateSelector
                        onTemplateSelect={(config) => {
                          setJsonConfig(config);
                          setMode('json');
                        }}
                      />
                    </TabsContent>

                    <TabsContent value="animation" className="mt-6">
                      <AnimationPanel
                        style={videoStyle}
                        onChange={setVideoStyle}
                      />
                    </TabsContent>

                    <TabsContent value="style" className="mt-6">
                      <StyleCustomizer
                        style={videoStyle}
                        onChange={setVideoStyle}
                      />
                    </TabsContent>

                    <TabsContent value="effects" className="mt-6">
                      <EffectsPanel
                        style={videoStyle}
                        onChange={setVideoStyle}
                      />
                    </TabsContent>
                  </Tabs>
                )}
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

        {/* AI Chat Assistant */}
        <VideoAIChat
          currentScript={scriptLines}
          currentStyle={videoStyle}
          onUpdateVideo={handleAIUpdate}
        />
      </div>
    </PageLayout>
  );
};

export default VideoGenerator;
