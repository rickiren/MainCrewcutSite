import type { PostItem } from './types';

// Tiny ID generator (cuid-like)
export function cuid(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}${random}`;
}

// Check if ISO string is within last 48 hours
export function within48h(iso: string): boolean {
  const postTime = new Date(iso).getTime();
  const now = Date.now();
  const hoursDiff = (now - postTime) / (1000 * 60 * 60);
  return hoursDiff <= 48;
}

// Score post based on engagement and recency
export function scorePost(p: PostItem): number {
  const engagement = (p.commentCount * 0.6) + (p.likeCount * 0.4);
  const postTime = new Date(p.createdAtISO).getTime();
  const now = Date.now();
  const hoursDiff = (now - postTime) / (1000 * 60 * 60);
  
  // Recency factor: 1.0 for very recent, 0.1 for 48h old
  const recency = Math.max(0.1, 1.0 - (hoursDiff / 48));
  
  return engagement * recency;
}

// Sleep for specified milliseconds
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Random number between min and max (inclusive)
export function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
