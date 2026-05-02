import { createClient } from '@supabase/supabase-js';
import { ProcessedArticle } from './processor';

// Initialize Supabase with Admin key for the bot
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function publishArticle(article: ProcessedArticle) {
  try {
    // 1. Check if source already exists to avoid duplicates
    const { data: existing } = await supabase
      .from('studies')
      .select('id')
      .eq('source_url', article.sourceUrl)
      .single();

    if (existing) {
      console.log(`Skipping: Article already exists for ${article.sourceUrl}`);
      return;
    }

    console.log(`Publishing: ${article.title.en}...`);

    // 2. Insert Articles (ES and EN)
    const { data: insertedArticles, error: artError } = await supabase
      .from('articles')
      .insert([
        {
          title: article.title.es,
          content: article.content.es,
          category: article.category,
          trust_score: article.trustScore,
          slug: article.slug,
          lang: 'es',
          image_url: `https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=800` // Default science image
        },
        {
          title: article.title.en,
          content: article.content.en,
          category: article.category,
          trust_score: article.trustScore,
          slug: article.slug,
          lang: 'en',
          image_url: `https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=800`
        }
      ])
      .select();

    if (artError) throw artError;

    // 3. Insert Study reference linked to the Spanish article (main)
    const spanishArticle = insertedArticles.find(a => a.lang === 'es');
    if (spanishArticle) {
      const { error: studyError } = await supabase
        .from('studies')
        .insert({
          article_id: spanishArticle.id,
          title: article.title.en,
          source_url: article.sourceUrl,
          publish_date: new Date().toISOString()
        });
      
      if (studyError) throw studyError;
    }

    console.log(`Successfully published: ${article.slug}`);
  } catch (error) {
    console.error('Error publishing to Supabase:', error);
  }
}
