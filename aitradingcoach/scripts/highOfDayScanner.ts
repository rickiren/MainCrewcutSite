import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface LowFloatTicker {
  ticker: string;
  float: number;
  volume: number;
}

interface MarketData {
  ticker: string;
  price: number;
  day_high: number | null;
  volume: number;
}

interface HodAlert {
  symbol: string;
  time: string;
  volume: number;
  float: number;
  alert_type: string;
}

// Track the highest alerted price for each ticker in memory
const lastAlertedPrice: Record<string, number> = {};

async function scanForHodAlerts() {
  console.log('🚀 Running HOD scan using API/database fields...');
  // 1. Fetch all low float tickers
  let allTickers: LowFloatTicker[] = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('low_float_tickers')
      .select('ticker, float, volume')
      .range(from, from + pageSize - 1);
    if (error) {
      console.error('Error fetching low float tickers:', error);
      break;
    }
    if (!data || data.length === 0) break;
    allTickers.push(...data);
    from += pageSize;
    if (data.length < pageSize) break;
  }
  if (allTickers.length === 0) {
    console.warn('⚠️ No low float tickers found.');
    return;
  }
  console.log(`✅ Loaded ${allTickers.length} low float tickers`);

  // 2. Fetch market data for these tickers
  const tickerSymbols = allTickers.map(t => t.ticker);
  let allMarketData: MarketData[] = [];
  from = 0;
  while (from < tickerSymbols.length) {
    const batch = tickerSymbols.slice(from, from + pageSize);
    const { data, error } = await supabase
      .from('market_data')
      .select('ticker, price, day_high, volume')
      .in('ticker', batch);
    if (error) {
      console.error('Error fetching market_data:', error);
      break;
    }
    if (data) {
      allMarketData.push(...data);
    }
    from += pageSize;
  }
  // Create a map for fast lookup
  const marketDataMap = new Map<string, MarketData>();
  for (const md of allMarketData) {
    marketDataMap.set(md.ticker, md);
  }

  // 3. For each low float ticker, check if price > last alerted price
  let alerts: HodAlert[] = [];
  const now = new Date().toISOString();
  for (const t of allTickers) {
    const md = marketDataMap.get(t.ticker);
    if (!md) continue;
    const last = lastAlertedPrice[t.ticker] ?? (md.day_high ?? 0);
    if (md.price > last) {
      lastAlertedPrice[t.ticker] = md.price;
      const alert: HodAlert = {
        symbol: t.ticker,
        time: now,
        volume: md.volume,
        float: t.float,
        alert_type: 'HOD',
      };
      alerts.push(alert);
      console.log(`🚨 HOD Alert: ${t.ticker} - Price: $${md.price} > Last High: $${last}`);
    }
  }
  // 4. Store alerts in hod_alerts
  if (alerts.length > 0) {
    const { error } = await supabase
      .from('hod_alerts')
      .insert(alerts);
    if (error) {
      console.error('Error storing HOD alerts:', error);
    } else {
      console.log(`✅ Stored ${alerts.length} HOD alerts.`);
    }
  } else {
    console.log('No new HOD alerts to store.');
  }
}

// Run the scan every 5 seconds indefinitely
if (require.main === module) {
  (async function runLoop() {
    while (true) {
      try {
        // Modified scanForHodAlerts to use lastAlertedPrice
        await (async function scanForHodAlerts() {
          console.log('🚀 Running HOD scan using API/database fields...');
          // 1. Fetch all low float tickers
          let allTickers: LowFloatTicker[] = [];
          let from = 0;
          const pageSize = 1000;
          while (true) {
            const { data, error } = await supabase
              .from('low_float_tickers')
              .select('ticker, float, volume')
              .range(from, from + pageSize - 1);
            if (error) {
              console.error('Error fetching low float tickers:', error);
              break;
            }
            if (!data || data.length === 0) break;
            allTickers.push(...data);
            from += pageSize;
            if (data.length < pageSize) break;
          }
          if (allTickers.length === 0) {
            console.warn('⚠️ No low float tickers found.');
            return;
          }
          console.log(`✅ Loaded ${allTickers.length} low float tickers`);

          // 2. Fetch market data for these tickers
          const tickerSymbols = allTickers.map(t => t.ticker);
          let allMarketData: MarketData[] = [];
          from = 0;
          while (from < tickerSymbols.length) {
            const batch = tickerSymbols.slice(from, from + pageSize);
            const { data, error } = await supabase
              .from('market_data')
              .select('ticker, price, day_high, volume')
              .in('ticker', batch);
            if (error) {
              console.error('Error fetching market_data:', error);
              break;
            }
            if (data) {
              allMarketData.push(...data);
            }
            from += pageSize;
          }
          // Create a map for fast lookup
          const marketDataMap = new Map<string, MarketData>();
          for (const md of allMarketData) {
            marketDataMap.set(md.ticker, md);
          }

          // 3. For each low float ticker, check if price > last alerted price
          let alerts: HodAlert[] = [];
          const now = new Date().toISOString();
          for (const t of allTickers) {
            const md = marketDataMap.get(t.ticker);
            if (!md) continue;
            const last = lastAlertedPrice[t.ticker] ?? (md.day_high ?? 0);
            if (md.price > last) {
              lastAlertedPrice[t.ticker] = md.price;
              const alert: HodAlert = {
                symbol: t.ticker,
                time: now,
                volume: md.volume,
                float: t.float,
                alert_type: 'HOD',
              };
              alerts.push(alert);
              console.log(`🚨 HOD Alert: ${t.ticker} - Price: $${md.price} > Last High: $${last}`);
            }
          }
          // 4. Store alerts in hod_alerts
          if (alerts.length > 0) {
            const { error } = await supabase
              .from('hod_alerts')
              .insert(alerts);
            if (error) {
              console.error('Error storing HOD alerts:', error);
            } else {
              console.log(`✅ Stored ${alerts.length} HOD alerts.`);
            }
          } else {
            console.log('No new HOD alerts to store.');
          }
        })();
      } catch (err) {
        console.error('HOD scan error:', err);
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  })();
} 