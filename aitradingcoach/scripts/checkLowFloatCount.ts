import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkLowFloatCount() {
  try {
    // Get total count
    const { count, error: countError } = await supabase
      .from('low_float_tickers')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error getting count:', countError);
      return;
    }
    
    console.log(`Total low float tickers: ${count}`);
    
    // Get recent entries
    const { data: recentData, error: recentError } = await supabase
      .from('low_float_tickers')
      .select('ticker, price, float, volume, percent_change, filtered_at')
      .order('filtered_at', { ascending: false })
      .limit(10);
    
    if (recentError) {
      console.error('Error getting recent data:', recentError);
      return;
    }
    
    console.log('\nRecent low float tickers:');
    recentData?.forEach(ticker => {
      console.log(`${ticker.ticker}: $${ticker.price} | Float: ${ticker.float?.toLocaleString()} | Vol: ${ticker.volume?.toLocaleString()} | Change: ${ticker.percent_change}% | Updated: ${ticker.filtered_at}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkLowFloatCount(); 