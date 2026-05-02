
import axios from 'axios';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function listAllModels() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const response = await axios.get(url);
    console.log('Available models:');
    response.data.models.forEach((m: any) => {
      console.log(`- ${m.name} (${m.displayName})`);
    });
  } catch (e: any) {
    console.log('❌ Error listing models:', e.response?.data || e.message);
  }
}

listAllModels();
