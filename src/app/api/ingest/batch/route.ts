import { NextResponse } from 'next/server';
import { PubMedService } from '@/lib/services/pubmed';
import { getSupabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

/**
 * POST /api/ingest/batch
 * Enqueues articles for async processing. Returns immediately without doing AI work.
 * The actual processing is handled by /api/cron/worker (runs every 10 min).
 * Protected by admin_session cookie.
 */
export async function POST(req: Request) {
  // Auth check — only admin can enqueue jobs
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('admin_session')?.value === 'true';
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { query, count } = await req.json();
    // Cap count to prevent resource exhaustion
    const safeCount = Math.min(Math.max(1, count || 5), 50);

    if (!query) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    const pubmed = new PubMedService();
    const supabase = getSupabaseAdmin();

    // 1. Search PubMed for IDs only (fast, no AI)
    console.log(`📥 Enqueuing batch: ${safeCount} articles for "${query}" in both 'es' and 'en'`);
    const ids = await pubmed.searchStudies(query, safeCount);

    if (ids.length === 0) {
      return NextResponse.json({ message: 'No articles found for this query.', queued: 0 });
    }

    // 2. Save two queue jobs (ES and EN) per article ID
    const jobs = ids.flatMap((pmid) => [
      {
        query,
        locale: 'es',
        pubmed_ids: [pmid],
        status: 'pending',
      },
      {
        query,
        locale: 'en',
        pubmed_ids: [pmid],
        status: 'pending',
      }
    ]);

    const { data, error } = await supabase
      .from('ingestion_queue')
      .insert(jobs)
      .select('id');

    if (error) throw error;

    console.log(`✅ Queued ${data.length} jobs for processing (both Spanish and English).`);

    return NextResponse.json({
      message: `${data.length} jobs (Spanish & English versions) added to the processing queue. The worker will process them in the next few minutes.`,
      queued: data.length,
      jobIds: data.map((j: { id: string }) => j.id),
    });

  } catch (error: unknown) {
    console.error('Enqueue error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
