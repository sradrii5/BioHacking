import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateRealLink() {
  console.log('🔗 Updating Magnesium L-Threonate with your real affiliate link...');
  
  const { error } = await supabase
    .from('products')
    .update({ affiliate_link: 'https://amzn.to/4u80aXq' })
    .eq('name', 'Magnesium L-Threonate');

  if (error) {
    console.error('❌ Error updating link:', error.message);
  } else {
    console.log('✅ Success! Your real affiliate link is now live on the site.');
  }
}

updateRealLink();
