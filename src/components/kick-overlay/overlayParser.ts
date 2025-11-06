import type { OverlayElement, OverlayElementType } from '@/types/overlay';
import { OVERLAY_THEMES } from '@/types/overlay';

interface ParsedHTMLElement {
  type: OverlayElementType;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
    opacity?: number;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: number;
    textColor?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
  content?: string;
  label: string;
}

/**
 * Parses HTML template and extracts overlay elements
 */
export function parseHTMLTemplate(html: string): OverlayElement[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const elements: OverlayElement[] = [];
  const theme = OVERLAY_THEMES[0]; // Default theme

  // Try to find overlay elements in the HTML
  // Look for elements with common overlay indicators
  const overlayElements = doc.querySelectorAll('[data-type], .overlay-element, [class*="webcam"], [class*="chat"], [class*="alert"]');

  overlayElements.forEach((element, index) => {
    const htmlElement = element as HTMLElement;
    const computedStyle = extractStyleFromElement(htmlElement);
    const type = detectElementType(htmlElement);

    elements.push({
      id: `imported-${type}-${Date.now()}-${index}`,
      type,
      label: htmlElement.getAttribute('data-label') || getLabelForType(type),
      position: computedStyle.position,
      size: computedStyle.size,
      style: {
        backgroundColor: computedStyle.backgroundColor || theme.colors.background,
        borderColor: computedStyle.borderColor || theme.colors.border,
        borderWidth: computedStyle.borderWidth || 2,
        borderRadius: computedStyle.borderRadius || 8,
        borderStyle: computedStyle.borderStyle || 'solid',
        opacity: computedStyle.opacity || 0.9,
        fontSize: computedStyle.fontSize || 16,
        fontFamily: computedStyle.fontFamily || theme.fonts.primary,
        fontWeight: computedStyle.fontWeight || 400,
        textColor: computedStyle.textColor || theme.colors.text,
        textAlign: computedStyle.textAlign || 'center',
        shadow: theme.defaultElementStyle.shadow,
      },
      content: htmlElement.textContent?.trim() || '',
      zIndex: computedStyle.zIndex || 0,
    });
  });

  // If no elements found, try to extract all positioned divs
  if (elements.length === 0) {
    const allDivs = doc.querySelectorAll('div[style*="position"]');

    allDivs.forEach((element, index) => {
      const htmlElement = element as HTMLElement;
      const computedStyle = extractStyleFromElement(htmlElement);

      // Only include elements that are absolutely positioned
      if (computedStyle.position.x >= 0 && computedStyle.position.y >= 0) {
        elements.push({
          id: `imported-custom-${Date.now()}-${index}`,
          type: 'custom-box',
          label: `Imported Element ${index + 1}`,
          position: computedStyle.position,
          size: computedStyle.size,
          style: {
            backgroundColor: computedStyle.backgroundColor || theme.colors.background,
            borderColor: computedStyle.borderColor || theme.colors.border,
            borderWidth: computedStyle.borderWidth || 2,
            borderRadius: computedStyle.borderRadius || 8,
            borderStyle: computedStyle.borderStyle || 'solid',
            opacity: computedStyle.opacity || 0.9,
            fontSize: computedStyle.fontSize || 16,
            fontFamily: computedStyle.fontFamily || theme.fonts.primary,
            fontWeight: computedStyle.fontWeight || 400,
            textColor: computedStyle.textColor || theme.colors.text,
            textAlign: computedStyle.textAlign || 'center',
            shadow: theme.defaultElementStyle.shadow,
          },
          content: htmlElement.textContent?.trim() || '',
          zIndex: computedStyle.zIndex || 0,
        });
      }
    });
  }

  return elements;
}

/**
 * Extracts style properties from HTML element
 */
function extractStyleFromElement(element: HTMLElement) {
  const style = element.style;
  const className = element.className;
  const text = element.textContent || '';

  // Extract position (convert from px or % to percentage)
  let x = 0, y = 0, width = 20, height = 20;

  // Parse left, top
  if (style.left) {
    x = parsePositionValue(style.left);
  }
  if (style.top) {
    y = parsePositionValue(style.top);
  }

  // Parse width, height
  if (style.width) {
    width = parsePositionValue(style.width);
  }
  if (style.height) {
    height = parsePositionValue(style.height);
  }

  // Extract colors
  const backgroundColor = style.backgroundColor || '';
  const color = style.color || '';
  const borderColor = extractBorderColor(style.border || style.borderColor || '');

  // Extract border properties
  const borderWidth = parseBorderWidth(style.border || style.borderWidth || '');
  const borderRadius = parseInt(style.borderRadius || '0') || 0;
  const borderStyle = extractBorderStyle(style.border || style.borderStyle || '');

  // Extract text properties
  const fontSize = parseInt(style.fontSize || '16') || 16;
  const fontFamily = style.fontFamily || 'Arial, sans-serif';
  const fontWeight = parseInt(style.fontWeight || '400') || 400;
  const textAlign = (style.textAlign as 'left' | 'center' | 'right') || 'center';

  // Extract opacity
  const opacity = parseFloat(style.opacity || '1') || 1;

  // Extract z-index
  const zIndex = parseInt(style.zIndex || '0') || 0;

  return {
    position: { x, y },
    size: { width, height },
    backgroundColor,
    borderColor,
    borderWidth,
    borderRadius,
    borderStyle,
    textColor: color,
    fontSize,
    fontFamily,
    fontWeight,
    textAlign,
    opacity,
    zIndex,
  };
}

/**
 * Parses position value from CSS (supports %, px, or number)
 */
function parsePositionValue(value: string): number {
  if (value.includes('%')) {
    return parseFloat(value) || 0;
  }
  if (value.includes('px')) {
    // Assume 1920x1080 canvas for px conversion
    const px = parseFloat(value) || 0;
    return (px / 1920) * 100; // Convert to percentage
  }
  return parseFloat(value) || 0;
}

/**
 * Extracts border color from border shorthand
 */
function extractBorderColor(border: string): string {
  const colorMatch = border.match(/(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\)|[a-z]+)/);
  return colorMatch ? colorMatch[0] : '';
}

/**
 * Extracts border width from border shorthand
 */
function parseBorderWidth(border: string): number {
  const widthMatch = border.match(/(\d+)px/);
  return widthMatch ? parseInt(widthMatch[1]) : 0;
}

/**
 * Extracts border style from border shorthand
 */
function extractBorderStyle(border: string): 'solid' | 'dashed' | 'dotted' | 'none' {
  if (border.includes('dashed')) return 'dashed';
  if (border.includes('dotted')) return 'dotted';
  if (border.includes('none')) return 'none';
  return 'solid';
}

/**
 * Detects element type based on class names, data attributes, or content
 */
function detectElementType(element: HTMLElement): OverlayElementType {
  const dataType = element.getAttribute('data-type');
  if (dataType) return dataType as OverlayElementType;

  const className = element.className.toLowerCase();
  const text = element.textContent?.toLowerCase() || '';

  // Detect by class name
  if (className.includes('webcam') || className.includes('camera') || className.includes('cam')) {
    return 'webcam';
  }
  if (className.includes('chat')) {
    return 'chat';
  }
  if (className.includes('alert') || className.includes('notification')) {
    return 'alerts';
  }
  if (className.includes('donation') || className.includes('goal')) {
    return 'donation-goal';
  }
  if (className.includes('subscriber') || className.includes('sub')) {
    return 'subscriber-count';
  }
  if (className.includes('follower')) {
    return 'follower-count';
  }
  if (className.includes('event')) {
    return 'recent-events';
  }
  if (className.includes('label') || className.includes('title') || className.includes('text')) {
    return 'label';
  }
  if (className.includes('image') || className.includes('img')) {
    return 'image';
  }

  // Detect by text content
  if (text.includes('live') || text.includes('streaming')) {
    return 'label';
  }
  if (text.includes('chat')) {
    return 'chat';
  }
  if (text.includes('webcam') || text.includes('camera')) {
    return 'webcam';
  }

  return 'custom-box';
}

/**
 * Gets a default label for an element type
 */
function getLabelForType(type: OverlayElementType): string {
  const labels: Record<OverlayElementType, string> = {
    'webcam': 'Webcam',
    'chat': 'Chat',
    'alerts': 'Alerts',
    'label': 'Label',
    'image': 'Image',
    'donation-goal': 'Donation Goal',
    'subscriber-count': 'Subscribers',
    'follower-count': 'Followers',
    'recent-events': 'Recent Events',
    'custom-box': 'Custom Box',
  };
  return labels[type];
}

/**
 * Analyzes an uploaded image and extracts design information
 * This is a simplified version - in production, you'd use AI vision API
 */
export function analyzeImageDesign(imageData: string): Promise<OverlayElement[]> {
  return new Promise((resolve) => {
    // Create an image element to get dimensions
    const img = new Image();
    img.onload = () => {
      const elements: OverlayElement[] = [];
      const theme = OVERLAY_THEMES[0];

      // This is a placeholder implementation
      // In a real app, you'd send the image to an AI vision API
      // For now, we'll create a default gaming layout
      elements.push(
        {
          id: `webcam-${Date.now()}`,
          type: 'webcam',
          label: 'Webcam',
          position: { x: 73, y: 62 },
          size: { width: 22, height: 35 },
          style: {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            borderWidth: 2,
            borderRadius: 8,
            borderStyle: 'solid',
            opacity: 0.9,
            fontSize: 16,
            fontFamily: theme.fonts.primary,
            fontWeight: 400,
            textColor: theme.colors.text,
            textAlign: 'center',
            shadow: theme.defaultElementStyle.shadow,
          },
          zIndex: 0,
        },
        {
          id: `chat-${Date.now()}`,
          type: 'chat',
          label: 'Chat',
          position: { x: 5, y: 30 },
          size: { width: 25, height: 65 },
          style: {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            borderWidth: 2,
            borderRadius: 8,
            borderStyle: 'solid',
            opacity: 0.9,
            fontSize: 16,
            fontFamily: theme.fonts.primary,
            fontWeight: 400,
            textColor: theme.colors.text,
            textAlign: 'center',
            shadow: theme.defaultElementStyle.shadow,
          },
          zIndex: 0,
        }
      );

      resolve(elements);
    };
    img.src = imageData;
  });
}
