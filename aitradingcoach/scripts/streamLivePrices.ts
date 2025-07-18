import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import * as WebSocket from 'ws';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const POLYGON_API_KEY = process.env.POLYGON_API_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !POLYGON_API_KEY) {
  throw new Error('Please set SUPABASE_URL, SUPABASE_SERVICE_KEY, and POLYGON_API_KEY in your environment.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const WS_URL = 'wss://delayed.polygon.io/stocks';

function isoFromMillis(ms: number) {
  return new Date(ms).toISOString();
}

async function upsertPrice(ticker: string, price: number, last_updated: string) {
  try {
    const { error } = await supabase
      .from('market_data')
      .update({ price, last_updated })
      .eq('ticker', ticker);
    if (error) {
      console.error(`Supabase upsert error for ${ticker}:`, error);
    }
  } catch (err) {
    console.error(`Supabase error for ${ticker}:`, err);
  }
}

async function getTickersFromSupabase(limit = 100): Promise<string[]> {
  const { data, error } = await supabase
    .from('ticker_metadata')
    .select('ticker')
    .order('ticker', { ascending: true })
    .limit(limit);
  if (error) {
    console.error('Error fetching tickers from Supabase:', error);
    return [];
  }
  return data.map((row: { ticker: string }) => row.ticker);
}

export async function startLivePriceStream() {
  let ws: WebSocket.WebSocket | null = null;
  let reconnectTimeout: NodeJS.Timeout | null = null;
  let isReconnecting = false;
  let backoff = 1000; // Start with 1s
  const maxBackoff = 10000; // Max 10s
  let lastSubscribedChannels: string[] = [];
  let shuttingDown = false;

  // Fetch tickers from Supabase
  const TICKERS = await getTickersFromSupabase(100);
  if (TICKERS.length === 0) {
    console.error('No tickers found to subscribe to. Exiting.');
    return;
  }

  function subscribe(ws: WebSocket.WebSocket) {
    // Subscribe to all trades (T.*)
    const subMsg = { action: 'subscribe', params: 'T.*' };
    ws.send(JSON.stringify(subMsg));
    lastSubscribedChannels = ['T.*'];
    console.log('Subscription message sent:', JSON.stringify(subMsg));
  }

  function cleanup() {
    shuttingDown = true;
    if (ws) {
      ws.removeAllListeners();
      ws.close();
      ws = null;
    }
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    console.log('Cleaned up WebSocket connection.');
  }

  async function connect() {
    if (ws) {
      ws.removeAllListeners();
      ws.close();
      ws = null;
    }
    if (shuttingDown) return;
    isReconnecting = false;
    console.log('Connecting to Polygon WebSocket...');
    ws = new WebSocket.WebSocket(WS_URL);

    ws.on('open', () => {
      console.log('WebSocket connected. Authenticating...');
      ws!.send(JSON.stringify({ action: 'auth', params: POLYGON_API_KEY }));
      backoff = 1000; // Reset backoff on successful connect
    });

    ws.on('message', async (data) => {
      try {
        const messages = JSON.parse(data.toString());
        for (const msg of messages) {
          if (msg.ev === 'status') {
            console.log('Status message:', msg);
            if (msg.status === 'authenticated') {
              console.log('Authenticated. Subscribing to T.*');
              subscribe(ws!);
            }
          }
          if (msg.ev === 'T') {
            const ticker = msg.sym;
            const price = msg.p;
            const last_updated = isoFromMillis(msg.t);
            await upsertPrice(ticker, price, last_updated);
            console.log(`✅ [${ticker}] $${price} (updated at ${last_updated})`);
          }
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    });

    ws.on('close', () => {
      if (shuttingDown) return;
      if (!isReconnecting) {
        isReconnecting = true;
        console.error(`WebSocket closed. Reconnecting in ${backoff / 1000}s...`);
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        reconnectTimeout = setTimeout(() => {
          backoff = Math.min(backoff * 2, maxBackoff);
          connect();
        }, backoff);
      }
    });

    ws.on('error', (err) => {
      console.error('WebSocket error:', err);
      ws?.close();
    });

    // Warn if no trade data is received for 30 seconds
    let lastDataTime = Date.now();
    const warnIfNoData = setInterval(() => {
      if (Date.now() - lastDataTime > 30000) {
        console.warn('No trade data received in the last 30 seconds.');
      }
    }, 30000);

    ws.on('message', (data) => {
      try {
        const messages = JSON.parse(data.toString());
        for (const msg of messages) {
          if (msg.ev === 'T') {
            lastDataTime = Date.now();
          }
        }
      } catch {}
    });
    ws.on('close', () => clearInterval(warnIfNoData));
    ws.on('error', () => clearInterval(warnIfNoData));
  }

  // Handle clean shutdown
  process.on('SIGINT', () => {
    console.log('Received SIGINT. Shutting down WebSocket...');
    cleanup();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Shutting down WebSocket...');
    cleanup();
    process.exit(0);
  });
  process.on('beforeExit', () => {
    cleanup();
  });

  connect();
}

if (require.main === module) {
  startLivePriceStream();
} 