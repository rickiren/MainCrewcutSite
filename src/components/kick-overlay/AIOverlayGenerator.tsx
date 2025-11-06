import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, X, Loader2, Image as ImageIcon, Code } from 'lucide-react';
import type { OverlayElement } from '@/types/overlay';
import { ELEMENT_PRESETS, OVERLAY_THEMES } from '@/types/overlay';
import { KickImageUploader } from './KickImageUploader';
import { KickHTMLTemplateInput } from './KickHTMLTemplateInput';
import { parseHTMLTemplate, analyzeImageDesign } from '@/utils/overlayParser';

interface AIOverlayGeneratorProps {
  onGenerate: (elements: OverlayElement[], htmlTemplate?: string, cssTemplate?: string) => void;
  onClose: () => void;
}

export function AIOverlayGenerator({ onGenerate, onClose }: AIOverlayGeneratorProps) {
  const [activeTab, setActiveTab] = useState('text');
  const [description, setDescription] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');

    try {
      let elements: OverlayElement[] = [];

      if (activeTab === 'text') {
        if (!description.trim()) {
          setError('Please enter a description');
          setIsGenerating(false);
          return;
        }
        // Parse the description and generate elements
        elements = parseDescriptionToElements(description);
        // Simulate AI processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else if (activeTab === 'image') {
        if (!uploadedImage) {
          setError('Please upload an image first');
          setIsGenerating(false);
          return;
        }
        setIsAnalyzing(true);
        elements = await analyzeImageDesign(uploadedImage);
        setIsAnalyzing(false);
      } else if (activeTab === 'html') {
        setError('Please use the HTML template input below');
        setIsGenerating(false);
        return;
      }

      onGenerate(elements);
    } catch (err) {
      setError('Failed to generate overlay. Please try again.');
      console.error(err);
      setIsAnalyzing(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (imageData: string, fileName: string) => {
    setUploadedImage(imageData);
    setError('');
  };

  const handleImageRemove = () => {
    setUploadedImage(null);
  };

  const handleHTMLTemplateSubmit = async (html: string, css: string) => {
    setIsGenerating(true);
    setError('');

    try {
      if (!html || !html.trim()) {
        setError('Please provide HTML content');
        setIsGenerating(false);
        return;
      }

      const result = parseHTMLTemplate(html, css);
      // Pass both elements and HTML/CSS templates for exact design preservation
      onGenerate(result.elements, result.htmlTemplate, result.cssTemplate);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse HTML template. Please check your code.';
      setError(errorMessage);
      console.error('HTML parsing error:', err);
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
          <TabsTrigger value="text" className="data-[state=active]:bg-purple-600">
            <Sparkles className="w-4 h-4 mr-1" />
            Text
          </TabsTrigger>
          <TabsTrigger value="image" className="data-[state=active]:bg-purple-600">
            <ImageIcon className="w-4 h-4 mr-1" />
            Image
          </TabsTrigger>
          <TabsTrigger value="html" className="data-[state=active]:bg-purple-600">
            <Code className="w-4 h-4 mr-1" />
            HTML
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4 mt-4">
          <div className="space-y-3">
            <Label className="text-gray-300">
              Describe your ideal overlay layout
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Create a gaming overlay with webcam in bottom right, chat on left, and alerts at top center..."
              className="min-h-[100px] bg-gray-700/50 border-gray-600 text-white resize-none"
              disabled={isGenerating}
            />

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-gray-400">Example prompts:</Label>
            <div className="space-y-2">
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

          <div className="text-xs text-gray-500 pt-2">
            <p>💡 Tip: Mention specific elements like "webcam", "chat", "alerts", "donation goal", or describe a layout like "gaming", "minimal", or "full featured".</p>
          </div>
        </TabsContent>

        <TabsContent value="image" className="space-y-4 mt-4">
          <div className="space-y-3">
            <Label className="text-gray-300">
              Upload a screenshot of a design you like
            </Label>
            <KickImageUploader
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
              uploadedImage={uploadedImage}
              isAnalyzing={isAnalyzing}
            />

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
          </div>

          <div className="text-xs text-gray-500 pt-2">
            <p>💡 Tip: Upload a screenshot of any overlay design. The AI will analyze it and recreate a similar layout with positioned elements.</p>
          </div>
        </TabsContent>

        <TabsContent value="html" className="space-y-4 mt-4">
          <KickHTMLTemplateInput
            onTemplateSubmit={handleHTMLTemplateSubmit}
            isProcessing={isGenerating}
          />

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 pt-4 border-t border-gray-700">
        {activeTab !== 'html' && (
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || (activeTab === 'text' && !description.trim()) || (activeTab === 'image' && !uploadedImage)}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {activeTab === 'image' ? 'Analyzing...' : 'Generating...'}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Overlay
              </>
            )}
          </Button>
        )}
        <Button
          onClick={onClose}
          variant="outline"
          className="bg-gray-700/30 border-gray-600 text-gray-300 hover:bg-gray-700/50"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
