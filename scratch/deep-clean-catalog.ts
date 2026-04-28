import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const PERFECT_LIST = [
  // SPANISH VERSION
  { name: 'NMN Premium (Longevidad)', affiliate_link: 'https://amzn.to/4vWkfSn', category: 'Recomendaciones', lang: 'es', price_point: 'high', keywords: ['nmn', 'nicotinamide', 'nad+'] },
  { name: 'Magnesio L-Treonato (Cerebro & Sueño)', affiliate_link: 'https://amzn.to/4u80aXq', category: 'Recomendaciones', lang: 'es', price_point: 'medium', keywords: ['magnesio', 'magnesium', 'sleep', 'sueño'] },
  { name: 'Vitamina D3 + K2 (Inmunidad)', affiliate_link: 'https://amzn.to/4ulexbk', category: 'Recomendaciones', lang: 'es', price_point: 'low', keywords: ['vitamina d', 'vitamin d', 'k2', 'd3'] },
  { name: 'Creatina Monohidrato (Rendimiento)', affiliate_link: 'https://amzn.to/3OzxibL', category: 'Recomendaciones', lang: 'es', price_point: 'low', keywords: ['creatina', 'creatine'] },
  { name: 'Hongo Melena de León (Enfoque)', affiliate_link: 'https://amzn.to/3OSsKNI', category: 'Recomendaciones', lang: 'es', price_point: 'low', keywords: ['melena de leon', 'lions mane'] },
  { name: 'Xiaomi Smart Band 10', affiliate_link: 'https://amzn.to/3OSsY7w', category: 'Recomendaciones', lang: 'es', price_point: 'low', keywords: ['xiaomi band', 'mi band'] },
  { name: 'Amazfit GTR 3', affiliate_link: 'https://amzn.to/48xDW9c', category: 'Recomendaciones', lang: 'es', price_point: 'medium', keywords: ['amazfit', 'gtr'] },
  { name: 'Gafas de Bloqueo de Luz Azul', affiliate_link: 'https://amzn.to/3R8J6lS', category: 'Recomendaciones', lang: 'es', price_point: 'low', keywords: ['gafas luz azul', 'blue light glasses'] },
  { name: 'Manta de Infrarrojos (Recuperación)', affiliate_link: 'https://amzn.to/4cEDdWc', category: 'Recomendaciones', lang: 'es', price_point: 'high', keywords: ['manta infrarrojos', 'infrared blanket'] },
  
  // ENGLISH VERSION
  { name: 'Premium NMN (Longevity)', affiliate_link: 'https://amzn.to/4vWkfSn', category: 'Recomendaciones', lang: 'en', price_point: 'high', keywords: ['nmn'] },
  { name: 'Magnesium L-Threonate (Brain & Sleep)', affiliate_link: 'https://amzn.to/4u80aXq', category: 'Recomendaciones', lang: 'en', price_point: 'medium', keywords: ['magnesium'] },
  { name: 'Vitamin D3 + K2 (Immunity)', affiliate_link: 'https://amzn.to/4ulexbk', category: 'Recomendaciones', lang: 'en', price_point: 'low', keywords: ['vitamin d'] },
  { name: 'Creatine Monohydrate (Performance)', affiliate_link: 'https://amzn.to/3OzxibL', category: 'Recomendaciones', lang: 'en', price_point: 'low', keywords: ['creatine'] },
  { name: 'Lion\'s Mane Mushroom (Focus)', affiliate_link: 'https://amzn.to/3OSsKNI', category: 'Recomendaciones', lang: 'en', price_point: 'low', keywords: ['lions mane'] },
  { name: 'Xiaomi Smart Band 10', affiliate_link: 'https://amzn.to/3OSsY7w', category: 'Recomendaciones', lang: 'en', price_point: 'low', keywords: ['xiaomi band'] },
  { name: 'Amazfit GTR 3', affiliate_link: 'https://amzn.to/48xDW9c', category: 'Recomendaciones', lang: 'en', price_point: 'medium', keywords: ['amazfit'] },
  { name: 'Blue Light Blocking Glasses', affiliate_link: 'https://amzn.to/3R8J6lS', category: 'Recomendaciones', lang: 'en', price_point: 'low', keywords: ['blue light'] },
  { name: 'Infrared Sauna Blanket', affiliate_link: 'https://amzn.to/4cEDdWc', category: 'Recomendaciones', lang: 'en', price_point: 'high', keywords: ['infrared'] }
];

async function deepClean() {
  console.log('🧹 Starting deep cleanup...');
  
  // 1. Delete all current products
  const { error: dErr } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (dErr) {
    console.error('Error deleting products:', dErr.message);
    return;
  }
  console.log('✅ Old catalog wiped.');

  // 2. Insert the perfect, localized list
  const { error: iErr } = await supabase.from('products').insert(PERFECT_LIST);
  if (iErr) {
    console.error('Error inserting products:', iErr.message);
    return;
  }
  
  console.log('✅ Perfect catalog deployed (ES/EN)!');
}

deepClean();
