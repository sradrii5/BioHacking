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

  // 0. CLEANUP: Reset any jobs that have been stuck in "processing" for more than 5 minutes
  // This happens if a previous worker execution timed out or crashed
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  await supabase
    .from('ingestion_queue')
    .update({ status: 'pending', error_message: 'Timed out or restarted' })
    .eq('status', 'processing')
    .lt('created_at', fiveMinutesAgo); // Use created_at as a proxy for how long it's been active

  // 1. Pick the oldest pending job (one at a time to avoid timeout)
  const { data: job, error: fetchError } = await supabase
    .from('ingestion_queue')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (fetchError || !job) {
    console.log('📭 [WORKER] No pending jobs in queue.');
    return NextResponse.json({ message: 'No pending jobs.' });
  }

  console.log(`⚙️ [WORKER] Processing job ${job.id} (query: "${job.query}")`);

  // 2. Mark as processing to prevent double-processing by concurrent cron calls
  await supabase
    .from('ingestion_queue')
    .update({ status: 'processing' })
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

    // 5. Transform with AI (this is where the heavy lifting happens)
    const transformed = await transformer.transformStudy(study.abstract, job.locale as any);

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

    console.log(`✅ [WORKER] Job ${job.id} completed: "${transformed.metadata.title}"`);
    return NextResponse.json({
      success: true,
      jobId: job.id,
      article: transformed.metadata.title,
    });

  } catch (error: any) {
    console.error(`❌ [WORKER] Job ${job.id} failed:`, error.message);

    // Mark job as failed so it can be retried or inspected
    await supabase
      .from('ingestion_queue')
      .update({
        status: 'failed',
        error_message: error.message,
        processed_at: new Date().toISOString(),
      })
      .eq('id', job.id);

    return NextResponse.json({
      success: false,
      jobId: job.id,
      error: error.message,
    }, { status: 500 });
  }
}
