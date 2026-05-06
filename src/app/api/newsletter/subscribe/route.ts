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
    const { data, error } = await supabase
      .from('subscribers')
      .insert([
        { 
          email: email.toLowerCase().trim(), 
          lang: lang || 'es',
          status: 'active' 
        }
      ]);

    if (error) {
      console.error('❌ Supabase Subscription Error:', error);
      // Handle duplicate emails
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Este email ya está suscrito.' }, { status: 400 });
      }
      throw error;
    }

    console.log('✅ Subscriber saved to database:', email);


    // Send Welcome Email (Non-blocking for the main response)
    try {
      console.log(`📩 Triggering welcome email for: ${email}`);
      await sendWelcomeEmail({ email, lang });
    } catch (emailError: any) {
      console.error('❌ Failed to send welcome email:', emailError.message);
      // We don't throw here to avoid failing the whole subscription process
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Newsletter Subscription Error:', error.message);
    return NextResponse.json({ error: `Error Servidor: ${error.message || 'Fallo crítico'}` }, { status: 500 });
  }
}
