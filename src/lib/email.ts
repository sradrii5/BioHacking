import { Resend } from 'resend';
import { render } from '@react-email/render';
import DailyDigestEmail from '@/emails/DailyDigest';
import WeeklyDigestEmail from '@/emails/WeeklyDigest';
import WelcomeEmail from '@/emails/WelcomeEmail';
import * as React from 'react';

/**
 * Reusable utility to process tasks concurrently in controlled batches.
 * Helps prevent rate limiting (e.g. Resend 5/s) and serverless memory saturation.
 */
async function sendInBatches<T>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<void>,
  delayMs: number = 1000
) {
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize);
    
    // Process all items in the current chunk concurrently
    await Promise.allSettled(
      chunk.map(async (item) => {
        try {
          await processor(item);
        } catch (error) {
          console.error('❌ Error processing email in concurrent batch:', error);
        }
      })
    );

    // If there are more items left to process, wait to respect the rate limit
    if (i + batchSize < items.length) {
      console.log(`⏱️ Waiting ${delayMs}ms to respect API rate limits...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export async function sendWeeklyDigest({
  subscribers,
  articles,
  lang,
}: {
  subscribers: any[];
  articles: { title: string; slug: string }[];
  lang: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ Missing RESEND_API_KEY');
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const FROM_EMAIL = process.env.EMAIL_FROM || 'Biohacker Age <newsletter@biohackerage.com>';

  console.log(`✉️ Sending weekly digest concurrently to ${subscribers.length} subscribers (${lang})...`);

  // We send in batches of 5 to safely stay under Resend's 10/s rate limit
  await sendInBatches(subscribers, 5, async (subscriber) => {
    const emailHtml = await render(React.createElement(WeeklyDigestEmail, {
      articles,
      lang,
    }));
    
    const emailText = await render(React.createElement(WeeklyDigestEmail, {
      articles,
      lang,
    }), { plainText: true });

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: subscriber.email,
      subject: lang === 'es' ? '🧬 Resumen Semanal: Biohacking y Longevidad' : '🧬 Weekly Digest: Biohacking and Longevity',
      html: emailHtml,
      text: emailText,
    });

    if (error) {
      console.error(`❌ Resend Error (${subscriber.email}):`, error);
    } else {
      console.log(`✅ Weekly email sent to ${subscriber.email}:`, data?.id);
    }
  });
}

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
  const FROM_EMAIL = process.env.EMAIL_FROM || 'Biohacker Age <newsletter@biohackerage.com>';

  console.log(`✉️ Sending daily newsletter concurrently to ${subscribers.length} subscribers...`);

  // We send in batches of 5 to safely stay under Resend's 10/s rate limit
  await sendInBatches(subscribers, 5, async (subscriber) => {
    const emailHtml = await render(React.createElement(DailyDigestEmail, {
      title: article.title,
      tldr: article.tldr,
      slug: article.slug,
      lang: article.lang,
    }));
    
    const emailText = await render(React.createElement(DailyDigestEmail, {
      title: article.title,
      tldr: article.tldr,
      slug: article.slug,
      lang: article.lang,
    }), { plainText: true });

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: subscriber.email,
      subject: article.lang === 'es' ? `🧬 Nueva Ciencia: ${article.title}` : `🧬 New Science: ${article.title}`,
      html: emailHtml,
      text: emailText,
    });

    if (error) {
      console.error(`❌ Resend Error (${subscriber.email}):`, error);
    } else {
      console.log(`✅ Daily email sent to ${subscriber.email}:`, data?.id);
    }
  });
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
    const emailText = await render(React.createElement(WelcomeEmail, { lang }), { plainText: true });

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: lang === 'es' ? '🧬 ¡Bienvenido a la Era de la Longevidad!' : '🧬 Welcome to the Longevity Era!',
      html: emailHtml,
      text: emailText,
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

