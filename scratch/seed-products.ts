import { config } from 'dotenv';
config({ path: '.env.local' });

async function seedProducts() {
  const { getSupabaseAdmin } = require('../src/lib/supabase');
  const supabase = getSupabaseAdmin();

  const products = [
    {
      name: 'NMN Premium (Longevidad)',
      affiliate_link: 'https://amazon.es/nmn-demo?tag=antigravity-21',
      keywords: ['NMN', 'NAD+', 'nicotinamida']
    },
    {
      name: 'Magnesio de Alta Absorción',
      affiliate_link: 'https://amazon.es/magnesio-demo?tag=antigravity-21',
      keywords: ['magnesio', 'citrato de magnesio', 'glicinato de magnesio']
    },
    {
      name: 'Vitamina D3 + K2',
      affiliate_link: 'https://amazon.es/vitamina-d-demo?tag=antigravity-21',
      keywords: ['vitamina D', 'vitamina D3', 'sistema inmune']
    }
  ];

  console.log('Insertando productos de prueba...');
  const { error } = await supabase.from('products').insert(products);

  if (error) {
    console.error('Error al insertar productos:', error);
  } else {
    console.log('✅ Productos insertados con éxito.');
  }
}

seedProducts();
