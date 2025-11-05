/**
 * Text Splitting Utilities for Animation
 *
 * Functions to split text into animatable units (whole, line, word, character)
 * while preserving formatting, spaces, and structure.
 */

import { AnimationUnit, TextSegment } from '../types/animations';

// ═══════════════════════════════════════════════════════
// MAIN SPLITTING FUNCTION
// ═══════════════════════════════════════════════════════

/**
 * Split text into segments based on animation unit
 *
 * @param text - The text to split
 * @param unit - How to split the text (whole, line, word, character)
 * @returns Array of text segments with metadata
 *
 * @example
 * ```ts
 * splitText("Hello World", "word")
 * // Returns:
 * // [
 * //   { content: "Hello", index: 0, isSpace: false, position: 0 },
 * //   { content: " ", index: 1, isSpace: true, position: 5 },
 * //   { content: "World", index: 2, isSpace: false, position: 6 }
 * // ]
 * ```
 */
export function splitText(text: string, unit: AnimationUnit): TextSegment[] {
  switch (unit) {
    case 'whole':
      return splitWhole(text);
    case 'line':
      return splitByLine(text);
    case 'word':
      return splitByWord(text);
    case 'character':
      return splitByCharacter(text);
    default:
      return splitWhole(text);
  }
}

// ═══════════════════════════════════════════════════════
// SPLIT BY WHOLE (No splitting - return entire text)
// ═══════════════════════════════════════════════════════

function splitWhole(text: string): TextSegment[] {
  return [
    {
      content: text,
      index: 0,
      isSpace: false,
      position: 0,
    },
  ];
}

// ═══════════════════════════════════════════════════════
// SPLIT BY LINE (Split on \n)
// ═══════════════════════════════════════════════════════

function splitByLine(text: string): TextSegment[] {
  const lines = text.split('\n');
  const segments: TextSegment[] = [];
  let position = 0;

  lines.forEach((line, index) => {
    segments.push({
      content: line,
      index,
      isSpace: false,
      position,
    });

    position += line.length;

    // Add newline segment except for last line
    if (index < lines.length - 1) {
      segments.push({
        content: '\n',
        index: index + 0.5, // Half index for newline
        isSpace: true,
        position,
      });
      position += 1;
    }
  });

  return segments;
}

// ═══════════════════════════════════════════════════════
// SPLIT BY WORD (Split on spaces, preserve spaces)
// ═══════════════════════════════════════════════════════

function splitByWord(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let position = 0;
  let segmentIndex = 0;

  // Split by spaces but keep the spaces
  const parts = text.split(/(\s+)/);

  parts.forEach((part) => {
    if (part.length === 0) return;

    const isSpace = /^\s+$/.test(part);

    segments.push({
      content: part,
      index: segmentIndex++,
      isSpace,
      position,
    });

    position += part.length;
  });

  return segments;
}

// ═══════════════════════════════════════════════════════
// SPLIT BY CHARACTER (Every character separately)
// ═══════════════════════════════════════════════════════

function splitByCharacter(text: string): TextSegment[] {
  return text.split('').map((char, index) => ({
    content: char,
    index,
    isSpace: /\s/.test(char),
    position: index,
  }));
}

// ═══════════════════════════════════════════════════════
// HELPER: Get total segment count (excluding spaces if needed)
// ═══════════════════════════════════════════════════════

/**
 * Count non-space segments
 *
 * @param segments - Array of text segments
 * @returns Count of non-space segments
 */
export function countNonSpaceSegments(segments: TextSegment[]): number {
  return segments.filter((s) => !s.isSpace).length;
}

// ═══════════════════════════════════════════════════════
// HELPER: Get animation delay for a segment
// ═══════════════════════════════════════════════════════

/**
 * Calculate frame delay for a segment based on stagger
 *
 * @param segment - The text segment
 * @param staggerInFrames - Delay between segments
 * @param animateSpaces - Whether to count spaces in stagger
 * @returns Frame number when this segment should start animating
 *
 * @example
 * ```ts
 * const delay = getSegmentDelay(segment, 3, false);
 * // If segment.index is 2 and animateSpaces is false,
 * // returns 6 (2 * 3 frames)
 * ```
 */
export function getSegmentDelay(
  segment: TextSegment,
  staggerInFrames: number,
  animateSpaces: boolean = false
): number {
  if (animateSpaces) {
    return segment.index * staggerInFrames;
  }

  // Count only non-space segments before this one
  return Math.floor(segment.index) * staggerInFrames;
}

// ═══════════════════════════════════════════════════════
// HELPER: Rebuild text from segments
// ═══════════════════════════════════════════════════════

/**
 * Reconstruct original text from segments
 *
 * @param segments - Array of text segments
 * @returns Original text
 */
export function rebuildText(segments: TextSegment[]): string {
  return segments.map((s) => s.content).join('');
}

// ═══════════════════════════════════════════════════════
// HELPER: Filter visible segments
// ═══════════════════════════════════════════════════════

/**
 * Filter segments that should be visible at current frame
 *
 * @param segments - Array of text segments
 * @param frame - Current frame
 * @param staggerInFrames - Delay between segments
 * @param durationInFrames - Animation duration per segment
 * @returns Array of segments that should be visible
 */
export function getVisibleSegments(
  segments: TextSegment[],
  frame: number,
  staggerInFrames: number,
  durationInFrames: number
): TextSegment[] {
  return segments.filter((segment) => {
    const startFrame = getSegmentDelay(segment, staggerInFrames);
    const endFrame = startFrame + durationInFrames;
    return frame >= startFrame && frame < endFrame;
  });
}

// ═══════════════════════════════════════════════════════
// HELPER: Wrap text segments in styled spans
// ═══════════════════════════════════════════════════════

/**
 * Type for segment renderer function
 */
export type SegmentRenderer = (segment: TextSegment, style: React.CSSProperties) => React.ReactNode;

/**
 * Default segment renderer - creates a span with the segment content
 */
export const defaultSegmentRenderer: SegmentRenderer = (segment, style) => {
  // For spaces, use a non-breaking space to preserve layout
  const content = segment.isSpace && segment.content === ' ' ? '\u00A0' : segment.content;

  return (
    <span
      key={segment.index}
      style={{
        display: 'inline-block',
        ...style,
      }}
    >
      {content}
    </span>
  );
};

// ═══════════════════════════════════════════════════════
// UTILITY: Calculate animation progress for a segment
// ═══════════════════════════════════════════════════════

/**
 * Calculate normalized progress (0-1) for a segment's animation
 *
 * @param frame - Current frame
 * @param segment - The text segment
 * @param staggerInFrames - Delay between segments
 * @param durationInFrames - Animation duration per segment
 * @returns Progress from 0 to 1, or 0 if not started, or 1 if complete
 */
export function getSegmentProgress(
  frame: number,
  segment: TextSegment,
  staggerInFrames: number,
  durationInFrames: number
): number {
  const startFrame = getSegmentDelay(segment, staggerInFrames);
  const endFrame = startFrame + durationInFrames;

  if (frame < startFrame) return 0;
  if (frame >= endFrame) return 1;

  return (frame - startFrame) / durationInFrames;
}
