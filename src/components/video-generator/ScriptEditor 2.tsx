import { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Sparkles, Layout, ArrowUp, ArrowDown } from 'lucide-react';
import { ScriptLine, TextAnimationType, TextAnimationUnit, LineAnimationConfig } from '@/types/video';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { UITemplatePicker } from './UITemplatePicker';
import { UIMockupEditor } from './UIMockupEditor';

interface ScriptEditorProps {
  scriptLines: ScriptLine[];
  onChange: (lines: ScriptLine[]) => void;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({ scriptLines, onChange }) => {
  const [expandedAnimations, setExpandedAnimations] = useState<Set<string>>(new Set());
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const addLine = () => {
    const newLine: ScriptLine = {
      id: Date.now().toString(),
      text: '',
      duration: 3,
    };
    onChange([...scriptLines, newLine]);
  };

  const updateLine = (id: string, updates: Partial<ScriptLine>) => {
    onChange(
      scriptLines.map((line) =>
        line.id === id ? { ...line, ...updates } : line
      )
    );
  };

  const deleteLine = (id: string) => {
    onChange(scriptLines.filter((line) => line.id !== id));
  };

  const moveLine = (id: string, direction: 'up' | 'down') => {
    const currentIndex = scriptLines.findIndex((line) => line.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Check bounds
    if (newIndex < 0 || newIndex >= scriptLines.length) return;

    // Reorder array
    const newLines = [...scriptLines];
    [newLines[currentIndex], newLines[newIndex]] = [newLines[newIndex], newLines[currentIndex]];
    onChange(newLines);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedId && draggedId !== id) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(null);

    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const draggedIndex = scriptLines.findIndex((line) => line.id === draggedId);
    const targetIndex = scriptLines.findIndex((line) => line.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      return;
    }

    // Reorder array
    const newLines = [...scriptLines];
    const [removed] = newLines.splice(draggedIndex, 1);
    newLines.splice(targetIndex, 0, removed);
    onChange(newLines);
    setDraggedId(null);
  };

  const toggleAnimationExpanded = (id: string) => {
    const newExpanded = new Set(expandedAnimations);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedAnimations(newExpanded);
  };

  const updateLineAnimation = (id: string, animationUpdates: Partial<LineAnimationConfig> | null) => {
    const line = scriptLines.find((l) => l.id === id);
    if (!line) return;

    if (animationUpdates === null) {
      // Remove custom animation
      updateLine(id, { animation: undefined });
    } else {
      // Update or create animation config
      updateLine(id, {
        animation: {
          ...(line.animation || { type: 'fadeIn', unit: 'word' }),
          ...animationUpdates,
        },
      });
    }
  };

  const totalDuration = scriptLines.reduce((sum, line) => sum + line.duration, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Script Editor</h3>
          <p className="text-sm text-gray-500">Total duration: {totalDuration}s</p>
        </div>
        <div className="flex gap-2">
          <UITemplatePicker
            onSelect={(line) => onChange([...scriptLines, line])}
          />
          <Button onClick={addLine} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Line
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {scriptLines.map((line, index) => {
          const isAnimationExpanded = expandedAnimations.has(line.id);
          const hasCustomAnimation = !!line.animation;

          return (
            <div
              key={line.id}
              draggable
              onDragStart={(e) => handleDragStart(e, line.id)}
              onDragOver={(e) => handleDragOver(e, line.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, line.id)}
              className={`p-4 bg-white rounded-lg border transition-all ${
                draggedId === line.id
                  ? 'opacity-50 border-purple-400'
                  : dragOverId === line.id
                  ? 'border-purple-500 border-2 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Drag Handle & Reorder Controls */}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-md text-sm font-medium text-gray-600 cursor-move hover:bg-gray-200 transition-colors"
                    title="Drag to reorder"
                  >
                    <GripVertical className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveLine(line.id, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move up"
                    >
                      <ArrowUp className="w-3 h-3 text-gray-600" />
                    </button>
                    <button
                      onClick={() => moveLine(line.id, 'down')}
                      disabled={index === scriptLines.length - 1}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move down"
                    >
                      <ArrowDown className="w-3 h-3 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  {/* Scene Type Indicator */}
                  {line.sceneType === 'uiMockup' && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-md">
                      <Layout className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">UI Mockup Scene</span>
                      <span className="text-xs text-purple-600 ml-auto">
                        {line.sceneProps?.title || 'Custom UI'}
                      </span>
                    </div>
                  )}

                  <div>
                    <Label htmlFor={`text-${line.id}`} className="text-sm">
                      {line.sceneType === 'uiMockup' ? 'Title/Description' : 'Text'}
                    </Label>
                    <Input
                      id={`text-${line.id}`}
                      value={line.text}
                      onChange={(e) => updateLine(line.id, { text: e.target.value })}
                      placeholder={line.sceneType === 'uiMockup' ? 'Scene description...' : 'Enter scene text...'}
                      className="mt-1"
                      disabled={line.sceneType === 'uiMockup'}
                    />
                    {line.sceneType === 'uiMockup' && (
                      <p className="text-xs text-gray-500 mt-1">
                        This is a UI mockup scene. Use the customization controls below to edit it.
                      </p>
                    )}
                  </div>

                  {/* UI Mockup Editor */}
                  {line.sceneType === 'uiMockup' && (
                    <UIMockupEditor
                      line={line}
                      onUpdate={(updates) => updateLine(line.id, updates)}
                    />
                  )}

                  <div>
                    <Label htmlFor={`duration-${line.id}`} className="text-sm">
                      Duration (seconds)
                    </Label>
                    <Input
                      id={`duration-${line.id}`}
                      type="number"
                      min="1"
                      max="10"
                      step="0.5"
                      value={line.duration}
                      onChange={(e) =>
                        updateLine(line.id, { duration: parseFloat(e.target.value) || 3 })
                      }
                      className="mt-1 w-32"
                    />
                  </div>

                  {/* Animation Controls Toggle */}
                  <div className="pt-2 border-t">
                    <button
                      onClick={() => toggleAnimationExpanded(line.id)}
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {hasCustomAnimation ? 'Custom Animation' : 'Animation (using default)'}
                      </span>
                      {isAnimationExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    {/* Animation Controls Section */}
                    {isAnimationExpanded && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Use Custom Animation</Label>
                          <Switch
                            checked={hasCustomAnimation}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateLineAnimation(line.id, {
                                  type: 'fadeIn',
                                  unit: 'word',
                                  staggerInFrames: 5,
                                  durationInFrames: 30,
                                });
                              } else {
                                updateLineAnimation(line.id, null);
                              }
                            }}
                          />
                        </div>

                        {hasCustomAnimation && line.animation && (
                          <>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Animation Type</Label>
                              <Select
                                value={line.animation.type}
                                onValueChange={(value) =>
                                  updateLineAnimation(line.id, { type: value as TextAnimationType })
                                }
                              >
                                <SelectTrigger className="h-8 text-sm">
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
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs">Animation Unit</Label>
                              <Select
                                value={line.animation.unit}
                                onValueChange={(value) =>
                                  updateLineAnimation(line.id, { unit: value as TextAnimationUnit })
                                }
                              >
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="whole">Whole</SelectItem>
                                  <SelectItem value="word">Word by Word</SelectItem>
                                  <SelectItem value="character">Character by Character</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1.5">
                                <Label className="text-xs">Stagger (frames)</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  max="20"
                                  value={line.animation.staggerInFrames || 5}
                                  onChange={(e) =>
                                    updateLineAnimation(line.id, {
                                      staggerInFrames: parseInt(e.target.value) || 5,
                                    })
                                  }
                                  className="h-8 text-sm"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <Label className="text-xs">Duration (frames)</Label>
                                <Input
                                  type="number"
                                  min="10"
                                  max="60"
                                  step="5"
                                  value={line.animation.durationInFrames || 30}
                                  onChange={(e) =>
                                    updateLineAnimation(line.id, {
                                      durationInFrames: parseInt(e.target.value) || 30,
                                    })
                                  }
                                  className="h-8 text-sm"
                                />
                              </div>
                            </div>

                            <p className="text-xs text-gray-500">
                              {getAnimationDescription(line.animation.type, line.animation.unit)}
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteLine(line.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    title="Delete line"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {scriptLines.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">No script lines yet</p>
          <Button onClick={addLine} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Line
          </Button>
        </div>
      )}
    </div>
  );
};

// Helper function to describe animation
function getAnimationDescription(type: TextAnimationType, unit: TextAnimationUnit): string {
  const unitText =
    unit === 'whole' ? 'entire text' : unit === 'word' ? 'word by word' : 'character by character';

  const typeDescriptions: Record<TextAnimationType, string> = {
    fadeIn: `Fades in ${unitText}`,
    slideUp: `Slides up ${unitText}`,
    slideDown: `Slides down ${unitText}`,
    slideLeft: `Slides left ${unitText}`,
    slideRight: `Slides right ${unitText}`,
    scale: `Zooms in ${unitText}`,
    flipUp: `3D flip effect ${unitText} - like "Desktop Tool"`,
    rotate3D: `3D rotation ${unitText}`,
    typewriter: 'Classic typing effect with cursor',
    blur: `Blurs to focus ${unitText}`,
  };

  return typeDescriptions[type] || '';
}
