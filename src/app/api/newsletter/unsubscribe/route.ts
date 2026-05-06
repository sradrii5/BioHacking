import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Update status to 'unsubscribed'
    const { error } = await supabase
      .from('subscribers')
      .update({ status: 'unsubscribed' })
      .eq('email', email.toLowerCase().trim());


    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Unsubscribe Error:', error.message);
    return NextResponse.json({ error: 'Error al procesar la baja' }, { status: 500 });
  }
}
