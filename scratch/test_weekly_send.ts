import { sendWeeklyDigest } from '../src/lib/email';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testSend() {
  console.log('🧪 Testing actual sendWeeklyDigest in English...');
  
  const testSubscribers = [
    { email: 'adrianmelupy@gmail.com', lang: 'en' } // Using user's email to make sure it delivers
  ];

  const testArticles = [
    { title: 'The Power of Kimchi: Can it Help Flush Microplastics from the Body?', slug: 'kimchi-microplastics-health' },
    { title: 'The Unexpected Link Between Vitamin D and Pain', slug: 'vitamin-d-and-pain' }
  ];

  try {
    await sendWeeklyDigest({
      subscribers: testSubscribers,
      articles: testArticles,
      lang: 'en'
    });
    console.log('🏁 sendWeeklyDigest execution completed.');
  } catch (error) {
    console.error('❌ testSend critical crash:', error);
  }
}

testSend();
