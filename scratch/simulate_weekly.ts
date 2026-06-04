import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function simulate() {
  console.log('📅 [SIMULATION] Starting Weekly Newsletter Digest Simulation...');
  
  // 1. Get articles from the last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  console.log('sevenDaysAgo:', sevenDaysAgo);
  
  const { data: articles, error: artError } = await supabase
    .from('articles')
    .select('title, slug, created_at, seo_metadata')
    .gte('created_at', sevenDaysAgo)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (artError) {
    console.error('Articles Error:', artError);
    return;
  }
  
  console.log(`Fetched ${articles?.length || 0} published articles in the last 7 days.`);

  // 2. Get active subscribers
  const { data: subscribers, error: subError } = await supabase
    .from('subscribers')
    .select('email, lang')
    .eq('status', 'active');

  if (subError) {
    console.error('Subscribers Error:', subError);
    return;
  }
  
  console.log(`Fetched ${subscribers?.length || 0} active subscribers.`);

  // 3. Group articles and subscribers by language
  const langs = ['es', 'en'];

  for (const lang of langs) {
    const langArticles = articles
      ?.filter(a => {
        const articleLocale = a.seo_metadata?.locale;
        const matches = articleLocale === lang;
        console.log(`Checking article [${a.seo_metadata?.locale}] "${a.title}": matches ${lang}? ${matches}`);
        return matches;
      })
      .map(a => ({ title: a.title, slug: a.slug })) || [];

    const langSubs = subscribers?.filter(s => s.lang === lang) || [];

    console.log(`\nLanguage: ${lang}`);
    console.log(`- Subscribers (${langSubs.length}):`, langSubs.map(s => s.email));
    console.log(`- Articles found (${langArticles.length}):`, langArticles.map(a => a.title));
    
    if (langArticles.length > 0 && langSubs.length > 0) {
      console.log(`✅ Would send ${langArticles.length} articles to ${langSubs.length} ${lang} subscribers.`);
    } else {
      console.log(`❌ Skipped because articles count = ${langArticles.length}, subscribers count = ${langSubs.length}`);
    }
  }
}

simulate();
