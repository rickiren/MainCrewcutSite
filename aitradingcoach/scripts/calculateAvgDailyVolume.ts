importdotenv/config';
import fetch from 'node-fetch;
import { createClient } from '@supabase/supabase-js;const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const POLYGON_API_KEY = process.env.POLYGON_API_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !POLYGON_API_KEY) {
  throw new Error('Please set SUPABASE_URL, SUPABASE_SERVICE_KEY, and POLYGON_API_KEY in your environment.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Calculate average daily volume for a ticker using Polygons historical bars endpoint
 * @param ticker - The ticker symbol (e.g., "AAPL")
 * @returns Average daily volume over the last 10ding days, or null if unavailable
 */
async function calculateAverageDailyVolume(ticker: string): Promise<number | null> {
  try [object Object] // Calculate date range: 14 days back to account for weekends/holidays
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 14    const fromDate = startDate.toISOString().split('T')0 // YYYY-MM-DD
    const toDate = endDate.toISOString().split('T')0/ YYYY-MM-DD
    
    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${fromDate}/${toDate}?adjusted=true&sort=desc&limit=14iKey=${POLYGON_API_KEY}`;
    
    console.log(`Fetching historical data for ${ticker}...`);
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`Failed to fetch historical data for ${ticker}: ${res.status} ${res.statusText}`);
      return null;
    }
    
    const data = await res.json() as any;
    if (!data.results || data.results.length === 0
      console.log(`No historical data found for ${ticker}`);
      return null;
    }
    
    // Filter out zero-volume days and take the last 10ing days
    const validVolumes = data.results
      .filter((bar: any) => bar.v > 0) // Filter out zero-volume days
      .slice(0) // Take the last 10 trading days
      .map((bar: any) => bar.v); // Extract volume values
    
    if (validVolumes.length === 0
      console.log(`No valid volume data for ${ticker}`);
      return null;
    }
    
    // Calculate average
    const averageVolume = validVolumes.reduce((sum: number, vol: number) => sum + vol,0alidVolumes.length;
    
    console.log(`${ticker}: ${validVolumes.length} days, avg volume: ${averageVolume.toLocaleString()}`);
    return Math.round(averageVolume);
    
  } catch (error) {
    console.error(`Error calculating average daily volume for ${ticker}:`, error);
    return null;
  }
}

export async function updateLowFloatTickersWithAvgVolume() {
  try[object Object]
    console.log('Starting average daily volume calculation for low float tickers...');
    const startTime = Date.now();

    // Fetch all tickers from low_float_tickers table
    const { data: lowFloatTickers, error } = await supabase
      .from(low_float_tickers)
      .select(ticker, volume)    .order(ticker);

    if (error) {
      console.error('Error fetching low float tickers:', error);
      return;
    }

    if (!lowFloatTickers || lowFloatTickers.length === 0
      console.log(No low float tickers found in database);
      return;
    }

    console.log(`Found ${lowFloatTickers.length} low float tickers to process`);

    let processedCount = 0  let updatedCount = 0;
    let errorCount = 0   for (const tickerData of lowFloatTickers)[object Object]    processedCount++;
      console.log(`\n[${processedCount}/${lowFloatTickers.length}] Processing $[object Object]tickerData.ticker}...`);

      try {
        // Calculate average daily volume
        const avgDailyVolume = await calculateAverageDailyVolume(tickerData.ticker);
        
        if (avgDailyVolume !== null) {
          // Update the low_float_tickers table with the calculated average daily volume
          const { error: updateError } = await supabase
            .from(low_float_tickers')
            .update([object Object] avg_daily_volume: avgDailyVolume })
            .eq('ticker', tickerData.ticker);

          if (updateError) {
            console.error(`Error updating ${tickerData.ticker}:`, updateError);
            errorCount++;
          } else {
            console.log(`✅ Updated $[object Object]tickerData.ticker} with avg daily volume: ${avgDailyVolume.toLocaleString()}`);
            updatedCount++;
          }
        } else {
          console.log(`⚠️  Could not calculate avg daily volume for ${tickerData.ticker}`);
          errorCount++;
        }

        // Rate limiting: 12 second delay between requests (5 requests per minute for free tier)
        if (processedCount < lowFloatTickers.length) {
          console.log('Waiting 12nds for rate limit...');
          await new Promise(resolve => setTimeout(resolve, 120;
        }

      } catch (error)[object Object]     console.error(`Error processing ${tickerData.ticker}:`, error);
        errorCount++;
      }
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000 /60;

    console.log(`\n=== SUMMARY ===`);
    console.log(`Total tickers processed: ${processedCount}`);
    console.log(`Successfully updated: ${updatedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Total time: $[object Object]duration} minutes`);

  } catch (error) {
    console.error('Error in updateLowFloatTickersWithAvgVolume:', error);
    throw error;
  }
}

async function run() {
  try [object Object]   await updateLowFloatTickersWithAvgVolume();
  } catch (err) {
    console.error('Error:, err);
  }
}

if (require.main === module) {
  run();
} 