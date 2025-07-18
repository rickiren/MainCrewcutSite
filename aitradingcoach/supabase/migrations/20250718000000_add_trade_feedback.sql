-- Migration to add trade feedback functionality
-- This adds columns to track user feedback on trade results

-- Add trade_result column to store user feedback
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'trades'
    AND column_name = 'trade_result'
  ) THEN
    ALTER TABLE public.trades 
    ADD COLUMN trade_result text CHECK (trade_result IN ('win', 'loss', 'breakeven'));
  END IF;
END $$;

-- Add feedback_timestamp column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'trades'
    AND column_name = 'feedback_timestamp'
  ) THEN
    ALTER TABLE public.trades 
    ADD COLUMN feedback_timestamp timestamptz;
  END IF;
END $$;

-- Add index for querying trades by result
CREATE INDEX IF NOT EXISTS idx_trades_trade_result 
ON public.trades(trade_result);

-- Add index for querying trades by feedback timestamp
CREATE INDEX IF NOT EXISTS idx_trades_feedback_timestamp 
ON public.trades(feedback_timestamp);

-- Add comment to document the new columns
COMMENT ON COLUMN public.trades.trade_result IS 'User feedback on trade outcome: win, loss, or breakeven';
COMMENT ON COLUMN public.trades.feedback_timestamp IS 'When the user provided feedback on the trade'; 