import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface TickerMetadata {
  share_class_shares_outstanding: number; // Used as float estimate
}

export interface LowFloatTicker {
  ticker: string;
  price: number;
  float: number;
  volume: number;
  change_percent: number;
  rel_vol: number | null;
  source: string;
  filtered_at: string;
}

export async function filterAndStoreLowFloatTickers() {
  try {
    console.log('Starting low float ticker filter...');
    const startTime = Date.now();

    // Clean up old records (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { error: deleteError } = await supabase
      .from('low_float_tickers')
      .delete()
      .lt('filtered_at', oneHourAgo);
    if (deleteError) {
      console.error('Error deleting old records:', deleteError);
    } else {
      console.log('Cleaned up old records from low_float_tickers table');
    }

    // Optimize: Only fetch tickers that meet basic criteria first
    console.log('Fetching tickers with basic criteria...');
    let allTickers: { ticker: string; price: number; volume: number; change_percent: number; avg_daily_volume: number | null }[] = [];
    let from = 0;
    const pageSize = 1000;
    
    while (true) {
      const { data, error } = await supabase
        .from('market_data')
        .select('ticker, price, volume, change_percent, avg_daily_volume')
        .not('price', 'is', null)
        .not('volume', 'is', null)
        .not('change_percent', 'is', null)
        .gte('price', 0.3)
        .lte('price', 250)
        .gte('volume', 100000)
        .gt('change_percent', 10)
        .range(from, from + pageSize - 1);
      if (error) {
        console.error('Error fetching market_data:', error);
        break;
      }
      if (!data || data.length === 0) break;
      allTickers.push(...data);
      from += pageSize;
      if (data.length < pageSize) break; // last page
    }
    console.log(`Fetched ${allTickers.length} tickers from market_data (pre-filtered)`);

    if (allTickers.length === 0) {
      console.log('No tickers found with basic criteria');
      return { totalFiltered: 0, totalStored: 0 };
    }

    // Get unique ticker symbols
    const tickerSymbols = Array.from(new Set(allTickers.map(t => t.ticker)));
    console.log(`Processing ${tickerSymbols.length} unique tickers`);

    // Bulk fetch metadata for only the tickers we need
    console.log('Fetching ticker metadata...');
    let allMetadata: { ticker: string; share_class_shares_outstanding: number | null; weighted_shares_outstanding: number | null }[] = [];
    from = 0;
    while (from < tickerSymbols.length) {
      const batch = tickerSymbols.slice(from, from + pageSize);
      const { data, error } = await supabase
        .from('ticker_metadata')
        .select('ticker, share_class_shares_outstanding, weighted_shares_outstanding')
        .in('ticker', batch);
      if (error) {
        console.error('Error fetching ticker_metadata:', error);
        break;
      }
      if (data) {
        allMetadata.push(...data);
      }
      from += pageSize;
    }
    console.log(`Fetched ${allMetadata.length} ticker metadata records`);

    // Create a map for fast lookup
    const metadataMap = new Map<string, { share_class_shares_outstanding: number | null; weighted_shares_outstanding: number | null }>();
    for (const meta of allMetadata) {
      metadataMap.set(meta.ticker, {
        share_class_shares_outstanding: meta.share_class_shares_outstanding,
        weighted_shares_outstanding: meta.weighted_shares_outstanding
      });
    }

    const filteredTickers: LowFloatTicker[] = [];
    let skippedDueToNullFloat = 0;
    let skippedDueToCriteria = 0;
    let processedCount = 0;

    // Process each ticker in memory
    for (const ticker of allTickers) {
      processedCount++;
      
      // Progress logging every 500 tickers
      if (processedCount % 500 === 0) {
        console.log(`Processed ${processedCount}/${allTickers.length} tickers, skipped ${skippedDueToNullFloat + skippedDueToCriteria}, added ${filteredTickers.length}`);
      }

      // Get metadata from map
      const metadata = metadataMap.get(ticker.ticker);
      if (!metadata) {
        skippedDueToNullFloat++;
        continue;
      }

      // Try share_class_shares_outstanding first, then weighted_shares_outstanding as fallback
      let float: number | null = null;
      if (metadata.share_class_shares_outstanding != null) {
        float = Number(metadata.share_class_shares_outstanding);
      } else if (metadata.weighted_shares_outstanding != null) {
        float = Number(metadata.weighted_shares_outstanding);
      }

      if (float == null) {
        skippedDueToNullFloat++;
        continue;
      }

      const volume = Number(ticker.volume);
      const price = Number(ticker.price);
      const change_percent = Number(ticker.change_percent);
      const avg_daily_volume = ticker.avg_daily_volume ? Number(ticker.avg_daily_volume) : null;

      // Calculate relative volume if we have average daily volume
      const rel_vol = avg_daily_volume && avg_daily_volume > 0 ? volume / avg_daily_volume : null;

      // Apply float criteria (volume and price already filtered in query)
      const meetsFloat = float >= 100000 && float <= 100000000;
      // Additional filter: require relative volume > 1.5 (50% above average) if available
      const meetsRelVol = rel_vol === null || rel_vol >= 1.5;

      if (meetsFloat && meetsRelVol) {
        filteredTickers.push({
          ticker: ticker.ticker,
          price,
          float,
          volume,
          change_percent,
          rel_vol,
          source: 'auto_filter',
          filtered_at: new Date().toISOString(),
        });
      } else {
        skippedDueToCriteria++;
      }
    }

    const endTime = Date.now();
    console.log(`Processed ${processedCount} tickers in ${endTime - startTime}ms`);
    console.log(`Skipped ${skippedDueToNullFloat} tickers due to null float`);
    console.log(`Skipped ${skippedDueToCriteria} tickers due to not meeting criteria`);
    console.log(`Filtered ${filteredTickers.length} tickers that meet all criteria`);

    if (filteredTickers.length === 0) {
      console.log('No low-float tickers found matching criteria');
      return { totalFiltered: 0, totalStored: 0 };
    }

    // Upsert in batches with error resilience
    const batchSize = 100;
    let totalUpserted = 0;
    for (let i = 0; i < filteredTickers.length; i += batchSize) {
      const batch = filteredTickers.slice(i, i + batchSize);
      try {
        const { error: upsertError } = await supabase
          .from('low_float_tickers')
          .upsert(batch, { onConflict: 'ticker' });
        if (upsertError) {
          console.error('Error upserting batch:', upsertError);
          console.log('Continuing with remaining batches...');
        } else {
          totalUpserted += batch.length;
          console.log(`Successfully upserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} tickers`);
        }
      } catch (err) {
        console.error('Unexpected error upserting batch:', err);
        console.log('Continuing with remaining batches...');
      }
    }

    // After upserting, fetch day_high for each filtered ticker from market_data
    const tickersToFetch = filteredTickers.map(t => t.ticker);
    let dayHighMap = new Map<string, number | null>();
    for (let i = 0; i < tickersToFetch.length; i += batchSize) {
      const batch = tickersToFetch.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('market_data')
        .select('ticker, day_high')
        .in('ticker', batch);
      if (error) {
        console.error('Error fetching day_high from market_data:', error);
        continue;
      }
      if (data) {
        for (const row of data) {
          dayHighMap.set(row.ticker, row.day_high ?? null);
        }
      }
    }

    // Log filtered tickers with day_high
    for (const t of filteredTickers) {
      const dayHigh = dayHighMap.get(t.ticker);
      console.log(`[LOW FLOAT] ${t.ticker} | Price: ${t.price} | Float: ${t.float} | Volume: ${t.volume} | Change%: ${t.change_percent} | RelVol: ${t.rel_vol} | Day High: ${dayHigh}`);
    }

    // Optionally, return filtered tickers with day_high
    const filteredWithDayHigh = filteredTickers.map(t => ({ ...t, day_high: dayHighMap.get(t.ticker) ?? null }));

    console.log(`Successfully stored ${totalUpserted} low float tickers total`);
    return { totalFiltered: filteredTickers.length, totalStored: totalUpserted, filteredWithDayHigh };
  } catch (error) {
    console.error('Error in filterAndStoreLowFloatTickers:', error);
    throw error;
  }
}

async function runContinuous() {
  console.log('Starting continuous low float ticker filter (runs every 15 seconds)...');
  
  while (true) {
    try {
      console.log(`\n[${new Date().toISOString()}] Running low float filter...`);
      const startTime = Date.now();
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Filter operation timed out after 10 seconds')), 10000);
      });
      
      const filterPromise = filterAndStoreLowFloatTickers();
      
      const { totalFiltered, totalStored } = await Promise.race([filterPromise, timeoutPromise]) as any;
      const endTime = Date.now();
      
      console.log(`[${new Date().toISOString()}] Filter completed in ${endTime - startTime}ms. Filtered: ${totalFiltered}, Stored: ${totalStored}`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in filter cycle:`, error);
    }
    
    // Wait 15 seconds before next run
    console.log(`[${new Date().toISOString()}] Waiting 15 seconds before next run...`);
    await new Promise(resolve => setTimeout(resolve, 15000));
  }
}

if (require.main === module) {
  runContinuous()
    .catch(err => {
      console.error('Continuous script failed:', err);
      process.exit(1);
    });
}

/**
 * If the low_float_tickers table does not exist, create it in Supabase with:
 *
 * CREATE TABLE low_float_tickers (
 *   ticker text PRIMARY KEY,
 *   float numeric,
 *   volume numeric,
 *   rel_vol numeric,
 *   change_percent numeric,
 *   change_from_close_percent numeric,
 *   source text,
 *   filtered_at timestamp
 * );
 *
 * You can run this SQL in the Supabase SQL editor.
 *
 * Note: share_class_shares_outstanding is used as the float estimate.
 */ 