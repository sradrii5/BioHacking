import { createClient } from '@supabase/supabase-js';
import { sendWeeklyDigest } from '../src/lib/email';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testRealWeekly() {
  console.log('🧪 Simulating REAL weekly cron and sending Spanish digest with actual DB articles...');

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  console.log('Fetching articles published since:', sevenDaysAgo);

  // 1. Fetch real published articles
  const { data: articles, error } = await supabase
    .from('articles')
    .select('title, slug, created_at, seo_metadata')
    .gte('created_at', sevenDaysAgo)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles:', error);
    return;
  }

  console.log(`Fetched ${articles.length} published articles from last 7 days.`);

  // 2. Filter for Spanish
  const esArticles = articles
    .filter(a => a.seo_metadata?.locale === 'es')
    .map(a => ({ title: a.title, slug: a.slug }));

  console.log(`\nActual Spanish articles to send (${esArticles.length}):`);
  esArticles.forEach((a, i) => console.log(`  ${i+1}. ${a.title}`));

  // 3. Send Spanish digest to user's real email
  const testSubscribers = [
    { email: 'adrianmelupy@gmail.com', lang: 'es' }
  ];

  if (esArticles.length > 0) {
    try {
      console.log('\n📧 Sending real Spanish weekly digest to adrianmelupy@gmail.com...');
      await sendWeeklyDigest({
        subscribers: testSubscribers,
        articles: esArticles,
        lang: 'es'
      });
      console.log('✅ Real Spanish weekly digest sent successfully.');
    } catch (sendError) {
      console.error('Error sending:', sendError);
    }
  } else {
    console.log('⚠️ No Spanish articles found in the last 7 days.');
  }
}

testRealWeekly();
