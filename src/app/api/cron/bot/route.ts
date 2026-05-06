import { NextResponse } from 'next/server';
import { fetchPubMed, fetchScienceDaily } from '@/scripts/bot/fetchers';
import { processArticle } from '@/scripts/bot/processor';
import { publishArticle, isAlreadyPublished } from '@/scripts/bot/publisher';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendDailyDigest } from '@/lib/email';

// This route is called by Vercel Cron.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('🤖 [CRON] Starting Biohacking Bot...');
  const results = { processed: 0, skipped: 0, failed: 0, articles: [] as string[] };

  try {
    const pubmedItems = await fetchPubMed();
    const newsItems = await fetchScienceDaily();
    const allItems = [...pubmedItems, ...newsItems];

    console.log(`📡 [CRON] Found ${allItems.length} potential articles.`);

    for (const item of allItems) {
      const alreadyExists = await isAlreadyPublished(item.link, item.title);
      if (alreadyExists) {
        results.skipped++;
        continue;
      }

      const processed = await processArticle(item);
      if (processed) {
        await publishArticle(processed);
        results.processed++;
        results.articles.push(processed.slug);
        
        // 3. Send Newsletter to subscribers grouped by language
        const supabase = getSupabaseAdmin();
        const { data: subscribers } = await supabase
          .from('subscribers')
          .select('email, lang')
          .eq('status', 'active');

        if (subscribers && subscribers.length > 0) {
          // Send to Spanish subscribers
          const esSubs = subscribers.filter(s => s.lang === 'es');
          if (esSubs.length > 0) {
            await sendDailyDigest({
              subscribers: esSubs,
              article: {
                title: processed.title.es,
                tldr: processed.tldr.es,
                slug: processed.slug,
                lang: 'es'
              }
            });
          }

          // Send to English subscribers
          const enSubs = subscribers.filter(s => s.lang === 'en');
          if (enSubs.length > 0) {
            await sendDailyDigest({
              subscribers: enSubs,
              article: {
                title: processed.title.en,
                tldr: processed.tldr.en,
                slug: processed.slug,
                lang: 'en'
              }
            });
          }
        }

        console.log(`🎯 [CRON] Successfully published daily article: ${processed.slug}`);
        break; 
      } else {
        results.failed++;
      }
    }

    console.log('✅ [CRON] Bot finished.', results);
    return NextResponse.json({ success: true, ...results });

  } catch (error: any) {
    console.error('💥 [CRON] Critical error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
