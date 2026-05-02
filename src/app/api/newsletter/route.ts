import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('subscribers')
      .insert([{ email }]);

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Ya estás suscrito' }, { status: 200 });
      }
      throw error;
    }

    return NextResponse.json({ message: 'Suscrito con éxito' }, { status: 200 });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
