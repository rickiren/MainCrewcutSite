import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { ScriptLine } from '@/types/video';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ScriptEditorProps {
  scriptLines: ScriptLine[];
  onChange: (lines: ScriptLine[]) => void;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({ scriptLines, onChange }) => {
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

  const totalDuration = scriptLines.reduce((sum, line) => sum + line.duration, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Script Editor</h3>
          <p className="text-sm text-gray-500">Total duration: {totalDuration}s</p>
        </div>
        <Button onClick={addLine} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Line
        </Button>
      </div>

      <div className="space-y-3">
        {scriptLines.map((line, index) => (
          <div
            key={line.id}
            className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-md text-sm font-medium text-gray-600">
              {index + 1}
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <Label htmlFor={`text-${line.id}`} className="text-sm">
                  Text
                </Label>
                <Input
                  id={`text-${line.id}`}
                  value={line.text}
                  onChange={(e) => updateLine(line.id, { text: e.target.value })}
                  placeholder="Enter scene text..."
                  className="mt-1"
                />
              </div>

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
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteLine(line.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
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
