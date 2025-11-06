import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Edit3, Palette, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ExtractedHTMLElement } from './OverlayCanvas';

interface HTMLEditorPanelProps {
  editMode: boolean;
  extractedElements: ExtractedHTMLElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (elementId: string, updates: { content?: string; style?: Partial<CSSStyleDeclaration> }) => void;
  onSave?: () => void;
}

export function HTMLEditorPanel({
  editMode,
  extractedElements,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onSave,
}: HTMLEditorPanelProps) {
  const [textContent, setTextContent] = useState('');
  const [fontSize, setFontSize] = useState('16');
  const [color, setColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('');
  const [fontWeight, setFontWeight] = useState('400');
  const [fontFamily, setFontFamily] = useState('');

  const selected = extractedElements.find((el) => el.id === selectedElementId);

  useEffect(() => {
    if (selected) {
      setTextContent(selected.textContent || '');
      setFontSize(String(parseInt(selected.computedStyle.fontSize) || 16));
      setColor(rgbToHex(selected.computedStyle.color));
      setBackgroundColor(rgbToHex(selected.computedStyle.backgroundColor));
      setFontWeight(selected.computedStyle.fontWeight || '400');
      setFontFamily(selected.computedStyle.fontFamily || '');
    }
  }, [selected]);

  const rgbToHex = (rgb: string): string => {
    if (!rgb || rgb === 'rgba(0, 0, 0, 0)' || rgb === 'transparent') return '#000000';
    const result = rgb.match(/\d+/g);
    if (!result || result.length < 3) return '#000000';
    const r = parseInt(result[0]);
    const g = parseInt(result[1]);
    const b = parseInt(result[2]);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  const handleContentUpdate = (content: string) => {
    if (selected) {
      setTextContent(content);

      // Preserve inline styles and structure by using innerHTML for simple text
      // If the element has no child elements, we can safely use textContent
      // Otherwise, try to update just the text nodes to preserve structure
      if (selected.element.children.length === 0) {
        // No child elements, safe to use textContent
        selected.element.textContent = content;
      } else {
        // Has child elements, update innerHTML carefully
        // This preserves child elements like <span>, <strong>, etc.
        const firstTextNode = Array.from(selected.element.childNodes).find(
          node => node.nodeType === Node.TEXT_NODE
        );
        if (firstTextNode) {
          firstTextNode.textContent = content;
        } else {
          // Fallback to innerHTML if no text nodes
          selected.element.innerHTML = content;
        }
      }

      onUpdateElement(selected.id, { content });
    }
  };

  const handleStyleUpdate = (property: string, value: string) => {
    if (selected && selected.element) {
      (selected.element.style as any)[property] = value;
      onUpdateElement(selected.id, { style: { [property]: value } as Partial<CSSStyleDeclaration> });
    }
  };

  if (!editMode) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Edit Mode Info */}
      {extractedElements.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-white">📝 Edit Mode Active</h4>
              {onSave && (
                <Button
                  onClick={onSave}
                  size="sm"
                  variant="outline"
                  className="bg-blue-600/20 border-blue-500 text-blue-200 hover:bg-blue-600/30 h-7 text-xs"
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
              )}
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <p>✓ {extractedElements.length} editable elements detected</p>
              <p>💡 <strong>Tip:</strong> Add <code className="bg-gray-700 px-1 rounded text-purple-300">data-editable="true"</code> to any HTML element to make it customizable</p>
              <p>🎯 Elements with <code className="bg-gray-700 px-1 rounded text-purple-300">data-id="your-id"</code> will use that ID for tracking</p>
              {onSave && (
                <p className="text-yellow-400 mt-2">💾 Changes are saved automatically when exiting edit mode, or click Save to save now</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Element List */}
      {extractedElements.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-semibold text-white mb-2">📋 Editable Elements ({extractedElements.length})</h3>
            <p className="text-xs text-gray-400 mb-3">Click an element to edit</p>
          </div>
          <div className="max-h-[200px] overflow-y-auto p-2">
            <div className="grid grid-cols-1 gap-2">
              {extractedElements.map((el) => {
                const isSelected = selectedElementId === el.id;
                return (
                  <button
                    key={el.id}
                    onClick={() => onSelectElement(el.id)}
                    className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      isSelected
                        ? 'bg-blue-600/30 border-2 border-blue-500 text-white'
                        : 'bg-gray-700/50 border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-purple-300">{el.tagName}</span>
                          {isSelected && <span className="text-xs text-blue-400">✓ Selected</span>}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {el.textContent || '(empty)'}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Selected Element Editor */}
      {selected ? (
        <Card className="bg-gray-800/50 border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">✏️ Edit Selected Element</h3>
            <div className="text-sm text-gray-400 mt-1 space-y-1">
              <p>
                <span className="text-gray-500">Tag:</span> <span className="text-purple-300 font-mono">{selected.tagName}</span>
              </p>
              <p>
                <span className="text-gray-500">ID:</span> <span className="text-blue-300 font-mono text-xs">{selected.id}</span>
              </p>
              {selected.id.startsWith('auto-') && (
                <p className="text-xs text-yellow-400">
                  ⚠️ Auto-generated ID - add <code className="bg-gray-700 px-1 rounded">data-id</code> to HTML for persistence
                </p>
              )}
            </div>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Text Content */}
              <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
                <label className="block text-base font-semibold text-white mb-3 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-400" />
                  Edit Text Content
                </label>
                <textarea
                  key={selected.id}
                  value={textContent}
                  onChange={(e) => handleContentUpdate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/80 border-2 border-blue-600/50 rounded-md text-white text-base min-h-[120px] resize-y focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Enter text content here..."
                />
                <p className="text-xs text-blue-300 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Changes apply instantly as you type
                </p>
              </div>

              {/* Colors Section */}
              <div className="bg-purple-600/10 border border-purple-600/30 rounded-lg p-4">
                <label className="block text-base font-semibold text-white mb-3 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-400" />
                  Colors & Styling
                </label>
                
                {/* Text Color */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Text Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        setColor(e.target.value);
                        handleStyleUpdate('color', e.target.value);
                      }}
                      className="w-16 h-12 bg-gray-700/50 border-2 border-gray-600 rounded-md cursor-pointer hover:border-purple-500 transition-colors"
                      title="Click to pick text color"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => {
                        setColor(e.target.value);
                        handleStyleUpdate('color', e.target.value);
                      }}
                      onBlur={(e) => handleStyleUpdate('color', e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-900/80 border-2 border-gray-600 rounded-md text-white text-sm font-mono focus:border-purple-500 focus:outline-none"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                {/* Background Color */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Background Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={backgroundColor !== '#000000' ? backgroundColor : '#ffffff'}
                      onChange={(e) => {
                        setBackgroundColor(e.target.value);
                        handleStyleUpdate('backgroundColor', e.target.value);
                      }}
                      className="w-16 h-12 bg-gray-700/50 border-2 border-gray-600 rounded-md cursor-pointer hover:border-purple-500 transition-colors"
                      title="Click to pick background color"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => {
                        setBackgroundColor(e.target.value);
                        handleStyleUpdate('backgroundColor', e.target.value);
                      }}
                      onBlur={(e) => handleStyleUpdate('backgroundColor', e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-900/80 border-2 border-gray-600 rounded-md text-white text-sm font-mono focus:border-purple-500 focus:outline-none"
                      placeholder="transparent"
                    />
                  </div>
                </div>

                {/* Font Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Font Size (px)</label>
                  <input
                    type="number"
                    value={fontSize}
                    onChange={(e) => {
                      setFontSize(e.target.value);
                      handleStyleUpdate('fontSize', `${e.target.value}px`);
                    }}
                    className="w-full px-3 py-2 bg-gray-900/80 border-2 border-gray-600 rounded-md text-white text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Font Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Font Weight</label>
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

              {/* Font Family */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Font Family</label>
                <select
                  value={fontFamily}
                  onChange={(e) => {
                    setFontFamily(e.target.value);
                    handleStyleUpdate('fontFamily', e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white text-sm"
                >
                  <option value="">Default (from HTML)</option>
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
                  <option value="'Times New Roman', Times, serif">Times New Roman</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Courier New', Courier, monospace">Courier New</option>
                  <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
                  <option value="Impact, fantasy">Impact</option>
                  <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                  <option value="Verdana, sans-serif">Verdana</option>
                </select>
              </div>

              <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3 text-xs text-blue-300">
                <p className="font-medium mb-1">💡 Quick Tips:</p>
                <ul className="space-y-1 text-blue-200/80">
                  <li>• Changes apply instantly to the preview</li>
                  <li>• Drag the blue outline to move the element</li>
                  <li>• Drag corner/edge handles to resize</li>
                  <li>• Export HTML to save all your changes</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      ) : extractedElements.length > 0 ? (
        <Card className="bg-gray-800/50 border-gray-700 border-2 border-dashed border-yellow-500/50">
          <div className="p-6 text-center">
            <Edit3 className="w-12 h-12 mx-auto mb-3 text-yellow-400 opacity-75" />
            <p className="text-base font-semibold text-white mb-2">Ready to Edit!</p>
            <p className="text-sm text-gray-300 mb-4">
              Select an element from the list above or click directly on any <span className="text-green-400 font-semibold">green-bordered element</span> in the preview to edit its text and colors
            </p>
            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3 text-left text-xs text-blue-200">
              <p className="font-semibold mb-1">💡 Quick Tip:</p>
              <p>Once selected, you'll see text editing, color pickers, font size controls, and more!</p>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

