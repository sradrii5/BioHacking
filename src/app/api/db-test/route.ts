import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

/**
 * GET /api/db-test
 * Health check endpoint — PROTECTED. Admin only.
 * Do not expose in production without auth.
 */
export async function GET() {
  // Only accessible to logged-in admins
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('admin_session')?.value === 'true';

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { count, error } = await supabase
      .from('studies')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Connection to Supabase successful',
      studies_count: count,
    });
  } catch (error: unknown) {
    console.error('[db-test] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Database connection failed' },
      { status: 500 }
    );
  }
}
