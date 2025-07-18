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

export interface IpoData {
  ticker: string;
  name: string;
  exchange: string;
  offer_date: string;
  offer_price: number | null;
  shares: number | null;
  status: string;
  published_at: string;
  collected_at: string;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchAndStoreIpos() {
  try {
    let allIpos: IpoData[] = [];
    let next_url: string | null = null;
    let page = 1;
    let totalFetched = 0;

    do {
      const url = next_url || `https://api.polygon.io/v3/reference/ipos?limit=50&sort=published_utc&order=desc&apiKey=${POLYGON_API_KEY}`;
      console.log(`Fetching IPOs from Polygon (page ${page})...`);
      
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`Polygon API error: ${res.status} ${res.statusText}`);
        const errorText = await res.text();
        console.error('Error details:', errorText);
        break;
      }

      const data = await res.json() as any;
      const results = data.results || [];
      
      console.log(`Got ${results.length} IPOs on page ${page}`);
      
      if (results.length === 0) {
        console.log('No more IPOs to fetch.');
        break;
      }

      // Transform the data to match our schema
      const ipoItems: IpoData[] = results.map((item: any) => ({
        ticker: item.ticker || '',
        name: item.name || '',
        exchange: item.exchange || '',
        offer_date: item.offer_date || null,
        offer_price: item.offer_price || null,
        shares: item.shares || null,
        status: item.status || 'unknown',
        published_at: item.published_utc || item.updated_utc || new Date().toISOString(),
        collected_at: new Date().toISOString(),
      }));

      allIpos.push(...ipoItems);
      totalFetched += results.length;

      // Check for next page
      next_url = data.next_url ? `${data.next_url}&apiKey=${POLYGON_API_KEY}` : null;
      page++;

      // Throttle: 2 requests per second (safe for Developer plan)
      if (next_url) {
        await delay(500);
      }

    } while (next_url && page <= 5); // Limit to 5 pages to avoid excessive API usage

    console.log(`Total IPOs fetched: ${totalFetched}`);

    if (allIpos.length === 0) {
      console.log('No IPOs found to process');
      return { totalFetched: 0, totalSaved: 0 };
    }

    // Check for existing IPOs to avoid duplicates
    // We'll check by ticker and offer_date combination
    const existingIpos = await supabase
      .from('ipos')
      .select('ticker, offer_date')
      .in('ticker', allIpos.map(ipo => ipo.ticker).filter(Boolean));

    const existingIpoSet = new Set(
      existingIpos.data?.map(ipo => `${ipo.ticker}-${ipo.offer_date}`) || []
    );

    const newIpos = allIpos.filter(ipo => {
      const key = `${ipo.ticker}-${ipo.offer_date}`;
      return !existingIpoSet.has(key);
    });

    console.log(`Found ${existingIpoSet.size} existing IPOs, ${newIpos.length} new IPOs to insert`);

    let totalSaved = 0;
    if (newIpos.length > 0) {
      // Insert new IPOs in batches to avoid payload size limits
      const batchSize = 50;
      for (let i = 0; i < newIpos.length; i += batchSize) {
        const batch = newIpos.slice(i, i + batchSize);
        const { error } = await supabase
          .from('ipos')
          .insert(batch);
        
        if (error) {
          console.error('Error inserting IPO batch:', error);
        } else {
          console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} IPOs`);
          totalSaved += batch.length;
        }
      }
    }

    // Also update existing IPOs if their data has changed
    const existingIposToUpdate = allIpos.filter(ipo => {
      const key = `${ipo.ticker}-${ipo.offer_date}`;
      return existingIpoSet.has(key);
    });

    if (existingIposToUpdate.length > 0) {
      console.log(`Updating ${existingIposToUpdate.length} existing IPOs...`);
      for (const ipo of existingIposToUpdate) {
        const { error } = await supabase
          .from('ipos')
          .update({
            name: ipo.name,
            exchange: ipo.exchange,
            offer_price: ipo.offer_price,
            shares: ipo.shares,
            status: ipo.status,
            published_at: ipo.published_at,
            collected_at: ipo.collected_at,
          })
          .eq('ticker', ipo.ticker)
          .eq('offer_date', ipo.offer_date);
        
        if (error) {
          console.error(`Error updating IPO ${ipo.ticker}:`, error);
        }
      }
    }

    console.log(`IPO fetch complete. Total saved: ${totalSaved} new IPOs, ${existingIposToUpdate.length} updated`);
    return { totalFetched, totalSaved };

  } catch (error) {
    console.error('Error fetching and storing IPOs:', error);
    throw error;
  }
}

if (require.main === module) {
  fetchAndStoreIpos()
    .then(({ totalFetched, totalSaved }) => {
      console.log(`Script completed successfully. Fetched: ${totalFetched}, Saved: ${totalSaved}`);
      process.exit(0);
    })
    .catch(err => {
      console.error('Script failed:', err);
      process.exit(1);
    });
}

/**
 * If the ipos table does not exist, create it in Supabase with:
 *
 * CREATE TABLE ipos (
 *   id SERIAL PRIMARY KEY,
 *   ticker text NOT NULL,
 *   name text NOT NULL,
 *   exchange text NOT NULL,
 *   offer_date date,
 *   offer_price numeric,
 *   shares numeric,
 *   status text NOT NULL,
 *   published_at timestamp NOT NULL,
 *   collected_at timestamp NOT NULL,
 *   UNIQUE(ticker, offer_date)
 * );
 *
 * You can run this SQL in the Supabase SQL editor.
 */ 