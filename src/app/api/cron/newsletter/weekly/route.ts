import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendWeeklyDigest } from '@/lib/email';

// Extend serverless timeout to 60s (Hobby plan default is 10s — not enough for batch email sends)
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    console.error('❌ [WEEKLY] Unauthorized — CRON_SECRET mismatch or missing in env');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('📅 [CRON] Starting Weekly Newsletter Digest...');
  const supabase = getSupabaseAdmin();

  try {
    // 1. Get articles from the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: articles, error: artError } = await supabase
      .from('articles')
      .select('title, slug, created_at, seo_metadata')
      .gte('created_at', sevenDaysAgo)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (artError) throw artError;

    console.log(`📄 [WEEKLY] Articles found in last 7 days: ${articles?.length ?? 0}`);

    if (!articles || articles.length === 0) {
      console.warn('📭 [WEEKLY] No published articles in last 7 days. Newsletter skipped.');
      return NextResponse.json({ success: true, message: 'No articles found in last 7 days' });
    }

    // 2. Get active subscribers
    const { data: subscribers, error: subError } = await supabase
      .from('subscribers')
      .select('email, lang')
      .eq('status', 'active');

    if (subError) throw subError;

    console.log(`👥 [WEEKLY] Active subscribers: ${subscribers?.length ?? 0}`);

    if (!subscribers || subscribers.length === 0) {
      console.warn('👥 [WEEKLY] No active subscribers found. Newsletter skipped.');
      return NextResponse.json({ success: true, message: 'No subscribers found' });
    }

    // 3. Group by language and send sequentially to avoid hitting Resend's concurrent rate limits
    const langs = ['es', 'en'];
    const summary: Record<string, { articles: number; subscribers: number }> = {};

    for (const lang of langs) {
      const langArticles = articles
        .filter(a => a.seo_metadata?.locale === lang)
        .map(a => ({ title: a.title, slug: a.slug }));

      const langSubs = subscribers.filter(s => s.lang === lang);

      summary[lang] = { articles: langArticles.length, subscribers: langSubs.length };

      if (langArticles.length > 0 && langSubs.length > 0) {
        console.log(`📧 [WEEKLY] Sending ${langArticles.length} articles to ${langSubs.length} [${lang}] subscribers...`);
        await sendWeeklyDigest({ subscribers: langSubs, articles: langArticles, lang });
        console.log(`✅ [WEEKLY] [${lang}] batch complete.`);
      } else {
        console.warn(`⚠️ [WEEKLY] Skipping [${lang}]: ${langArticles.length} articles, ${langSubs.length} subscribers`);
      }
    }

    console.log('✅ [CRON] Weekly newsletter finished.', summary);
    return NextResponse.json({ success: true, articlesCount: articles.length, summary });

  } catch (error: any) {
    console.error('💥 [CRON] Weekly Newsletter Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
