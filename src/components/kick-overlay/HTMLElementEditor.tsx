import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Type, Palette } from 'lucide-react';

interface HTMLElementEditorProps {
  element: HTMLElement | null;
  onUpdate: (updates: Partial<CSSStyleDeclaration>) => void;
  onUpdateContent: (content: string) => void;
  onDelete?: () => void;
}

export function HTMLElementEditor({ element, onUpdate, onUpdateContent, onDelete }: HTMLElementEditorProps) {
  const [textContent, setTextContent] = useState('');
  const [fontSize, setFontSize] = useState('16');
  const [color, setColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('');
  const [fontWeight, setFontWeight] = useState('400');

  useEffect(() => {
    if (element) {
      const computed = window.getComputedStyle(element);
      setTextContent(element.textContent || '');
      setFontSize(parseInt(computed.fontSize) || 16);
      setColor(rgbToHex(computed.color));
      setBackgroundColor(rgbToHex(computed.backgroundColor));
      setFontWeight(computed.fontWeight || '400');
    }
  }, [element]);

  const rgbToHex = (rgb: string): string => {
    if (!rgb || rgb === 'rgba(0, 0, 0, 0)' || rgb === 'transparent') return '';

    const result = rgb.match(/\d+/g);
    if (!result || result.length < 3) return '';

    const r = parseInt(result[0]);
    const g = parseInt(result[1]);
    const b = parseInt(result[2]);

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  const handleTextUpdate = () => {
    onUpdateContent(textContent);
  };

  const handleStyleUpdate = (property: string, value: string) => {
    onUpdate({ [property]: value } as Partial<CSSStyleDeclaration>);
  };

  if (!element) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Type className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Select an element to edit its properties</p>
        <p className="text-xs mt-2">Click "Edit Mode" and select any text element</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Edit Element</h3>
        {onDelete && (
          <Button
            onClick={onDelete}
            size="sm"
            variant="destructive"
            className="h-8"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Remove
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {/* Element Info */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2 text-sm">
            <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs font-mono">
              {element.tagName.toLowerCase()}
            </span>
            <span className="text-gray-400">HTML Element</span>
          </div>
        </div>

        {/* Text Content */}
        <div>
          <Label className="text-gray-300 mb-2 flex items-center gap-2">
            <Type className="w-4 h-4" />
            Text Content
          </Label>
          <Textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            onBlur={handleTextUpdate}
            className="bg-gray-700/50 border-gray-600 text-white min-h-[80px]"
            placeholder="Enter text..."
          />
        </div>

        {/* Typography */}
        <div className="space-y-3 border-t border-gray-700 pt-3">
          <Label className="text-gray-300 flex items-center gap-2">
            <Type className="w-4 h-4" />
            Typography
          </Label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-400 mb-1">Font Size</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={fontSize}
                  onChange={(e) => {
                    setFontSize(e.target.value);
                    handleStyleUpdate('fontSize', `${e.target.value}px`);
                  }}
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
                <span className="text-xs text-gray-400">px</span>
              </div>
            </div>

            <div>
              <Label className="text-xs text-gray-400 mb-1">Font Weight</Label>
              <select
                value={fontWeight}
                onChange={(e) => {
                  setFontWeight(e.target.value);
                  handleStyleUpdate('fontWeight', e.target.value);
                }}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white text-sm"
              >
                <option value="300">Light</option>
                <option value="400">Normal</option>
                <option value="500">Medium</option>
                <option value="600">Semibold</option>
                <option value="700">Bold</option>
                <option value="800">Extra Bold</option>
              </select>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-3 border-t border-gray-700 pt-3">
          <Label className="text-gray-300 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Colors
          </Label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-400 mb-1">Text Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    handleStyleUpdate('color', e.target.value);
                  }}
                  className="w-12 h-10 bg-gray-700/50 border-gray-600 cursor-pointer"
                />
                <Input
                  type="text"
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    handleStyleUpdate('color', e.target.value);
                  }}
                  className="flex-1 bg-gray-700/50 border-gray-600 text-white font-mono text-xs"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-gray-400 mb-1">Background</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={backgroundColor || '#ffffff'}
                  onChange={(e) => {
                    setBackgroundColor(e.target.value);
                    handleStyleUpdate('backgroundColor', e.target.value);
                  }}
                  className="w-12 h-10 bg-gray-700/50 border-gray-600 cursor-pointer"
                />
                <Input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => {
                    setBackgroundColor(e.target.value);
                    handleStyleUpdate('backgroundColor', e.target.value);
                  }}
                  className="flex-1 bg-gray-700/50 border-gray-600 text-white font-mono text-xs"
                  placeholder="transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3 text-xs text-blue-300">
          <p className="font-medium mb-1">💡 Tips:</p>
          <ul className="space-y-1 text-blue-200/80">
            <li>• Drag the element outline to reposition</li>
            <li>• Changes are applied in real-time</li>
            <li>• Export HTML to save your edits</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
