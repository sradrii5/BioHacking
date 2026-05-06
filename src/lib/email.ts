import { Resend } from 'resend';
import { render } from '@react-email/render';
import DailyDigestEmail from '@/emails/DailyDigest';
import WelcomeEmail from '@/emails/WelcomeEmail';
import * as React from 'react';

export async function sendDailyDigest({
  subscribers,
  article,
}: {
  subscribers: any[];
  article: { title: string; tldr: string; slug: string; lang: string };
}) {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ Missing RESEND_API_KEY');
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  // TIP: Use 'onboarding@resend.dev' if your domain is not verified yet
  const FROM_EMAIL = process.env.EMAIL_FROM || 'Biohacker Age <newsletter@biohackerage.com>';

  console.log(`✉️ Sending newsletter to ${subscribers.length} subscribers...`);

  for (const subscriber of subscribers) {
    try {
      const emailHtml = await render(React.createElement(DailyDigestEmail, {
        title: article.title,
        tldr: article.tldr,
        slug: article.slug,
        lang: article.lang,
      }));

      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: subscriber.email,
        subject: article.lang === 'es' ? `🧬 Nueva Ciencia: ${article.title}` : `🧬 New Science: ${article.title}`,
        html: emailHtml,
      });

      if (error) {
        console.error(`❌ Resend Error (${subscriber.email}):`, error);
      } else {
        console.log(`✅ Email sent to ${subscriber.email}:`, data?.id);
      }
    } catch (error) {
      console.error(`❌ Critical failure sending to ${subscriber.email}:`, error);
    }
  }
}

export async function sendWelcomeEmail({
  email,
  lang,
}: {
  email: string;
  lang: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is missing!');
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const FROM_EMAIL = process.env.EMAIL_FROM || 'Biohacker Age <newsletter@biohackerage.com>';

  try {
    console.log(`📩 Sending welcome email to: ${email}`);
    const emailHtml = await render(React.createElement(WelcomeEmail, { lang }));

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: lang === 'es' ? '🧬 ¡Bienvenido a la Era de la Longevidad!' : '🧬 Welcome to the Longevity Era!',
      html: emailHtml,
    });

    if (error) {
      console.error('❌ Resend Welcome Email Error:', error);
      // Helpful tip for common error
      if (error.name === 'validation_error' || (error as any).message?.includes('domain')) {
        console.warn('👉 TIP: Ensure biohackerage.com is verified in Resend. Otherwise, use onboarding@resend.dev');
      }
    } else {
      console.log('✅ Welcome email sent successfully:', data?.id);
    }
  } catch (error) {
    console.error(`❌ Critical failure sending welcome email to ${email}:`, error);
  }
}

