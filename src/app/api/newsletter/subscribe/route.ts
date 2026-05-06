import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email, lang } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Insert into subscribers table
    const { error } = await supabase
      .from('subscribers')
      .insert([
        { 
          email: email.toLowerCase().trim(), 
          lang: lang || 'es',
          status: 'active' 
        }
      ]);

    if (error) {
      // Handle duplicate emails
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Este email ya está suscrito.' }, { status: 400 });
      }
      throw error;
    }

    // Send Welcome Email immediately
    await sendWelcomeEmail({ email, lang });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Newsletter Subscription Error:', error.message);
    return NextResponse.json({ error: 'Error al procesar la suscripción' }, { status: 500 });
  }
}
