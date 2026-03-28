import { createClient } from '@supabase/supabase-js';

let cachedServerClient = null;
let cachedAdminClient = null;

export function getSupabaseServerClient() {
  if (cachedServerClient) {
    return cachedServerClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing Supabase credentials for server client');
  }

  cachedServerClient = createClient(url, anonKey, {
    auth: { persistSession: false },
  });

  return cachedServerClient;
}

export function getSupabaseServerAdminClient() {
  if (cachedAdminClient) {
    return cachedAdminClient;
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase service role credentials');
  }

  cachedAdminClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });

  return cachedAdminClient;
}
