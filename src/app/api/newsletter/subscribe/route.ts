import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendWelcomeEmail } from '@/lib/email';
import { getNewsletterLimiter, getIp, checkRateLimit } from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
  // Rate limiting: 3 subscriptions per IP per 10 minutes
  const limiter = getNewsletterLimiter();
  const ip = getIp(request);
  const rateLimitResponse = await checkRateLimit(limiter, ip);
  if (rateLimitResponse) return rateLimitResponse;

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
    console.error('Newsletter Subscription Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
