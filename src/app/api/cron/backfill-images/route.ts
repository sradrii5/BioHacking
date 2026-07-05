import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { fetchUnsplashImage } from '@/lib/services/unsplash';

/**
 * GET /api/cron/backfill-images
 * Processes up to 40 articles without cover images per run.
 * Called by Vercel Cron every 2 hours.
 * Protected by CRON_SECRET header.
 *
 * Unsplash demo tier: 50 req/hour → 40 articles/run leaves 10 req buffer.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const BATCH_SIZE = 40; // Safe under the 50 req/hour demo limit

  console.log('🖼️ [IMAGE BACKFILL] Starting batch...');

  // Fetch articles without a cover image (oldest first for progressive rollout)
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, seo_metadata')
    .eq('status', 'published')
    .is('cover_image_url', null)
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE);

  if (error) {
    console.error('[IMAGE BACKFILL] DB error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!articles || articles.length === 0) {
    console.log('[IMAGE BACKFILL] All articles already have images! 🎉');
    return NextResponse.json({ success: true, processed: 0, remaining: 0 });
  }

  console.log(`[IMAGE BACKFILL] Found ${articles.length} articles to process.`);

  let successCount = 0;
  let failCount = 0;

  for (const article of articles) {
    const keywords: string[] = article.seo_metadata?.product_keywords || [];

    const image = await fetchUnsplashImage(keywords, article.title);

    if (!image) {
      failCount++;
      // Small delay even on failure to avoid hammering the API
      await new Promise(r => setTimeout(r, 500));
    } else {
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          cover_image_url: image.url,
          cover_image_alt: image.alt,
          cover_image_credit: image.credit,
          cover_image_credit_url: image.creditUrl,
        })
        .eq('id', article.id);

      if (updateError) {
        console.error(`[IMAGE BACKFILL] Failed to update article ${article.id}:`, updateError.message);
        failCount++;
      } else {
        console.log(`✅ [IMAGE BACKFILL] "${article.title.substring(0, 50)}" → ${image.credit}`);
        successCount++;
      }

      // 1.5s between requests — keeps us well within rate limits
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  // Count remaining articles without images for reporting
  const { count: remaining } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')
    .is('cover_image_url', null);

  console.log(`[IMAGE BACKFILL] Done. ✅ ${successCount} updated, ⚠️ ${failCount} skipped. Remaining: ${remaining ?? '?'}`);

  return NextResponse.json({
    success: true,
    processed: successCount,
    skipped: failCount,
    remaining: remaining ?? null,
  });
}
