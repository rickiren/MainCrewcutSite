import { useState, useRef, useEffect } from 'react';
import { Move, Trash2, Type, Image as ImageIcon, Square, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OverlayElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
}

interface DraggableOverlayEditorProps {
  html: string;
  css: string;
  onElementsChange: (elements: OverlayElement[]) => void;
}

export const DraggableOverlayEditor: React.FC<DraggableOverlayEditorProps> = ({
  html,
  css,
  onElementsChange,
}) => {
  const [elements, setElements] = useState<OverlayElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onElementsChange(elements);
  }, [elements, onElementsChange]);

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    const element = elements.find((el) => el.id === elementId);
    if (!element) return;

    setDragging(elementId);
    setSelectedElement(elementId);
    setDragOffset({
      x: e.clientX - element.x,
      y: e.clientY - element.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, rect.width - 100));
    const y = Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, rect.height - 50));

    setElements((prev) =>
      prev.map((el) =>
        el.id === dragging ? { ...el, x, y } : el
      )
    );
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const addTextElement = () => {
    const newElement: OverlayElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'New Text',
      x: 50,
      y: 50,
      width: 200,
      height: 40,
      fontSize: 24,
      color: '#ffffff',
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const addShapeElement = (shape: 'rectangle' | 'circle') => {
    const newElement: OverlayElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      content: shape,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      backgroundColor: '#667eea',
      borderRadius: shape === 'circle' ? 50 : 8,
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  const updateElement = (id: string, updates: Partial<OverlayElement>) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const selectedEl = elements.find((el) => el.id === selectedElement);

  return (
    <div className="grid grid-cols-[1fr,300px] gap-4 h-[600px]">
      {/* Canvas */}
      <Card className="relative overflow-hidden">
        <div
          ref={canvasRef}
          className="absolute inset-0 bg-gradient-to-br from-purple-100 to-blue-100"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Base HTML Preview */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            dangerouslySetInnerHTML={{ __html: `<style>${css}</style>${html}` }}
          />

          {/* Draggable Elements */}
          {elements.map((element) => (
            <div
              key={element.id}
              className={`absolute cursor-move ${
                selectedElement === element.id
                  ? 'ring-2 ring-blue-500 ring-offset-2'
                  : ''
              }`}
              style={{
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
              }}
              onMouseDown={(e) => handleMouseDown(e, element.id)}
            >
              {element.type === 'text' && (
                <div
                  style={{
                    fontSize: element.fontSize,
                    color: element.color,
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {element.content}
                </div>
              )}
              {element.type === 'shape' && (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: element.backgroundColor,
                    borderRadius: element.borderRadius,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        {/* Toolbar */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Add Elements</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={addTextElement}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <Type className="w-4 h-4 mr-2" />
              Text
            </Button>
            <Button
              onClick={() => addShapeElement('rectangle')}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <Square className="w-4 h-4 mr-2" />
              Box
            </Button>
            <Button
              onClick={() => addShapeElement('circle')}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <Circle className="w-4 h-4 mr-2" />
              Circle
            </Button>
          </div>
        </Card>

        {/* Properties Panel */}
        <Card className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              {selectedEl ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Element Properties</h3>
                    <Button
                      onClick={() => deleteElement(selectedEl.id)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {selectedEl.type === 'text' && (
                    <>
                      <div>
                        <Label>Text Content</Label>
                        <Input
                          value={selectedEl.content}
                          onChange={(e) =>
                            updateElement(selectedEl.id, {
                              content: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Font Size</Label>
                        <Input
                          type="number"
                          value={selectedEl.fontSize}
                          onChange={(e) =>
                            updateElement(selectedEl.id, {
                              fontSize: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Color</Label>
                        <Input
                          type="color"
                          value={selectedEl.color}
                          onChange={(e) =>
                            updateElement(selectedEl.id, {
                              color: e.target.value,
                            })
                          }
                        />
                      </div>
                    </>
                  )}

                  {selectedEl.type === 'shape' && (
                    <>
                      <div>
                        <Label>Background Color</Label>
                        <Input
                          type="color"
                          value={selectedEl.backgroundColor}
                          onChange={(e) =>
                            updateElement(selectedEl.id, {
                              backgroundColor: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Border Radius</Label>
                        <Input
                          type="number"
                          value={selectedEl.borderRadius}
                          onChange={(e) =>
                            updateElement(selectedEl.id, {
                              borderRadius: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Width</Label>
                      <Input
                        type="number"
                        value={selectedEl.width}
                        onChange={(e) =>
                          updateElement(selectedEl.id, {
                            width: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Height</Label>
                      <Input
                        type="number"
                        value={selectedEl.height}
                        onChange={(e) =>
                          updateElement(selectedEl.id, {
                            height: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>X Position</Label>
                      <Input
                        type="number"
                        value={Math.round(selectedEl.x)}
                        onChange={(e) =>
                          updateElement(selectedEl.id, {
                            x: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Y Position</Label>
                      <Input
                        type="number"
                        value={Math.round(selectedEl.y)}
                        onChange={(e) =>
                          updateElement(selectedEl.id, {
                            y: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Move className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select an element to edit properties</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
};
