import { useState } from 'react';
import { ChevronDown, ChevronUp, Settings, Plus, Trash2, Palette, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { UIMockupProps } from '@/types/videoJSON';
import { ScriptLine } from '@/types/video';

interface UIMockupEditorProps {
  line: ScriptLine;
  onUpdate: (updates: Partial<ScriptLine>) => void;
}

export const UIMockupEditor: React.FC<UIMockupEditorProps> = ({ line, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (!line.sceneProps || line.sceneType !== 'uiMockup') {
    return null;
  }

  const mockupProps = line.sceneProps as UIMockupProps;

  const updateMockupProps = (updates: Partial<UIMockupProps>) => {
    onUpdate({
      sceneProps: {
        ...mockupProps,
        ...updates,
      },
    });
  };

  const updateSection = (sectionId: string, updates: Partial<UIMockupProps['sections'][0]>) => {
    const updatedSections = mockupProps.sections.map((section) =>
      section.id === sectionId ? { ...section, ...updates } : section
    );
    updateMockupProps({ sections: updatedSections });
  };

  const updateSectionContent = (sectionId: string, contentUpdates: Partial<UIMockupProps['sections'][0]['content']>) => {
    const section = mockupProps.sections.find((s) => s.id === sectionId);
    if (!section) return;

    updateSection(sectionId, {
      content: {
        ...section.content,
        ...contentUpdates,
      },
    });
  };

  const updateField = (sectionId: string, fieldIndex: number, fieldUpdates: Partial<{ label: string; value: string }>) => {
    const section = mockupProps.sections.find((s) => s.id === sectionId);
    if (!section || !section.content.fields) return;

    const updatedFields = section.content.fields.map((field, i) =>
      i === fieldIndex ? { ...field, ...fieldUpdates } : field
    );
    updateSectionContent(sectionId, { fields: updatedFields });
  };

  const addField = (sectionId: string) => {
    const section = mockupProps.sections.find((s) => s.id === sectionId);
    if (!section) return;

    const newFields = [
      ...(section.content.fields || []),
      { label: 'New Field', value: 'Value' },
    ];
    updateSectionContent(sectionId, { fields: newFields });
  };

  const removeField = (sectionId: string, fieldIndex: number) => {
    const section = mockupProps.sections.find((s) => s.id === sectionId);
    if (!section || !section.content.fields) return;

    const updatedFields = section.content.fields.filter((_, i) => i !== fieldIndex);
    updateSectionContent(sectionId, { fields: updatedFields });
  };

  return (
    <div className="pt-2 border-t">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors w-full"
      >
        <Settings className="w-4 h-4" />
        <span>Customize UI Mockup</span>
        {isExpanded ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
      </button>

      {isExpanded && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-6">
          {/* Background Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-gray-600" />
              <Label className="text-sm font-semibold">Background</Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Background Type</Label>
                <Select
                  value={mockupProps.background.type}
                  onValueChange={(value: any) =>
                    updateMockupProps({ background: { ...mockupProps.background, type: value } })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                    <SelectItem value="pattern">Pattern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {mockupProps.background.type === 'pattern' && (
                <div>
                  <Label className="text-xs">Pattern</Label>
                  <Select
                    value={mockupProps.background.pattern || 'ribbed'}
                    onValueChange={(value: any) =>
                      updateMockupProps({ background: { ...mockupProps.background, pattern: value } })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ribbed">Ribbed</SelectItem>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="dots">Dots</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Animation Settings */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Animation</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Entrance Type</Label>
                <Select
                  value={mockupProps.animations.entrance}
                  onValueChange={(value: any) =>
                    updateMockupProps({ animations: { ...mockupProps.animations, entrance: value } })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fadeIn">Fade In</SelectItem>
                    <SelectItem value="slideUp">Slide Up</SelectItem>
                    <SelectItem value="scale">Scale</SelectItem>
                    <SelectItem value="flip">Flip</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Stagger: {mockupProps.animations.stagger} frames</Label>
                <Slider
                  value={[mockupProps.animations.stagger]}
                  min={1}
                  max={20}
                  step={1}
                  onValueChange={([value]) =>
                    updateMockupProps({ animations: { ...mockupProps.animations, stagger: value } })
                  }
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-gray-600" />
                <Label className="text-sm font-semibold">Sections ({mockupProps.sections.length})</Label>
              </div>
              <Button
                onClick={() => {
                  const newSection: UIMockupProps['sections'][0] = {
                    id: `section-${Date.now()}`,
                    type: 'card',
                    position: { x: 10, y: 10, width: 80, height: 80 },
                    content: {
                      title: 'New Section',
                      fields: [{ label: 'Label', value: 'Value' }],
                    },
                    style: {
                      opacity: 0.3,
                      blur: 15,
                    },
                  };
                  updateMockupProps({ sections: [...mockupProps.sections, newSection] });
                }}
                size="sm"
                variant="outline"
                className="h-7 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Section
              </Button>
            </div>
            {mockupProps.sections.map((section, sectionIndex) => (
              <div key={section.id} className="border border-gray-200 rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                    className="flex items-center gap-2 text-xs font-medium text-gray-700 hover:text-purple-600"
                  >
                    <span>Section {sectionIndex + 1}: {section.type}</span>
                    {expandedSection === section.id ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                  {mockupProps.sections.length > 1 && (
                    <Button
                      onClick={() => {
                        const updatedSections = mockupProps.sections.filter((s) => s.id !== section.id);
                        updateMockupProps({ sections: updatedSections });
                        if (expandedSection === section.id) {
                          setExpandedSection(null);
                        }
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                {expandedSection === section.id && (
                  <div className="space-y-3 pt-2 border-t">
                    {/* Section Title */}
                    <div>
                      <Label className="text-xs">Section Title</Label>
                      <Input
                        value={section.content.title || ''}
                        onChange={(e) => updateSectionContent(section.id, { title: e.target.value })}
                        placeholder="Section title..."
                        className="h-8 text-xs mt-1"
                      />
                    </div>

                    {/* Section Type */}
                    <div>
                      <Label className="text-xs">Section Type</Label>
                      <Select
                        value={section.type}
                        onValueChange={(value: any) => updateSection(section.id, { type: value })}
                      >
                        <SelectTrigger className="h-8 text-xs mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="form">Form</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="ticket">Ticket</SelectItem>
                          <SelectItem value="info">Info</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Fields */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Fields</Label>
                        <Button
                          onClick={() => addField(section.id)}
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Field
                        </Button>
                      </div>
                      {section.content.fields?.map((field, fieldIndex) => (
                        <div key={fieldIndex} className="grid grid-cols-2 gap-2 p-2 bg-white rounded border">
                          <div>
                            <Label className="text-xs">Label</Label>
                            <Input
                              value={field.label}
                              onChange={(e) => updateField(section.id, fieldIndex, { label: e.target.value })}
                              className="h-7 text-xs mt-1"
                            />
                          </div>
                          <div className="flex items-end gap-1">
                            <div className="flex-1">
                              <Label className="text-xs">Value</Label>
                              <Input
                                value={field.value}
                                onChange={(e) => updateField(section.id, fieldIndex, { value: e.target.value })}
                                className="h-7 text-xs mt-1"
                              />
                            </div>
                            <Button
                              onClick={() => removeField(section.id, fieldIndex)}
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Button (for form type) */}
                    {section.type === 'form' && (
                      <div>
                        <Label className="text-xs">Button Text</Label>
                        <Input
                          value={section.content.button?.text || ''}
                          onChange={(e) =>
                            updateSectionContent(section.id, {
                              button: { text: e.target.value },
                            })
                          }
                          placeholder="Button text..."
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                    )}

                    {/* Barcode (for ticket type) */}
                    {section.type === 'ticket' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={section.content.barcode || false}
                          onChange={(e) => updateSectionContent(section.id, { barcode: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <Label className="text-xs">Show Barcode</Label>
                      </div>
                    )}

                    {/* Section Style */}
                    <div className="space-y-2 pt-2 border-t">
                      <Label className="text-xs font-semibold">Style</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Opacity: {section.style.opacity?.toFixed(1) || 0.3}</Label>
                          <Slider
                            value={[section.style.opacity || 0.3]}
                            min={0}
                            max={1}
                            step={0.1}
                            onValueChange={([value]) => updateSection(section.id, { style: { ...section.style, opacity: value } })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Blur: {section.style.blur || 15}px</Label>
                          <Slider
                            value={[section.style.blur || 15]}
                            min={0}
                            max={30}
                            step={1}
                            onValueChange={([value]) => updateSection(section.id, { style: { ...section.style, blur: value } })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      {section.type === 'ticket' && (
                        <div>
                          <Label className="text-xs">Background Color</Label>
                          <Input
                            type="color"
                            value={section.style.backgroundColor || '#1e3a8a'}
                            onChange={(e) => updateSection(section.id, { style: { ...section.style, backgroundColor: e.target.value } })}
                            className="h-8 mt-1"
                          />
                        </div>
                      )}
                    </div>

                    {/* Position (Advanced) */}
                    <details className="pt-2 border-t">
                      <summary className="text-xs font-medium cursor-pointer text-gray-600 hover:text-gray-900">
                        Position & Size (Advanced)
                      </summary>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <Label className="text-xs">X: {section.position.x}%</Label>
                          <Slider
                            value={[section.position.x]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={([value]) =>
                              updateSection(section.id, {
                                position: { ...section.position, x: value },
                              })
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Y: {section.position.y}%</Label>
                          <Slider
                            value={[section.position.y]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={([value]) =>
                              updateSection(section.id, {
                                position: { ...section.position, y: value },
                              })
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Width: {section.position.width}%</Label>
                          <Slider
                            value={[section.position.width]}
                            min={10}
                            max={100}
                            step={1}
                            onValueChange={([value]) =>
                              updateSection(section.id, {
                                position: { ...section.position, width: value },
                              })
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Height: {section.position.height}%</Label>
                          <Slider
                            value={[section.position.height]}
                            min={10}
                            max={100}
                            step={1}
                            onValueChange={([value]) =>
                              updateSection(section.id, {
                                position: { ...section.position, height: value },
                              })
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

