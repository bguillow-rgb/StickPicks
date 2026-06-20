import { createClient } from '@supabase/supabase-js';

// Web override of the Supabase client. Differences from the native client:
//  - Uses the browser's default localStorage (no AsyncStorage shim needed).
//  - detectSessionInUrl: true so OAuth redirect callbacks complete the session.
//  - flowType: 'pkce' for the browser OAuth redirect flow.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase credentials not found. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});
