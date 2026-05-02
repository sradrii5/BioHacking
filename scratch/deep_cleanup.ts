import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function deepCleanup() {
  console.log('🧪 Deep Cleaning...');
  
  // 1. Delete articles created today
  const today = new Date().toISOString().split('T')[0];
  const { error: err1 } = await supabase
    .from('articles')
    .delete()
    .gte('created_at', today);

  // 2. Delete studies created today
  const { error: err2 } = await supabase
    .from('studies')
    .delete()
    .gte('created_at', today);

  if (err1 || err2) console.error('Error:', err1 || err2);
  else console.log('✅ Deep cleanup finished. Running bot again...');
}

deepCleanup();
