import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const POLYGON_API_KEY = process.env.POLYGON_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface MarketData {
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

async function populateTablesDuringExtendedHours() {
  console.log('Starting table population for extended hours...');
  
  // 1. Use bulk snapshot to quickly populate market_data table
  console.log('Step 1: Fetching bulk snapshot data...');
  
  try {
    const url = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers?apiKey=${POLYGON_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Bulk snapshot failed: ${response.status} ${response.statusText}`);
      return;
    }
    
    const data: any = await response.json();
    const records: MarketData[] = [];
    
    if (data.results) {
      console.log(`Processing ${data.results.length} tickers from bulk snapshot...`);
      
      for (const ticker of data.results) {
        if (ticker.ticker && ticker.lastTrade) {
          const lastTrade = ticker.lastTrade;
          const prevDay = ticker.prevDay;
          
          records.push({
            ticker: ticker.ticker,
            price: lastTrade.p,
            change_percent: prevDay ? ((lastTrade.p - prevDay.c) / prevDay.c) * 100 : 0,
            volume: lastTrade.s,
            high: ticker.day?.h || lastTrade.p,
            low: ticker.day?.l || lastTrade.p,
            open: ticker.day?.o || lastTrade.p,
            close: lastTrade.p,
            day_high: ticker.day?.h || null,
            last_updated: new Date(lastTrade.t).toISOString(),
            avg_daily_volume: null,
          });
        }
      }
    }
    
    console.log(`Processed ${records.length} records from bulk snapshot`);
    
    // 2. Upsert to market_data table
    if (records.length > 0) {
      console.log(`Upserting ${records.length} records to market_data...`);
      const { error: upsertError } = await supabase
        .from('market_data')
        .upsert(records, { onConflict: 'ticker' });
      
      if (upsertError) {
        console.error('Error upserting market_data:', upsertError);
      } else {
        console.log('Successfully populated market_data table');
      }
    }
    
  } catch (error) {
    console.error('Error fetching bulk snapshot:', error);
    return;
  }
  
  // 3. Now run the low float filter
  console.log('Step 2: Running low float filter...');
  const { filterAndStoreLowFloatTickers } = require('./filterLowFloatTickers');
  await filterAndStoreLowFloatTickers();
  
  console.log('Table population complete!');
}

if (require.main === module) {
  populateTablesDuringExtendedHours();
} 