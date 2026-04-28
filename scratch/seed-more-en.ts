import { config } from 'dotenv';
config({ path: '.env.local' });
const { getSupabaseAdmin } = require('../src/lib/supabase');

async function seedMoreEnglish() {
  const supabase = getSupabaseAdmin();

  // We need to make sure studies exist for these
  const studies = [
    { title: "Spermidine and longevity in humans", source_url: "https://pubmed.ncbi.nlm.nih.gov/30310830/", publish_date: "2018-10-01", raw_summary: "Clinical evidence for spermidine in longevity." },
    { title: "Health effects of cold water immersion", source_url: "https://pubmed.ncbi.nlm.nih.gov/36133814/", publish_date: "2022-09-01", raw_summary: "Benefits of cold exposure." },
    { title: "Resveratrol and sirtuins mechanism", source_url: "https://pubmed.ncbi.nlm.nih.gov/23473998/", publish_date: "2013-03-01", raw_summary: "Molecular biology of resveratrol." }
  ];

  const articles = [
    {
      study_idx: 0,
      article: {
        title: "Spermidine: The Natural Compound That Recycles Your Cells",
        slug: "spermidine-autophagy-human-health",
        tl_dr: "Found in aged cheese and wheat germ, spermidine is a potent autophagy inducer that mimics the effects of fasting.",
        trust_score: 91,
        content_html: "<h2>The Power of Spermidine</h2><p>Spermidine is a polyamine that plays a critical role in cellular survival...</p>",
        seo_metadata: { locale: 'en' },
        status: 'published'
      }
    },
    {
      study_idx: 1,
      article: {
        title: "Cold Exposure: Why the 'Cold Plunge' is the Ultimate Biohack",
        slug: "cold-plunge-hormesis-benefits",
        tl_dr: "Short exposure to cold water triggers hormetic stress, boosting dopamine and brown fat activation.",
        trust_score: 89,
        content_html: "<h2>Hormetic Stress</h2><p>Cold water immersion is not just about willpower. It's a physiological reset...</p>",
        seo_metadata: { locale: 'en' },
        status: 'published'
      }
    },
    {
      study_idx: 2,
      article: {
        title: "Resveratrol: Activating the Longevity Genes (Sirtuins)",
        slug: "resveratrol-sirtuins-longevity-science",
        tl_dr: "Red wine's secret molecule might be the key to slowing down the molecular clock of aging.",
        trust_score: 87,
        content_html: "<h2>Sirtuin Activation</h2><p>Resveratrol acts as a sirtuin activator, mimicking caloric restriction at a cellular level...</p>",
        seo_metadata: { locale: 'en' },
        status: 'published'
      }
    }
  ];

  for (const s of studies) {
    await supabase.from('studies').upsert(s, { onConflict: 'source_url' });
  }

  for (const item of articles) {
    const { data: study } = await supabase.from('studies').select('id').eq('source_url', studies[item.study_idx].source_url).single();
    if (study) {
      await supabase.from('articles').upsert({
        ...item.article,
        study_id: study.id
      }, { onConflict: 'slug' });
    }
  }

  console.log('✅ Más contenido en inglés inyectado.');
}

seedMoreEnglish();
