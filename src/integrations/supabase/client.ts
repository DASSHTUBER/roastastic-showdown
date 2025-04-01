// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://unpsxwxopprzdwyfphev.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVucHN4d3hvcHByemR3eWZwaGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNjk0ODksImV4cCI6MjA1ODc0NTQ4OX0.CTlQWaCPI6-JKB5KSQmx5yJrhdo1L1vTYwAR9kHcxrs";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});