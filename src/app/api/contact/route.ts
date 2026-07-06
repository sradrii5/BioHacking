import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const CONTACT_TO = 'contact@biohackerage.com';
const FROM_EMAIL = 'Biohacker Age <contact@biohackerage.com>';

// Prevent HTML injection in email bodies
function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    // Sanitize inputs before interpolating into email HTML
    const safeName = escHtml(name);
    const safeEmail = escHtml(email);
    const safeSubject = escHtml(subject);
    const safeMessage = escHtml(message);

    // 1. Notify admin inbox
    const { error: adminError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: CONTACT_TO,
      replyTo: email, // raw email is safe in replyTo field (RFC 5322)
      subject: `[Contact Form] ${safeSubject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #09090b; color: #e4e4e7; border-radius: 16px;">
          <h2 style="color: #3b82f6; margin-bottom: 24px; font-size: 20px;">Nuevo mensaje de contacto</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #71717a; font-size: 13px; width: 80px;">De</td><td style="padding: 8px 0; color: #e4e4e7;">${safeName} &lt;${safeEmail}&gt;</td></tr>
            <tr><td style="padding: 8px 0; color: #71717a; font-size: 13px;">Asunto</td><td style="padding: 8px 0; color: #e4e4e7;">${safeSubject}</td></tr>
          </table>
          <hr style="border: none; border-top: 1px solid #27272a; margin: 24px 0;" />
          <p style="color: #a1a1aa; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${safeMessage}</p>
          <hr style="border: none; border-top: 1px solid #27272a; margin: 24px 0;" />
          <p style="color: #52525b; font-size: 12px;">Responde directamente a este email para contactar con ${safeName}.</p>
        </div>
      `,
    });

    if (adminError) {
      console.error('❌ Contact form admin email error:', adminError);
      return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
    }

    // 2. Auto-reply to the sender
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Hemos recibido tu mensaje · Biohacker Age',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #09090b; color: #e4e4e7; border-radius: 16px;">
          <p style="color: #71717a; font-size: 12px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 24px;">Biohacker Age</p>
          <h2 style="color: #ffffff; font-size: 24px; font-weight: 900; margin-bottom: 16px;">Gracias, ${safeName}.</h2>
          <p style="color: #a1a1aa; line-height: 1.7; margin-bottom: 24px;">
            Hemos recibido tu mensaje sobre <strong style="color: #e4e4e7;">&quot;${safeSubject}&quot;</strong>. 
            Te responderemos en un plazo de 48 horas hábiles.
          </p>
          <div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="color: #52525b; font-size: 12px; margin: 0 0 8px;">Tu mensaje:</p>
            <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${safeMessage}</p>
          </div>
          <a href="https://www.biohackerage.com" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 13px;">
            Volver a Biohacker Age →
          </a>
          <p style="color: #3f3f46; font-size: 11px; margin-top: 32px;">
            Biohacker Age · www.biohackerage.com<br/>
            Este es un email automático de confirmación.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Contact API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
