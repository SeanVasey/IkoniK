import { createBrowserClient } from '@supabase/ssr'

// Creates a Supabase client for use in browser/client components.
// Uses the public anon key — safe to expose to the client.
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
