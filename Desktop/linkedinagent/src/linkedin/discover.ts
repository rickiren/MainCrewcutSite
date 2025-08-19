import { getAuthedPage } from './login';
import { loadStore, upsertPosts, enqueue } from '../core/store';
import { cuid, within48h, scorePost, sleep, rand } from '../core/utils';
import type { NicheConfig, PostItem, QueueItem } from '../core/types';
import { promises as fs } from 'fs';
import { join } from 'path';

// Parse relative time strings to ISO
function parseRelativeTime(timeStr: string): string | null {
  const now = new Date();
  
  if (timeStr.includes('h')) {
    const hours = parseInt(timeStr.replace('h', ''));
    if (hours <= 48) {
      const date = new Date(now.getTime() - (hours * 60 * 60 * 1000));
      return date.toISOString();
    }
  } else if (timeStr.includes('d')) {
    const days = parseInt(timeStr.replace('d', ''));
    if (days === 1) {
      const date = new Date(now.getTime() - (24 * 60 * 60 * 1000));
      return date.toISOString();
    }
  }
  
  return null;
}

// Extract post data from LinkedIn article element
async function extractPostData(article: any): Promise<PostItem | null> {
  try {
    // Get post URL
    const linkElement = article.querySelector('a[href*="/posts/"]') || article.querySelector('a');
    if (!linkElement) return null;
    
    const url = linkElement.href;
    if (!url || !url.includes('/posts/')) return null;
    
    // Get post text
    const text = article.innerText || '';
    if (text.length < 100) return null; // Skip very short posts
    
    // Truncate text to 900-1200 chars
    const truncatedText = text.length > 1200 ? text.substring(0, 1200) + '...' : text;
    
    // Try to find time information
    const timeElements = article.querySelectorAll('[class*="time"], [class*="ago"], span');
    let createdAtISO = '';
    
    for (const el of timeElements) {
      const text = el.textContent?.trim();
      if (text && (text.includes('h') || text.includes('d'))) {
        const parsed = parseRelativeTime(text);
        if (parsed) {
          createdAtISO = parsed;
          break;
        }
      }
    }
    
    if (!createdAtISO) return null; // Skip if we can't determine time
    
    // Get engagement counts
    let likeCount = 0;
    let commentCount = 0;
    
    const likeElements = article.querySelectorAll('[class*="like"], [class*="reaction"]');
    const commentElements = article.querySelectorAll('[class*="comment"], [class*="reply"]');
    
    for (const el of likeElements) {
      const text = el.textContent;
      if (text && /\d+/.test(text)) {
        likeCount = parseInt(text.match(/\d+/)?.[0] || '0');
        break;
      }
    }
    
    for (const el of commentElements) {
      const text = el.textContent;
      if (text && /\d+/.test(text)) {
        commentCount = parseInt(text.match(/\d+/)?.[0] || '0');
        break;
      }
    }
    
    // Get author information
    let authorName = '';
    let authorTitle = '';
    let authorCompany = '';
    
    const authorElements = article.querySelectorAll('[role="button"], [aria-label*="author"], [class*="author"]');
    for (const el of authorElements) {
      const text = el.textContent?.trim();
      if (text && text.length > 0 && text.length < 100) {
        authorName = text;
        break;
      }
    }
    
    // Try to find title and company in nearby elements
    const titleElements = article.querySelectorAll('span, div');
    for (const el of titleElements) {
      const text = el.textContent?.trim();
      if (text && text.length > 10 && text.length < 200 && !authorTitle) {
        if (text.includes(' at ') || text.includes(' - ')) {
          authorTitle = text;
        }
      }
    }
    
    return {
      id: cuid(),
      url,
      text: truncatedText,
      createdAtISO,
      likeCount,
      commentCount,
      authorName: authorName || undefined,
      authorTitle: authorTitle || undefined,
      authorCompany: authorCompany || undefined
    };
    
  } catch (error) {
    console.log('Error extracting post data:', error);
    return null;
  }
}

// Main discovery function
export async function runDiscovery(): Promise<void> {
  let page;
  
  try {
    console.log('🔍 Starting LinkedIn discovery...');
    
    // Load niche configuration
    const configPath = join(process.cwd(), 'src/config/niche.multifamily.json');
    const configData = await fs.readFile(configPath, 'utf-8');
    const config: NicheConfig = JSON.parse(configData);
    
    console.log(`📋 Loaded niche config: ${config.name}`);
    console.log(`🔑 Keywords: ${config.filters.keywords.join(', ')}`);
    
    // Get authenticated page
    page = await getAuthedPage();
    
    // Select 2 random keywords
    const selectedKeywords = config.filters.keywords
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    
    console.log(`🎯 Selected keywords: ${selectedKeywords.join(', ')}`);
    
    const allPosts: PostItem[] = [];
    
    for (const keyword of selectedKeywords) {
      console.log(`\n🔎 Searching for: ${keyword}`);
      
      try {
        // Navigate to search results
        const searchUrl = `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword)}&sortBy=%22date_posted%22`;
        await page.goto(searchUrl, { waitUntil: 'networkidle' });
        
        // Wait for content to load
        await sleep(rand(2000, 4000));
        
        // Perform 2-3 incremental scrolls with random delays
        for (let i = 0; i < rand(2, 3); i++) {
          await page.evaluate(() => {
            window.scrollBy(0, rand(800, 1200));
          });
          await sleep(rand(1500, 3000));
        }
        
        // Extract posts
        const articles = await page.$$('article');
        console.log(`📄 Found ${articles.length} articles`);
        
        let extractedCount = 0;
        for (const article of articles) {
          if (extractedCount >= 15) break; // Limit to ~15 posts
          
          const postData = await extractPostData(article);
          if (postData && within48h(postData.createdAtISO)) {
            allPosts.push(postData);
            extractedCount++;
          }
        }
        
        console.log(`✅ Extracted ${extractedCount} posts for "${keyword}"`);
        
        // Random sleep between keywords
        await sleep(rand(3000, 6000));
        
      } catch (error) {
        console.error(`❌ Error processing keyword "${keyword}":`, error);
      }
    }
    
    // Filter, score, and sort posts
    console.log(`\n📊 Processing ${allPosts.length} total posts...`);
    
    const scoredPosts = allPosts
      .map(post => ({ ...post, score: scorePost(post) }))
      .sort((a, b) => b.score - a.score);
    
    const topPosts = scoredPosts.slice(0, 6);
    console.log(`🏆 Top ${topPosts.length} posts selected`);
    
    // Save posts
    await upsertPosts(topPosts);
    console.log(`💾 Saved ${topPosts.length} posts to store`);
    
    // Enqueue COMMENT jobs for top 3
    const top3Posts = topPosts.slice(0, 3);
    for (const post of top3Posts) {
      const queueItem: QueueItem = {
        id: cuid(),
        kind: "COMMENT",
        payload: { kind: "COMMENT", postId: post.id },
        runAfter: Date.now() + rand(30000, 150000), // 30s to 2.5min delay
        status: "queued"
      };
      
      await enqueue(queueItem);
      console.log(`📝 Enqueued COMMENT job for post: ${post.url.substring(0, 50)}...`);
    }
    
    console.log(`\n🎉 Discovery complete!`);
    console.log(`📊 Posts saved: ${topPosts.length}`);
    console.log(`📝 COMMENT jobs enqueued: ${top3Posts.length}`);
    
  } catch (error) {
    console.error('❌ Discovery failed:', error);
    throw error;
  } finally {
    if (page) {
      try {
        await page.context().browser()?.close();
      } catch (error) {
        console.log('Browser already closed');
      }
    }
  }
}
