import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  const fixDate = new Date('2026-06-04T00:00:00Z').toISOString();
  
  console.log(`Setting articles created before ${fixDate} to status 'draft'...`);
  
  const { data, error } = await supabase
    .from('articles')
    .update({ status: 'draft' })
    .lt('created_at', fixDate)
    .eq('status', 'published')
    .select('id, title');

  if (error) {
    console.error('Error updating articles:', error);
    return;
  }

  console.log(`Successfully moved ${data?.length || 0} old articles to draft status.`);
}

run();
