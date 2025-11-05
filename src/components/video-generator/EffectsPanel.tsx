import { VideoStyle } from '@/types/video';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface EffectsPanelProps {
  style: VideoStyle;
  onChange: (style: VideoStyle) => void;
}

export const EffectsPanel: React.FC<EffectsPanelProps> = ({ style, onChange }) => {
  const updateGlobalEffects = (updates: Partial<VideoStyle['globalEffects']>) => {
    onChange({
      ...style,
      globalEffects: {
        ...style.globalEffects,
        ...updates,
      },
    });
  };

  const particles = style.globalEffects?.particles || {
    enabled: false,
    type: 'confetti',
    count: 100,
    speed: 2,
  };

  const glitch = style.globalEffects?.glitch || {
    enabled: false,
    intensity: 0.5,
    rgbSplit: true,
    scanLines: true,
  };

  const neon = style.globalEffects?.neon || {
    enabled: false,
    glowIntensity: 20,
    flickerEffect: false,
  };

  const film = style.globalEffects?.film || {
    enabled: false,
    grainIntensity: 0.3,
    vignette: true,
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Global Effects</h3>

      {/* Particle Effect */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-semibold">✨ Particle Effect</Label>
            <p className="text-xs text-gray-500">Confetti, snow, rain, or floating particles</p>
          </div>
          <Switch
            checked={particles.enabled}
            onCheckedChange={(enabled) =>
              updateGlobalEffects({
                particles: { ...particles, enabled },
              })
            }
          />
        </div>

        {particles.enabled && (
          <>
            <div>
              <Label className="text-sm">Particle Type</Label>
              <Select
                value={particles.type}
                onValueChange={(type: any) =>
                  updateGlobalEffects({
                    particles: { ...particles, type },
                  })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confetti">🎉 Confetti</SelectItem>
                  <SelectItem value="snow">❄️ Snow</SelectItem>
                  <SelectItem value="rain">🌧️ Rain</SelectItem>
                  <SelectItem value="floating">✨ Floating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">Particle Count: {particles.count}</Label>
              <Slider
                min={10}
                max={200}
                step={10}
                value={[particles.count]}
                onValueChange={([count]) =>
                  updateGlobalEffects({
                    particles: { ...particles, count },
                  })
                }
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm">Speed: {particles.speed}x</Label>
              <Slider
                min={0.5}
                max={5}
                step={0.5}
                value={[particles.speed]}
                onValueChange={([speed]) =>
                  updateGlobalEffects({
                    particles: { ...particles, speed },
                  })
                }
                className="mt-2"
              />
            </div>
          </>
        )}
      </div>

      {/* Glitch Effect */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-semibold">⚡ Glitch Effect</Label>
            <p className="text-xs text-gray-500">Digital distortion and RGB split</p>
          </div>
          <Switch
            checked={glitch.enabled}
            onCheckedChange={(enabled) =>
              updateGlobalEffects({
                glitch: { ...glitch, enabled },
              })
            }
          />
        </div>

        {glitch.enabled && (
          <>
            <div>
              <Label className="text-sm">Intensity: {glitch.intensity.toFixed(2)}</Label>
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={[glitch.intensity]}
                onValueChange={([intensity]) =>
                  updateGlobalEffects({
                    glitch: { ...glitch, intensity },
                  })
                }
                className="mt-2"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">RGB Split</Label>
              <Switch
                checked={glitch.rgbSplit}
                onCheckedChange={(rgbSplit) =>
                  updateGlobalEffects({
                    glitch: { ...glitch, rgbSplit },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Scan Lines</Label>
              <Switch
                checked={glitch.scanLines}
                onCheckedChange={(scanLines) =>
                  updateGlobalEffects({
                    glitch: { ...glitch, scanLines },
                  })
                }
              />
            </div>
          </>
        )}
      </div>

      {/* Neon Effect */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-semibold">💫 Neon Glow</Label>
            <p className="text-xs text-gray-500">Neon glow on text and elements</p>
          </div>
          <Switch
            checked={neon.enabled}
            onCheckedChange={(enabled) =>
              updateGlobalEffects({
                neon: { ...neon, enabled },
              })
            }
          />
        </div>

        {neon.enabled && (
          <>
            <div>
              <Label className="text-sm">Glow Intensity: {neon.glowIntensity}</Label>
              <Slider
                min={5}
                max={50}
                step={5}
                value={[neon.glowIntensity]}
                onValueChange={([glowIntensity]) =>
                  updateGlobalEffects({
                    neon: { ...neon, glowIntensity },
                  })
                }
                className="mt-2"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Flicker Effect</Label>
              <Switch
                checked={neon.flickerEffect}
                onCheckedChange={(flickerEffect) =>
                  updateGlobalEffects({
                    neon: { ...neon, flickerEffect },
                  })
                }
              />
            </div>
          </>
        )}
      </div>

      {/* Film Effect */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-semibold">🎞️ Film Effect</Label>
            <p className="text-xs text-gray-500">Film grain and vignette</p>
          </div>
          <Switch
            checked={film.enabled}
            onCheckedChange={(enabled) =>
              updateGlobalEffects({
                film: { ...film, enabled },
              })
            }
          />
        </div>

        {film.enabled && (
          <>
            <div>
              <Label className="text-sm">Grain Intensity: {film.grainIntensity.toFixed(2)}</Label>
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={[film.grainIntensity]}
                onValueChange={([grainIntensity]) =>
                  updateGlobalEffects({
                    film: { ...film, grainIntensity },
                  })
                }
                className="mt-2"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Vignette</Label>
              <Switch
                checked={film.vignette}
                onCheckedChange={(vignette) =>
                  updateGlobalEffects({
                    film: { ...film, vignette },
                  })
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
