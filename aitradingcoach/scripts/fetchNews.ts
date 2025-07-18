import 'dotenv/config';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const POLYGON_API_KEY = process.env.POLYGON_API_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !POLYGON_API_KEY) {
  throw new Error('Please set SUPABASE_URL, SUPABASE_SERVICE_KEY, and POLYGON_API_KEY in your environment.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export interface NewsItem {
  id: string;
  tickers: string[];
  headline: string;
  summary: string | null;
  url: string;
  source: string;
  published_at: string;
  collected_at: string;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchAndStoreNews() {
  try {
    let allNews: NewsItem[] = [];
    let next_url: string | null = null;
    let page = 1;
    let totalFetched = 0;
    let totalWithTickers = 0;
    let totalSaved = 0;
    const maxArticles = 500;

    do {
      const url = next_url || `https://api.polygon.io/v2/reference/news?limit=50&order=desc&apiKey=${POLYGON_API_KEY}`;
      console.log(`Fetching news from Polygon (page ${page})...`);
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`Polygon API error: ${res.status} ${res.statusText}`);
        const errorText = await res.text();
        console.error('Error details:', errorText);
        break;
      }

      const data = await res.json() as any;
      const results = data.results || [];
      totalFetched += results.length;

      for (const item of results) {
        if (item.tickers && Array.isArray(item.tickers) && item.tickers.length > 0) {
          totalWithTickers++;
          allNews.push({
            id: item.id,
            tickers: item.tickers,
            headline: item.title || item.headline || '',
            summary: item.summary || null,
            url: item.article_url || item.url || '',
            source: item.publisher?.name || item.source || 'Unknown',
            published_at: item.published_utc || new Date().toISOString(),
            collected_at: new Date().toISOString(),
          });
        }
      }

      next_url = data.next_url ? `${data.next_url}&apiKey=${POLYGON_API_KEY}` : null;
      page++;

      // Throttle: 2 requests per second (safe for Developer plan)
      if (next_url) await delay(500);

    } while (next_url && allNews.length < maxArticles);

    // Limit to maxArticles
    if (allNews.length > maxArticles) {
      allNews = allNews.slice(0, maxArticles);
    }

    console.log(`Total articles fetched: ${totalFetched}`);
    console.log(`Articles with tickers: ${totalWithTickers}`);
    console.log(`Articles to store: ${allNews.length}`);

    // Check for existing news items to avoid duplicates
    const existingIds = allNews.map(item => item.id);
    const { data: existingNews } = await supabase
      .from('news')
      .select('id')
      .in('id', existingIds);

    const existingIdSet = new Set(existingNews?.map(item => item.id) || []);
    const newNews = allNews.filter(item => !existingIdSet.has(item.id));

    if (newNews.length > 0) {
      const batchSize = 100;
      for (let i = 0; i < newNews.length; i += batchSize) {
        const batch = newNews.slice(i, i + batchSize);
        const { error } = await supabase
          .from('news')
          .insert(batch);
        if (error) {
          console.error('Error inserting news batch:', error);
        } else {
          totalSaved += batch.length;
        }
      }
    }

    console.log(`News fetch complete. Total saved: ${totalSaved} new items`);
    return { totalFetched, totalWithTickers, totalSaved };

  } catch (error) {
    console.error('Error fetching and storing news:', error);
    throw error;
  }
}

if (require.main === module) {
  fetchAndStoreNews()
    .then(({ totalFetched, totalWithTickers, totalSaved }) => {
      console.log(`Script completed. Fetched: ${totalFetched}, With Tickers: ${totalWithTickers}, Saved: ${totalSaved}`);
      process.exit(0);
    })
    .catch(err => {
      console.error('Script failed:', err);
      process.exit(1);
    });
}

/**
 * If the news table does not exist, create it in Supabase with:
 *
 * CREATE TABLE news (
 *   id text PRIMARY KEY,
 *   tickers text[] NOT NULL,
 *   headline text NOT NULL,
 *   summary text,
 *   url text NOT NULL,
 *   source text NOT NULL,
 *   published_at timestamp NOT NULL,
 *   collected_at timestamp NOT NULL
 * );
 *
 * You can run this SQL in the Supabase SQL editor.
 */ 