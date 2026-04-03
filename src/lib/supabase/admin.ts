import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client using the **service-role key**, which bypasses
 * Row-Level Security. Use this exclusively on the server for privileged
 * operations such as storage uploads on behalf of users.
 *
 * ⚠️  Never import this module from client-side code.
 */
export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
