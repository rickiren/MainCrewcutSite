// HTML Template Parser for Kick Overlay Generator
// Parses HTML/CSS and converts to OverlayElement format

import type { OverlayElement } from '@/types/overlay';
import { OVERLAY_THEMES } from '@/types/overlay';

/**
 * Detects element type from HTML element attributes and content
 */
function detectElementType(element: HTMLElement): OverlayElement['type'] {
  // Check data-type attribute first
  const dataType = element.getAttribute('data-type');
  if (dataType) {
    const validTypes: OverlayElement['type'][] = [
      'webcam', 'chat', 'alerts', 'label', 'image',
      'donation-goal', 'subscriber-count', 'follower-count',
      'recent-events', 'custom-box'
    ];
    if (validTypes.includes(dataType as OverlayElement['type'])) {
      return dataType as OverlayElement['type'];
    }
  }

  // Check class names
  const className = element.className.toLowerCase();
  if (className.includes('webcam') || className.includes('camera') || className.includes('facecam')) {
    return 'webcam';
  }
  if (className.includes('chat') || className.includes('messages')) {
    return 'chat';
  }
  if (className.includes('alert') || className.includes('notification')) {
    return 'alerts';
  }
  if (className.includes('donation') || className.includes('goal')) {
    return 'donation-goal';
  }
  if (className.includes('subscriber') || className.includes('subs')) {
    return 'subscriber-count';
  }
  if (className.includes('follower')) {
    return 'follower-count';
  }
  if (className.includes('event') || className.includes('recent')) {
    return 'recent-events';
  }
  if (element.tagName === 'IMG' || className.includes('image')) {
    return 'image';
  }

  // Default to label for text elements
  return 'label';
}

/**
 * Extracts style properties from CSS computed styles
 */
function extractStyleFromElement(element: HTMLElement, computedStyle: CSSStyleDeclaration): Partial<OverlayElement['style']> {
  const style: Partial<OverlayElement['style']> = {};

  // Background color
  const bgColor = computedStyle.backgroundColor;
  if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
    style.backgroundColor = bgColor;
  }

  // Border properties
  const borderWidth = parseInt(computedStyle.borderWidth) || 0;
  if (borderWidth > 0) {
    style.borderWidth = borderWidth;
    style.borderColor = computedStyle.borderColor || '#000000';
    style.borderStyle = (computedStyle.borderStyle as any) || 'solid';
  }

  // Border radius
  const borderRadius = parseInt(computedStyle.borderRadius) || 0;
  if (borderRadius > 0) {
    style.borderRadius = borderRadius;
  }

  // Text properties
  const fontSize = parseInt(computedStyle.fontSize) || 16;
  style.fontSize = fontSize;
  style.fontFamily = computedStyle.fontFamily || 'Arial, sans-serif';
  style.fontWeight = parseInt(computedStyle.fontWeight) || 400;
  style.textColor = computedStyle.color || '#000000';
  style.textAlign = (computedStyle.textAlign as any) || 'left';

  // Opacity
  const opacity = parseFloat(computedStyle.opacity);
  if (opacity !== 1) {
    style.opacity = opacity;
  }

  // Shadow
  const boxShadow = computedStyle.boxShadow;
  if (boxShadow && boxShadow !== 'none') {
    const shadowMatch = boxShadow.match(/(\d+)px\s+(\d+)px\s+(\d+)px\s+(.+)/);
    if (shadowMatch) {
      style.shadow = {
        enabled: true,
        x: parseInt(shadowMatch[1]) || 0,
        y: parseInt(shadowMatch[2]) || 0,
        blur: parseInt(shadowMatch[3]) || 0,
        color: shadowMatch[4] || 'rgba(0,0,0,0.5)',
      };
    }
  }

  return style;
}

/**
 * Converts pixel values to percentages based on canvas size
 */
function pxToPercent(value: number, canvasSize: number): number {
  return (value / canvasSize) * 100;
}

/**
 * Parses a CSS position value (px or %) to percentage
 */
function parsePosition(value: string, canvasSize: number): number {
  if (value.endsWith('%')) {
    return parseFloat(value);
  }
  if (value.endsWith('px')) {
    return pxToPercent(parseFloat(value), canvasSize);
  }
  return parseFloat(value) || 0;
}

/**
 * Parses inline style attribute
 */
function parseInlineStyle(styleAttr: string): Record<string, string> {
  const styles: Record<string, string> = {};
  if (!styleAttr) return styles;
  
  styleAttr.split(';').forEach(rule => {
    const [property, value] = rule.split(':').map(s => s.trim());
    if (property && value) {
      const camelProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      styles[camelProperty] = value;
    }
  });
  
  return styles;
}

/**
 * Result of parsing HTML template - includes both elements and raw HTML/CSS
 */
export interface ParseHTMLResult {
  elements: OverlayElement[];
  htmlTemplate: string;
  cssTemplate: string;
}

/**
 * Parses HTML template and converts to OverlayElement array
 * Also returns the raw HTML/CSS for exact design preservation
 */
export function parseHTMLTemplate(
  html: string,
  css: string = '',
  canvasWidth: number = 1920,
  canvasHeight: number = 1080
): ParseHTMLResult {
  const elements: OverlayElement[] = [];
  const theme = OVERLAY_THEMES[0]; // Default theme

  // Create a temporary container to parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Check if we have a valid document
  if (!doc || !doc.documentElement) {
    throw new Error('Invalid HTML structure');
  }
  
  // Determine if it's a full HTML document or just body content
  const isFullHTML = doc.documentElement.tagName === 'HTML';
  const bodyContent = doc.body ? doc.body.innerHTML : '';
  
  // Create a temporary container div with styles
  const container = document.createElement('div');
  container.style.width = `${canvasWidth}px`;
  container.style.height = `${canvasHeight}px`;
  container.style.position = 'relative';
  container.style.visibility = 'hidden';
  container.style.pointerEvents = 'none';
  
  // Create a temporary style element to apply CSS
  const styleElement = document.createElement('style');
  styleElement.textContent = css;
  document.head.appendChild(styleElement);
  document.body.appendChild(container);

  // Clone and append HTML to container for element extraction
  // Use body content if available, otherwise use the full HTML
  const htmlContent = bodyContent || (isFullHTML ? '' : html);
  container.innerHTML = htmlContent;

  // Find all positioned elements (absolute or fixed)
  const allElements = container.querySelectorAll('*');
  
  allElements.forEach((el, index) => {
    const htmlElement = el as HTMLElement;
    const computedStyle = window.getComputedStyle(htmlElement);
    const position = computedStyle.position;
    
    // Only process absolutely or fixed positioned elements
    if (position === 'absolute' || position === 'fixed') {
      const elementType = detectElementType(htmlElement);
      
      // Get position
      const left = parsePosition(computedStyle.left, canvasWidth);
      const top = parsePosition(computedStyle.top, canvasHeight);
      
      // Get size
      const width = parsePosition(computedStyle.width, canvasWidth);
      const height = parsePosition(computedStyle.height, canvasHeight);
      
      // Extract styles
      const style = extractStyleFromElement(htmlElement, computedStyle);
      
      // Merge with theme defaults
      const finalStyle: OverlayElement['style'] = {
        backgroundColor: style.backgroundColor || theme.colors.background,
        borderColor: style.borderColor || theme.colors.border,
        borderWidth: style.borderWidth || theme.defaultElementStyle.borderWidth || 2,
        borderRadius: style.borderRadius || theme.defaultElementStyle.borderRadius || 8,
        borderStyle: style.borderStyle || theme.defaultElementStyle.borderStyle || 'solid',
        opacity: style.opacity ?? theme.defaultElementStyle.opacity ?? 0.9,
        fontSize: style.fontSize || 16,
        fontFamily: style.fontFamily || theme.fonts.primary,
        fontWeight: style.fontWeight || 400,
        textColor: style.textColor || theme.colors.text,
        textAlign: style.textAlign || 'center',
        shadow: style.shadow || theme.defaultElementStyle.shadow,
      };
      
      // Get content
      let content = '';
      if (elementType === 'image') {
        const img = htmlElement.querySelector('img');
        content = img?.getAttribute('src') || img?.getAttribute('data-src') || '';
      } else {
        content = htmlElement.textContent?.trim() || htmlElement.innerText?.trim() || '';
      }
      
      const overlayElement: OverlayElement = {
        id: `element-${Date.now()}-${index}`,
        type: elementType,
        label: elementType.charAt(0).toUpperCase() + elementType.slice(1).replace('-', ' '),
        position: {
          x: Math.max(0, Math.min(100, left)),
          y: Math.max(0, Math.min(100, top)),
        },
        size: {
          width: Math.max(1, Math.min(100, width)),
          height: Math.max(1, Math.min(100, height)),
        },
        style: finalStyle,
        content: content,
        zIndex: parseInt(computedStyle.zIndex) || index,
      };
      
      elements.push(overlayElement);
    }
  });
  
  // Extract full HTML structure before cleanup
  // If HTML already has full structure, use it
  let fullHTML = html;
  if (isFullHTML) {
    // Use the original full HTML document
    fullHTML = html;
  } else if (bodyContent) {
    // Wrap body content in a container
    fullHTML = `<div class="overlay-container">${bodyContent}</div>`;
  } else {
    // Fallback: use the original HTML
    fullHTML = html;
  }
  
  // Extract CSS from style tags
  const styleTags = doc.querySelectorAll('style');
  const extractedCSS = Array.from(styleTags)
    .map(style => style.textContent || '')
    .join('\n');
  
  // Combine extracted CSS with provided CSS
  const allCSS = [extractedCSS, css].filter(Boolean).join('\n');
  
  // Clean up - use try-catch to handle potential errors
  try {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    if (styleElement.parentNode) {
      document.head.removeChild(styleElement);
    }
  } catch (cleanupError) {
    console.warn('Error during cleanup:', cleanupError);
  }
  
  return {
    elements,
    htmlTemplate: fullHTML,
    cssTemplate: allCSS,
  };
}

/**
 * Analyzes an uploaded image and generates overlay elements
 * This is a placeholder - can be enhanced with real AI vision API
 */
export async function analyzeImageDesign(
  imageData: string,
  canvasWidth: number = 1920,
  canvasHeight: number = 1080
): Promise<OverlayElement[]> {
  // Placeholder implementation
  // In production, this would use Claude Vision API or similar
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Create a simple default layout based on common overlay patterns
      const theme = OVERLAY_THEMES[0];
      
      const elements: OverlayElement[] = [
        {
          id: `webcam-${Date.now()}`,
          type: 'webcam',
          label: 'Webcam',
          position: { x: 75, y: 60 },
          size: { width: 20, height: 35 },
          style: {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            borderWidth: 3,
            borderRadius: 12,
            borderStyle: 'solid',
            opacity: 0.95,
            fontSize: 16,
            fontFamily: theme.fonts.primary,
            fontWeight: 400,
            textColor: theme.colors.text,
            textAlign: 'center',
            shadow: theme.defaultElementStyle.shadow,
          },
          zIndex: 1,
        },
        {
          id: `chat-${Date.now()}`,
          type: 'chat',
          label: 'Chat',
          position: { x: 5, y: 30 },
          size: { width: 25, height: 60 },
          style: {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            borderWidth: 2,
            borderRadius: 8,
            borderStyle: 'solid',
            opacity: 0.9,
            fontSize: 14,
            fontFamily: theme.fonts.primary,
            fontWeight: 400,
            textColor: theme.colors.text,
            textAlign: 'left',
            shadow: theme.defaultElementStyle.shadow,
          },
          zIndex: 0,
        },
      ];
      
      resolve(elements);
    }, 1500); // Simulate analysis time
  });
}

