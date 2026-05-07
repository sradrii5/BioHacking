import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendWeeklyDigest } from '@/lib/email';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
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
    if (!articles || articles.length === 0) {
      console.log('📭 No articles found in the last 7 days. Skipping newsletter.');
      return NextResponse.json({ success: true, message: 'No articles found' });
    }

    // 2. Get active subscribers
    const { data: subscribers, error: subError } = await supabase
      .from('subscribers')
      .select('email, lang')
      .eq('status', 'active');

    if (subError) throw subError;
    if (!subscribers || subscribers.length === 0) {
      console.log('👥 No active subscribers found.');
      return NextResponse.json({ success: true, message: 'No subscribers found' });
    }

    // 3. Group articles and subscribers by language
    const langs = ['es', 'en'];

    for (const lang of langs) {
      const langArticles = articles
        .filter(a => a.seo_metadata?.locale === lang)
        .map(a => ({ title: a.title, slug: a.slug }));

      const langSubs = subscribers.filter(s => s.lang === lang);

      if (langArticles.length > 0 && langSubs.length > 0) {
        console.log(`📧 Sending ${langArticles.length} articles to ${langSubs.length} ${lang} subscribers...`);
        await sendWeeklyDigest({
          subscribers: langSubs,
          articles: langArticles,
          lang
        });
      }
    }

    console.log('✅ [CRON] Weekly newsletter finished.');
    return NextResponse.json({ success: true, articlesCount: articles.length });

  } catch (error: any) {
    console.error('💥 [CRON] Weekly Newsletter Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
