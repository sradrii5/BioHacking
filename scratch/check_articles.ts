import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  const cronTime = new Date('2026-05-17T10:00:00.000Z');
  const sevenDaysBeforeCron = new Date(cronTime.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  console.log('Cron Execution Time Simulated:', cronTime.toISOString());
  console.log('Seven Days Before Cron:', sevenDaysBeforeCron.toISOString());

  // 1. Query articles
  const { data: articles, error: artError } = await supabase
    .from('articles')
    .select('id, title, slug, created_at, status, seo_metadata');

  if (artError) {
    console.error('Articles Error:', artError);
  } else {
    console.log(`Total articles found: ${articles.length}`);
    const activeAtCron = articles.filter(a => {
      const created = new Date(a.created_at);
      return created >= sevenDaysBeforeCron && created <= cronTime && a.status === 'published';
    });
    console.log(`Articles active at cron time: ${activeAtCron.length}`);
    
    const esArticles = activeAtCron.filter(a => a.seo_metadata?.locale === 'es');
    const enArticles = activeAtCron.filter(a => a.seo_metadata?.locale === 'en');
    
    console.log(`- Spanish ('es') at cron: ${esArticles.length}`);
    esArticles.forEach(a => console.log(`  * [es] [${a.created_at}] ${a.title}`));
    console.log(`- English ('en') at cron: ${enArticles.length}`);
    enArticles.forEach(a => console.log(`  * [en] [${a.created_at}] ${a.title}`));
  }

  // 2. Query subscribers
  const { data: subscribers, error: subError } = await supabase
    .from('subscribers')
    .select('*');

  if (subError) {
    console.error('Subscribers Error:', subError);
  } else {
    console.log('\n--- Subscribers ---');
    subscribers.forEach(s => {
      console.log(`- [${s.status}] [${s.lang}] ${s.email} (${s.created_at})`);
    });
  }
}

check();
