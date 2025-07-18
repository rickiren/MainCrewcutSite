import 'dotenv/config';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

console.log("Script started with limit:", process.argv[2]);

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const POLYGON_API_KEY = process.env.POLYGON_API_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY. Exiting.');
  throw new Error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export interface TickerMetadata {
  ticker: string;
  name: string | null;
  primary_exchange: string | null;
  market_cap: number | null;
  share_class_shares_outstanding: number | null;
  weighted_shares_outstanding: number | null;
  avg_volume_10d: number | null;
  updated_at: string;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchAndStoreTickerMetadata() {
  try {
    // Fetch all valid tickers from market_data in batches of 1000
    let allTickers: { ticker: string }[] = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
      const { data, error } = await supabase
        .from("market_data")
        .select("ticker")
        .range(from, from + pageSize - 1);
      if (error) {
        console.error("Error fetching market_data:", error);
        break;
      }
      if (!data || data.length === 0) break;
      allTickers.push(...data);
      from += pageSize;
      if (data.length < pageSize) break; // last page
    }
    console.log("Total tickers loaded from market_data:", allTickers.length, allTickers.slice(0, 10)); // Show first 10 for sanity check
    if (allTickers.length === 0) {
      console.error('No valid tickers found in market_data. Exiting.');
      return;
    }
    const batchSize = 100;
    let batch: TickerMetadata[] = [];
    let totalUpserted = 0;
    for (let i = 0; i < allTickers.length; i++) {
      const ticker = allTickers[i].ticker;
      
      // Progress indicator every 10 tickers
      if (i % 10 === 0) {
        console.log(`Processing ticker ${i + 1}/${allTickers.length}: ${ticker}`);
      }
      
      const url = `https://api.polygon.io/v3/reference/tickers/${ticker}?apiKey=${POLYGON_API_KEY}`;
      let res, json;
      try {
        res = await fetch(url);
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`Failed to fetch details for ${ticker}:`, res.status, errorText);
          continue;
        }
        json = await res.json();
      } catch (err) {
        console.error(`Error fetching or parsing details for ${ticker}:`, err);
        continue;
      }
      const t = (json as any).results;
      if (!t) {
        console.log(`No details found for ${ticker}`);
        continue;
      }
      
      // Only log null values occasionally to reduce noise
      if (t.share_class_shares_outstanding == null && i % 50 === 0) {
        console.log(`Ticker ${ticker} missing share_class_shares_outstanding in Polygon response`);
      }
      
      batch.push({
        ticker: t.ticker,
        name: t.name ?? null,
        primary_exchange: t.primary_exchange ?? null,
        market_cap: t.market_cap ?? null,
        share_class_shares_outstanding: t.share_class_shares_outstanding ?? null,
        weighted_shares_outstanding: t.weighted_shares_outstanding ?? null,
        avg_volume_10d: t.avg_volume_10d ?? null,
        updated_at: t.last_updated_utc ?? new Date().toISOString(),
      });
      
      // Upsert in batches
      if (batch.length === batchSize || i === allTickers.length - 1) {
        console.log(`\n=== UPSERTING BATCH ${Math.floor(i / batchSize) + 1} ===`);
        console.log(`Upserting batch of ${batch.length} tickers (ending with ${ticker})...`);
        const { error: upsertError } = await supabase
          .from('ticker_metadata')
          .upsert(batch, { onConflict: 'ticker' });
        if (upsertError) {
          console.error('Supabase upsert error:', upsertError);
          throw upsertError;
        }
        totalUpserted += batch.length;
        console.log(`✅ Successfully upserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} tickers`);
        console.log(`📊 Total upserted so far: ${totalUpserted}/${allTickers.length}`);
        batch = [];
        // Add a delay to avoid rate limits
        console.log(`⏳ Waiting 2 seconds before next batch...`);
        await delay(2000);
      } else {
        // Shorter delay between single requests
        await delay(250);
      }
    }
    console.log(`Upserted a total of ${totalUpserted} tickers to ticker_metadata.`);
  } catch (err) {
    console.error('Script exited early due to error:', err);
    return;
  }
}

if (require.main === module) {
  fetchAndStoreTickerMetadata()
    .catch(err => {
      console.error('Error:', err);
      process.exit(1);
    });
}

/**
 * If the ticker_metadata table does not exist, create it in Supabase with:
 *
 * CREATE TABLE ticker_metadata (
 *   ticker text PRIMARY KEY,
 *   name text,
 *   primary_exchange text,
 *   market_cap bigint,
 *   share_class_shares_outstanding bigint,
 *   weighted_shares_outstanding bigint,
 *   avg_volume_10d numeric,
 *   updated_at timestamp
 * );
 *
 * You can run this SQL in the Supabase SQL editor.
 */ 