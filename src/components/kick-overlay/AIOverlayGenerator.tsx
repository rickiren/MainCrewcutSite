import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, X, Loader2, Upload, FileCode, MessageSquare, Image as ImageIcon } from 'lucide-react';
import type { OverlayElement } from '@/types/overlay';
import { ELEMENT_PRESETS, OVERLAY_THEMES } from '@/types/overlay';
import { parseHTMLTemplate, analyzeImageDesign } from './overlayParser';

interface AIOverlayGeneratorProps {
  onGenerate: (elements: OverlayElement[]) => void;
  onClose: () => void;
}

export function AIOverlayGenerator({ onGenerate, onClose }: AIOverlayGeneratorProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'html'>('text');
  const [description, setDescription] = useState('');
  const [htmlTemplate, setHtmlTemplate] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle text description generation
  const handleTextGenerate = async () => {
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const elements = parseDescriptionToElements(description);
      await new Promise(resolve => setTimeout(resolve, 1000));
      onGenerate(elements);
    } catch (err) {
      setError('Failed to generate overlay. Please try again.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle HTML template import
  const handleHTMLImport = async () => {
    if (!htmlTemplate.trim()) {
      setError('Please paste an HTML template');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const elements = parseHTMLTemplate(htmlTemplate);

      if (elements.length === 0) {
        setError('No overlay elements found in HTML. Make sure your HTML contains positioned elements.');
        setIsGenerating(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      onGenerate(elements);
    } catch (err) {
      setError('Failed to parse HTML template. Please check the format.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setUploadedImage(imageData);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  // Handle image analysis and generation
  const handleImageGenerate = async () => {
    if (!uploadedImage) {
      setError('Please upload an image first');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const elements = await analyzeImageDesign(uploadedImage);
      await new Promise(resolve => setTimeout(resolve, 1500));
      onGenerate(elements);
    } catch (err) {
      setError('Failed to analyze image. Please try again.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Simple AI-like parser that creates overlay elements based on keywords
  const parseDescriptionToElements = (desc: string): OverlayElement[] => {
    const elements: OverlayElement[] = [];
    const lowerDesc = desc.toLowerCase();
    const theme = OVERLAY_THEMES[0]; // Default theme

    // Helper to create element with theme-based styling
    const createElement = (
      type: keyof typeof ELEMENT_PRESETS,
      customPosition?: { x: number; y: number }
    ): OverlayElement => {
      const preset = ELEMENT_PRESETS[type];
      return {
        id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        label: preset.label || type,
        position: customPosition || preset.position || { x: 10, y: 10 },
        size: preset.size || { width: 20, height: 20 },
        style: {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
          borderWidth: theme.defaultElementStyle.borderWidth || 2,
          borderRadius: theme.defaultElementStyle.borderRadius || 8,
          borderStyle: theme.defaultElementStyle.borderStyle || 'solid',
          opacity: theme.defaultElementStyle.opacity || 0.9,
          fontSize: preset.style?.fontSize || 16,
          fontFamily: theme.fonts.primary,
          fontWeight: preset.style?.fontWeight || 400,
          textColor: theme.colors.text,
          textAlign: preset.style?.textAlign || 'center',
          shadow: theme.defaultElementStyle.shadow,
        },
        content: preset.content,
        zIndex: 0,
      };
    };

    // Detect layout preferences
    const layoutPresets: Record<string, () => OverlayElement[]> = {
      // Gaming layout
      gaming: () => [
        createElement('webcam', { x: 75, y: 65 }),
        createElement('chat', { x: 5, y: 30 }),
        createElement('alerts', { x: 30, y: 5 }),
        createElement('recent-events', { x: 70, y: 10 }),
        createElement('subscriber-count', { x: 5, y: 5 }),
        createElement('follower-count', { x: 5, y: 12 }),
      ],

      // Minimal layout
      minimal: () => [
        createElement('webcam', { x: 70, y: 60 }),
        createElement('label', { x: 5, y: 5 }),
      ],

      // Full featured
      full: () => [
        createElement('webcam', { x: 72, y: 60 }),
        createElement('chat', { x: 5, y: 35 }),
        createElement('alerts', { x: 35, y: 5 }),
        createElement('donation-goal', { x: 35, y: 85 }),
        createElement('subscriber-count', { x: 5, y: 5 }),
        createElement('follower-count', { x: 5, y: 12 }),
        createElement('recent-events', { x: 72, y: 10 }),
        createElement('label', { x: 20, y: 5 }),
      ],

      // Just chatting
      'just chatting': () => [
        createElement('webcam', { x: 25, y: 20 }),
        createElement('chat', { x: 65, y: 20 }),
        createElement('alerts', { x: 35, y: 5 }),
        createElement('subscriber-count', { x: 5, y: 5 }),
        createElement('recent-events', { x: 5, y: 75 }),
      ],
    };

    // Check for layout keywords
    for (const [keyword, generator] of Object.entries(layoutPresets)) {
      if (lowerDesc.includes(keyword)) {
        return generator();
      }
    }

    // Individual element detection
    if (lowerDesc.includes('webcam') || lowerDesc.includes('camera') || lowerDesc.includes('facecam')) {
      elements.push(createElement('webcam'));
    }

    if (lowerDesc.includes('chat')) {
      elements.push(createElement('chat'));
    }

    if (lowerDesc.includes('alert') || lowerDesc.includes('notification')) {
      elements.push(createElement('alerts'));
    }

    if (lowerDesc.includes('donation') || lowerDesc.includes('goal')) {
      elements.push(createElement('donation-goal'));
    }

    if (lowerDesc.includes('subscriber') || lowerDesc.includes('subs')) {
      elements.push(createElement('subscriber-count'));
    }

    if (lowerDesc.includes('follower') || lowerDesc.includes('followers')) {
      elements.push(createElement('follower-count'));
    }

    if (lowerDesc.includes('event') || lowerDesc.includes('recent')) {
      elements.push(createElement('recent-events'));
    }

    if (lowerDesc.includes('label') || lowerDesc.includes('text') || lowerDesc.includes('title')) {
      const labelElement = createElement('label');

      // Try to extract custom text
      const textMatch = desc.match(/["']([^"']+)["']/);
      if (textMatch) {
        labelElement.content = textMatch[1];
      }

      elements.push(labelElement);
    }

    // If no elements detected, create a default gaming layout
    if (elements.length === 0) {
      return layoutPresets.gaming();
    }

    return elements;
  };

  const examplePrompts = [
    'Create a gaming overlay with webcam in bottom right, chat on left, and alerts at top',
    'Make a minimal overlay with just a webcam and a "Live on Kick" label',
    'Full featured streaming overlay with all elements',
    'Just chatting layout with large webcam and chat visible',
  ];

  const exampleHTML = `<!DOCTYPE html>
<html>
<body style="width: 1920px; height: 1080px; background: rgba(0,0,0,0);">
  <div class="webcam" style="position: absolute; left: 75%; top: 60%; width: 20%; height: 35%; background: rgba(10,10,35,0.9); border: 2px solid #00f5ff; border-radius: 12px;"></div>
  <div class="chat" style="position: absolute; left: 5%; top: 30%; width: 25%; height: 60%; background: rgba(10,10,35,0.9); border: 2px solid #00f5ff; border-radius: 8px;"></div>
  <div class="alerts" style="position: absolute; left: 35%; top: 5%; width: 30%; height: 12%; background: rgba(10,10,35,0.9); border: 2px solid #00f5ff; border-radius: 8px;">Alerts</div>
</body>
</html>`;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">AI Overlay Generator</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Text Description
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Upload Image
          </TabsTrigger>
          <TabsTrigger value="html" className="flex items-center gap-2">
            <FileCode className="w-4 h-4" />
            HTML Template
          </TabsTrigger>
        </TabsList>

        {/* Text Description Tab */}
        <TabsContent value="text" className="space-y-4">
          <div className="space-y-3">
            <Label className="text-gray-300">
              Describe your ideal overlay layout
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Create a gaming overlay with webcam in bottom right, chat on left, and alerts at top center..."
              className="min-h-[120px] bg-gray-700/50 border-gray-600 text-white resize-none"
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-gray-400">Example prompts:</Label>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {examplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setDescription(prompt)}
                  className="block w-full text-left text-sm text-gray-400 hover:text-purple-400 transition-colors p-2 rounded bg-gray-700/30 hover:bg-gray-700/50"
                  disabled={isGenerating}
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleTextGenerate}
            disabled={isGenerating || !description.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate from Description
              </>
            )}
          </Button>
        </TabsContent>

        {/* Image Upload Tab */}
        <TabsContent value="image" className="space-y-4">
          <div className="space-y-3">
            <Label className="text-gray-300">
              Upload a screenshot of your desired overlay design
            </Label>
            <p className="text-sm text-gray-400">
              Upload an image of an overlay you like, and we'll analyze it to create a similar layout
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full bg-gray-700/30 border-gray-600 text-white hover:bg-gray-700/50"
              disabled={isGenerating}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Image
            </Button>

            {uploadedImage && (
              <div className="relative rounded-lg overflow-hidden border-2 border-purple-500/30 bg-gray-800/50 p-2">
                <img
                  src={uploadedImage}
                  alt="Uploaded overlay design"
                  className="w-full h-auto max-h-[300px] object-contain rounded"
                />
                <Button
                  onClick={() => setUploadedImage(null)}
                  variant="ghost"
                  size="sm"
                  className="absolute top-3 right-3 bg-gray-900/80 hover:bg-gray-900 text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500 p-3 rounded bg-blue-500/10 border border-blue-500/30">
            <p className="font-medium text-blue-400 mb-1">💡 AI Image Analysis</p>
            <p>Our AI will analyze the layout, positioning, and style of elements in your image to recreate a similar overlay design.</p>
          </div>

          <Button
            onClick={handleImageGenerate}
            disabled={isGenerating || !uploadedImage}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Image...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate from Image
              </>
            )}
          </Button>
        </TabsContent>

        {/* HTML Template Tab */}
        <TabsContent value="html" className="space-y-4">
          <div className="space-y-3">
            <Label className="text-gray-300">
              Paste your HTML overlay template
            </Label>
            <p className="text-sm text-gray-400">
              Import an existing HTML overlay and customize it with our editor
            </p>
            <Textarea
              value={htmlTemplate}
              onChange={(e) => setHtmlTemplate(e.target.value)}
              placeholder="Paste your HTML code here..."
              className="min-h-[200px] bg-gray-700/50 border-gray-600 text-white resize-none font-mono text-xs"
              disabled={isGenerating}
            />

            <Button
              onClick={() => setHtmlTemplate(exampleHTML)}
              variant="outline"
              size="sm"
              className="bg-gray-700/30 border-gray-600 text-gray-300 hover:bg-gray-700/50"
              disabled={isGenerating}
            >
              Load Example HTML
            </Button>
          </div>

          <div className="text-xs text-gray-500 p-3 rounded bg-green-500/10 border border-green-500/30">
            <p className="font-medium text-green-400 mb-1">📋 HTML Tips</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Use absolute positioning (left, top in % or px)</li>
              <li>Add class names like "webcam", "chat", "alerts" for auto-detection</li>
              <li>Include data-type attribute for precise element type mapping</li>
            </ul>
          </div>

          <Button
            onClick={handleHTMLImport}
            disabled={isGenerating || !htmlTemplate.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Parsing HTML...
              </>
            ) : (
              <>
                <FileCode className="w-4 h-4 mr-2" />
                Import HTML Template
              </>
            )}
          </Button>
        </TabsContent>
      </Tabs>

      {error && (
        <div className="p-3 rounded bg-red-500/10 border border-red-500/30">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="text-xs text-gray-500 pt-2">
        <p>💡 Tip: After generating, you can drag elements around and customize them using the editor panels.</p>
      </div>
    </div>
  );
}
