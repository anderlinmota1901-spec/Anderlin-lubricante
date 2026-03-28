import { createClient } from '@supabase/supabase-js';

let cachedClient = null;

export function getSupabaseClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error('Supabase credentials missing. Define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    throw new Error('Missing Supabase credentials');
  }

  cachedClient = createClient(url, anonKey);
  return cachedClient;
}

