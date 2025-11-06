import { useState, useRef, useEffect } from 'react';
import { Trash2, GripVertical, Video, MessageSquare, Bell, Image, DollarSign, Users, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { OverlayConfig, OverlayElement } from '@/types/overlay';
import { motion } from 'framer-motion';

interface OverlayCanvasProps {
  config: OverlayConfig;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<OverlayElement>) => void;
  onRemoveElement: (id: string) => void;
}

export function OverlayCanvas({
  config,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onRemoveElement,
}: OverlayCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

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
}
