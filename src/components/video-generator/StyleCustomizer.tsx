import { VideoStyle } from '@/types/video';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Camera } from 'lucide-react';

interface StyleCustomizerProps {
  style: VideoStyle;
  onChange: (style: VideoStyle) => void;
}

export const StyleCustomizer: React.FC<StyleCustomizerProps> = ({ style, onChange }) => {
  const updateStyle = (updates: Partial<VideoStyle>) => {
    onChange({ ...style, ...updates });
  };

  const colorPresets = [
    {
      name: 'Purple Dream',
      primaryColor: '#667eea',
      secondaryColor: '#764ba2',
      accentColor: '#f093fb',
    },
    {
      name: 'Ocean Blue',
      primaryColor: '#2E3192',
      secondaryColor: '#1BFFFF',
      accentColor: '#00D4FF',
    },
    {
      name: 'Sunset Orange',
      primaryColor: '#FF512F',
      secondaryColor: '#F09819',
      accentColor: '#FFD700',
    },
    {
      name: 'Forest Green',
      primaryColor: '#134E5E',
      secondaryColor: '#71B280',
      accentColor: '#95E1D3',
    },
    {
      name: 'Pink Candy',
      primaryColor: '#FF006E',
      secondaryColor: '#FF8A00',
      accentColor: '#FFBE0B',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Style Customization</h3>

        {/* Scene Type */}
        <div className="mb-6">
          <Label htmlFor="sceneType" className="text-sm mb-2 block">
            Scene Type
          </Label>
          <Select
            value={style.sceneType}
            onValueChange={(value: any) => updateStyle({ sceneType: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3d">🎬 Cinematic 3D (Floating Glass Cards)</SelectItem>
              <SelectItem value="2d">🎨 Classic 2D (Flat Design)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            {style.sceneType === '3d'
              ? 'Camera rotates around floating glass cards in 3D space'
              : 'Traditional 2D scene with background effects'}
          </p>
        </div>

        {/* Color Presets */}
        <div className="mb-6">
          <Label className="text-sm mb-2 block">Color Presets</Label>
          <div className="grid grid-cols-2 gap-2">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => updateStyle({
                  primaryColor: preset.primaryColor,
                  secondaryColor: preset.secondaryColor,
                  accentColor: preset.accentColor,
                })}
                className="p-3 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-all"
              >
                <div className="flex gap-2 mb-2">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: preset.primaryColor }}
                  />
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: preset.secondaryColor }}
                  />
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: preset.accentColor }}
                  />
                </div>
                <p className="text-xs font-medium">{preset.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="primaryColor" className="text-sm">
              Primary Color
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="primaryColor"
                type="color"
                value={style.primaryColor}
                onChange={(e) => updateStyle({ primaryColor: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                value={style.primaryColor}
                onChange={(e) => updateStyle({ primaryColor: e.target.value })}
                placeholder="#667eea"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="secondaryColor" className="text-sm">
              Secondary Color
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="secondaryColor"
                type="color"
                value={style.secondaryColor}
                onChange={(e) => updateStyle({ secondaryColor: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                value={style.secondaryColor}
                onChange={(e) => updateStyle({ secondaryColor: e.target.value })}
                placeholder="#764ba2"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="accentColor" className="text-sm">
              Accent Color
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="accentColor"
                type="color"
                value={style.accentColor}
                onChange={(e) => updateStyle({ accentColor: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                value={style.accentColor}
                onChange={(e) => updateStyle({ accentColor: e.target.value })}
                placeholder="#f093fb"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Font Family */}
        <div className="mt-6">
          <Label htmlFor="fontFamily" className="text-sm">
            Font Family
          </Label>
          <Select
            value={style.fontFamily}
            onValueChange={(value) => updateStyle({ fontFamily: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Space Grotesk, sans-serif">Space Grotesk</SelectItem>
              <SelectItem value="Inter, sans-serif">Inter</SelectItem>
              <SelectItem value="Playfair Display, serif">Playfair Display</SelectItem>
              <SelectItem value="Montserrat, sans-serif">Montserrat</SelectItem>
              <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
              <SelectItem value="Poppins, sans-serif">Poppins</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Background Style (only for 2D scenes) */}
        {style.sceneType === '2d' && (
          <div className="mt-6">
            <Label htmlFor="backgroundStyle" className="text-sm">
              Background Style
            </Label>
            <Select
              value={style.backgroundStyle}
              onValueChange={(value: any) => updateStyle({ backgroundStyle: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3d-cards">3D Cards</SelectItem>
                <SelectItem value="gradient">Gradient</SelectItem>
                <SelectItem value="solid">Solid</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Background style for 2D scenes
            </p>
          </div>
        )}

        {/* Text Style */}
        <div className="mt-6">
          <Label htmlFor="textStyle" className="text-sm">
            Text Style
          </Label>
          <Select
            value={style.textStyle || 'solid'}
            onValueChange={(value: any) => updateStyle({ textStyle: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid Color</SelectItem>
              <SelectItem value="gradient">Gradient</SelectItem>
              <SelectItem value="neon">Neon Glow</SelectItem>
              <SelectItem value="neonMulti">Neon Multi-Color</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Neon Text Configuration */}
        {(style.textStyle === 'neon' || style.textStyle === 'neonMulti') && (
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <Label className="text-sm font-semibold text-purple-900">Neon Text Settings</Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Glow Color</Label>
                <Input
                  type="color"
                  value={style.neonConfig?.glowColor || style.accentColor}
                  onChange={(e) =>
                    updateStyle({
                      neonConfig: {
                        ...style.neonConfig,
                        glowColor: e.target.value,
                      },
                    })
                  }
                  className="h-10 mt-1"
                />
              </div>
              {style.textStyle === 'neonMulti' && (
                <div>
                  <Label className="text-xs">Secondary Glow Color</Label>
                  <Input
                    type="color"
                    value={style.neonConfig?.secondaryGlowColor || style.secondaryColor}
                    onChange={(e) =>
                      updateStyle({
                        neonConfig: {
                          ...style.neonConfig,
                          secondaryGlowColor: e.target.value,
                        },
                      })
                    }
                    className="h-10 mt-1"
                  />
                </div>
              )}
              <div>
                <Label className="text-xs">Glow Intensity: {style.neonConfig?.glowIntensity || 50}</Label>
                <Slider
                  value={[style.neonConfig?.glowIntensity || 50]}
                  min={20}
                  max={100}
                  step={5}
                  onValueChange={([value]) =>
                    updateStyle({
                      neonConfig: {
                        ...style.neonConfig,
                        glowIntensity: value,
                      },
                    })
                  }
                  className="mt-2"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={style.neonConfig?.outline !== false}
                  onCheckedChange={(checked) =>
                    updateStyle({
                      neonConfig: {
                        ...style.neonConfig,
                        outline: checked,
                      },
                    })
                  }
                />
                <Label className="text-xs">Text Outline</Label>
              </div>
            </div>
          </div>
        )}

        {/* Camera Animation Settings */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3 mt-6">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-blue-600" />
            <Label className="text-sm font-semibold text-blue-900">Camera Animation</Label>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Enable Continuous Motion</Label>
            <Switch
              checked={style.cameraAnimation?.enabled !== false}
              onCheckedChange={(checked) =>
                updateStyle({
                  cameraAnimation: {
                    ...style.cameraAnimation,
                    enabled: checked,
                    type: style.cameraAnimation?.type || 'combined',
                    intensity: style.cameraAnimation?.intensity || 0.5,
                  },
                })
              }
            />
          </div>
          {style.cameraAnimation?.enabled !== false && (
            <>
              <div>
                <Label className="text-xs">Animation Type</Label>
                <Select
                  value={style.cameraAnimation?.type || 'combined'}
                  onValueChange={(value: any) =>
                    updateStyle({
                      cameraAnimation: {
                        ...style.cameraAnimation,
                        type: value,
                      },
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="combined">Combined (All)</SelectItem>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="pan">Pan</SelectItem>
                    <SelectItem value="orbit">Orbit</SelectItem>
                    <SelectItem value="dolly">Dolly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Intensity: {((style.cameraAnimation?.intensity || 0.5) * 100).toFixed(0)}%</Label>
                <Slider
                  value={[style.cameraAnimation?.intensity || 0.5]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={([value]) =>
                    updateStyle({
                      cameraAnimation: {
                        ...style.cameraAnimation,
                        intensity: value,
                      },
                    })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-xs">Transition Type</Label>
                <Select
                  value={style.cameraAnimation?.transitionType || 'zoom'}
                  onValueChange={(value: any) =>
                    updateStyle({
                      cameraAnimation: {
                        ...style.cameraAnimation,
                        transitionType: value,
                      },
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="slide">Slide</SelectItem>
                    <SelectItem value="rotate">Rotate</SelectItem>
                    <SelectItem value="fade">Fade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        {/* Text Color (only for solid text) */}
        {style.textStyle === 'solid' && (
          <div className="mt-6">
            <Label htmlFor="textColor" className="text-sm">
              Text Color
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="textColor"
                type="color"
                value={style.textColor}
                onChange={(e) => updateStyle({ textColor: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                value={style.textColor}
                onChange={(e) => updateStyle({ textColor: e.target.value })}
                placeholder="#FFFFFF"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              White (#FFFFFF) recommended for best visibility
            </p>
          </div>
        )}

        {/* Animation Speed */}
        <div className="mt-6">
          <Label htmlFor="animationSpeed" className="text-sm">
            Animation Speed: {style.animationSpeed.toFixed(1)}x
          </Label>
          <Slider
            id="animationSpeed"
            min={0.5}
            max={2.0}
            step={0.1}
            value={[style.animationSpeed]}
            onValueChange={([value]) => updateStyle({ animationSpeed: value })}
            className="mt-2"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Slower (0.5x)</span>
            <span>Normal (1.0x)</span>
            <span>Faster (2.0x)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
