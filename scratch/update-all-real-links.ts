import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const UPDATES = [
  { name: 'NMN Premium (Longevidad)', link: 'https://amzn.to/4vWkfSn', keywords: ['nmn', 'nicotinamide', 'nad+'] },
  { name: 'Vitamina D3 + K2', link: 'https://amzn.to/4ulexbk', keywords: ['vitamina d', 'vitamin d', 'k2', 'd3'] },
  { name: 'Creatina monohidrato', link: 'https://amzn.to/3OzxibL', keywords: ['creatina', 'creatine', 'monohidrato'] },
  { name: 'Xiaomi Smart Band 10', link: 'https://amzn.to/3OSsY7w', keywords: ['xiaomi band', 'mi band', 'smart band'] },
  { name: 'Amazfit GTR 3', link: 'https://amzn.to/48xDW9c', keywords: ['amazfit', 'smartwatch', 'gtr'] }
];

const NEW_PRODUCTS = [
  {
    name: 'Hongo Melena de León',
    affiliate_link: 'https://amzn.to/3OSsKNI',
    category: 'Recomendaciones',
    price_point: 'low',
    keywords: ['melena de leon', 'lions mane', 'hongo', 'nootropico', 'enfoque']
  },
  {
    name: 'Gafas de Bloqueo de Luz Azul',
    affiliate_link: 'https://amzn.to/3R8J6lS',
    category: 'Recomendaciones',
    price_point: 'low',
    keywords: ['gafas luz azul', 'blue light glasses', 'sueño', 'ritmo circadiano']
  },
  {
    name: 'Manta de Infrarrojos',
    affiliate_link: 'https://amzn.to/4cEDdWc',
    category: 'Recomendaciones',
    price_point: 'high',
    keywords: ['manta infrarrojos', 'infrared blanket', 'sauna', 'recuperacion', 'detox']
  }
];

async function updateAll() {
  console.log('🔄 Updating existing product links...');
  for (const item of UPDATES) {
    const { error } = await supabase
      .from('products')
      .update({ affiliate_link: item.link, category: 'Recomendaciones' })
      .ilike('name', `%${item.name.split(' ')[0]}%`);
    if (error) console.error(`Error updating ${item.name}:`, error.message);
  }

  console.log('✨ Adding new biohacking tools...');
  const { error: iErr } = await supabase.from('products').insert(NEW_PRODUCTS);
  if (iErr) console.error('Error inserting new products:', iErr.message);

  console.log('✅ All real links are now live!');
}

updateAll();
