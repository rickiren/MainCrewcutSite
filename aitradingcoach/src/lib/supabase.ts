import { createClient } from '@supabase/supabase-js';
import { useEffect } from 'react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface ChatMessage {
  id: string;
  user_id: string;
  message_type: 'user' | 'ai' | 'system' | 'ticker_detection' | 'screenshot_analysis' | 'error';
  content: string;
  ticker?: string;
  screenshot_id?: string;
  context_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TickerSession {
  id: string;
  user_id: string;
  ticker: string;
  session_start: string;
  session_end?: string;
  screenshot_count: number;
  duration_minutes: number;
  is_active: boolean;
  session_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Screenshot {
  id: string;
  user_id: string;
  ticker_session_id?: string;
  filename: string;
  file_path?: string;
  storage_path?: string;
  ticker?: string;
  analysis_result?: string;
  ai_grade?: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  detected_patterns?: string[];
  price_data?: Record<string, any>;
  volume_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  ticker_session_id?: string;
  ticker: string;
  trade_type: 'long' | 'short';
  entry_price?: number;
  exit_price?: number;
  quantity?: number;
  entry_time?: string;
  exit_time?: string;
  pnl?: number;
  strategy?: string;
  notes?: string;
  screenshot_ids?: string[];
  trade_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AIAnalysis {
  id: string;
  user_id: string;
  screenshot_id: string;
  ticker: string;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  risk_level: 'low' | 'medium' | 'high' | 'extreme';
  reward_potential: 'low' | 'medium' | 'high' | 'excellent';
  entry_suggestion?: number;
  stop_loss_suggestion?: number;
  target_suggestion?: number;
  confidence_score?: number;
  key_observations?: string[];
  warnings?: string[];
  analysis_data?: Record<string, any>;
  created_at: string;
}

export interface BatchAnalysis {
  id: string;
  user_id: string;
  session_id: string;
  ticker: string;
  summary: string;
  screenshot_urls: string[];
  screenshot_count: number;
  analysis_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ScreenshotCoaching {
  id: string;
  screenshot_id: string;
  coaching_feedback: string;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  screenshots_folder_path?: string;
  polling_interval_seconds: number;
  max_conversation_history: number;
  preferred_timeframes: string[];
  risk_tolerance: 'conservative' | 'medium' | 'aggressive';
  notification_settings: Record<string, boolean>;
  ai_personality: 'conservative' | 'balanced' | 'aggressive';
  settings_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Database service functions
export class DatabaseService {
  // Chat Messages
  static async saveChatMessage(message: Omit<ChatMessage, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(message)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getChatHistory(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data?.reverse() || [];
  }

  static async getChatHistoryByTicker(userId: string, ticker: string, limit = 20) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .eq('ticker', ticker)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data?.reverse() || [];
  }

  // Ticker Sessions
  static async createTickerSession(session: Omit<TickerSession, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('ticker_sessions')
      .insert(session)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateTickerSession(id: string, updates: Partial<TickerSession>) {
    const { data, error } = await supabase
      .from('ticker_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getActiveTickerSession(userId: string) {
    const { data, error } = await supabase
      .from('ticker_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('session_start', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async endTickerSession(id: string) {
    const { data, error } = await supabase
      .from('ticker_sessions')
      .update({
        session_end: new Date().toISOString(),
        is_active: false
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Screenshots
  static async saveScreenshot(screenshot: Omit<Screenshot, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('screenshots')
      .insert(screenshot)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getScreenshotsBySession(sessionId: string) {
    const { data, error } = await supabase
      .from('screenshots')
      .select('*')
      .eq('ticker_session_id', sessionId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  static async getRecentScreenshots(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from('screenshots')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }

  // Screenshot Coaching
  static async getLatestScreenshotForCoaching(userId: string) {
    const { data, error } = await supabase
      .from('screenshots')
      .select('*')
      .eq('user_id', userId)
      .is('analysis_result', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async updateScreenshotCoachingStatus(screenshotId: string, status: string, feedback?: string) {
    const updates: any = {};
    if (feedback) {
      updates.analysis_result = feedback;
    }
    
    const { data, error } = await supabase
      .from('screenshots')
      .update(updates)
      .eq('id', screenshotId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getScreenshotWithCoaching(screenshotId: string) {
    const { data, error } = await supabase
      .from('screenshots')
      .select(`
        *,
        ai_analysis (
          id,
          grade,
          risk_level,
          reward_potential,
          confidence_score,
          key_observations,
          analysis_data
        )
      `)
      .eq('id', screenshotId)
      .single();
    
    if (error) throw error;
    return data;
  }

  // AI Analysis
  static async saveAIAnalysis(analysis: Omit<AIAnalysis, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('ai_analysis')
      .insert(analysis)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getAnalysisByTicker(userId: string, ticker: string, limit = 20) {
    const { data, error } = await supabase
      .from('ai_analysis')
      .select('*')
      .eq('user_id', userId)
      .eq('ticker', ticker)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }

  // Batch Analysis
  static async saveBatchAnalysis(analysis: Omit<BatchAnalysis, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('batch_analysis')
      .insert(analysis)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getBatchAnalysisBySession(userId: string, sessionId: string, limit = 10) {
    const { data, error } = await supabase
      .from('batch_analysis')
      .select('*')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }

  static async getBatchAnalysisByTicker(userId: string, ticker: string, limit = 20) {
    const { data, error } = await supabase
      .from('batch_analysis')
      .select('*')
      .eq('user_id', userId)
      .eq('ticker', ticker)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }

  // Trades
  static async saveTrade(trade: Omit<Trade, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('trades')
      .insert(trade)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getTradesByTicker(userId: string, ticker: string) {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .eq('ticker', ticker)
      .order('entry_time', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  // User Settings
  static async getUserSettings(userId: string) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async saveUserSettings(settings: Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert(settings)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Storage functions
  static async uploadScreenshot(userId: string, file: File, filename: string) {
    const filePath = `${userId}/${filename}`;
    
    const { data, error } = await supabase.storage
      .from('screenshots')
      .upload(filePath, file);
    
    if (error) throw error;
    return data;
  }

  static async getScreenshotUrl(filePath: string) {
    const { data } = supabase.storage
      .from('screenshots')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }

  // Cleanup functions
  static async cleanupOldData(userId: string, daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    // Clean up old chat messages
    const { error: chatError } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', userId)
      .lt('created_at', cutoffDate.toISOString());

    if (chatError) console.error('Error cleaning up chat messages:', chatError);

    // Clean up old screenshots
    const { error: screenshotError } = await supabase
      .from('screenshots')
      .delete()
      .eq('user_id', userId)
      .lt('created_at', cutoffDate.toISOString());

    if (screenshotError) console.error('Error cleaning up screenshots:', screenshotError);

    // Clean up old ticker sessions
    const { error: sessionError } = await supabase
      .from('ticker_sessions')
      .delete()
      .eq('user_id', userId)
      .lt('created_at', cutoffDate.toISOString());

    if (sessionError) console.error('Error cleaning up ticker sessions:', sessionError);
  }

  // Low Float Tickers
  static async getLowFloatTickers(limit = 100) {
    const { data, error } = await supabase
      .from('low_float_tickers')
      .select('ticker, price, change_percent, rel_vol, volume, float, filtered_at')
      .order('change_percent', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }
}

/**
 * React hook to subscribe to new chat_messages in Supabase and append them to state.
 * Only listens for messages related to the current ticker or session ID.
 * @param setMessages - React setState function for messages array
 * @param tickerOrSessionId - string (ticker or session ID to filter messages)
 */
export function useSupabaseChatSubscription(
  setMessages: (fn: (prev: any[]) => any[]) => void,
  tickerOrSessionId: string | null
) {
  useEffect(() => {
    if (!tickerOrSessionId) return;

    // Subscribe to INSERTs on chat_messages filtered by ticker or session ID
    const channel = supabase
      .channel('chat_messages-insert')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `ticker=eq.${tickerOrSessionId}` // default: filter by ticker
        },
        (payload) => {
          // If the message matches the ticker or session ID, append it
          const msg = payload.new;
          if (
            msg.ticker === tickerOrSessionId ||
            msg.ticker_session_id === tickerOrSessionId
          ) {
            setMessages((prev) => [...prev, msg]);
          }
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [setMessages, tickerOrSessionId]);
}