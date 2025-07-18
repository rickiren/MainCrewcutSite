/*
  # Fix RLS policy for chat_messages table

  1. Security Updates
    - Drop existing policy if it exists
    - Create new policy "Users can manage their own chat messages"
    - Allow authenticated users to read and write their own messages only
    - Match on user_id column using auth.uid()

  2. Policy Details
    - Applies to: ALL operations (SELECT, INSERT, UPDATE, DELETE)
    - Role: authenticated users only
    - Condition: user_id must match auth.uid()
*/

-- Drop the existing policy if it exists
DROP POLICY IF EXISTS "Users can manage their own chat messages" ON public.chat_messages;

-- Create the new policy for authenticated users to manage their own chat messages
CREATE POLICY "Users can manage their own chat messages"
  ON public.chat_messages
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure RLS is enabled on the table
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;