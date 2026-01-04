
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * We prioritize environment variables for flexibility. 
 * If SUPABASE_URL is missing, we use the specific URI provided for this project.
 */
const supabaseUrl = process.env.SUPABASE_URL || 'https://suyeetfefzjjfygqfppr.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1eWVldGZlZnpqamZ5Z3FmcHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1Mjk5NjAsImV4cCI6MjA4MzEwNTk2MH0.K3bsfF-z2CwZZLPhEXhvWyKgZeHBJ2ZpwVJ5v1GfyCE';

/**
 * Validation function to ensure we only attempt to initialize the client 
 * with valid, non-placeholder strings. Prevents the "supabaseUrl is required" crash.
 */
const isValidConfig = (url: string | undefined, key: string | undefined): boolean => {
  const check = (val: string | undefined) => 
    !!val && typeof val === 'string' && val.trim().length > 0 && val !== 'undefined' && val !== 'null';
  
  return check(url) && check(key);
};

// Rigorous initialization check to prevent the application from crashing if credentials are missing.
export const supabase: SupabaseClient | null = isValidConfig(supabaseUrl, supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.warn("Supabase configuration is incomplete (Missing Anon Key). Bloom is running in Local-Only mode using browser storage.");
}

/**
 * DATABASE SCHEMA REQUIREMENTS (for your Supabase project):
 * 
 * Table: habits
 * - id: uuid (primary key, default: uuid_generate_v4())
 * - name: text (not null)
 * - goal: text
 * - color: text
 * - completed_dates: text[] (not null, default: '{}')
 * - created_at: timestamptz (default: now())
 * 
 * Note: Ensure you have enabled the 'habits' table in your Supabase dashboard 
 * with appropriate RLS policies or public access for this demo.
 */
