import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const SAMPLE_PRODUCTS = [
  {
    name: 'Magnesium L-Threonate',
    affiliate_link: 'https://amazon.com/example-magnesium',
    category: 'Suplementos',
    price_point: 'medium',
    keywords: ['magnesium', 'magnesio', 'sleep', 'sueño', 'brain']
  },
  {
    name: 'Vitamin D3 + K2',
    affiliate_link: 'https://amazon.com/example-vitamin-d',
    category: 'Suplementos',
    price_point: 'low',
    keywords: ['vitamin d', 'vitamina d', 'immune', 'inmune', 'bones']
  },
  {
    name: 'Creatine Monohydrate',
    affiliate_link: 'https://amazon.com/example-creatine',
    category: 'Suplementos',
    price_point: 'low',
    keywords: ['creatine', 'creatina', 'muscle', 'brain', 'energy']
  },
  {
    name: 'NMN (Nicotinamide Mononucleotide)',
    affiliate_link: 'https://amazon.com/example-nmn',
    category: 'Suplementos',
    price_point: 'high',
    keywords: ['nmn', 'nad+', 'aging', 'envejecimiento', 'longevity']
  }
];

async function seedProducts() {
  console.log('🛒 Seeding premium supplements...');
  
  const { error } = await supabase.from('products').insert(SAMPLE_PRODUCTS);

  if (error) {
    console.error('❌ Error seeding products:', error.message);
  } else {
    console.log('✅ 4 Premium supplements added to your catalog!');
  }
}

seedProducts();
