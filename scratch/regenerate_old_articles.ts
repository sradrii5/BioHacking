import { createClient } from '@supabase/supabase-js';
import { AITransformerService } from '../src/lib/services/ai-transformer';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function regenerate() {
  const transformer = new AITransformerService();
  const fixDate = new Date('2026-06-04T00:00:00Z').toISOString();

  console.log(`Fetching articles created before ${fixDate} with their studies...`);

  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, created_at, status, study_id, seo_metadata')
    .lt('created_at', fixDate)
    .eq('status', 'published');

  if (error) {
    console.error('Error fetching articles:', error);
    return;
  }

  console.log(`Found ${articles.length} articles to regenerate.`);

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    console.log(`[${i + 1}/${articles.length}] Regenerating: "${article.title}"...`);

    // Fetch raw study details
    const { data: study, error: studyError } = await supabase
      .from('studies')
      .select('*')
      .eq('id', article.study_id)
      .single();

    if (studyError || !study) {
      console.warn(`⚠️ Skipped: Could not find raw study for article: ${article.title}`);
      continue;
    }

    try {
      const locale = (article.seo_metadata?.locale || 'es') as 'es' | 'en';
      
      // Re-map study format for the transformer
      const studyInput = {
        pmid: study.source_url.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/)?.[1] || '',
        title: study.title,
        abstract: study.raw_summary,
        pubDate: study.publish_date,
        url: study.source_url,
        authors: [] as string[],
        firstAuthorLastName: '',
        institution: '',
        journal: '',
        doi: '',
        sampleSizeHint: '',
      };

      // Transform with new prompt
      const transformed = await transformer.transformStudy(studyInput, locale);

      // Update in database
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          title: transformed.metadata.title,
          content_html: transformed.content_html,
          tl_dr: transformed.metadata.tl_dr,
          trust_score: transformed.metadata.trust_score,
          seo_metadata: {
            ...article.seo_metadata,
            category: transformed.metadata.category,
            social: transformed.social,
          }
        })
        .eq('id', article.id);

      if (updateError) {
        console.error(`❌ Error updating database for "${article.title}":`, updateError.message);
      } else {
        console.log(`✅ Regenerated and updated: "${transformed.metadata.title}"`);
      }

    } catch (err: any) {
      console.error(`❌ Failed to regenerate "${article.title}":`, err.message);
    }

    // Throttle to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log('🏁 Regeneration process completed.');
}

regenerate();
