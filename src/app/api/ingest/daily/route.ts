import { NextResponse } from 'next/server';
import { PubMedService } from '@/lib/services/pubmed';
import { BioRxivService } from '@/lib/services/biorxiv';
import { AITransformerService } from '@/lib/services/ai-transformer';
import { getSupabaseAdmin } from '@/lib/supabase';

// Topics to monitor daily
const HOT_TOPICS = [
  'longevity aging science',
  'autophagy fasting',
  'nootropics cognitive enhancement',
  'peptide therapy longevity',
  'microbiome health aging',
  'sleep quality biohacking',
  'mitochondria dysfunction',
  'hormesis cold heat therapy',
  'senolytic drugs'
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const pubmed = new PubMedService();
    const biorxiv = new BioRxivService();
    const transformer = new AITransformerService();
    const supabase = getSupabaseAdmin();

    const results = [];

    // 1. Fetch 2 from PubMed
    const topic = HOT_TOPICS[Math.floor(Math.random() * HOT_TOPICS.length)];
    const pIds = await pubmed.searchStudies(topic, 2);
    const pStudies = await pubmed.fetchStudyDetails(pIds);

    // 2. Fetch 2 from bioRxiv (pre-prints)
    const bStudies = await biorxiv.fetchRecent(2);

    // Map PubMed studies (fully enriched) and bioRxiv studies (minimal shape) into a unified array
    const allStudies = [
      ...pStudies, // Already PubMedStudy with full enrichment
      ...bStudies.map(s => ({
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

    for (const study of allStudies) {
      try {
        const { data: existing } = await supabase.from('studies').select('id').eq('source_url', study.url).single();
        if (existing) continue;

        const transformed = await transformer.transformStudy(study, 'es');
        const slugBase = transformed.metadata.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        await supabase.from('articles').insert({
          study_id: (await supabase.from('studies').insert({
            title: study.title,
            source_url: study.url,
            publish_date: study.pubDate,
            raw_summary: study.abstract
          }).select().single()).data.id,
          title: transformed.metadata.title,
          content_html: transformed.content_html,
          slug: `${slugBase}-${Math.random().toString(36).substring(2, 4)}`,
          tl_dr: transformed.metadata.tl_dr,
          trust_score: transformed.metadata.trust_score,
          status: 'published',
          seo_metadata: { 
            locale: 'es',
            category: transformed.metadata.category,
            social: transformed.social,
            source_type: study.journal || 'PubMed' 
          }
        });

        results.push({ title: transformed.metadata.title, type: study.journal || 'PubMed' });
      } catch (e) {
        console.error(`Error ingesting ${study.title}:`, e);
      }
    }

    return NextResponse.json({ 
      message: 'Hybrid daily automation complete', 
      processed: results 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
