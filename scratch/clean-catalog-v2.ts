import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const CLEAN_LIST = [
  { name: 'NMN Premium (Longevidad)', affiliate_link: 'https://amzn.to/4vWkfSn', category: 'Recomendaciones', price_point: 'high', keywords: ['nmn', 'nicotinamide', 'nad+'] },
  { name: 'Magnesio L-Treonato (Cerebro & Sueño)', affiliate_link: 'https://amzn.to/4u80aXq', category: 'Recomendaciones', price_point: 'medium', keywords: ['magnesio', 'magnesium', 'sleep', 'sueño'] },
  { name: 'Vitamina D3 + K2 (Inmunidad)', affiliate_link: 'https://amzn.to/4ulexbk', category: 'Recomendaciones', price_point: 'low', keywords: ['vitamina d', 'vitamin d', 'k2', 'd3'] },
  { name: 'Creatina Monohidrato (Rendimiento)', affiliate_link: 'https://amzn.to/3OzxibL', category: 'Recomendaciones', price_point: 'low', keywords: ['creatina', 'creatine'] },
  { name: 'Hongo Melena de León (Enfoque)', affiliate_link: 'https://amzn.to/3OSsKNI', category: 'Recomendaciones', price_point: 'low', keywords: ['melena de leon', 'lions mane'] },
  { name: 'Xiaomi Smart Band 10', affiliate_link: 'https://amzn.to/3OSsY7w', category: 'Recomendaciones', price_point: 'low', keywords: ['xiaomi band', 'mi band'] },
  { name: 'Amazfit GTR 3', affiliate_link: 'https://amzn.to/48xDW9c', category: 'Recomendaciones', price_point: 'medium', keywords: ['amazfit', 'gtr'] },
  { name: 'Gafas de Bloqueo de Luz Azul', affiliate_link: 'https://amzn.to/3R8J6lS', category: 'Recomendaciones', price_point: 'low', keywords: ['gafas luz azul', 'blue light glasses'] },
  { name: 'Manta de Infrarrojos (Recuperación)', affiliate_link: 'https://amzn.to/4cEDdWc', category: 'Recomendaciones', price_point: 'high', keywords: ['manta infrarrojos', 'infrared blanket'] }
];

async function cleanOnly() {
  console.log('🧹 Cleaning duplicates and fixing names...');
  
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  const { error } = await supabase.from('products').insert(CLEAN_LIST);
  if (error) console.error('Error:', error.message);
  else console.log('✅ Catalog cleaned and updated with correct names!');
}

cleanOnly();
