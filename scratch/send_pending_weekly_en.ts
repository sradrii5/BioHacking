import { createClient } from '@supabase/supabase-js';
import { sendWeeklyDigest } from '../src/lib/email';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function sendPendingEn() {
  console.log('🚀 [MANUAL RUN] Sending pending English weekly digest to active English subscribers...');

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // 1. Fetch real published English articles from last 7 days
  const { data: articles, error: artError } = await supabase
    .from('articles')
    .select('title, slug, created_at, seo_metadata')
    .gte('created_at', sevenDaysAgo)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (artError) {
    console.error('Error fetching articles:', artError);
    return;
  }

  const enArticles = articles
    .filter(a => a.seo_metadata?.locale === 'en')
    .map(a => ({ title: a.title, slug: a.slug }));

  console.log(`Fetched ${enArticles.length} English articles to send.`);

  // 2. Fetch active English subscribers
  const { data: subscribers, error: subError } = await supabase
    .from('subscribers')
    .select('email, lang')
    .eq('status', 'active')
    .eq('lang', 'en');

  if (subError) {
    console.error('Error fetching subscribers:', subError);
    return;
  }

  console.log(`Fetched ${subscribers.length} active English subscribers:`, subscribers.map(s => s.email));

  if (enArticles.length > 0 && subscribers.length > 0) {
    try {
      console.log('✉️ Starting parallel batch delivery...');
      await sendWeeklyDigest({
        subscribers,
        articles: enArticles,
        lang: 'en'
      });
      console.log('✅ Manual run completed successfully. All English subscribers have been processed!');
    } catch (sendError) {
      console.error('Error in weekly digest delivery:', sendError);
    }
  } else {
    console.log('ℹ️ No English articles or active English subscribers found. Nothing to send.');
  }
}

sendPendingEn();
