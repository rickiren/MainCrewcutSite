import { useState } from 'react';
import { Plus, Video, MessageSquare, Bell, Type, Image, DollarSign, Users, Eye, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { OverlayElement, OverlayElementType, OverlayTheme } from '@/types/overlay';
import { ELEMENT_PRESETS } from '@/types/overlay';

interface ElementPanelProps {
  onAddElement: (element: OverlayElement) => void;
  selectedElement?: OverlayElement;
  onUpdateElement: (updates: Partial<OverlayElement>) => void;
  theme: OverlayTheme;
}

const ELEMENT_TYPES: { type: OverlayElementType; label: string; icon: any }[] = [
  { type: 'webcam', label: 'Webcam', icon: Video },
  { type: 'chat', label: 'Chat', icon: MessageSquare },
  { type: 'alerts', label: 'Alerts', icon: Bell },
  { type: 'label', label: 'Label', icon: Type },
  { type: 'image', label: 'Image', icon: Image },
  { type: 'donation-goal', label: 'Donation Goal', icon: DollarSign },
  { type: 'subscriber-count', label: 'Subscribers', icon: Users },
  { type: 'follower-count', label: 'Followers', icon: Users },
  { type: 'recent-events', label: 'Recent Events', icon: Eye },
  { type: 'custom-box', label: 'Custom Box', icon: Box },
];

export function ElementPanel({ onAddElement, selectedElement, onUpdateElement, theme }: ElementPanelProps) {
  const [showAddElements, setShowAddElements] = useState(true);

  const handleAddElement = (type: OverlayElementType) => {
    const preset = ELEMENT_PRESETS[type];
    const newElement: OverlayElement = {
      id: `${type}-${Date.now()}`,
      type,
      label: preset.label || type,
      position: preset.position || { x: 10, y: 10 },
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

    onAddElement(newElement);
  };

  return (
    <div className="space-y-6">
      {/* Add Elements Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Add Elements</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowAddElements(!showAddElements)}
            className="text-gray-400 hover:text-white"
          >
            {showAddElements ? '−' : '+'}
          </Button>
        </div>

        {showAddElements && (
          <div className="grid grid-cols-2 gap-2">
            {ELEMENT_TYPES.map(({ type, label, icon: Icon }) => (
              <Button
                key={type}
                onClick={() => handleAddElement(type)}
                variant="outline"
                className="h-auto flex flex-col items-center gap-2 py-3 bg-gray-700/30 border-gray-600 hover:bg-gray-700/50 hover:border-purple-500 text-white"
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>
        )}
      </div>

      <Separator className="bg-gray-700" />

      {/* Edit Selected Element */}
      {selectedElement ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Edit Element</h3>

          {/* Label */}
          <div className="space-y-2">
            <Label className="text-gray-300">Label</Label>
            <Input
              value={selectedElement.label}
              onChange={(e) => onUpdateElement({ label: e.target.value })}
              className="bg-gray-700/50 border-gray-600 text-white"
            />
          </div>

          {/* Content (for text-based elements) */}
          {(selectedElement.type === 'label' || selectedElement.type === 'custom-box') && (
            <div className="space-y-2">
              <Label className="text-gray-300">Content</Label>
              <Input
                value={selectedElement.content || ''}
                onChange={(e) => onUpdateElement({ content: e.target.value })}
                placeholder="Enter text content"
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
          )}

          {/* Position */}
          <div className="space-y-3">
            <Label className="text-gray-300">Position</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">X ({selectedElement.position.x.toFixed(1)}%)</Label>
                <Slider
                  value={[selectedElement.position.x]}
                  onValueChange={([x]) => onUpdateElement({ position: { ...selectedElement.position, x } })}
                  min={0}
                  max={100 - selectedElement.size.width}
                  step={0.1}
                  className="bg-gray-700"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Y ({selectedElement.position.y.toFixed(1)}%)</Label>
                <Slider
                  value={[selectedElement.position.y]}
                  onValueChange={([y]) => onUpdateElement({ position: { ...selectedElement.position, y } })}
                  min={0}
                  max={100 - selectedElement.size.height}
                  step={0.1}
                  className="bg-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Size */}
          <div className="space-y-3">
            <Label className="text-gray-300">Size</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Width ({selectedElement.size.width.toFixed(1)}%)</Label>
                <Slider
                  value={[selectedElement.size.width]}
                  onValueChange={([width]) => onUpdateElement({ size: { ...selectedElement.size, width } })}
                  min={5}
                  max={100 - selectedElement.position.x}
                  step={0.1}
                  className="bg-gray-700"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Height ({selectedElement.size.height.toFixed(1)}%)</Label>
                <Slider
                  value={[selectedElement.size.height]}
                  onValueChange={([height]) => onUpdateElement({ size: { ...selectedElement.size, height } })}
                  min={5}
                  max={100 - selectedElement.position.y}
                  step={0.1}
                  className="bg-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <Label className="text-gray-300">Font Size ({selectedElement.style.fontSize || 16}px)</Label>
            <Slider
              value={[selectedElement.style.fontSize || 16]}
              onValueChange={([fontSize]) => onUpdateElement({
                style: { ...selectedElement.style, fontSize }
              })}
              min={8}
              max={72}
              step={1}
              className="bg-gray-700"
            />
          </div>

          {/* Text Alignment */}
          <div className="space-y-2">
            <Label className="text-gray-300">Text Alignment</Label>
            <Select
              value={selectedElement.style.textAlign || 'center'}
              onValueChange={(textAlign: 'left' | 'center' | 'right') =>
                onUpdateElement({ style: { ...selectedElement.style, textAlign } })
              }
            >
              <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Opacity */}
          <div className="space-y-2">
            <Label className="text-gray-300">Opacity ({((selectedElement.style.opacity || 1) * 100).toFixed(0)}%)</Label>
            <Slider
              value={[(selectedElement.style.opacity || 1) * 100]}
              onValueChange={([value]) => onUpdateElement({
                style: { ...selectedElement.style, opacity: value / 100 }
              })}
              min={0}
              max={100}
              step={1}
              className="bg-gray-700"
            />
          </div>

          {/* Z-Index */}
          <div className="space-y-2">
            <Label className="text-gray-300">Layer (Z-Index: {selectedElement.zIndex || 0})</Label>
            <Slider
              value={[selectedElement.zIndex || 0]}
              onValueChange={([zIndex]) => onUpdateElement({ zIndex })}
              min={0}
              max={100}
              step={1}
              className="bg-gray-700"
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Select an element to edit its properties</p>
        </div>
      )}
    </div>
  );
}
