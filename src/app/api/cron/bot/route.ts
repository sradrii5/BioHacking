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

    let processedInThisRun = 0;
    const MAX_ARTICLES_PER_RUN = 3;

    for (const item of allItems) {
      if (processedInThisRun >= MAX_ARTICLES_PER_RUN) break;

      const alreadyExists = await isAlreadyPublished(item.link, item.title);
      if (alreadyExists) {
        results.skipped++;
        continue;
      }

      const processed = await processArticle(item);
      if (processed) {
        await publishArticle(processed);
        results.processed++;
        results.articles.push(processed.slug.es);
        
        processedInThisRun++;
        console.log(`🎯 [CRON] Successfully published daily article: ${processed.slug.es}`);
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
