import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Trash2, GripVertical, Video, MessageSquare, Bell, Image, DollarSign, Users, Eye, Edit3, Eye as EyeIcon, Palette, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { OverlayConfig, OverlayElement } from '@/types/overlay';
import { motion } from 'framer-motion';

interface OverlayCanvasProps {
  config: OverlayConfig;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<OverlayElement>) => void;
  onRemoveElement: (id: string) => void;
  onHTMLElementUpdate?: (elementId: string, property: string, value: string) => void;
  onHTMLElementContentUpdate?: (elementId: string, content: string) => void;
  selectedHTMLElement?: HTMLElement | null;
  onEditModeChange?: (editMode: boolean) => void;
  onExtractedElementsChange?: (elements: ExtractedHTMLElement[]) => void;
  onSaveHTML?: (html: string, css: string) => void;
}

export interface ExtractedHTMLElement {
  id: string;
  element: HTMLElement;
  tagName: string;
  textContent: string;
  rect: DOMRect;
  computedStyle: CSSStyleDeclaration;
}

export interface OverlayCanvasHandle {
  save: () => void;
}

export const OverlayCanvas = forwardRef<OverlayCanvasHandle, OverlayCanvasProps>(({
  config,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onRemoveElement,
  onEditModeChange,
  onExtractedElementsChange,
  onSaveHTML,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const htmlContainerRef = useRef<HTMLDivElement>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [editMode, setEditMode] = useState(false);
  const [extractedElements, setExtractedElements] = useState<ExtractedHTMLElement[]>([]);

  // Calculate canvas scale to fit container
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight - 40; // Account for controls
        const scaleX = containerWidth / config.canvas.width;
        const scaleY = containerHeight / config.canvas.height;
        setCanvasScale(Math.min(scaleX, scaleY, 1)); // Don't scale up beyond 100%
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [config.canvas.width, config.canvas.height]);

  // Handle element drag start
  const handleMouseDown = (e: React.MouseEvent, element: OverlayElement) => {
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).classList.contains('drag-handle')) {
      return;
    }

    e.stopPropagation();
    onSelectElement(element.id);
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    });
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent, element: OverlayElement) => {
    e.stopPropagation();
    onSelectElement(element.id);
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.size.width,
      height: element.size.height,
    });
  };

  // Handle mouse move for dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!selectedElementId) return;

      const element = config.elements.find(el => el.id === selectedElementId);
      if (!element || !containerRef.current) return;

      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        const canvasWidth = config.canvas.width * canvasScale;
        const canvasHeight = config.canvas.height * canvasScale;

        const deltaXPercent = (deltaX / canvasWidth) * 100;
        const deltaYPercent = (deltaY / canvasHeight) * 100;

        const newX = Math.max(0, Math.min(100 - element.size.width, element.position.x + deltaXPercent));
        const newY = Math.max(0, Math.min(100 - element.size.height, element.position.y + deltaYPercent));

        onUpdateElement(selectedElementId, {
          position: { x: newX, y: newY },
        });

        setDragStart({ x: e.clientX, y: e.clientY });
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        const canvasWidth = config.canvas.width * canvasScale;
        const canvasHeight = config.canvas.height * canvasScale;

        const deltaWidthPercent = (deltaX / canvasWidth) * 100;
        const deltaHeightPercent = (deltaY / canvasHeight) * 100;

        const newWidth = Math.max(5, Math.min(100 - element.position.x, resizeStart.width + deltaWidthPercent));
        const newHeight = Math.max(5, Math.min(100 - element.position.y, resizeStart.height + deltaHeightPercent));

        onUpdateElement(selectedElementId, {
          size: { width: newWidth, height: newHeight },
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, selectedElementId, dragStart, resizeStart, config, canvasScale, onUpdateElement]);

  // Get icon for element type
  const getElementIcon = (type: OverlayElement['type']) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case 'webcam': return <Video className={iconClass} />;
      case 'chat': return <MessageSquare className={iconClass} />;
      case 'alerts': return <Bell className={iconClass} />;
      case 'image': return <Image className={iconClass} />;
      case 'donation-goal': return <DollarSign className={iconClass} />;
      case 'subscriber-count':
      case 'follower-count': return <Users className={iconClass} />;
      case 'recent-events': return <Eye className={iconClass} />;
      default: return null;
    }
  };

  // Apply theme-based styles to element
  const getElementStyles = (element: OverlayElement) => {
    const style = element.style;
    return {
      position: 'absolute' as const,
      left: `${element.position.x}%`,
      top: `${element.position.y}%`,
      width: `${element.size.width}%`,
      height: `${element.size.height}%`,
      backgroundColor: style.backgroundColor || config.theme.colors.background,
      border: `${style.borderWidth || 2}px ${style.borderStyle || 'solid'} ${style.borderColor || config.theme.colors.border}`,
      borderRadius: `${style.borderRadius || 8}px`,
      opacity: style.opacity || 0.9,
      color: style.textColor || config.theme.colors.text,
      fontSize: `${style.fontSize || 16}px`,
      fontFamily: style.fontFamily || config.theme.fonts.primary,
      fontWeight: style.fontWeight || 400,
      textAlign: style.textAlign || 'center',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '12px',
      cursor: 'move',
      userSelect: 'none' as const,
      zIndex: element.zIndex || 0,
      boxShadow: style.shadow?.enabled
        ? `${style.shadow.x}px ${style.shadow.y}px ${style.shadow.blur}px ${style.shadow.color}`
        : 'none',
    };
  };

  const canvasWidth = config.canvas.width * canvasScale;
  const canvasHeight = config.canvas.height * canvasScale;

  // Generate HTML content for iframe when HTML template is present
  const generateHTMLContent = (): string => {
    if (!config.htmlTemplate) return '';
    
    // Parse the HTML template
    const parser = new DOMParser();
    const doc = parser.parseFromString(config.htmlTemplate, 'text/html');
    
    // Check if it's a full HTML document
    if (doc.documentElement.tagName === 'HTML') {
      // If additional CSS is provided, inject it into the head
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
      // Return the complete HTML document
      return `<!DOCTYPE html>${doc.documentElement.outerHTML}`;
    }
    
    // Otherwise, wrap body content in full HTML structure
    const allCSS = config.cssTemplate || '';
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=${config.canvas.width}, height=${config.canvas.height}">
  <title>Overlay Preview</title>
  ${allCSS ? `<style>${allCSS}</style>` : ''}
</head>
<body>
  ${config.htmlTemplate}
</body>
</html>`;
  };

  // Handle iframe loading for HTML templates (preview mode)
  useEffect(() => {
    if (config.htmlTemplate && iframeRef.current && !editMode) {
      const htmlContent = generateHTMLContent();
      const iframe = iframeRef.current;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      iframe.src = url;

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [config.htmlTemplate, config.cssTemplate, config.canvas.width, config.canvas.height, editMode]);

  // Auto-tag common editable elements if no data-editable attributes found
  const autoTagEditableElements = () => {
    if (!htmlContainerRef.current) return 0;

    // Common classes and selectors that should be editable
    const commonEditableClasses = [
      'channel-title', 'live-indicator', 'ribbon', 'ribbon-text',
      'webcam-frame', 'webcam-label', 'social-callout', 'social-text',
      'social-handle', 'chat-box', 'chat-header', 'events-panel',
      'events-header', 'bottom-bar', 'top-banner', 'title', 'subtitle',
      'header', 'footer', 'label', 'caption', 'heading'
    ];

    // Common tag names for text content
    const commonEditableTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'button', 'a', 'span', 'label'];

    let taggedCount = 0;

    // Tag by common classes
    commonEditableClasses.forEach((className) => {
      const elements = htmlContainerRef.current?.querySelectorAll(`.${className}`);
      elements?.forEach((el) => {
        if (!el.hasAttribute('data-editable')) {
          el.setAttribute('data-editable', 'true');
          if (!el.hasAttribute('data-id')) {
            el.setAttribute('data-id', `auto-${className}-${Date.now()}`);
          }
          taggedCount++;
        }
      });
    });

    // Tag common text elements if they have meaningful content
    commonEditableTags.forEach((tagName) => {
      const elements = htmlContainerRef.current?.querySelectorAll(tagName);
      elements?.forEach((el) => {
        const text = el.textContent?.trim();
        // Only tag if it has text, no data-editable yet, and not too many children
        if (text && text.length > 0 && text.length < 200 && !el.hasAttribute('data-editable') && el.children.length === 0) {
          el.setAttribute('data-editable', 'true');
          if (!el.hasAttribute('data-id')) {
            el.setAttribute('data-id', `auto-${tagName}-${Date.now()}`);
          }
          taggedCount++;
        }
      });
    });

    return taggedCount;
  };

  // Extract elements from HTML when entering edit mode
  const extractElementsFromHTML = () => {
    if (!htmlContainerRef.current) return;

    const extracted: ExtractedHTMLElement[] = [];

    // First, check if there are any manually tagged data-editable elements
    let editableElements = htmlContainerRef.current.querySelectorAll('[data-editable="true"]');

    // If no manually tagged elements found, auto-tag common ones
    if (editableElements.length === 0) {
      const taggedCount = autoTagEditableElements();
      console.log(`Auto-tagged ${taggedCount} elements as editable`);
      // Re-query after auto-tagging
      editableElements = htmlContainerRef.current.querySelectorAll('[data-editable="true"]');
    }

    // Extract ALL editable elements - don't filter out parents or overlapping elements
    // Users can edit any element they want, even if it overlaps with others
    editableElements.forEach((el, index) => {
      const htmlEl = el as HTMLElement;
      const text = htmlEl.textContent?.trim();

      // Get data-id or generate one
      const dataId = htmlEl.getAttribute('data-id') || `element-${index}-${Date.now()}`;

      // Extract element info - account for canvas scale in coordinates
      const rect = htmlEl.getBoundingClientRect();
      const containerRect = htmlContainerRef.current?.getBoundingClientRect();

      if (rect && containerRect) {
        // Calculate position relative to the container, accounting for scale
        // The container has a transform scale applied, so we need to account for that
        const relativeX = (rect.left - containerRect.left) / canvasScale;
        const relativeY = (rect.top - containerRect.top) / canvasScale;
        const relativeWidth = rect.width / canvasScale;
        const relativeHeight = rect.height / canvasScale;

        extracted.push({
          id: dataId,
          element: htmlEl,
          tagName: htmlEl.tagName.toLowerCase(),
          textContent: text || '',
          rect: new DOMRect(
            relativeX,
            relativeY,
            relativeWidth,
            relativeHeight
          ),
          computedStyle: window.getComputedStyle(htmlEl),
        });
      }
    });

    setExtractedElements(extracted);
    onExtractedElementsChange?.(extracted);
    console.log(`Extracted ${extracted.length} editable elements`);
  };

  // Save modified HTML and CSS
  const saveModifiedHTML = () => {
    if (!htmlContainerRef.current || !config.htmlTemplate) return;

    // Clone the container to avoid modifying the original
    const container = htmlContainerRef.current.cloneNode(true) as HTMLElement;
    
    // Remove any temporary attributes we might have added
    container.querySelectorAll('[data-temp-id]').forEach(el => {
      el.removeAttribute('data-temp-id');
    });
    
    // Extract the HTML content with all inline styles preserved
    const modifiedHTML = container.innerHTML;
    
    // Keep the original CSS - inline styles are preserved in the HTML
    const css = config.cssTemplate || '';

    // Call the save callback
    onSaveHTML?.(modifiedHTML, css);
  };

  // Expose save function via ref
  useImperativeHandle(ref, () => ({
    save: saveModifiedHTML,
  }));

  // Toggle edit mode
  const toggleEditMode = () => {
    const newEditMode = !editMode;
    
    if (editMode && !newEditMode) {
      // Exiting edit mode - save changes before switching
      saveModifiedHTML();
    }
    
    setEditMode(newEditMode);
    onEditModeChange?.(newEditMode);
    if (!editMode) {
      // Entering edit mode - extract elements after a short delay to let HTML render
      setTimeout(() => {
        extractElementsFromHTML();
      }, 100);
    } else {
      // Exiting edit mode - clear extracted elements
      setExtractedElements([]);
      onExtractedElementsChange?.([]);
      onSelectElement(null);
    }
  };

  // Handle dragging extracted HTML elements
  const handleHTMLElementDrag = (extractedId: string, deltaX: number, deltaY: number) => {
    // Framer Motion provides deltas in screen/pixel coordinates
    // We need to convert these to the scaled canvas coordinate system
    // The canvas has a transform: scale(canvasScale) applied, so screen pixels
    // need to be divided by the scale to get canvas coordinates
    const normalizedDeltaX = deltaX / canvasScale;
    const normalizedDeltaY = deltaY / canvasScale;

    // Update the extracted elements state
    setExtractedElements((prev) =>
      prev.map((el) => {
        if (el.id === extractedId) {
          return {
            ...el,
            rect: new DOMRect(
              el.rect.x + normalizedDeltaX,
              el.rect.y + normalizedDeltaY,
              el.rect.width,
              el.rect.height
            ),
          };
        }
        return el;
      })
    );

    // Update the actual HTML element's position in the DOM
    const extracted = extractedElements.find((el) => el.id === extractedId);
    if (extracted && extracted.element) {
      // Get current transform values
      const currentTransform = extracted.element.style.transform || '';
      const translateMatch = currentTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);

      let currentX = 0;
      let currentY = 0;
      if (translateMatch) {
        currentX = parseFloat(translateMatch[1].trim());
        currentY = parseFloat(translateMatch[2].trim());
      }

      // Apply the new position - these are in the scaled coordinate system
      // The element itself is inside the scaled container, so we apply the delta directly
      extracted.element.style.position = 'relative';
      extracted.element.style.transform = `translate(${currentX + normalizedDeltaX}px, ${currentY + normalizedDeltaY}px)`;
    }
  };

  // If HTML template exists, render it with edit mode support
  if (config.htmlTemplate) {
    return (
      <div ref={containerRef} className="w-full flex flex-col">
        {/* Canvas Info */}
        <div className="w-full flex items-center justify-between mb-3 text-sm text-gray-400">
          <div>
            Resolution: {config.canvas.width} × {config.canvas.height}px
            {canvasScale < 1 && ` (${Math.round(canvasScale * 100)}% scale)`}
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs">HTML Template Mode</span>
            {editMode && (
              <span className="px-2 py-1 bg-green-600/20 text-green-300 rounded text-xs">
                {extractedElements.length} Editable Elements
              </span>
            )}
            {editMode && (
              <Button
                onClick={saveModifiedHTML}
                size="sm"
                variant="outline"
                className="bg-blue-600/20 border-blue-500 text-blue-200 hover:bg-blue-600/30"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            )}
            <Button
              onClick={toggleEditMode}
              size="sm"
              variant={editMode ? 'default' : 'outline'}
              className={editMode ? 'bg-green-600 hover:bg-green-700' : 'border-gray-600'}
            >
              {editMode ? (
                <>
                  <EyeIcon className="w-4 h-4 mr-2" />
                  Preview Mode
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Mode
                </>
              )}
            </Button>
          </div>
        </div>

        {/* HTML Content */}
        <div className="flex justify-center">
          <div
            ref={canvasContainerRef}
            className="relative bg-gray-900 border-2 border-gray-700 rounded-lg shadow-2xl overflow-hidden"
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
            }}
          >
          {/* Preview Mode: Show in iframe */}
          {!editMode && (
            <iframe
              ref={iframeRef}
              className="border-0"
              style={{
                width: `${config.canvas.width}px`,
                height: `${config.canvas.height}px`,
                transform: `scale(${canvasScale})`,
                transformOrigin: 'top left',
              }}
              title="Overlay Preview"
            />
          )}

          {/* Edit Mode: Show as HTML with draggable overlays */}
          {editMode && (
            <div
              ref={htmlContainerRef}
              className="w-full h-full relative overflow-auto"
              style={{
                transform: `scale(${canvasScale})`,
                transformOrigin: 'top left',
                width: `${config.canvas.width}px`,
                height: `${config.canvas.height}px`,
              }}
              dangerouslySetInnerHTML={{
                __html: `<style>${config.cssTemplate || ''}</style>${config.htmlTemplate}`,
              }}
            />
          )}

          {/* Draggable Overlays for Edit Mode */}
          {editMode &&
            extractedElements.map((extracted, index) => {
              const isSelected = selectedElementId === extracted.id;
              // Higher z-index for selected, and incrementing for others to prevent overlap issues
              const zIndex = isSelected ? 9999 : 1000 + index;

              // Position overlays accounting for canvas scale
              // The HTML container is scaled, but overlays are not, so we need to scale the positions
              const overlayLeft = extracted.rect.x * canvasScale;
              const overlayTop = extracted.rect.y * canvasScale;
              const overlayWidth = extracted.rect.width * canvasScale;
              const overlayHeight = extracted.rect.height * canvasScale;

              return (
                <motion.div
                  key={extracted.id}
                  className={`absolute border-2 cursor-move ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-green-500 bg-green-500/5 hover:bg-green-500/10'
                  }`}
                  style={{
                    left: `${overlayLeft}px`,
                    top: `${overlayTop}px`,
                    width: `${overlayWidth}px`,
                    height: `${overlayHeight}px`,
                    pointerEvents: 'auto',
                    zIndex: zIndex,
                  }}
                  drag
                  dragMomentum={false}
                  dragElastic={0}
                  dragConstraints={canvasContainerRef}
                  onDragStart={() => onSelectElement(extracted.id)}
                  onDrag={(_, info) => {
                    handleHTMLElementDrag(extracted.id, info.delta.x, info.delta.y);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectElement(extracted.id);
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap flex items-center gap-2 z-10">
                      <GripVertical className="w-3 h-3" />
                      {extracted.tagName}: "{extracted.textContent.substring(0, 20)}..."
                    </div>
                  )}

                  {/* Helper text for non-selected elements */}
                  {!isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-xs text-green-600 font-medium bg-white/90 px-2 py-1 rounded">
                        Click to select & drag
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Default element-based rendering
  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] flex flex-col items-center">
      {/* Canvas Info */}
      <div className="w-full flex items-center justify-between mb-3 text-sm text-gray-400">
        <div>
          Resolution: {config.canvas.width} × {config.canvas.height}px
          {canvasScale < 1 && ` (${Math.round(canvasScale * 100)}% scale)`}
        </div>
        <div>
          Elements: {config.elements.length}
        </div>
      </div>

      {/* Canvas */}
      <div
        className="relative bg-gray-900 border-2 border-gray-700 rounded-lg shadow-2xl"
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          backgroundColor: config.canvas.backgroundColor,
          backgroundImage: config.canvas.backgroundImage ? `url(${config.canvas.backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        onClick={() => onSelectElement(null)}
      >
        {config.elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">Your overlay canvas is empty</p>
              <p className="text-sm mt-2">Add elements from the Elements panel →</p>
            </div>
          </div>
        )}

        {/* Render elements */}
        {config.elements.map((element) => {
          const isSelected = element.id === selectedElementId;
          return (
            <motion.div
              key={element.id}
              style={getElementStyles(element)}
              onMouseDown={(e) => handleMouseDown(e, element)}
              className={`overlay-element ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {/* Drag handle */}
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-1 bg-blue-500/20 backdrop-blur-sm rounded-t-lg drag-handle">
                  <div className="flex items-center gap-1 text-xs text-white">
                    <GripVertical className="w-3 h-3" />
                    {element.label}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveElement(element.id);
                    }}
                    className="h-5 w-5 p-0 hover:bg-red-500/30"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </Button>
                </div>
              )}

              {/* Element content */}
              <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                {getElementIcon(element.type)}
                <span className="font-medium">{element.content || element.label}</span>
              </div>

              {/* Resize handle */}
              {isSelected && (
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-tl cursor-nwse-resize"
                  onMouseDown={(e) => handleResizeStart(e, element)}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});
