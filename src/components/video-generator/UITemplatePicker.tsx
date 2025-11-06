import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { UI_TEMPLATES, getUITemplate } from '@/data/uiTemplates';
import { ScriptLine } from '@/types/video';
import { Layout, Plane, BarChart3, Mail } from 'lucide-react';

interface UITemplatePickerProps {
  onSelect: (line: ScriptLine) => void;
}

const TEMPLATE_ICONS = {
  flightBooking: Plane,
  productCard: Layout,
  dashboard: BarChart3,
  contactForm: Mail,
};

export const UITemplatePicker: React.FC<UITemplatePickerProps> = ({ onSelect }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (templateName: string) => {
    const template = getUITemplate(templateName);
    if (!template) return;

    const newLine: ScriptLine = {
      id: Date.now().toString(),
      text: template.title || templateName,
      duration: 6,
      sceneType: 'uiMockup',
      sceneProps: template,
    };

    onSelect(newLine);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Layout className="w-4 h-4 mr-2" />
          Add UI Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select UI Template</DialogTitle>
          <DialogDescription>
            Choose a glassmorphic UI template to add as a scene in your video
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {Object.entries(UI_TEMPLATES).map(([key, template]) => {
            const Icon = TEMPLATE_ICONS[key as keyof typeof TEMPLATE_ICONS] || Layout;

            return (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className="p-4 border-2 rounded-lg text-left transition-all hover:border-purple-300 hover:bg-gray-50 border-gray-200"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm mb-1 text-gray-900">
                      {template.title || key}
                    </div>
                    <div className="text-xs text-gray-500">
                      {template.layout} layout • {template.sections.length} section
                      {template.sections.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

