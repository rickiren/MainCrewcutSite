/**
 * Animation Panel Component
 *
 * UI panel for controlling default text animation settings.
 * These settings apply to all script lines that don't have custom animations.
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { VideoStyle, TextAnimationType, TextAnimationUnit } from '@/types/video';
import { Sparkles, Zap } from 'lucide-react';

interface AnimationPanelProps {
  style: VideoStyle;
  onChange: (style: VideoStyle) => void;
}

export const AnimationPanel: React.FC<AnimationPanelProps> = ({ style, onChange }) => {
  // Initialize default animation if it doesn't exist
  const defaultAnimation = style.defaultAnimation || {
    type: 'fadeIn' as TextAnimationType,
    unit: 'word' as TextAnimationUnit,
    staggerInFrames: 5,
    durationInFrames: 30,
    fade: true,
  };

  const updateDefaultAnimation = (updates: Partial<typeof defaultAnimation>) => {
    const newStyle = {
      ...style,
      defaultAnimation: {
        ...defaultAnimation,
        ...updates,
      },
    };
    console.log('✏️ AnimationPanel updating:', {
      updates,
      oldAnimation: defaultAnimation,
      newAnimation: newStyle.defaultAnimation
    });
    onChange(newStyle);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <CardTitle>Default Text Animation</CardTitle>
          </div>
          <CardDescription>
            Set the default animation for all script lines. Individual lines can override these settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Animation Type */}
          <div className="space-y-2">
            <Label>Animation Type</Label>
            <Select
              value={defaultAnimation.type}
              onValueChange={(value) => updateDefaultAnimation({ type: value as TextAnimationType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fadeIn">Fade In</SelectItem>
                <SelectItem value="slideUp">Slide Up</SelectItem>
                <SelectItem value="slideDown">Slide Down</SelectItem>
                <SelectItem value="slideLeft">Slide Left</SelectItem>
                <SelectItem value="slideRight">Slide Right</SelectItem>
                <SelectItem value="scale">Scale (Zoom)</SelectItem>
                <SelectItem value="flipUp">Flip Up (3D)</SelectItem>
                <SelectItem value="rotate3D">Rotate 3D</SelectItem>
                <SelectItem value="typewriter">Typewriter</SelectItem>
                <SelectItem value="blur">Blur to Focus</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {getAnimationDescription(defaultAnimation.type)}
            </p>
          </div>

          {/* Animation Unit */}
          <div className="space-y-2">
            <Label>Animation Unit</Label>
            <Select
              value={defaultAnimation.unit}
              onValueChange={(value) => updateDefaultAnimation({ unit: value as TextAnimationUnit })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whole">Whole (entire text at once)</SelectItem>
                <SelectItem value="line">Line by Line</SelectItem>
                <SelectItem value="word">Word by Word</SelectItem>
                <SelectItem value="character">Character by Character</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              How to split the text for animation
            </p>
          </div>

          {/* Stagger (delay between units) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Stagger (frames)</Label>
              <span className="text-sm text-gray-600">{defaultAnimation.staggerInFrames}</span>
            </div>
            <Slider
              value={[defaultAnimation.staggerInFrames || 5]}
              min={1}
              max={20}
              step={1}
              onValueChange={(value) => updateDefaultAnimation({ staggerInFrames: value[0] })}
            />
            <p className="text-xs text-gray-500">
              Delay in frames between each {defaultAnimation.unit} starting
            </p>
          </div>

          {/* Duration per unit */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Duration (frames)</Label>
              <span className="text-sm text-gray-600">{defaultAnimation.durationInFrames}</span>
            </div>
            <Slider
              value={[defaultAnimation.durationInFrames || 30]}
              min={10}
              max={60}
              step={5}
              onValueChange={(value) => updateDefaultAnimation({ durationInFrames: value[0] })}
            />
            <p className="text-xs text-gray-500">
              How long each {defaultAnimation.unit} takes to animate
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Animation-Specific Options */}
      {renderAnimationOptions(defaultAnimation, updateDefaultAnimation)}

      {/* Quick Presets */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            <CardTitle>Quick Presets</CardTitle>
          </div>
          <CardDescription>Apply popular animation styles with one click</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() =>
                updateDefaultAnimation({
                  type: 'flipUp',
                  unit: 'character',
                  staggerInFrames: 2,
                  durationInFrames: 20,
                  fade: true,
                })
              }
              className="p-3 border rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <div className="font-semibold text-sm">Desktop Tool</div>
              <div className="text-xs text-gray-500">Flip up, character by character</div>
            </button>

            <button
              onClick={() =>
                updateDefaultAnimation({
                  type: 'typewriter',
                  unit: 'character',
                  staggerInFrames: 4,
                  cursor: true,
                })
              }
              className="p-3 border rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <div className="font-semibold text-sm">Typewriter</div>
              <div className="text-xs text-gray-500">Classic typing with cursor</div>
            </button>

            <button
              onClick={() =>
                updateDefaultAnimation({
                  type: 'slideUp',
                  unit: 'word',
                  staggerInFrames: 5,
                  durationInFrames: 25,
                  distance: 30,
                  fade: true,
                })
              }
              className="p-3 border rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <div className="font-semibold text-sm">Smooth Slide</div>
              <div className="text-xs text-gray-500">Slide up, word by word</div>
            </button>

            <button
              onClick={() =>
                updateDefaultAnimation({
                  type: 'scale',
                  unit: 'whole',
                  durationInFrames: 40,
                  from: 0,
                  to: 1,
                  fade: true,
                })
              }
              className="p-3 border rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <div className="font-semibold text-sm">Impact Zoom</div>
              <div className="text-xs text-gray-500">Zoom in, entire text</div>
            </button>

            <button
              onClick={() =>
                updateDefaultAnimation({
                  type: 'fadeIn',
                  unit: 'character',
                  staggerInFrames: 3,
                  durationInFrames: 20,
                })
              }
              className="p-3 border rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <div className="font-semibold text-sm">Classic Fade</div>
              <div className="text-xs text-gray-500">Fade in, character by character</div>
            </button>

            <button
              onClick={() =>
                updateDefaultAnimation({
                  type: 'blur',
                  unit: 'word',
                  staggerInFrames: 6,
                  durationInFrames: 25,
                  from: 20,
                  to: 0,
                  fade: true,
                })
              }
              className="p-3 border rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <div className="font-semibold text-sm">Focus Blur</div>
              <div className="text-xs text-gray-500">Blur to focus, word by word</div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper: Get description for animation type
function getAnimationDescription(type: TextAnimationType): string {
  const descriptions: Record<TextAnimationType, string> = {
    fadeIn: 'Simple opacity transition from transparent to visible',
    slideUp: 'Text slides upward with fade effect',
    slideDown: 'Text slides downward with fade effect',
    slideLeft: 'Text slides from right to left',
    slideRight: 'Text slides from left to right',
    scale: 'Text zooms in or out',
    flipUp: '3D flip effect like "Desktop Tool" - works best with characters',
    rotate3D: '3D rotation on different axes',
    typewriter: 'Classic typing effect with optional blinking cursor',
    blur: 'Text transitions from blurry to sharp focus',
  };
  return descriptions[type] || '';
}

// Helper: Render animation-specific options
function renderAnimationOptions(
  animation: any,
  updateAnimation: (updates: any) => void
): React.ReactNode {
  const type = animation.type;

  // Slide animations need direction and distance
  if (type.startsWith('slide')) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Slide Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Distance (pixels)</Label>
              <span className="text-sm text-gray-600">{animation.distance || 20}</span>
            </div>
            <Slider
              value={[animation.distance || 20]}
              min={10}
              max={100}
              step={5}
              onValueChange={(value) => updateAnimation({ distance: value[0] })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Include Fade Effect</Label>
            <Switch
              checked={animation.fade !== false}
              onCheckedChange={(checked) => updateAnimation({ fade: checked })}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Scale animation needs from/to values
  if (type === 'scale') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scale Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Start Scale</Label>
              <span className="text-sm text-gray-600">{animation.from || 0}</span>
            </div>
            <Slider
              value={[animation.from || 0]}
              min={0}
              max={2}
              step={0.1}
              onValueChange={(value) => updateAnimation({ from: value[0] })}
            />
            <p className="text-xs text-gray-500">0 = zoom in, 2 = zoom out</p>
          </div>

          <div className="flex items-center justify-between">
            <Label>Include Fade Effect</Label>
            <Switch
              checked={animation.fade !== false}
              onCheckedChange={(checked) => updateAnimation({ fade: checked })}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Rotate3D needs direction
  if (type === 'rotate3D') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">3D Rotation Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Rotation Direction</Label>
            <Select
              value={animation.direction || 'flipUp'}
              onValueChange={(value) => updateAnimation({ direction: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flipUp">Flip Up (X-axis)</SelectItem>
                <SelectItem value="flipDown">Flip Down (X-axis)</SelectItem>
                <SelectItem value="swingIn">Swing In (Y-axis)</SelectItem>
                <SelectItem value="spinIn">Spin In (Z-axis)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Include Fade Effect</Label>
            <Switch
              checked={animation.fade !== false}
              onCheckedChange={(checked) => updateAnimation({ fade: checked })}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Typewriter needs cursor option
  if (type === 'typewriter') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Typewriter Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Show Blinking Cursor</Label>
            <Switch
              checked={animation.cursor !== false}
              onCheckedChange={(checked) => updateAnimation({ cursor: checked })}
            />
          </div>
          <p className="text-xs text-gray-500">
            Typewriter always uses character-level animation
          </p>
        </CardContent>
      </Card>
    );
  }

  // Blur needs from/to blur amount
  if (type === 'blur') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Blur Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Blur Amount (pixels)</Label>
              <span className="text-sm text-gray-600">{animation.from || 20}</span>
            </div>
            <Slider
              value={[animation.from || 20]}
              min={5}
              max={50}
              step={5}
              onValueChange={(value) => updateAnimation({ from: value[0], to: 0 })}
            />
            <p className="text-xs text-gray-500">Starting blur (ends at 0 for sharp focus)</p>
          </div>

          <div className="flex items-center justify-between">
            <Label>Include Fade Effect</Label>
            <Switch
              checked={animation.fade !== false}
              onCheckedChange={(checked) => updateAnimation({ fade: checked })}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  // FlipUp and fadeIn just need fade option
  if (type === 'flipUp' || type === 'fadeIn') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>Include Fade Effect</Label>
            <Switch
              checked={animation.fade !== false}
              onCheckedChange={(checked) => updateAnimation({ fade: checked })}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
