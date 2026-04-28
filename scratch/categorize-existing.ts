import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function categorizeExisting() {
  console.log('🧐 Fetching articles without category...');
  
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, seo_metadata');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`📝 Found ${articles.length} articles. Updating...`);

  for (const article of articles) {
    const updatedMetadata = {
      ...article.seo_metadata,
      category: article.seo_metadata.category || 'Ciencia'
    };

    const { error: uErr } = await supabase
      .from('articles')
      .update({ seo_metadata: updatedMetadata })
      .eq('id', article.id);

    if (uErr) {
      console.error(`❌ Failed to update ${article.id}:`, uErr.message);
    } else {
      console.log(`✅ Updated ${article.id}`);
    }
  }

  console.log('🎉 Done! All articles categorized as "Ciencia" by default.');
}

categorizeExisting();
