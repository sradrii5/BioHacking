import { config } from 'dotenv';
config({ path: '.env.local' });
const { getSupabaseAdmin } = require('../src/lib/supabase');

async function seedEnglishContent() {
  const supabase = getSupabaseAdmin();

  const content = [
    {
      study_source_url: "https://pubmed.ncbi.nlm.nih.gov/33827473/",
      article: {
        title: "Ultimate Guide: Why Magnesium is the King of Deep Rest",
        slug: "guide-magnesium-deep-rest",
        tl_dr: "Magnesium doesn't just relax your muscles; it regulates the neurotransmitters responsible for restorative sleep.",
        trust_score: 95,
        content_html: "<h2>The Forgotten Mineral</h2><p>In a world full of stress and caffeine, <strong>magnesium</strong> stands as the ultimate biohacker's ally. This mineral acts on the parasympathetic nervous system...</p><h3>Scientific Evidence</h3><p>Recent studies show that magnesium citrate supplementation reduces nocturnal cortisol...</p>",
        seo_metadata: { locale: 'en' },
        status: 'published'
      }
    },
    {
      study_source_url: "https://pubmed.ncbi.nlm.nih.gov/31826367/",
      article: {
        title: "Autophagy and Longevity: The Power of Intermittent Fasting",
        slug: "autophagy-longevity-intermittent-fasting",
        tl_dr: "Fasting isn't about being hungry; it's about activating your body's cellular recycling system.",
        trust_score: 92,
        content_html: "<h2>Cellular Cleanup</h2><p>Autophagy is the process by which your cells remove damaged components. Prolonged <strong>fasting</strong> is the most potent trigger for this process...</p><h3>Metabolic Benefits</h3><ul><li>Improved insulin sensitivity</li><li>Reduction in systemic inflammation</li><li>Increased mental clarity</li></ul>",
        seo_metadata: { locale: 'en' },
        status: 'published'
      }
    }
  ];

  console.log('Inyectando contenido en INGLÉS vía JSON Meta...');

  for (const item of content) {
    const { data: study } = await supabase.from('studies').select('id').eq('source_url', item.study_source_url).single();
    
    if (study) {
      const { error: aErr } = await supabase.from('articles').upsert({
        ...item.article,
        study_id: study.id
      }, { onConflict: 'slug' });

      if (aErr) console.error('Error in article:', aErr);
    }
  }

  console.log('✅ Base de datos poblada con contenido en inglés.');
}

seedEnglishContent();
