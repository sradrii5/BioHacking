import { sendWeeklyDigest } from '../src/lib/email';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testChunking() {
  console.log('🧪 Testing sendWeeklyDigest with chunked batch concurrency...');

  // Create 7 mock subscribers to see it split into 2 batches (batch size is 5)
  const testSubscribers = [
    { email: 'adrianmelupy+1@gmail.com', lang: 'en' },
    { email: 'adrianmelupy+2@gmail.com', lang: 'en' },
    { email: 'adrianmelupy+3@gmail.com', lang: 'en' },
    { email: 'adrianmelupy+4@gmail.com', lang: 'en' },
    { email: 'adrianmelupy+5@gmail.com', lang: 'en' },
    { email: 'adrianmelupy+6@gmail.com', lang: 'en' },
    { email: 'adrianmelupy+7@gmail.com', lang: 'en' },
  ];

  const testArticles = [
    { title: 'The Power of Kimchi: Can it Help Flush Microplastics from the Body?', slug: 'kimchi-microplastics-health' },
    { title: 'The Unexpected Link Between Vitamin D and Pain', slug: 'vitamin-d-and-pain' }
  ];

  try {
    console.time('⏰ Execution Time');
    await sendWeeklyDigest({
      subscribers: testSubscribers,
      articles: testArticles,
      lang: 'en'
    });
    console.timeEnd('⏰ Execution Time');
    console.log('🏁 Concurrency test completed successfully.');
  } catch (error) {
    console.error('❌ testChunking critical crash:', error);
  }
}

testChunking();
