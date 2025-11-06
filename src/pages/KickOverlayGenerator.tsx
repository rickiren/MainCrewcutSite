import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Sparkles, Save, Undo2, Redo2 } from 'lucide-react';
import { OverlayCanvas } from '@/components/kick-overlay/OverlayCanvas';
import { ElementPanel } from '@/components/kick-overlay/ElementPanel';
import { StyleCustomizer } from '@/components/kick-overlay/StyleCustomizer';
import { AIOverlayGenerator } from '@/components/kick-overlay/AIOverlayGenerator';
import { TemplateSelector } from '@/components/kick-overlay/TemplateSelector';
import type { OverlayConfig, OverlayElement, OverlayTheme } from '@/types/overlay';
import { OVERLAY_THEMES, CANVAS_PRESETS } from '@/types/overlay';

export default function KickOverlayGenerator() {
  const [overlayConfig, setOverlayConfig] = useState<OverlayConfig>({
    id: 'default-overlay',
    name: 'My Kick Overlay',
    canvas: {
      width: CANVAS_PRESETS['1080p'].width,
      height: CANVAS_PRESETS['1080p'].height,
      backgroundColor: 'rgba(0, 0, 0, 0)',
    },
    elements: [],
    theme: OVERLAY_THEMES[0], // Default to Neon Cyberpunk
  });

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('elements');
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  // Add a new element to the canvas
  const handleAddElement = (element: OverlayElement) => {
    setOverlayConfig(prev => ({
      ...prev,
      elements: [...prev.elements, element],
    }));
    setSelectedElementId(element.id);
  };

  // Update an existing element
  const handleUpdateElement = (elementId: string, updates: Partial<OverlayElement>) => {
    setOverlayConfig(prev => ({
      ...prev,
      elements: prev.elements.map(el =>
        el.id === elementId ? { ...el, ...updates } : el
      ),
    }));
  };

  // Remove an element
  const handleRemoveElement = (elementId: string) => {
    setOverlayConfig(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== elementId),
    }));
    if (selectedElementId === elementId) {
      setSelectedElementId(null);
    }
  };

  // Update theme
  const handleThemeChange = (theme: OverlayTheme) => {
    setOverlayConfig(prev => ({
      ...prev,
      theme,
      // Optionally update existing elements to match theme
      elements: prev.elements.map(el => ({
        ...el,
        style: {
          ...el.style,
          ...theme.defaultElementStyle,
          borderColor: el.style?.borderColor || theme.colors.border,
          backgroundColor: el.style?.backgroundColor || theme.colors.background,
          textColor: el.style?.textColor || theme.colors.text,
        },
      })),
    }));
  };

  // Export overlay as HTML
  const handleExportHTML = () => {
    const htmlContent = generateOverlayHTML(overlayConfig);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${overlayConfig.name.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Save overlay config as JSON
  const handleSaveConfig = () => {
    const json = JSON.stringify(overlayConfig, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${overlayConfig.name.replace(/\s+/g, '-').toLowerCase()}-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate HTML content for export
  const generateOverlayHTML = (config: OverlayConfig): string => {
    // If HTML template exists, use it directly (preserves exact design)
    if (config.htmlTemplate) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(config.htmlTemplate, 'text/html');
      
      // If it's a full HTML document, return as-is (with any additional CSS)
      if (doc.documentElement.tagName === 'HTML') {
        if (config.cssTemplate) {
          const styleEl = doc.createElement('style');
          styleEl.textContent = config.cssTemplate;
          if (doc.head) {
            doc.head.appendChild(styleEl);
          } else {
            const head = doc.createElement('head');
            head.appendChild(styleEl);
            doc.documentElement.insertBefore(head, doc.documentElement.firstChild);
          }
        }
        return `<!DOCTYPE html>${doc.documentElement.outerHTML}`;
      }
      
      // Otherwise wrap in full HTML structure
      const allCSS = config.cssTemplate || '';
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=${config.canvas.width}, height=${config.canvas.height}">
  <title>${config.name}</title>
  ${allCSS ? `<style>${allCSS}</style>` : ''}
</head>
<body>
  ${config.htmlTemplate}
</body>
</html>`;
    }
    
    // Fall back to element-based generation
    const elementsHTML = config.elements
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
      .map(el => {
        const style = `
          position: absolute;
          left: ${el.position.x}%;
          top: ${el.position.y}%;
          width: ${el.size.width}%;
          height: ${el.size.height}%;
          background-color: ${el.style.backgroundColor || 'transparent'};
          border: ${el.style.borderWidth || 0}px ${el.style.borderStyle || 'solid'} ${el.style.borderColor || 'transparent'};
          border-radius: ${el.style.borderRadius || 0}px;
          opacity: ${el.style.opacity || 1};
          color: ${el.style.textColor || '#ffffff'};
          font-size: ${el.style.fontSize || 16}px;
          font-family: ${el.style.fontFamily || 'Arial, sans-serif'};
          font-weight: ${el.style.fontWeight || 400};
          text-align: ${el.style.textAlign || 'left'};
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: ${el.zIndex || 0};
          ${el.style.shadow?.enabled ? `box-shadow: ${el.style.shadow.x}px ${el.style.shadow.y}px ${el.style.shadow.blur}px ${el.style.shadow.color};` : ''}
        `.trim();

        return `<div class="overlay-element" data-type="${el.type}" style="${style}">
          ${el.content || el.label}
        </div>`;
      })
      .join('\n    ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      width: ${config.canvas.width}px;
      height: ${config.canvas.height}px;
      background-color: ${config.canvas.backgroundColor};
      ${config.canvas.backgroundImage ? `background-image: url('${config.canvas.backgroundImage}');` : ''}
      background-size: cover;
      background-position: center;
      overflow: hidden;
      font-family: ${config.theme.fonts.primary};
    }
    .overlay-container {
      position: relative;
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div class="overlay-container">
    ${elementsHTML}
  </div>
</body>
</html>`;
  };

  const selectedElement = overlayConfig.elements.find(el => el.id === selectedElementId);

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-20">
        <div className="px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto pb-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Kick Overlay Generator
                </h1>
                <p className="text-gray-300">
                  Create professional streaming overlays for OBS with AI-powered design
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAIGenerator(!showAIGenerator)}
                  className="bg-purple-600/20 border-purple-500 text-purple-200 hover:bg-purple-600/30"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Generator
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSaveConfig}
                  className="bg-blue-600/20 border-blue-500 text-blue-200 hover:bg-blue-600/30"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Config
                </Button>
                <Button
                  onClick={handleExportHTML}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export HTML
                </Button>
              </div>
            </div>
          </div>

          {/* AI Generator Modal */}
          {showAIGenerator && (
            <div className="mb-6">
              <Card className="bg-gray-800/50 border-purple-500/30 backdrop-blur-sm">
                <AIOverlayGenerator
                  onGenerate={(elements, htmlTemplate, cssTemplate) => {
                    setOverlayConfig(prev => ({
                      ...prev,
                      elements: [...prev.elements, ...elements],
                      // Store HTML/CSS templates if provided (for HTML template mode)
                      ...(htmlTemplate && { htmlTemplate }),
                      ...(cssTemplate && { cssTemplate }),
                    }));
                    setShowAIGenerator(false);
                  }}
                  onClose={() => setShowAIGenerator(false)}
                />
              </Card>
            </div>
          )}

          {/* Main Editor Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Preview Canvas */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-white mb-2">Live Preview</h2>
                  <p className="text-sm text-gray-400">
                    Click and drag elements to reposition. Resize using handles.
                  </p>
                </div>
                <OverlayCanvas
                  config={overlayConfig}
                  selectedElementId={selectedElementId}
                  onSelectElement={setSelectedElementId}
                  onUpdateElement={handleUpdateElement}
                  onRemoveElement={handleRemoveElement}
                />
              </Card>
            </div>

            {/* Right: Editor Controls */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="elements">Elements</TabsTrigger>
                    <TabsTrigger value="style">Style</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                  </TabsList>

                  <TabsContent value="elements" className="space-y-4">
                    <ElementPanel
                      onAddElement={handleAddElement}
                      selectedElement={selectedElement}
                      onUpdateElement={(updates) => {
                        if (selectedElementId) {
                          handleUpdateElement(selectedElementId, updates);
                        }
                      }}
                      theme={overlayConfig.theme}
                    />
                  </TabsContent>

                  <TabsContent value="style" className="space-y-4">
                    <StyleCustomizer
                      config={overlayConfig}
                      selectedElement={selectedElement}
                      onUpdateConfig={(updates) => {
                        setOverlayConfig(prev => ({ ...prev, ...updates }));
                      }}
                      onUpdateElement={(updates) => {
                        if (selectedElementId) {
                          handleUpdateElement(selectedElementId, updates);
                        }
                      }}
                      onThemeChange={handleThemeChange}
                    />
                  </TabsContent>

                  <TabsContent value="templates" className="space-y-4">
                    <TemplateSelector
                      onSelectTemplate={(template) => {
                        setOverlayConfig(prev => ({
                          ...prev,
                          elements: template.elements,
                          theme: template.theme,
                        }));
                      }}
                    />
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
