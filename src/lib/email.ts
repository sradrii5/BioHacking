import { Resend } from 'resend';
import DailyDigestEmail from '@/emails/DailyDigest';
import WelcomeEmail from '@/emails/WelcomeEmail';

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
  console.log(`✉️ Sending newsletter to ${subscribers.length} subscribers...`);

  // We could use batch sending for large numbers, but for now individual or small batches is fine
  for (const subscriber of subscribers) {
    try {
      await resend.emails.send({
        from: 'Biohacker Age <newsletter@biohackerage.com>',
        to: subscriber.email,
        subject: article.lang === 'es' ? `🧬 Nueva Ciencia: ${article.title}` : `🧬 New Science: ${article.title}`,
        react: DailyDigestEmail({
          title: article.title,
          tldr: article.tldr,
          slug: article.slug,
          lang: article.lang,
        }),
      });
    } catch (error) {
      console.error(`❌ Failed to send email to ${subscriber.email}:`, error);
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
    console.error('❌ RESEND_API_KEY is missing in environment variables!');
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: 'Biohacker Age <newsletter@biohackerage.com>',
      to: email,
      subject: lang === 'es' ? '🧬 ¡Bienvenido a la Era de la Longevidad!' : '🧬 Welcome to the Longevity Era!',
      react: WelcomeEmail({ lang }),
    });
  } catch (error) {
    console.error(`❌ Failed to send welcome email to ${email}:`, error);
  }
}
