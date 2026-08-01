// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

interface ViteEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

const viteEnv = import.meta.env as unknown as ViteEnv;

const supabaseUrl = viteEnv.VITE_SUPABASE_URL;
const supabaseAnonKey = viteEnv.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[FlowSensei] Missing Supabase env vars. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)