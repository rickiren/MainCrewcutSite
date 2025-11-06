import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { OverlayConfig, OverlayElement } from '@/types/overlay';
import { OVERLAY_THEMES, ELEMENT_PRESETS, CANVAS_PRESETS } from '@/types/overlay';
import { Video, MessageSquare, Bell, Eye, Users, DollarSign, Type } from 'lucide-react';

interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  category: 'Gaming' | 'Just Chatting' | 'Minimal' | 'Full Featured';
  theme: typeof OVERLAY_THEMES[number];
  elements: OverlayElement[];
}

interface TemplateSelectorProps {
  onSelectTemplate: (template: TemplateConfig) => void;
}

// Helper to create element with theme
const createElement = (
  type: keyof typeof ELEMENT_PRESETS,
  theme: typeof OVERLAY_THEMES[number],
  customPosition?: { x: number; y: number },
  customSize?: { width: number; height: number },
  customContent?: string
): OverlayElement => {
  const preset = ELEMENT_PRESETS[type];
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    label: preset.label || type,
    position: customPosition || preset.position || { x: 10, y: 10 },
    size: customSize || preset.size || { width: 20, height: 20 },
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
    content: customContent || preset.content,
    zIndex: 0,
  };
};

// Pre-built templates
const TEMPLATES: TemplateConfig[] = [
  // Gaming Templates
  {
    id: 'gaming-neon',
    name: 'Neon Gaming Pro',
    description: 'Vibrant cyberpunk design perfect for fast-paced gaming',
    category: 'Gaming',
    theme: OVERLAY_THEMES[0], // Neon Cyberpunk
    elements: [
      createElement('webcam', OVERLAY_THEMES[0], { x: 73, y: 62 }, { width: 22, height: 35 }),
      createElement('chat', OVERLAY_THEMES[0], { x: 5, y: 30 }, { width: 25, height: 65 }),
      createElement('alerts', OVERLAY_THEMES[0], { x: 33, y: 5 }, { width: 34, height: 12 }),
      createElement('recent-events', OVERLAY_THEMES[0], { x: 73, y: 5 }, { width: 22, height: 50 }),
      createElement('subscriber-count', OVERLAY_THEMES[0], { x: 5, y: 5 }, { width: 12, height: 6 }),
      createElement('follower-count', OVERLAY_THEMES[0], { x: 18, y: 5 }, { width: 12, height: 6 }),
      createElement('label', OVERLAY_THEMES[0], { x: 5, y: 13 }, { width: 25, height: 5 }, 'LIVE ON KICK'),
    ],
  },
  {
    id: 'gaming-minimal',
    name: 'Gaming Minimal',
    description: 'Clean minimalist design that doesn\'t distract from gameplay',
    category: 'Gaming',
    theme: OVERLAY_THEMES[1], // Minimalist Dark
    elements: [
      createElement('webcam', OVERLAY_THEMES[1], { x: 75, y: 65 }, { width: 20, height: 32 }),
      createElement('chat', OVERLAY_THEMES[1], { x: 5, y: 40 }, { width: 20, height: 55 }),
      createElement('alerts', OVERLAY_THEMES[1], { x: 35, y: 5 }, { width: 30, height: 10 }),
      createElement('label', OVERLAY_THEMES[1], { x: 5, y: 5 }, { width: 15, height: 5 }, 'LIVE'),
    ],
  },
  {
    id: 'gaming-pro',
    name: 'Gaming Pro',
    description: 'Bold professional gaming overlay with all essential elements',
    category: 'Gaming',
    theme: OVERLAY_THEMES[2], // Gaming Pro
    elements: [
      createElement('webcam', OVERLAY_THEMES[2], { x: 72, y: 60 }, { width: 23, height: 37 }),
      createElement('chat', OVERLAY_THEMES[2], { x: 5, y: 25 }, { width: 28, height: 70 }),
      createElement('alerts', OVERLAY_THEMES[2], { x: 35, y: 5 }, { width: 32, height: 13 }),
      createElement('donation-goal', OVERLAY_THEMES[2], { x: 35, y: 85 }, { width: 30, height: 10 }),
      createElement('subscriber-count', OVERLAY_THEMES[2], { x: 5, y: 5 }, { width: 13, height: 7 }),
      createElement('follower-count', OVERLAY_THEMES[2], { x: 19, y: 5 }, { width: 13, height: 7 }),
      createElement('recent-events', OVERLAY_THEMES[2], { x: 72, y: 5 }, { width: 23, height: 48 }),
    ],
  },

  // Just Chatting Templates
  {
    id: 'chatting-glass',
    name: 'Glass Chatting',
    description: 'Modern glassmorphic design for engaging conversations',
    category: 'Just Chatting',
    theme: OVERLAY_THEMES[3], // Glass Modern
    elements: [
      createElement('webcam', OVERLAY_THEMES[3], { x: 20, y: 15 }, { width: 35, height: 60 }),
      createElement('chat', OVERLAY_THEMES[3], { x: 60, y: 15 }, { width: 35, height: 75 }),
      createElement('alerts', OVERLAY_THEMES[3], { x: 30, y: 5 }, { width: 40, height: 8 }),
      createElement('subscriber-count', OVERLAY_THEMES[3], { x: 5, y: 5 }, { width: 11, height: 6 }),
      createElement('follower-count', OVERLAY_THEMES[3], { x: 17, y: 5 }, { width: 11, height: 6 }),
      createElement('recent-events', OVERLAY_THEMES[3], { x: 5, y: 80 }, { width: 48, height: 15 }),
      createElement('label', OVERLAY_THEMES[3], { x: 20, y: 78 }, { width: 35, height: 6 }, 'Just Chatting'),
    ],
  },
  {
    id: 'chatting-neon',
    name: 'Neon Chatting',
    description: 'Eye-catching neon design for interactive streams',
    category: 'Just Chatting',
    theme: OVERLAY_THEMES[0], // Neon Cyberpunk
    elements: [
      createElement('webcam', OVERLAY_THEMES[0], { x: 25, y: 20 }, { width: 30, height: 55 }),
      createElement('chat', OVERLAY_THEMES[0], { x: 60, y: 20 }, { width: 35, height: 70 }),
      createElement('alerts', OVERLAY_THEMES[0], { x: 30, y: 5 }, { width: 40, height: 10 }),
      createElement('recent-events', OVERLAY_THEMES[0], { x: 5, y: 78 }, { width: 50, height: 17 }),
      createElement('subscriber-count', OVERLAY_THEMES[0], { x: 5, y: 5 }, { width: 11, height: 6 }),
    ],
  },

  // Minimal Templates
  {
    id: 'minimal-clean',
    name: 'Ultra Minimal',
    description: 'Absolutely minimal - just webcam and branding',
    category: 'Minimal',
    theme: OVERLAY_THEMES[1], // Minimalist Dark
    elements: [
      createElement('webcam', OVERLAY_THEMES[1], { x: 70, y: 60 }, { width: 25, height: 37 }),
      createElement('label', OVERLAY_THEMES[1], { x: 5, y: 5 }, { width: 20, height: 6 }, 'LIVE ON KICK'),
    ],
  },
  {
    id: 'minimal-elegant',
    name: 'Elegant Minimal',
    description: 'Simple and elegant with essential elements only',
    category: 'Minimal',
    theme: OVERLAY_THEMES[3], // Glass Modern
    elements: [
      createElement('webcam', OVERLAY_THEMES[3], { x: 68, y: 58 }, { width: 27, height: 39 }),
      createElement('alerts', OVERLAY_THEMES[3], { x: 30, y: 5 }, { width: 40, height: 10 }),
      createElement('label', OVERLAY_THEMES[3], { x: 5, y: 5 }, { width: 18, height: 6 }, 'LIVE'),
      createElement('subscriber-count', OVERLAY_THEMES[3], { x: 5, y: 90 }, { width: 12, height: 6 }),
    ],
  },

  // Full Featured Templates
  {
    id: 'full-neon',
    name: 'Full Neon Experience',
    description: 'Complete overlay with every element you need',
    category: 'Full Featured',
    theme: OVERLAY_THEMES[0], // Neon Cyberpunk
    elements: [
      createElement('webcam', OVERLAY_THEMES[0], { x: 72, y: 60 }, { width: 23, height: 37 }),
      createElement('chat', OVERLAY_THEMES[0], { x: 5, y: 30 }, { width: 25, height: 65 }),
      createElement('alerts', OVERLAY_THEMES[0], { x: 33, y: 5 }, { width: 34, height: 12 }),
      createElement('donation-goal', OVERLAY_THEMES[0], { x: 33, y: 84 }, { width: 34, height: 11 }),
      createElement('subscriber-count', OVERLAY_THEMES[0], { x: 5, y: 5 }, { width: 12, height: 6 }),
      createElement('follower-count', OVERLAY_THEMES[0], { x: 18, y: 5 }, { width: 12, height: 6 }),
      createElement('recent-events', OVERLAY_THEMES[0], { x: 72, y: 5 }, { width: 23, height: 48 }),
      createElement('label', OVERLAY_THEMES[0], { x: 5, y: 13 }, { width: 25, height: 5 }, 'LIVE ON KICK'),
    ],
  },
  {
    id: 'full-pro',
    name: 'Professional Complete',
    description: 'Professional full-featured overlay for serious streamers',
    category: 'Full Featured',
    theme: OVERLAY_THEMES[2], // Gaming Pro
    elements: [
      createElement('webcam', OVERLAY_THEMES[2], { x: 70, y: 58 }, { width: 25, height: 39 }),
      createElement('chat', OVERLAY_THEMES[2], { x: 5, y: 28 }, { width: 27, height: 67 }),
      createElement('alerts', OVERLAY_THEMES[2], { x: 35, y: 5 }, { width: 32, height: 14 }),
      createElement('donation-goal', OVERLAY_THEMES[2], { x: 35, y: 82 }, { width: 32, height: 13 }),
      createElement('subscriber-count', OVERLAY_THEMES[2], { x: 5, y: 5 }, { width: 13, height: 7 }),
      createElement('follower-count', OVERLAY_THEMES[2], { x: 19, y: 5 }, { width: 13, height: 7 }),
      createElement('recent-events', OVERLAY_THEMES[2], { x: 70, y: 5 }, { width: 25, height: 46 }),
      createElement('label', OVERLAY_THEMES[2], { x: 5, y: 14 }, { width: 27, height: 6 }, 'LIVE'),
    ],
  },
];

export function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  const categories = ['Gaming', 'Just Chatting', 'Minimal', 'Full Featured'] as const;

  const getElementIcons = (elements: OverlayElement[]) => {
    const iconMap: Record<string, any> = {
      webcam: Video,
      chat: MessageSquare,
      alerts: Bell,
      'recent-events': Eye,
      'subscriber-count': Users,
      'follower-count': Users,
      'donation-goal': DollarSign,
      label: Type,
    };

    const uniqueTypes = [...new Set(elements.map(el => el.type))];
    return uniqueTypes.slice(0, 5).map(type => {
      const Icon = iconMap[type];
      return Icon ? <Icon key={type} className="w-3 h-3" /> : null;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Templates</h3>
        <p className="text-sm text-gray-400">
          Start with a pre-built template and customize it to your needs
        </p>
      </div>

      {categories.map((category) => {
        const categoryTemplates = TEMPLATES.filter(t => t.category === category);
        if (categoryTemplates.length === 0) return null;

        return (
          <div key={category} className="space-y-3">
            <h4 className="text-md font-medium text-gray-300">{category}</h4>
            <div className="space-y-3">
              {categoryTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="bg-gray-700/30 border-gray-600 hover:border-purple-500 transition-colors cursor-pointer group"
                  onClick={() => onSelectTemplate(template)}
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="text-white font-medium group-hover:text-purple-300 transition-colors">
                          {template.name}
                        </h5>
                        <p className="text-sm text-gray-400 mt-1">
                          {template.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-purple-600/20 border-purple-500 text-purple-200"
                        >
                          {template.theme.name}
                        </Badge>
                        <div className="flex items-center gap-1 text-gray-400">
                          {getElementIcons(template.elements)}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-purple-400 hover:text-purple-300 hover:bg-purple-600/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTemplate(template);
                        }}
                      >
                        Use Template
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
