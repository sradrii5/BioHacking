import { NextResponse } from 'next/server';
import { fetchPubMed, fetchScienceDaily } from '@/scripts/bot/fetchers';
import { processArticle } from '@/scripts/bot/processor';
import { publishArticle, isAlreadyPublished } from '@/scripts/bot/publisher';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendDailyDigest } from '@/lib/email';

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

    // 2. Process and publish (Limited to 1 article per run for consistency and safety)
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
        
        // 3. Send Newsletter to subscribers
        const supabase = getSupabaseAdmin();
        const { data: subscribers } = await supabase
          .from('subscribers')
          .select('email, lang')
          .eq('status', 'active');

        if (subscribers && subscribers.length > 0) {
          await sendDailyDigest({
            subscribers,
            article: {
              title: processed.title.es, // Default to ES for now or match sub lang
              tldr: processed.tldr.es,
              slug: processed.slug,
              lang: 'es'
            }
          });
        }

        // We only want 1 fresh article per day
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
