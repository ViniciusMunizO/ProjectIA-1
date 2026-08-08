import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

// Server-only client, authenticated with the service_role key: it bypasses
// row-level security, so it must never be sent to or reachable from the
// frontend. All authorization happens in this server's own route/middleware
// layer instead of RLS policies.
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export class SupabaseQueryError extends Error {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

export const unwrap = <T>(result: { data: T | null; error: { message: string; code?: string } | null }): T => {
  if (result.error) {
    throw new SupabaseQueryError(result.error.message, result.error.code);
  }
  if (result.data === null) {
    throw new SupabaseQueryError('Expected data, got null');
  }
  return result.data;
};
