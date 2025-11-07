import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import type { OverlayConfig, OverlayElement, OverlayTheme } from '@/types/overlay';
import { OVERLAY_THEMES, CANVAS_PRESETS } from '@/types/overlay';
import { Palette, Monitor } from 'lucide-react';

interface StyleCustomizerProps {
  config: OverlayConfig;
  selectedElement?: OverlayElement;
  onUpdateConfig: (updates: Partial<OverlayConfig>) => void;
  onUpdateElement: (updates: Partial<OverlayElement>) => void;
  onThemeChange: (theme: OverlayTheme) => void;
}

export function StyleCustomizer({
  config,
  selectedElement,
  onUpdateConfig,
  onUpdateElement,
  onThemeChange,
}: StyleCustomizerProps) {
  const handleCanvasSizeChange = (preset: keyof typeof CANVAS_PRESETS) => {
    const { width, height } = CANVAS_PRESETS[preset];
    onUpdateConfig({
      canvas: {
        ...config.canvas,
        width,
        height,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Theme Selector */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white">
          <Palette className="w-4 h-4" />
          <Label className="text-lg font-semibold">Theme</Label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {OVERLAY_THEMES.map((theme) => (
            <Button
              key={theme.id}
              onClick={() => onThemeChange(theme)}
              variant={config.theme.id === theme.id ? 'default' : 'outline'}
              className={`h-auto flex flex-col items-start gap-2 p-3 ${
                config.theme.id === theme.id
                  ? 'bg-purple-600 border-purple-500'
                  : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50'
              }`}
            >
              <div className="flex gap-1">
                {Object.values(theme.colors).slice(0, 4).map((color, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-white">{theme.name}</div>
                <div className="text-xs text-gray-400">{theme.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      <Separator className="bg-gray-700" />

      {/* Canvas Settings */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white">
          <Monitor className="w-4 h-4" />
          <Label className="text-lg font-semibold">Canvas</Label>
        </div>

        {/* Canvas Size Preset */}
        <div className="space-y-2">
          <Label className="text-gray-300">Resolution</Label>
          <Select
            value={
              Object.entries(CANVAS_PRESETS).find(
                ([_, preset]) =>
                  preset.width === config.canvas.width && preset.height === config.canvas.height
              )?.[0] || 'custom'
            }
            onValueChange={(value) => {
              if (value !== 'custom') {
                handleCanvasSizeChange(value as keyof typeof CANVAS_PRESETS);
              }
            }}
          >
            <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CANVAS_PRESETS).map(([key, preset]) => (
                <SelectItem key={key} value={key}>
                  {preset.name} ({preset.width}×{preset.height})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Canvas Size */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-gray-300">Width (px)</Label>
            <Input
              type="number"
              value={config.canvas.width}
              onChange={(e) =>
                onUpdateConfig({
                  canvas: { ...config.canvas, width: parseInt(e.target.value) || 1920 },
                })
              }
              className="bg-gray-700/50 border-gray-600 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Height (px)</Label>
            <Input
              type="number"
              value={config.canvas.height}
              onChange={(e) =>
                onUpdateConfig({
                  canvas: { ...config.canvas, height: parseInt(e.target.value) || 1080 },
                })
              }
              className="bg-gray-700/50 border-gray-600 text-white"
            />
          </div>
        </div>

        {/* Background Color */}
        <div className="space-y-2">
          <Label className="text-gray-300">Background Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={config.canvas.backgroundColor}
              onChange={(e) =>
                onUpdateConfig({
                  canvas: { ...config.canvas, backgroundColor: e.target.value },
                })
              }
              className="w-16 h-10 bg-gray-700/50 border-gray-600"
            />
            <Input
              type="text"
              value={config.canvas.backgroundColor}
              onChange={(e) =>
                onUpdateConfig({
                  canvas: { ...config.canvas, backgroundColor: e.target.value },
                })
              }
              placeholder="rgba(0,0,0,0)"
              className="flex-1 bg-gray-700/50 border-gray-600 text-white"
            />
          </div>
        </div>
      </div>

      <Separator className="bg-gray-700" />

      {/* Element Styling (when element is selected) */}
      {selectedElement && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Element Style</h3>

          {/* Colors */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-gray-300">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={selectedElement.style.backgroundColor || '#000000'}
                  onChange={(e) =>
                    onUpdateElement({
                      style: { ...selectedElement.style, backgroundColor: e.target.value },
                    })
                  }
                  className="w-16 h-10 bg-gray-700/50 border-gray-600"
                />
                <Input
                  type="text"
                  value={selectedElement.style.backgroundColor || ''}
                  onChange={(e) =>
                    onUpdateElement({
                      style: { ...selectedElement.style, backgroundColor: e.target.value },
                    })
                  }
                  placeholder="rgba(0,0,0,0.9)"
                  className="flex-1 bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={selectedElement.style.textColor || '#ffffff'}
                  onChange={(e) =>
                    onUpdateElement({
                      style: { ...selectedElement.style, textColor: e.target.value },
                    })
                  }
                  className="w-16 h-10 bg-gray-700/50 border-gray-600"
                />
                <Input
                  type="text"
                  value={selectedElement.style.textColor || ''}
                  onChange={(e) =>
                    onUpdateElement({
                      style: { ...selectedElement.style, textColor: e.target.value },
                    })
                  }
                  className="flex-1 bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Border Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={selectedElement.style.borderColor || '#ffffff'}
                  onChange={(e) =>
                    onUpdateElement({
                      style: { ...selectedElement.style, borderColor: e.target.value },
                    })
                  }
                  className="w-16 h-10 bg-gray-700/50 border-gray-600"
                />
                <Input
                  type="text"
                  value={selectedElement.style.borderColor || ''}
                  onChange={(e) =>
                    onUpdateElement({
                      style: { ...selectedElement.style, borderColor: e.target.value },
                    })
                  }
                  className="flex-1 bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
            </div>
          </div>

          {/* Border Style */}
          <div className="space-y-2">
            <Label className="text-gray-300">Border Style</Label>
            <Select
              value={selectedElement.style.borderStyle || 'solid'}
              onValueChange={(borderStyle: 'solid' | 'dashed' | 'dotted' | 'none') =>
                onUpdateElement({ style: { ...selectedElement.style, borderStyle } })
              }
            >
              <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Border Width */}
          <div className="space-y-2">
            <Label className="text-gray-300">
              Border Width ({selectedElement.style.borderWidth || 0}px)
            </Label>
            <Slider
              value={[selectedElement.style.borderWidth || 0]}
              onValueChange={([borderWidth]) =>
                onUpdateElement({
                  style: { ...selectedElement.style, borderWidth },
                })
              }
              min={0}
              max={20}
              step={1}
              className="bg-gray-700"
            />
          </div>

          {/* Border Radius */}
          <div className="space-y-2">
            <Label className="text-gray-300">
              Border Radius ({selectedElement.style.borderRadius || 0}px)
            </Label>
            <Slider
              value={[selectedElement.style.borderRadius || 0]}
              onValueChange={([borderRadius]) =>
                onUpdateElement({
                  style: { ...selectedElement.style, borderRadius },
                })
              }
              min={0}
              max={50}
              step={1}
              className="bg-gray-700"
            />
          </div>

          {/* Font Weight */}
          <div className="space-y-2">
            <Label className="text-gray-300">Font Weight</Label>
            <Select
              value={String(selectedElement.style.fontWeight || 400)}
              onValueChange={(value) =>
                onUpdateElement({
                  style: { ...selectedElement.style, fontWeight: parseInt(value) },
                })
              }
            >
              <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="300">Light (300)</SelectItem>
                <SelectItem value="400">Normal (400)</SelectItem>
                <SelectItem value="500">Medium (500)</SelectItem>
                <SelectItem value="600">Semi-Bold (600)</SelectItem>
                <SelectItem value="700">Bold (700)</SelectItem>
                <SelectItem value="800">Extra Bold (800)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Shadow */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Shadow</Label>
              <Switch
                checked={selectedElement.style.shadow?.enabled || false}
                onCheckedChange={(enabled) =>
                  onUpdateElement({
                    style: {
                      ...selectedElement.style,
                      shadow: {
                        enabled,
                        x: selectedElement.style.shadow?.x || 0,
                        y: selectedElement.style.shadow?.y || 4,
                        blur: selectedElement.style.shadow?.blur || 12,
                        color: selectedElement.style.shadow?.color || 'rgba(0,0,0,0.5)',
                      },
                    },
                  })
                }
              />
            </div>

            {selectedElement.style.shadow?.enabled && (
              <div className="space-y-3 pl-4 border-l-2 border-gray-700">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-400">
                    Blur ({selectedElement.style.shadow.blur}px)
                  </Label>
                  <Slider
                    value={[selectedElement.style.shadow.blur]}
                    onValueChange={([blur]) =>
                      onUpdateElement({
                        style: {
                          ...selectedElement.style,
                          shadow: { ...selectedElement.style.shadow!, blur },
                        },
                      })
                    }
                    min={0}
                    max={50}
                    step={1}
                    className="bg-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-gray-400">Shadow Color</Label>
                  <Input
                    type="text"
                    value={selectedElement.style.shadow.color}
                    onChange={(e) =>
                      onUpdateElement({
                        style: {
                          ...selectedElement.style,
                          shadow: { ...selectedElement.style.shadow!, color: e.target.value },
                        },
                      })
                    }
                    placeholder="rgba(0,0,0,0.5)"
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
