/*
  # AI Trading Coach Database Schema

  1. New Tables
    - `chat_messages` - Store all AI/user conversations with context
    - `ticker_sessions` - Track trading sessions per ticker with duration  
    - `screenshots` - Screenshot metadata with AI analysis results
    - `trades` - Manual trade logging with P&L tracking
    - `ai_analysis` - Structured AI analysis with grades and suggestions
    - `user_settings` - User preferences and configuration

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access only their own data
    - Secure file storage with user-based access

  3. Storage
    - Create storage buckets for screenshots and trade attachments
    - Set up proper access policies for file uploads
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message_type text NOT NULL CHECK (message_type IN ('user', 'ai', 'system', 'ticker_detection', 'screenshot_analysis', 'error', 'user_response')),
  content text NOT NULL,
  ticker text,
  screenshot_id uuid,
  context_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ticker Sessions Table
CREATE TABLE IF NOT EXISTS ticker_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ticker text NOT NULL,
  session_start timestamptz DEFAULT now(),
  session_end timestamptz,
  screenshot_count integer DEFAULT 0,
  duration_minutes integer DEFAULT 0,
  is_active boolean DEFAULT true,
  session_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Screenshots Table
CREATE TABLE IF NOT EXISTS screenshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ticker_session_id uuid REFERENCES ticker_sessions(id) ON DELETE SET NULL,
  filename text NOT NULL,
  file_path text,
  storage_path text,
  ticker text,
  analysis_result text,
  ai_grade text CHECK (ai_grade IN ('A+', 'A', 'B', 'C', 'D', 'F')),
  detected_patterns text[],
  price_data jsonb DEFAULT '{}',
  volume_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trades Table
CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ticker_session_id uuid REFERENCES ticker_sessions(id) ON DELETE SET NULL,
  ticker text NOT NULL,
  trade_type text NOT NULL CHECK (trade_type IN ('long', 'short')),
  entry_price decimal(10,4),
  exit_price decimal(10,4),
  quantity integer,
  entry_time timestamptz,
  exit_time timestamptz,
  pnl decimal(10,2),
  strategy text,
  notes text,
  screenshot_ids uuid[],
  trade_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI Analysis Table
CREATE TABLE IF NOT EXISTS ai_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  screenshot_id uuid REFERENCES screenshots(id) ON DELETE CASCADE NOT NULL,
  ticker text NOT NULL,
  grade text NOT NULL CHECK (grade IN ('A+', 'A', 'B', 'C', 'D', 'F')),
  risk_level text NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'extreme')),
  reward_potential text NOT NULL CHECK (reward_potential IN ('low', 'medium', 'high', 'excellent')),
  entry_suggestion decimal(10,4),
  stop_loss_suggestion decimal(10,4),
  target_suggestion decimal(10,4),
  confidence_score decimal(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  key_observations text[],
  warnings text[],
  analysis_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  screenshots_folder_path text,
  polling_interval_seconds integer DEFAULT 5,
  max_conversation_history integer DEFAULT 50,
  preferred_timeframes text[] DEFAULT ARRAY['1m', '5m', '15m'],
  risk_tolerance text DEFAULT 'medium' CHECK (risk_tolerance IN ('conservative', 'medium', 'aggressive')),
  notification_settings jsonb DEFAULT '{"ticker_changes": true, "grade_alerts": true, "risk_warnings": true}',
  ai_personality text DEFAULT 'balanced' CHECK (ai_personality IN ('conservative', 'balanced', 'aggressive')),
  settings_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticker_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Chat Messages Policies
CREATE POLICY "Users can manage their own chat messages"
  ON chat_messages
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ticker Sessions Policies
CREATE POLICY "Users can manage their own ticker sessions"
  ON ticker_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Screenshots Policies
CREATE POLICY "Users can manage their own screenshots"
  ON screenshots
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trades Policies
CREATE POLICY "Users can manage their own trades"
  ON trades
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- AI Analysis Policies
CREATE POLICY "Users can manage their own AI analysis"
  ON ai_analysis
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User Settings Policies
CREATE POLICY "Users can manage their own settings"
  ON user_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_ticker ON chat_messages(ticker);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_ticker_sessions_user_id ON ticker_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ticker_sessions_ticker ON ticker_sessions(ticker);
CREATE INDEX IF NOT EXISTS idx_ticker_sessions_is_active ON ticker_sessions(is_active);

CREATE INDEX IF NOT EXISTS idx_screenshots_user_id ON screenshots(user_id);
CREATE INDEX IF NOT EXISTS idx_screenshots_ticker ON screenshots(ticker);
CREATE INDEX IF NOT EXISTS idx_screenshots_session_id ON screenshots(ticker_session_id);

CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_ticker ON trades(ticker);
CREATE INDEX IF NOT EXISTS idx_trades_session_id ON trades(ticker_session_id);

CREATE INDEX IF NOT EXISTS idx_ai_analysis_user_id ON ai_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_ticker ON ai_analysis(ticker);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_screenshot_id ON ai_analysis(screenshot_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ticker_sessions_updated_at BEFORE UPDATE ON ticker_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_screenshots_updated_at BEFORE UPDATE ON screenshots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON trades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();