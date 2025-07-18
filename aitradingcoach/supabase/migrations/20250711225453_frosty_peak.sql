/*
  # Add coaching_status column to screenshots table

  1. New Columns
    - `coaching_status` (text, default 'pending')
      - Tracks the status of AI coaching for each screenshot
      - Valid values: 'pending', 'processing', 'completed', 'failed'

  2. Constraints
    - Check constraint to ensure only valid status values
    - Default value of 'pending' for new screenshots

  3. Indexes
    - Index on coaching_status for efficient querying

  4. Data Updates
    - Set existing screenshots to 'pending' status
*/

-- Add the coaching_status column with default value
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'screenshots'
    AND column_name = 'coaching_status'
  ) THEN
    ALTER TABLE public.screenshots 
    ADD COLUMN coaching_status text DEFAULT 'pending';
    
    -- Add check constraint for valid status values
    ALTER TABLE public.screenshots 
    ADD CONSTRAINT screenshots_coaching_status_check 
    CHECK (coaching_status IN ('pending', 'processing', 'completed', 'failed'));
    
    -- Update existing records to have 'pending' status
    UPDATE public.screenshots 
    SET coaching_status = 'pending' 
    WHERE coaching_status IS NULL;
    
    -- Add index for efficient querying by coaching status
    CREATE INDEX IF NOT EXISTS idx_screenshots_coaching_status 
    ON public.screenshots(coaching_status);
    
    -- Add composite index for user + status queries
    CREATE INDEX IF NOT EXISTS idx_screenshots_user_coaching_status 
    ON public.screenshots(user_id, coaching_status);
    
  END IF;
END $$;