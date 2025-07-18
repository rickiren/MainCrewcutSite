-- Migration to create dedicated batch_analysis table
-- This separates batch screenshot analysis from individual screenshot analysis

-- Create the batch_analysis table
CREATE TABLE IF NOT EXISTS batch_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id uuid REFERENCES ticker_sessions(id) ON DELETE CASCADE NOT NULL,
  ticker text NOT NULL,
  summary text NOT NULL,
  screenshot_urls text[] NOT NULL,
  screenshot_count integer NOT NULL CHECK (screenshot_count >= 3 AND screenshot_count <= 5),
  analysis_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE batch_analysis ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for batch_analysis
CREATE POLICY "Users can manage their own batch analysis"
  ON batch_analysis
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_batch_analysis_user_id ON batch_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_batch_analysis_session_id ON batch_analysis(session_id);
CREATE INDEX IF NOT EXISTS idx_batch_analysis_ticker ON batch_analysis(ticker);
CREATE INDEX IF NOT EXISTS idx_batch_analysis_created_at ON batch_analysis(created_at);

-- Add updated_at trigger for batch_analysis
CREATE TRIGGER update_batch_analysis_updated_at 
  BEFORE UPDATE ON batch_analysis 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 