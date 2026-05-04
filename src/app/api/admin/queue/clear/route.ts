import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function DELETE() {
  const supabase = getSupabaseAdmin();

  try {
    const { error } = await supabase
      .from('ingestion_queue')
      .delete()
      .in('status', ['done', 'failed']);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error clearing queue:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
