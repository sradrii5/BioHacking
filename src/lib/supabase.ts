import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Database operations will fail.');
}

/**
 * Public client for use in Client Components and public API routes.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Service role client for backend operations (e.g., ingestion worker).
 * WARNING: Never use this in Client Components.
 */
export const getSupabaseAdmin = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations.');
  }
  return createClient(supabaseUrl, serviceRoleKey);
};
