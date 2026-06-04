import { NextResponse } from 'next/server';
import { PubMedService } from '@/lib/services/pubmed';
import { AITransformerService } from '@/lib/services/ai-transformer';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/cron/worker
 * Processes ONE pending item from ingestion_queue.
 * Called by Vercel Cron every 10 minutes.
 * Protected by CRON_SECRET header.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const startTime = Date.now();
  const MAX_DURATION = 240000; // 240 seconds (leaving 60s buffer for Vercel's 300s limit)
  let processedCount = 0;
  let lastProcessedTitle = '';

  console.log('🚀 [WORKER] Starting batch processing session...');

  // 0. CLEANUP: Reset any jobs that have been stuck in "processing" for more than 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  await supabase
    .from('ingestion_queue')
    .update({ status: 'pending', error_message: 'Timed out or restarted' })
    .eq('status', 'processing')
    .lt('created_at', fiveMinutesAgo);

  // 0b. CLEANUP: Delete completed jobs older than 5 minutes to keep the queue clean
  const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  await supabase
    .from('ingestion_queue')
    .delete()
    .eq('status', 'done')
    .lt('processed_at', fiveMinsAgo);

  // LOOP: Process items while we have time and there are pending items
  while (Date.now() - startTime < MAX_DURATION) {
    // 1. Pick the oldest pending job
    const { data: job, error: fetchError } = await supabase
      .from('ingestion_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (fetchError || !job) {
      console.log(`📭 [WORKER] Queue empty. Total processed in this run: ${processedCount}`);
      break;
    }

    console.log(`⚙️ [WORKER] Processing job ${job.id} (query: "${job.query}")`);

    // 2. Mark as processing
    await supabase
      .from('ingestion_queue')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', job.id);

    try {
      const pubmed = new PubMedService();
      const transformer = new AITransformerService();

      // 3. Fetch article details from PubMed
      const studies = await pubmed.fetchStudyDetails(job.pubmed_ids);
      if (!studies || studies.length === 0) {
        throw new Error(`PubMed returned no details for IDs: ${job.pubmed_ids.join(', ')}`);
      }

      const study = studies[0];
      console.log(`📄 [WORKER] Processing study: "${study.title}"`);

      // 4. Save raw study
      const { data: savedStudy, error: studyError } = await supabase
        .from('studies')
        .upsert({
          title: study.title,
          source_url: study.url,
          publish_date: study.pubDate,
          raw_summary: study.abstract,
        }, { onConflict: 'source_url' })
        .select()
        .single();

      if (studyError) throw studyError;

      // 5. Transform with AI (Groq first, then Gemini)
      // Pass the full enriched study object so the LLM has access to authors,
      // institution, journal, DOI, and sample size for high-quality generation.
      const transformed = await transformer.transformStudy(study, job.locale as any);

      // 6. Save article
      const slug = transformed.metadata.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { error: articleError } = await supabase
        .from('articles')
        .upsert({
          study_id: savedStudy.id,
          title: transformed.metadata.title,
          content_html: transformed.content_html,
          slug: `${slug}-${study.pmid}`,
          tl_dr: transformed.metadata.tl_dr,
          trust_score: transformed.metadata.trust_score,
          status: 'published',
          seo_metadata: {
            locale: job.locale,
            category: transformed.metadata.category,
            social: transformed.social,
          },
        }, { onConflict: 'slug' });

      if (articleError) throw articleError;

      // 7. Mark job as done
      await supabase
        .from('ingestion_queue')
        .update({ status: 'done', processed_at: new Date().toISOString() })
        .eq('id', job.id);

      console.log(`✅ [WORKER] Completed: "${transformed.metadata.title}"`);
      processedCount++;
      lastProcessedTitle = transformed.metadata.title;

    } catch (error: any) {
      console.error(`❌ [WORKER] Job ${job.id} failed:`, error.message);

      if (error.status === 429) {
        await supabase
          .from('ingestion_queue')
          .update({
            status: 'pending',
            error_message: 'Rate limited by AI engine. Retrying later...',
            updated_at: new Date().toISOString(),
          })
          .eq('id', job.id);
        
        console.log('🛑 [WORKER] Rate limit hit. Stopping this session to avoid errors.');
        break; // Stop loop and return current progress
      }

      await supabase
        .from('ingestion_queue')
        .update({
          status: 'failed',
          error_message: error.message,
          processed_at: new Date().toISOString(),
        })
        .eq('id', job.id);
      
      // Continue to next job even if one failed
    }
  }

  return NextResponse.json({
    success: true,
    processed: processedCount,
    lastArticle: lastProcessedTitle,
    timeElapsed: `${(Date.now() - startTime) / 1000}s`
  });
}
