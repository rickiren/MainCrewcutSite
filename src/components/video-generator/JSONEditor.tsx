import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VideoJSONConfig, validateVideoConfig } from '@/types/videoJSON';
import { FileJson, Play, AlertCircle, CheckCircle2 } from 'lucide-react';

interface JSONEditorProps {
  onConfigUpdate: (config: VideoJSONConfig) => void;
}

const EXAMPLE_JSON = `{
  "videoId": "demo-video-1",
  "aspectRatio": "16/9",
  "fps": 30,
  "durationInFrames": 420,
  "globalSettings": {
    "backgroundColor": "#0c0014",
    "primaryColor": "#9333ea",
    "secondaryColor": "#764ba2",
    "accentColor": "#f093fb",
    "fontFamily": "Inter, sans-serif"
  },
  "scenes": [
    {
      "id": "intro",
      "type": "textReveal",
      "durationInFrames": 90,
      "props": {
        "textLines": [
          { "text": "Welcome to" },
          { "text": "JSON Video Creator", "style": "metallic" }
        ],
        "animation": {
          "type": "fadeIn",
          "staggerInFrames": 10
        },
        "effects": {
          "glow": { "color": "rgba(147, 51, 234, 0.6)", "radius": 30 }
        }
      }
    },
    {
      "id": "stats",
      "type": "statCard",
      "durationInFrames": 150,
      "props": {
        "title": "Impressive Numbers",
        "cards": [
          {
            "label": "Videos Created",
            "value": "1000+",
            "gradient": ["#D946EF", "#B91C1C"]
          },
          {
            "label": "Happy Users",
            "value": "5000+",
            "gradient": ["#A855F7", "#4F46E5"]
          },
          {
            "label": "Hours Saved",
            "value": "10K+",
            "gradient": ["#EC4899", "#D946EF"]
          }
        ]
      }
    },
    {
      "id": "cta",
      "type": "ctaButton",
      "durationInFrames": 180,
      "props": {
        "preText": "Ready to create amazing videos?",
        "buttonText": "Get Started Now",
        "effect": {
          "type": "pulse",
          "intensity": 0.08
        }
      }
    }
  ]
}`;

export const JSONEditor: React.FC<JSONEditorProps> = ({ onConfigUpdate }) => {
  const [jsonText, setJsonText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationSuccess, setValidationSuccess] = useState(false);

  const handleLoadExample = () => {
    setJsonText(EXAMPLE_JSON);
    setValidationError(null);
    setValidationSuccess(false);
  };

  const handlePreview = () => {
    try {
      // Parse JSON
      const parsed = JSON.parse(jsonText);

      // Validate structure
      if (!validateVideoConfig(parsed)) {
        throw new Error('Invalid video configuration structure. Please check required fields.');
      }

      // Success!
      setValidationError(null);
      setValidationSuccess(true);
      onConfigUpdate(parsed);

    } catch (error) {
      if (error instanceof SyntaxError) {
        setValidationError(`JSON Syntax Error: ${error.message}`);
      } else if (error instanceof Error) {
        setValidationError(error.message);
      } else {
        setValidationError('An unknown error occurred');
      }
      setValidationSuccess(false);
    }
  };

  const handleTextChange = (value: string) => {
    setJsonText(value);
    setValidationSuccess(false);
    if (validationError) {
      setValidationError(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileJson className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">JSON Video Configuration</h3>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleLoadExample} variant="outline" size="sm">
            Load Example
          </Button>
          <Button
            onClick={handlePreview}
            disabled={!jsonText.trim()}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            <Play className="w-4 h-4 mr-2" />
            Preview Video
          </Button>
        </div>
      </div>

      {/* JSON Input */}
      <Textarea
        value={jsonText}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder="Paste your JSON video configuration here..."
        className="font-mono text-sm min-h-[400px] resize-y"
      />

      {/* Validation Feedback */}
      {validationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      {validationSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ✓ Valid JSON! Your video is now previewing above.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Reference */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm">
        <h4 className="font-semibold mb-2">Available Scene Types:</h4>
        <ul className="space-y-1 text-gray-600">
          <li>• <code className="bg-gray-200 px-1 rounded">textReveal</code> - Animated text with effects</li>
          <li>• <code className="bg-gray-200 px-1 rounded">statCard</code> - Statistics cards with gradients</li>
          <li>• <code className="bg-gray-200 px-1 rounded">ctaButton</code> - Call-to-action with animations</li>
          <li>• <code className="bg-gray-200 px-1 rounded">uiGrid</code> - Grid of UI elements/images</li>
          <li>• <code className="bg-gray-200 px-1 rounded">staticImageShowcase</code> - Image with zoom effects</li>
          <li>• <code className="bg-gray-200 px-1 rounded">simple3DText</code> - 3D floating glass cards scene</li>
        </ul>
      </div>
    </div>
  );
};
