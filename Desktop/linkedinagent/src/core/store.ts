import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import type { PostItem, QueueItem } from './types';
import { DATA_DIR } from '../linkedin/constants';

const STORE_FILE = join(DATA_DIR, 'store.json');

interface StoreData {
  posts: PostItem[];
  queue: QueueItem[];
}

// Ensure data directory exists
async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Load store data
export async function loadStore(): Promise<StoreData> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(STORE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    // Return default structure if file doesn't exist
    return { posts: [], queue: [] };
  }
}

// Save store data
export async function saveStore(data: StoreData): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(STORE_FILE, JSON.stringify(data, null, 2));
}

// Upsert posts by URL uniqueness
export async function upsertPosts(posts: PostItem[]): Promise<void> {
  const store = await loadStore();
  const existingUrls = new Set(store.posts.map(p => p.url));
  
  for (const post of posts) {
    const existingIndex = store.posts.findIndex(p => p.url === post.url);
    if (existingIndex >= 0) {
      // Update existing post
      store.posts[existingIndex] = { ...store.posts[existingIndex], ...post };
    } else {
      // Add new post
      store.posts.push(post);
    }
  }
  
  await saveStore(store);
}

// List all posts
export async function listPosts(): Promise<PostItem[]> {
  const store = await loadStore();
  return store.posts;
}

// Enqueue a job
export async function enqueue(item: QueueItem): Promise<void> {
  const store = await loadStore();
  store.queue.push(item);
  await saveStore(store);
}

// Get next job of specified kind
export async function nextJob(kind: "COMMENT"): Promise<QueueItem | null> {
  const store = await loadStore();
  const now = Date.now();
  
  const nextJob = store.queue
    .filter(item => item.kind === kind && item.status === "queued" && item.runAfter <= now)
    .sort((a, b) => a.runAfter - b.runAfter)[0];
  
  return nextJob || null;
}

// Mark job status
export async function markJob(id: string, status: QueueItem["status"]): Promise<void> {
  const store = await loadStore();
  const jobIndex = store.queue.findIndex(item => item.id === id);
  
  if (jobIndex >= 0) {
    store.queue[jobIndex].status = status;
    await saveStore(store);
  }
}
