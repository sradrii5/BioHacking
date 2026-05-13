import { createClient } from '@supabase/supabase-js';

// During build, environment variables might be missing. 
// We use placeholder values to prevent 'supabaseUrl is required' error.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  if (process.env.NODE_ENV === 'production') {
    console.warn('Supabase credentials missing in production environment!');
  }
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
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NODE_ENV === 'production') {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is missing!');
  }

  return createClient(supabaseUrl, serviceRoleKey);
};
