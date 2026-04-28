import { config } from 'dotenv';
config({ path: '.env.local' });
const { getSupabaseAdmin } = require('../src/lib/supabase');

async function seedContent() {
  const supabase = getSupabaseAdmin();

  const content = [
    {
      study: {
        title: "Magnesium supplementation and sleep quality in older adults: A systematic review",
        source_url: "https://pubmed.ncbi.nlm.nih.gov/33827473/",
        publish_date: "2021-04-01",
        raw_summary: "Systematic review confirming that magnesium improves sleep efficiency and reduces sleep latency."
      },
      article: {
        title: "Guía Definitiva: Por qué el Magnesio es el Rey del Descanso Profundo",
        slug: "guia-magnesio-descanso-profundo",
        tl_dr: "El magnesio no solo relaja tus músculos, sino que regula los neurotransmisores responsables de un sueño reparador.",
        trust_score: 95,
        content_html: "<h2>El Mineral Olvidado</h2><p>En un mundo lleno de estrés y cafeína, el <strong>magnesio</strong> se presenta como el aliado definitivo para el biohacker. Este mineral actúa sobre el sistema nervioso parasimpático...</p><h3>Evidencia Científica</h3><p>Estudios recientes demuestran que la suplementación con citrato de magnesio reduce el cortisol nocturno...</p>",
      }
    },
    {
      study: {
        title: "Intermittent fasting and metabolic health",
        source_url: "https://pubmed.ncbi.nlm.nih.gov/31826367/",
        publish_date: "2019-12-01",
        raw_summary: "Comprehensive review of intermittent fasting's effects on metabolic switching and cellular resistance."
      },
      article: {
        title: "Autofagia y Longevidad: El Poder del Ayuno Intermitente",
        slug: "autofagia-longevidad-ayuno-intermitente",
        tl_dr: "Ayunar no es pasar hambre, es activar el sistema de reciclaje celular de tu propio cuerpo.",
        trust_score: 92,
        content_html: "<h2>Limpieza Celular</h2><p>La autofagia es el proceso por el cual tus células eliminan componentes dañados. El <strong>ayuno</strong> prolongado es el gatillo más potente para este proceso...</p><h3>Beneficios Metabólicos</h3><ul><li>Mejora de la sensibilidad a la insulina</li><li>Reducción de la inflamación sistémica</li><li>Aumento de la claridad mental</li></ul>",
      }
    },
    {
      study: {
        title: "Vitamin D and immune function",
        source_url: "https://pubmed.ncbi.nlm.nih.gov/21527855/",
        publish_date: "2011-05-01",
        raw_summary: "Molecular biology of Vitamin D and its critical role in innate and adaptive immunity."
      },
      article: {
        title: "Vitamina D: Más que una Vitamina, una Hormona Esencial para tu Inmunidad",
        slug: "vitamina-d-inmunidad-hormona",
        tl_dr: "Tener niveles óptimos de Vitamina D es como darle un escudo antibalas a tu sistema inmunológico.",
        trust_score: 88,
        content_html: "<h2>La Hormona del Sol</h2><p>La mayoría de la población vive en déficit crónico de <strong>Vitamina D</strong>. Este compuesto es en realidad una pro-hormona que regula miles de genes...</p><h3>Protocolo de Optimización</h3><p>Para alcanzar niveles terapéuticos, la exposición solar diaria y la suplementación con D3 + K2 son fundamentales...</p>",
      }
    }
  ];

  console.log('Inyectando contenido premium...');

  for (const item of content) {
    // 1. Insert study
    const { data: study, error: sErr } = await supabase.from('studies').upsert(item.study, { onConflict: 'source_url' }).select().single();
    if (sErr) {
      console.error('Error in study:', sErr);
      continue;
    }

    // 2. Insert article
    const { error: aErr } = await supabase.from('articles').upsert({
      ...item.article,
      study_id: study.id,
      status: 'published'
    }, { onConflict: 'slug' });

    if (aErr) console.error('Error in article:', aErr);
  }

  console.log('✅ Base de datos poblada con contenido premium.');
}

seedContent();
