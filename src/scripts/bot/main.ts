import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local (where Supabase and Gemini keys are)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { fetchPubMed, fetchScienceDaily } from './fetchers';
import { processArticle } from './processor';
import { publishArticle } from './publisher';

async function runBot() {
  console.log('🚀 Starting Biohacking Bot...');

  // 1. Fetch from all sources
  console.log('📡 Fetching new content...');
  const pubmedItems = await fetchPubMed();
  const newsItems = await fetchScienceDaily();
  
  const allItems = [...pubmedItems, ...newsItems];
  console.log(`🔎 Found ${allItems.length} potential articles.`);

  // 2. Process and Publish
  for (const item of allItems) {
    console.log(`\n🧠 Analyzing: ${item.title}`);
    
    const processed = await processArticle(item);
    
    if (processed) {
      await publishArticle(processed);
    } else {
      console.log('⚠️ Failed to process article.');
    }
    
    // Add a small delay between requests to be nice to the API
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n✅ Bot execution finished.');
}

// Run the bot
runBot().catch(err => {
  console.error('💥 Critical bot error:', err);
  process.exit(1);
});
