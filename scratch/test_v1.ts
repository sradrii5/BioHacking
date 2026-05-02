
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testV1() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    console.log('Testing gemini-1.5-flash with v1 API...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }, { apiVersion: 'v1' });
    const result = await model.generateContent("Hi");
    console.log('✅ Success with v1!');
    console.log('Response:', result.response.text());
  } catch (e: any) {
    console.log('❌ Failure with v1:', e.message);
  }
}

testV1();
