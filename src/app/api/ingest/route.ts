import { NextResponse } from 'next/server';
import { PubMedService } from '@/lib/services/pubmed';
import { AITransformerService, Locale } from '@/lib/services/ai-transformer';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { query = 'longevity', locale = 'es' } = await request.json();
    
    const pubmed = new PubMedService();
    const ai = new AITransformerService();
    const supabase = getSupabaseAdmin();

    // 1. Search PubMed
    console.log(`Searching PubMed for: ${query}`);
    const pmids = await pubmed.searchStudies(query, 1); // Limit to 1 for testing
    console.log(`PMIDs found: ${pmids.join(', ')}`);
    const studies = await pubmed.fetchStudyDetails(pmids);
    console.log(`Studies fetched: ${studies.length}`);

    const results = [];

    for (const study of studies) {
      console.log(`Processing study: ${study.pmid}`);
      // 2. Save raw study to Supabase
      const { data: studyRecord, error: studyError } = await supabase
        .from('studies')
        .upsert({
          title: study.title,
          source_url: study.url,
          publish_date: study.pubDate,
          raw_summary: study.abstract
        }, { onConflict: 'source_url' })
        .select()
        .single();

      if (studyError) {
        console.error(`Error saving study ${study.pmid}:`, studyError);
        continue;
      }

      // 3. AI Transformation (Two-step process)
      console.log(`Transforming study: ${study.title} (${locale})`);
      const transformed = await ai.transformStudy(study, locale as Locale);

      // 4. Save transformed article to Supabase
      const slug = study.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + study.pmid;

      const { data: articleRecord, error: articleError } = await supabase
        .from('articles')
        .upsert({
          study_id: studyRecord.id,
          title: transformed.metadata.title,
          content_html: transformed.content_html,
          slug,
          status: 'published',
          tl_dr: transformed.metadata.tl_dr,
          trust_score: transformed.metadata.trust_score,
          seo_metadata: {
            keywords: transformed.metadata.product_keywords
          }
        }, { onConflict: 'slug' })
        .select()
        .single();

      if (articleError) {
        console.error(`Error saving article for ${study.pmid}:`, articleError);
        continue;
      }

      results.push({
        pmid: study.pmid,
        article_slug: slug,
        trust_score: transformed.metadata.trust_score
      });
    }

    return NextResponse.json({ 
      success: true, 
      processed: results.length,
      details: results
    });

  } catch (error: any) {
    console.error('Ingestion error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}
