import { sendWeeklyDigest } from '../src/lib/email';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testSpanish() {
  console.log('🧪 Testing actual sendWeeklyDigest in Spanish...');
  
  const testSubscribers = [
    { email: 'adrianmelupy@gmail.com', lang: 'es' }
  ];

  const testArticles = [
    { title: 'Avance científico: fármaco revierte el envejecimiento de la piel y acelera la curación', slug: 'farmaco-revierte-envejecimiento-piel' },
    { title: 'La conexión inesperada entre la vitamina D y el dolor', slug: 'conexion-vitamina-d-y-dolor' }
  ];

  try {
    await sendWeeklyDigest({
      subscribers: testSubscribers,
      articles: testArticles,
      lang: 'es'
    });
    console.log('🏁 Spanish sendWeeklyDigest execution completed.');
  } catch (error) {
    console.error('❌ testSpanish critical crash:', error);
  }
}

testSpanish();
