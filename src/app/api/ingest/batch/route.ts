import { NextResponse } from 'next/server';
import { PubMedService } from '@/lib/services/pubmed';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/ingest/batch
 * Enqueues articles for async processing. Returns immediately without doing AI work.
 * The actual processing is handled by /api/cron/worker (runs every 10 min).
 */
export async function POST(req: Request) {
  try {
    const { query, count = 5, locale = 'es' } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    const pubmed = new PubMedService();
    const supabase = getSupabaseAdmin();

    // 1. Search PubMed for IDs only (fast, no AI)
    console.log(`📥 Enqueuing batch: ${count} articles for "${query}" in ${locale}`);
    const ids = await pubmed.searchStudies(query, count);

    if (ids.length === 0) {
      return NextResponse.json({ message: 'No articles found for this query.', queued: 0 });
    }

    // 2. Save one queue job per article ID
    const jobs = ids.map((pmid) => ({
      query,
      locale,
      pubmed_ids: [pmid],
      status: 'pending',
    }));

    const { data, error } = await supabase
      .from('ingestion_queue')
      .insert(jobs)
      .select('id');

    if (error) throw error;

    console.log(`✅ Queued ${data.length} jobs for processing.`);

    return NextResponse.json({
      message: `${data.length} articles added to the processing queue. The worker will process them in the next few minutes.`,
      queued: data.length,
      jobIds: data.map((j: any) => j.id),
    });

  } catch (error: any) {
    console.error('Enqueue error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
