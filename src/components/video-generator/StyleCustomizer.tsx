import { VideoStyle } from '@/types/video';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

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

        {/* Background Style */}
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
        </div>

        {/* Text Style */}
        <div className="mt-6">
          <Label htmlFor="textStyle" className="text-sm">
            Text Style
          </Label>
          <Select
            value={style.textStyle}
            onValueChange={(value: any) => updateStyle({ textStyle: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid Color</SelectItem>
              <SelectItem value="gradient">Gradient</SelectItem>
            </SelectContent>
          </Select>
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
