const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client for Electron main process
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for server-side operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = { supabase };