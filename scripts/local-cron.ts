import cron from 'node-cron';
import axios from 'axios';
import { config } from 'dotenv';
import path from 'path';

// Load env vars
config({ path: path.resolve(process.cwd(), '.env.local') });

const PORT = 3000;
const SECRET = process.env.CRON_SECRET || 'test_secret';
const URL = `http://localhost:${PORT}/api/ingest/daily?secret=${SECRET}`;

console.log('--- 🛡️ LONGEVITY CENTINEL ACTIVATED ---');
console.log(`Monitoring: ${URL}`);
console.log('Schedule: Every day at 09:00 AM');

// Task: Every day at 09:00
cron.schedule('0 9 * * *', async () => {
  console.log(`[${new Date().toLocaleString()}] 🚀 Triggering daily ingestion...`);
  try {
    const res = await axios.get(URL, { timeout: 600000 }); // 10 minutes timeout
    console.log('✅ Success:', res.data);
  } catch (err: any) {
    console.error('❌ Automation Error:', err.response?.data || err.message);
  }
});

// IMMEDIATE TEST (Optional: comment out if you only want the schedule)
async function testNow() {
  console.log(`[${new Date().toLocaleString()}] 🧪 Running immediate test...`);
  try {
    const res = await axios.get(URL, { timeout: 600000 }); // 10 minutes timeout
    console.log('✅ Test Result:', res.data);
  } catch (err: any) {
    if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
      console.log('⚠️ Timeout/Reset: The server is taking too long (probably waiting for AI quota).');
      console.log('💡 This is normal when Gemini limits are reached. It will retry tomorrow at 09:00 AM!');
    } else {
      console.error('❌ Test Failed:', err.response?.data || err.message);
    }
  }
}

testNow();
