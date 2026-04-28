import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const GADGETS = [
  {
    name: 'Oura Ring Gen3',
    affiliate_link: 'https://ouraring.com/example',
    category: 'Recomendaciones',
    price_point: 'high',
    keywords: ['oura ring', 'sleep tracker', 'readiness', 'wearable', 'hrv']
  },
  {
    name: 'Amazfit T-Rex Ultra',
    affiliate_link: 'https://amazon.com/example-amazfit',
    category: 'Recomendaciones',
    price_point: 'medium',
    keywords: ['amazfit', 'smartwatch', 'gps', 'fitness tracker', 'outdoor']
  },
  {
    name: 'Xiaomi Smart Band 8',
    affiliate_link: 'https://amazon.com/example-xiaomi',
    category: 'Recomendaciones',
    price_point: 'low',
    keywords: ['xiaomi band', 'mi band', 'fitness tracker', 'steps', 'heart rate']
  }
];

async function updateAndSeed() {
  console.log('🔄 Migrating existing supplements category...');
  
  // Update existing products from 'Suplementos' to 'Recomendaciones'
  const { error: uErr } = await supabase
    .from('products')
    .update({ category: 'Recomendaciones' })
    .eq('category', 'Suplementos');

  if (uErr) console.error('Migration error:', uErr.message);
  else console.log('✅ Existing supplements migrated to Recomendaciones.');

  console.log('⌚ Seeding premium gadgets...');
  
  const { error: iErr } = await supabase.from('products').insert(GADGETS);

  if (iErr) console.error('Seeding error:', iErr.message);
  else console.log('✅ Oura, Amazfit and Xiaomi added to catalog!');
  
  // Also migrate existing articles!
  console.log('📰 Migrating existing articles...');
  const { data: articles } = await supabase.from('articles').select('id, seo_metadata');
  if (articles) {
    for (const article of articles) {
      if (article.seo_metadata.category === 'Suplementos') {
        const updatedMetadata = { ...article.seo_metadata, category: 'Recomendaciones' };
        await supabase.from('articles').update({ seo_metadata: updatedMetadata }).eq('id', article.id);
      }
    }
    console.log('✅ Articles migrated.');
  }
}

updateAndSeed();
