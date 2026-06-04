import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkRealArticles() {
  const now = new Date();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  console.log('Current Date (Local/UTC):', now.toISOString());
  console.log('Seven Days Ago Threshold:', sevenDaysAgo.toISOString());

  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, created_at, status, seo_metadata')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles:', error);
    return;
  }

  console.log(`\nTotal articles in database: ${articles.length}`);
  
  const last7Days = articles.filter(a => {
    const created = new Date(a.created_at);
    return created >= sevenDaysAgo && a.status === 'published';
  });

  console.log(`Articles published in the last 7 days: ${last7Days.length}`);
  
  const es = last7Days.filter(a => a.seo_metadata?.locale === 'es');
  const en = last7Days.filter(a => a.seo_metadata?.locale === 'en');
  
  console.log(`- Spanish ('es'): ${es.length}`);
  es.forEach(a => console.log(`  * [es] [${a.created_at}] ${a.title}`));
  
  console.log(`- English ('en'): ${en.length}`);
  en.forEach(a => console.log(`  * [en] [${a.created_at}] ${a.title}`));

  console.log('\n--- All Articles (Last 10) ---');
  articles.slice(0, 10).forEach(a => {
    console.log(`- [${a.status}] [${a.seo_metadata?.locale}] [${a.created_at}] ${a.title}`);
  });
}

checkRealArticles();
