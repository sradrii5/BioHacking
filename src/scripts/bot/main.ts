import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables immediately before other imports
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { fetchPubMed, fetchScienceDaily } from './fetchers';
import { processArticle } from './processor';
import { publishArticle, isAlreadyPublished } from './publisher';

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
    // Check if already exists before processing to save API quota
    const alreadyExists = await isAlreadyPublished(item.link, item.title);
    if (alreadyExists) {
      console.log(`\n⏭️ Skipping (already in DB): ${item.title}`);
      continue;
    }

    console.log(`\n🧠 Analyzing: ${item.title}`);
    
    const processed = await processArticle(item);
    
    if (processed) {
      await publishArticle(processed);
    } else {
      console.log('⚠️ Failed to process article.');
    }
    
    // Increased delay to 30s to respect free tier rate limits (15 RPM / 1M TPM)
    console.log('⏳ Waiting 30s for next article...');
    await new Promise(resolve => setTimeout(resolve, 30000));
  }

  console.log('\n✅ Bot execution finished.');
}

// Run the bot
runBot().catch(err => {
  console.error('💥 Critical bot error:', err);
  process.exit(1);
});
