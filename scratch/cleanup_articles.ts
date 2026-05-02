import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function cleanup() {
  console.log('🧹 Cleaning up incomplete articles...');
  
  // Find articles missing source_url in seo_metadata
  const { data: articles } = await supabase
    .from('articles')
    .select('id, slug, seo_metadata')
    .is('seo_metadata->source_url', null);

  if (!articles || articles.length === 0) {
    console.log('✅ No incomplete articles found.');
    return;
  }

  // Filter out the old ones if necessary, but here we want to fix the bot's mess
  const idsToDelete = articles
    .filter(a => a.slug !== 'resveratrol-sirtuins-longevity-science') // Keep the sample one
    .map(a => a.id);

  if (idsToDelete.length === 0) return;

  console.log(`🗑️ Deleting ${idsToDelete.length} articles...`);
  
  const { error } = await supabase
    .from('articles')
    .delete()
    .in('id', idsToDelete);

  if (error) console.error('❌ Delete error:', error);
  else console.log('✅ Cleanup finished. You can now run the bot again.');
}

cleanup();
