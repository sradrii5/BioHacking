import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function analyze() {
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, created_at, status, seo_metadata')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  const fixDate = new Date('2026-06-04T00:00:00Z');
  
  const beforeFix = articles.filter(a => new Date(a.created_at) < fixDate);
  const afterFix = articles.filter(a => new Date(a.created_at) >= fixDate);

  console.log(`Total articles: ${articles.length}`);
  console.log(`Published BEFORE June 4th (old prompt): ${beforeFix.length}`);
  console.log(`Published AFTER June 4th (new prompt): ${afterFix.length}`);

  console.log('\nLast 5 articles BEFORE June 4th:');
  beforeFix.slice(0, 5).forEach(a => {
    console.log(`- [${a.created_at}] [${a.status}] [${a.seo_metadata?.locale}] ${a.title}`);
  });

  console.log('\nLast 5 articles AFTER June 4th:');
  afterFix.slice(0, 5).forEach(a => {
    console.log(`- [${a.created_at}] [${a.status}] [${a.seo_metadata?.locale}] ${a.title}`);
  });
}

analyze();
