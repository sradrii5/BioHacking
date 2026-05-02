import { NextResponse } from 'next/server';
import { fetchPubMed, fetchScienceDaily } from '@/scripts/bot/fetchers';
import { processArticle } from '@/scripts/bot/processor';
import { publishArticle, isAlreadyPublished } from '@/scripts/bot/publisher';

// This route is called by Vercel Cron every 2 days.
// Protected by CRON_SECRET to prevent unauthorized calls.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('🤖 [CRON] Starting Biohacking Bot...');
  const results = { processed: 0, skipped: 0, failed: 0, articles: [] as string[] };

  try {
    // 1. Fetch from all sources
    const pubmedItems = await fetchPubMed();
    const newsItems = await fetchScienceDaily();
    const allItems = [...pubmedItems, ...newsItems];

    console.log(`📡 [CRON] Found ${allItems.length} potential articles.`);

    // 2. Process and publish
    for (const item of allItems) {
      const alreadyExists = await isAlreadyPublished(item.link, item.title);
      if (alreadyExists) {
        console.log(`⏭️ [CRON] Skipping (already in DB): ${item.title}`);
        results.skipped++;
        continue;
      }

      const processed = await processArticle(item);
      if (processed) {
        await publishArticle(processed);
        results.processed++;
        results.articles.push(processed.slug);
      } else {
        results.failed++;
      }

      // Delay between articles to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    console.log('✅ [CRON] Bot finished.', results);
    return NextResponse.json({ success: true, ...results });

  } catch (error: any) {
    console.error('💥 [CRON] Critical error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
