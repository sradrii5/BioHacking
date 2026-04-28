import { NextResponse } from 'next/server';
import { PubMedService } from '@/lib/services/pubmed';
import { AITransformerService } from '@/lib/services/ai-transformer';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { query, count = 5, locale = 'es' } = await req.json();
    const pubmed = new PubMedService();
    const transformer = new AITransformerService();
    const supabase = getSupabaseAdmin();

    console.log(`🚀 Starting batch ingestion: ${count} articles for "${query}" in ${locale}`);

    const ids = await pubmed.searchStudies(query, count);
    const studies = await pubmed.fetchStudyDetails(ids);
    const results = [];

    for (const study of studies) {
      try {
        console.log(`Processing study: ${study.title}`);
        
        // 1. Save study
        const { data: savedStudy, error: sErr } = await supabase
          .from('studies')
          .upsert({
            title: study.title,
            source_url: study.url,
            publish_date: study.pubDate,
            raw_summary: study.abstract
          }, { onConflict: 'source_url' })
          .select()
          .single();

        if (sErr) throw sErr;

        // 2. Transform with AI
        const transformed = await transformer.transformStudy(study.abstract, locale as any);

        // 3. Save Article
        const slug = transformed.metadata.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        const { data: article, error: aErr } = await supabase
          .from('articles')
          .upsert({
            study_id: savedStudy.id,
            title: transformed.metadata.title,
            content_html: transformed.content_html,
            slug: `${slug}-${Math.random().toString(36).substring(2, 5)}`,
            tl_dr: transformed.metadata.tl_dr,
            trust_score: transformed.metadata.trust_score,
            status: 'published',
            seo_metadata: { 
              locale,
              social: transformed.social
            }
          }, { onConflict: 'slug' })
          .select()
          .single();

        if (aErr) throw aErr;

        results.push({ title: transformed.metadata.title, status: 'success' });
      } catch (err: any) {
        console.error(`❌ Failed to process study:`, err.message);
        results.push({ title: study.title, status: 'error', error: err.message });
      }
    }

    return NextResponse.json({ 
      message: 'Batch processing complete', 
      results 
    });

  } catch (error: any) {
    console.error('Batch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
