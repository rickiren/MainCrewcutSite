import 'dotenv/config';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const POLYGON_API_KEY = process.env.POLYGON_API_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export interface MarketData {
  ticker: string;
  price: number;
  change_percent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
  day_high: number | null;
  last_updated: string;
  avg_daily_volume: number | null;
}

// Fetch market data using bulk snapshot (fast, regular hours only)
async function fetchBulkSnapshot(): Promise<MarketData[]> {
  console.log('[DEBUG] Using bulk snapshot for regular hours...');
  
  try {
    // Use the correct bulk snapshot endpoint
    const url = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers?apiKey=${POLYGON_API_KEY}`;
    console.log('[DEBUG] Fetching from URL:', url);
    
    const res = await fetch(url);
    
    if (!res.ok) {
      console.error(`[ERROR] Bulk snapshot failed: ${res.status} ${res.statusText}`);
      return [];
    }
    
    const data: any = await res.json();
    console.log('[DEBUG] Bulk snapshot response status:', res.status);
    console.log('[DEBUG] Bulk snapshot response keys:', Object.keys(data));
    console.log('[DEBUG] Bulk snapshot count:', data.count || 'undefined');
    
    // The API returns data in a 'tickers' array, not 'results'
    if (!data.tickers) {
      console.log('[DEBUG] No tickers in bulk snapshot response');
      return [];
    }
    
    console.log(`[DEBUG] Processing ${data.tickers.length} tickers from bulk snapshot...`);
    
    // Process all tickers at once using map
    const records: MarketData[] = data.tickers
      .filter((ticker: any) => ticker.ticker && ticker.day && ticker.day.c > 0)
      .map((ticker: any) => {
        const day = ticker.day;
        
        // Handle invalid timestamps - use current time if updated is 0 or invalid
        let lastUpdated: string;
        try {
          if (ticker.updated && ticker.updated > 0) {
            lastUpdated = new Date(ticker.updated).toISOString();
          } else {
            lastUpdated = new Date().toISOString();
          }
        } catch (error) {
          lastUpdated = new Date().toISOString();
        }
        
        return {
          ticker: ticker.ticker,
          price: day.c,
          change_percent: ticker.todaysChangePerc || 0,
          volume: day.v,
          high: day.h,
          low: day.l,
          open: day.o,
          close: day.c,
          day_high: day.h,
          last_updated: lastUpdated,
          avg_daily_volume: null,
        };
      });
    
    console.log(`[DEBUG] Bulk snapshot processed ${records.length} records in one operation`);
    
    // Log first few records for debugging
    if (records.length > 0) {
      console.log('[DEBUG] Sample records:', records.slice(0, 3));
    }
    
    return records;
    
  } catch (error) {
    console.error('[ERROR] Error fetching bulk snapshot:', error);
    return [];
  }
}

export async function fetchAndStoreMarketData() {
  console.log('[DEBUG] fetchAndStoreMarketData started at', new Date().toISOString());

  // Get valid tickers from ticker_metadata first
  const { data: validTickers, error: tickerMetaError } = await supabase
    .from('ticker_metadata')
    .select('ticker');

  if (tickerMetaError) {
    console.error('[ERROR] Error fetching ticker_metadata:', tickerMetaError);
    return 0;
  }

  const validTickerSet = new Set(validTickers?.map(t => t.ticker) || []);
  console.log(`[DEBUG] Found ${validTickerSet.size} valid tickers in ticker_metadata`);

  // Use bulk snapshot for all market data
  const records = await fetchBulkSnapshot();
  
  console.log(`[DEBUG] Bulk snapshot returned ${records.length} records`);
  
  if (records.length === 0) {
    console.warn('[WARN] No valid records parsed — check API response format.');
    return 0;
  }

  // Filter to only include tickers that exist in ticker_metadata
  const filteredRecords = records.filter(record => validTickerSet.has(record.ticker));
  console.log(`[DEBUG] Filtered to ${filteredRecords.length} records that exist in ticker_metadata`);

  if (filteredRecords.length === 0) {
    console.warn('[WARN] No records match ticker_metadata after filtering.');
    return 0;
  }

  console.log(`[DEBUG] Prepared ${filteredRecords.length} records for upsert`);

  // Single fast upsert for all records
  const { error: upsertError } = await supabase
    .from('market_data')
    .upsert(filteredRecords, { onConflict: 'ticker' });
  
  if (upsertError) {
    console.error(`[ERROR] Error upserting records:`, upsertError);
    return 0;
  } else {
    console.log(`[DEBUG] ✅ Upserted ${filteredRecords.length} records to market_data in one operation`);
  }

  return filteredRecords.length;
}

async function run() {
  console.log('[START] Market data fetching service started');
  console.log('[INFO] Will run continuously every 15 seconds');
  
  while (true) {
    try {
      console.log(`\n[RUN] Starting market data fetch at ${new Date().toISOString()}`);
      await fetchAndStoreMarketData();
      console.log(`[WAIT] Waiting 15 seconds before next run...`);
      await new Promise(resolve => setTimeout(resolve, 15000)); // 15 seconds
    } catch (err) {
      console.error('[ERROR] Error in market data fetch:', err);
      console.log('[WAIT] Waiting 15 seconds before retry...');
      await new Promise(resolve => setTimeout(resolve, 15000)); // 15 seconds
    }
  }
}

if (require.main === module) {
  run();
}

/**
 * If the market_data table does not exist, create it in Supabase with:
 *
 * CREATE TABLE market_data (
 *   ticker text PRIMARY KEY,
 *   price numeric,
 *   change_percent numeric,
 *   volume numeric,
 *   high numeric,
 *   low numeric,
 *   open numeric,
 *   close numeric,
 *   last_updated timestamp
 * );
 *
 * You can run this SQL in the Supabase SQL editor.
 */ 