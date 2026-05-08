import { createClient } from '@supabase/supabase-js';
import { ProcessedArticle } from './processor';

let supabaseInstance: any = null;

const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials (URL and Service Key) are missing in environment variables.');
  }

  supabaseInstance = createClient(supabaseUrl, supabaseServiceKey);
  return supabaseInstance;
};

export async function isAlreadyPublished(sourceUrl: string, title: string): Promise<boolean> {
  const supabase = getSupabase();
  const normalizedUrl = sourceUrl.replace(/\/$/, '');
  
  // 1. Check by URL in studies
  const { data: study } = await supabase
    .from('studies')
    .select('id')
    .or(`source_url.eq.${normalizedUrl},source_url.eq.${normalizedUrl}/`)
    .single();
  
  if (study) return true;

  // 2. Check by Title in articles (to catch partial inserts)
  const { data: article } = await supabase
    .from('articles')
    .select('id')
    .ilike('title', `%${title.substring(0, 50)}%`) // Partial match of first 50 chars
    .limit(1);

  return !!article && article.length > 0;
}

export async function publishArticle(article: ProcessedArticle) {
  const supabase = getSupabase();
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

    // 2. Upsert Articles (ES and EN)
    const { data: insertedArticles, error: artError } = await supabase
      .from('articles')
      .upsert([
        {
          title: article.title.es,
          tl_dr: article.tldr.es,
          content_html: article.content.es,
          trust_score: article.trustScore,
          slug: article.slug.es,
          status: 'published',
          seo_metadata: {
            locale: 'es',
            category: article.category,
            keywords: ['biohacking', 'longevity', article.category],
            source_url: article.sourceUrl,
            social: article.social.es
          }
        },
        {
          title: article.title.en,
          tl_dr: article.tldr.en,
          content_html: article.content.en,
          trust_score: article.trustScore,
          slug: article.slug.en,
          status: 'published',
          seo_metadata: {
            locale: 'en',
            category: article.category,
            keywords: ['biohacking', 'longevity', article.category],
            source_url: article.sourceUrl,
            social: article.social.en
          }
        }
      ], { onConflict: 'slug' })
      .select();

    if (artError) throw artError;

    // 3. Insert Study reference linked to the Spanish article (main)
    const spanishArticle = (insertedArticles as any[]).find((a: any) => a.seo_metadata?.locale === 'es');
    if (spanishArticle) {
      const { error: studyError } = await supabase
        .from('studies')
        .insert({
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
