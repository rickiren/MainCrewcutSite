import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UI_TEMPLATES, getUITemplate } from '@/data/uiTemplates';
import { VideoJSONConfig } from '@/types/videoJSON';
import { Plane, Layout, BarChart3, Mail, Sparkles } from 'lucide-react';

interface UITemplateSelectorProps {
  onTemplateSelect: (config: VideoJSONConfig) => void;
}

const TEMPLATE_ICONS = {
  flightBooking: Plane,
  productCard: Layout,
  dashboard: BarChart3,
  contactForm: Mail,
};

export const UITemplateSelector: React.FC<UITemplateSelectorProps> = ({ onTemplateSelect }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleTemplateSelect = (templateName: string) => {
    const template = getUITemplate(templateName);
    if (!template) return;

    setSelectedTemplate(templateName);

    // Convert template to VideoJSONConfig
    const config: VideoJSONConfig = {
      videoId: `ui-${templateName}-${Date.now()}`,
      aspectRatio: '16/9',
      fps: 30,
      durationInFrames: 180, // 6 seconds
      globalSettings: {
        backgroundColor: '#f3f4f6',
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        accentColor: '#f093fb',
        fontFamily: 'Space Grotesk, sans-serif',
      },
      scenes: [
        {
          id: 'ui-mockup',
          type: 'uiMockup',
          durationInFrames: 180,
          props: template,
        },
      ],
    };

    onTemplateSelect(config);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <CardTitle>UI Mockup Templates</CardTitle>
          </div>
          <CardDescription>
            Select a pre-built glassmorphic UI template to use as a starting point
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(UI_TEMPLATES).map(([key, template]) => {
              const Icon = TEMPLATE_ICONS[key as keyof typeof TEMPLATE_ICONS] || Layout;
              const isSelected = selectedTemplate === key;

              return (
                <button
                  key={key}
                  onClick={() => handleTemplateSelect(key)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? 'bg-purple-100' : 'bg-gray-100'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          isSelected ? 'text-purple-600' : 'text-gray-600'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div
                        className={`font-semibold text-sm mb-1 ${
                          isSelected ? 'text-purple-900' : 'text-gray-900'
                        }`}
                      >
                        {template.title || key}
                      </div>
                      <div className="text-xs text-gray-500">
                        {template.layout} layout • {template.sections.length} section
                        {template.sections.length !== 1 ? 's' : ''}
                      </div>
                      {isSelected && (
                        <div className="mt-2 text-xs text-purple-600 font-medium">
                          ✓ Template applied - Switch to JSON mode to preview
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> After selecting a template, switch to{' '}
              <strong>JSON Mode</strong> to see the preview. You can then customize the template
              by editing the JSON configuration.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

