import { createClient } from '@/lib/supabase/server';

interface AuthSuccess {
  userId: string;
  error: null;
  status: null;
}

interface AuthFailure {
  userId: null;
  error: string;
  status: 401 | 403;
}

type AuthResult = AuthSuccess | AuthFailure;

/**
 * Verifies the current user is authenticated via Supabase and has an
 * approved profile. Returns the user ID on success or an error with
 * the appropriate HTTP status code on failure.
 */
export async function verifyAuth(): Promise<AuthResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { userId: null, error: 'Not authenticated', status: 401 };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('status')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { userId: null, error: 'Profile not found', status: 403 };
  }

  if (profile.status !== 'approved') {
    return {
      userId: null,
      error: 'Account not approved. Current status: ' + String(profile.status),
      status: 403,
    };
  }

  return { userId: user.id, error: null, status: null };
}

/**
 * Logs a successful file upload to the usage_log table for audit purposes.
 */
export async function logUpload(params: {
  userId: string;
  objectPath: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
}): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from('usage_log').insert({
    user_id: params.userId,
    endpoint: '/api/upload',
    model: null,
    input_tokens: null,
    output_tokens: null,
  });

  if (error) {
    // Upload logging is non-critical — silently ignore failures
  }
}

/**
 * Logs a Claude API call to the usage_log table.
 */
export async function logUsage(params: {
  userId: string;
  endpoint: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
}): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from('usage_log').insert({
    user_id: params.userId,
    endpoint: params.endpoint,
    model: params.model,
    input_tokens: params.inputTokens,
    output_tokens: params.outputTokens,
  });

  if (error) {
    // Usage logging is non-critical — silently ignore failures
  }
}
