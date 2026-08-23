import { NextResponse } from 'next/server';
import { PubMedService, PubMedStudy } from '@/lib/services/pubmed';
import { BioRxivService } from '@/lib/services/biorxiv';
import { AITransformerService } from '@/lib/services/ai-transformer';
import { getSupabaseAdmin } from '@/lib/supabase';

// Rotating topics so the daily search isn't always identical.
const HOT_TOPICS = [
  'longevity aging science',
  'autophagy fasting',
  'nootropics cognitive enhancement',
  'peptide therapy longevity',
  'microbiome health aging',
  'sleep quality biohacking',
  'mitochondria dysfunction',
  'hormesis cold heat therapy',
  'senolytic drugs',
];

export const maxDuration = 60;

/**
 * GET /api/cron/bot
 * Called by Vercel Cron once a day. Publishes exactly ONE study per run
 * (as 2 rows: es + en) through the structured ai-transformer.ts pipeline —
 * the old free-form processor.ts/publisher.ts path is no longer used here.
 * (Those files still exist for the manual `npm run bot` script — untouched.)
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const pubmed = new PubMedService();
  const biorxiv = new BioRxivService();
  const transformer = new AITransformerService();

  console.log('🤖 [CRON] Starting daily bot (1 study/day, structured pipeline)...');

  try {
    // 1. Gather a small pool of candidates so we can skip already-published ones
    const topic = HOT_TOPICS[Math.floor(Math.random() * HOT_TOPICS.length)];
    const pmids = await pubmed.searchStudies(topic, 5);
    const pubmedCandidates = await pubmed.fetchStudyDetails(pmids);
    const biorxivCandidates = await biorxiv.fetchRecent(5);

    const candidates: PubMedStudy[] = [
      ...pubmedCandidates,
      ...biorxivCandidates.map((s) => ({
        pmid: '',
        title: s.title,
        abstract: s.abstract,
        pubDate: s.date,
        url: `https://doi.org/${s.doi}`,
        authors: [] as string[],
        firstAuthorLastName: '',
        institution: '',
        journal: 'bioRxiv',
        doi: s.doi,
        sampleSizeHint: '',
      })),
    ];

    console.log(`📡 [CRON] Found ${candidates.length} candidates for topic "${topic}".`);

    for (const study of candidates) {
      const { data: existing } = await supabase
        .from('studies')
        .select('id')
        .eq('source_url', study.url)
        .single();

      if (existing) {
        console.log(`⏭️ [CRON] Already published: ${study.title}`);
        continue;
      }

      console.log(`🧠 [CRON] Processing: "${study.title}"`);

      // 2. Save the raw study once
      const { data: savedStudy, error: studyError } = await supabase
        .from('studies')
        .insert({
          title: study.title,
          source_url: study.url,
          publish_date: study.pubDate,
          raw_summary: study.abstract,
        })
        .select()
        .single();

      if (studyError) throw studyError;

      // 3. Transform both locales concurrently (each is a sequential Groq/Gemini
      // chain on its own, and the two are independent — running them in parallel
      // instead of a sequential loop is what keeps the whole run inside Vercel's
      // 60s function cap on the Hobby plan).
      const published: Record<string, string> = {};
      const locales = ['es', 'en'] as const;
      const transformResults = await Promise.all(
        locales.map((locale) => transformer.transformStudy(study, locale))
      );

      for (let i = 0; i < locales.length; i++) {
        const locale = locales[i];
        const transformed = transformResults[i];
        const slugBase = transformed.metadata.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        const slug = `${slugBase}-${study.pmid || Math.random().toString(36).substring(2, 6)}-${locale}`;

        const { error: articleError } = await supabase.from('articles').insert({
          study_id: savedStudy.id,
          title: transformed.metadata.title,
          content_html: transformed.content_html,
          slug,
          tl_dr: transformed.metadata.tl_dr,
          trust_score: transformed.metadata.trust_score,
          status: 'published',
          cover_image_url: transformed.cover_image_url ?? null,
          cover_image_alt: transformed.cover_image_alt ?? null,
          cover_image_credit: transformed.cover_image_credit ?? null,
          cover_image_credit_url: transformed.cover_image_credit_url ?? null,
          seo_metadata: {
            locale,
            category: transformed.metadata.category,
            social: transformed.social,
            source_url: study.url,
          },
        });

        if (articleError) throw articleError;
        published[locale] = slug;
        console.log(`✅ [CRON] Published [${locale}]: ${slug}`);
      }

      console.log('✅ [CRON] Bot finished. 1 study published in both languages.', published);
      return NextResponse.json({ success: true, processed: 1, articles: published });
    }

    console.log('📭 [CRON] No new unpublished candidates found today.');
    return NextResponse.json({ success: true, processed: 0, message: 'No new candidates found today.' });

  } catch (error: any) {
    console.error('💥 [CRON] Critical error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
