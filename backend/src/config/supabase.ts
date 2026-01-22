import { createClient } from '@supabase/supabase-js';

let supabaseClient: any;

export async function setupSupabase() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  }

  supabaseClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export function getSupabase() {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized');
  }
  return supabaseClient;
}
