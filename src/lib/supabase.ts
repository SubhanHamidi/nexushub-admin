import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lkzxbyblvuyeebeifypv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrenhieWJsdnV5ZWViZWlmeXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MjYxMjcsImV4cCI6MjEwNTUwMjEyN30.d_ZTQ62obdvXkAAv6Kj5-hG46a0ddR3UY6o1gFmAeBE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);