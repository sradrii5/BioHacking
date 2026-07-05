/**
 * BACKFILL SCRIPT: Add Unsplash cover images to existing articles
 *
 * Run with: npx tsx src/scripts/backfill-images.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local from project root
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import { fetchUnsplashImage } from '../lib/services/unsplash';


// Load env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!process.env.UNSPLASH_ACCESS_KEY) {
  console.error('❌ Missing UNSPLASH_ACCESS_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function backfillImages() {
  console.log('🖼️  Starting image backfill...\n');

  // Fetch all articles without a cover image
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, seo_metadata')
    .eq('status', 'published')
    .is('cover_image_url', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching articles:', error.message);
    process.exit(1);
  }

  if (!articles || articles.length === 0) {
    console.log('✅ All articles already have images!');
    return;
  }

  console.log(`📋 Found ${articles.length} articles without images.\n`);

  let successCount = 0;
  let failCount = 0;

  for (const article of articles) {
    process.stdout.write(`  Processing: "${article.title.substring(0, 60)}..."  `);

    // Extract keywords from seo_metadata if available
    const keywords: string[] = article.seo_metadata?.product_keywords || [];

    const image = await fetchUnsplashImage(keywords, article.title);

    if (!image) {
      console.log('⚠️  No image found, skipping.');
      failCount++;
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
        console.log(`❌ DB error: ${updateError.message}`);
        failCount++;
      } else {
        console.log(`✅ Done (credit: ${image.credit})`);
        successCount++;
      }
    }

    // Respect Unsplash rate limit: 50 req/hour for demo, 5000/hour with key
    // Wait 1.5s between requests to be safe
    await sleep(1500);
  }

  console.log(`\n📊 Backfill complete:`);
  console.log(`   ✅ Updated: ${successCount} articles`);
  console.log(`   ⚠️  Skipped: ${failCount} articles`);
}

backfillImages().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
