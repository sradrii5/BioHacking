import Link from 'next/link';
import { getDictionary } from '@/lib/dictionaries';
import { Footer } from '@/components/Footer';

export async function generateMetadata({ params }: { params: Promise<{ lang: 'en' | 'es' }> }) {
  const { lang } = await params;
  return {
    title: lang === 'es'
      ? 'Sobre Nosotros | Biohacker Age'
      : 'About Us | Biohacker Age',
    description: lang === 'es'
      ? 'Conoce la misión de Biohacker Age: llevar la investigación científica sobre longevidad y optimización biológica a un público amplio.'
      : 'Learn about the mission of Biohacker Age: bringing longevity and biological optimization research to a broad audience.',
  };
}

export default async function AboutPage({ params }: { params: Promise<{ lang: 'en' | 'es' }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans">
      {/* Nav */}
      <nav className="bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800 h-20 flex items-center shrink-0">
        <div className="container mx-auto px-4">
          <Link href={`/${lang}`} className="text-xl font-black tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs">LB</div>
            LONGEVITY<span className="text-blue-500">BIOHACKER</span>
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero */}
        <section className="py-24 md:py-32 border-b border-zinc-900">
          <div className="container mx-auto px-4 max-w-4xl">
            <Link
              href={`/${lang}`}
              className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-12 text-[10px] font-black uppercase tracking-[0.3em] group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              {dict.legal.back_to_home}
            </Link>

            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-blue-400 text-xs font-black uppercase tracking-widest">
                {lang === 'es' ? 'Nuestra Misión' : 'Our Mission'}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-none mb-8 tracking-tighter">
              {lang === 'es' ? (
                <>Ciencia aplicada.<br /><span className="text-blue-500">Sin filtros.</span></>
              ) : (
                <>Applied science.<br /><span className="text-blue-500">No fluff.</span></>
              )}
            </h1>

            <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl">
              {lang === 'es'
                ? 'Biohacker Age nació de una frustración: la investigación científica más relevante sobre longevidad y rendimiento humano llega tarde, mal traducida o directamente no llega al público general.'
                : 'Biohacker Age was born from a frustration: the most relevant scientific research on longevity and human performance arrives late, poorly translated, or simply never reaches the general public.'}
            </p>
          </div>
        </section>

        {/* Who's behind this — real authorship, not "Editorial Team" */}
        <section className="py-20 border-b border-zinc-900">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex flex-col md:flex-row gap-8 items-start bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 md:p-12">
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl">
                AC
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter mb-4">
                  {lang === 'es' ? 'Quién hay detrás' : 'Who is behind this'}
                </h2>
                <p className="text-zinc-400 leading-relaxed mb-4">
                  {lang === 'es'
                    ? 'Adrian Castro creó Biohacker Age para tener un sitio donde seguir de cerca la investigación en longevidad y optimización biológica sin depender de titulares sensacionalistas.'
                    : 'Adrian Castro created Biohacker Age to have a place to closely follow longevity and biological optimization research without relying on sensationalist headlines.'}
                </p>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  {lang === 'es'
                    ? 'El contenido se elabora con asistencia de IA a partir de literatura científica publicada (PubMed, bioRxiv) y se revisa editorialmente antes de publicarse. Ningún artículo sale sin pasar por esa revisión.'
                    : 'Content is produced with AI assistance from published scientific literature (PubMed, bioRxiv) and is editorially reviewed before publishing. No article goes live without that review.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What we do */}
        <section className="py-20 border-b border-zinc-900">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-12">
              {lang === 'es' ? 'Qué hacemos' : 'What we do'}
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🔬',
                  titleEs: 'Rastreamos la ciencia',
                  titleEn: 'We track the science',
                  descEs: 'Monitorizamos bases de datos académicas como PubMed y bioRxiv para identificar investigaciones relevantes en longevidad, neurociencia, nutrición y rendimiento físico.',
                  descEn: 'We monitor academic databases like PubMed and bioRxiv to identify relevant research in longevity, neuroscience, nutrition, and physical performance.',
                },
                {
                  icon: '🧠',
                  titleEs: 'Analizamos con rigor',
                  titleEn: 'We analyze rigorously',
                  descEs: 'Cada artículo incluye la metodología del estudio, los investigadores responsables, los datos concretos y las limitaciones. Sin interpretaciones infundadas.',
                  descEn: 'Each article includes the study methodology, responsible researchers, concrete data, and limitations. No unfounded interpretations.',
                },
                {
                  icon: '⚡',
                  titleEs: 'Publicamos lo accionable',
                  titleEn: "We publish what's actionable",
                  descEs: 'La divulgación tiene valor real cuando el lector puede hacer algo con ella. Incluimos protocolos prácticos basados en los hallazgos del estudio.',
                  descEn: 'Science communication has real value when the reader can do something with it. We include practical protocols based on study findings.',
                },
              ].map((item) => (
                <div key={item.icon} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                  <div className="text-4xl mb-6">{item.icon}</div>
                  <h3 className="text-lg font-black text-white mb-4 tracking-tight">
                    {lang === 'es' ? item.titleEs : item.titleEn}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {lang === 'es' ? item.descEs : item.descEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Editorial standards */}
        <section className="py-20 border-b border-zinc-900">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-6">
              {lang === 'es' ? 'Nuestros estándares editoriales' : 'Our editorial standards'}
            </h2>
            <p className="text-zinc-400 mb-12 max-w-2xl">
              {lang === 'es'
                ? 'La credibilidad es el activo más valioso de una publicación científica. Estos son los principios que guían cada artículo publicado en Biohacker Age:'
                : 'Credibility is the most valuable asset of a science publication. These are the principles that guide every article published on Biohacker Age:'}
            </p>

            <div className="space-y-6">
              {[
                {
                  numeral: '01',
                  titleEs: 'Fuentes primarias verificables',
                  titleEn: 'Verifiable primary sources',
                  descEs: 'Todo artículo enlaza directamente al estudio original en PubMed u otro repositorio académico. El lector puede verificar cada afirmación en la fuente.',
                  descEn: 'Every article links directly to the original study on PubMed or another academic repository. The reader can verify every claim at the source.',
                },
                {
                  numeral: '02',
                  titleEs: 'Datos concretos, no generalizaciones',
                  titleEn: 'Concrete data, not generalizations',
                  descEs: 'Citamos tamaños muestrales, valores p, efectos medidos y metodologías específicas. "Los investigadores encontraron mejoras significativas" no es suficiente.',
                  descEn: 'We cite sample sizes, p-values, measured effects, and specific methodologies. "Researchers found significant improvements" is not enough.',
                },
                {
                  numeral: '03',
                  titleEs: 'Limitaciones incluidas',
                  titleEn: 'Limitations included',
                  descEs: 'Cada análisis incluye una sección de limitaciones del estudio. La ciencia honesta reconoce lo que aún no sabe.',
                  descEn: 'Every analysis includes a study limitations section. Honest science acknowledges what it doesn\'t yet know.',
                },
                {
                  numeral: '04',
                  titleEs: 'Sin conflictos de interés editoriales',
                  titleEn: 'No editorial conflicts of interest',
                  descEs: 'Los ingresos publicitarios y de afiliados no influyen en la selección de estudios ni en las conclusiones editoriales. La publicidad se identifica claramente.',
                  descEn: 'Advertising and affiliate revenue does not influence study selection or editorial conclusions. Advertising is clearly identified.',
                },
              ].map((item) => (
                <div key={item.numeral} className="flex gap-8 items-start border border-zinc-800 rounded-2xl p-8 bg-zinc-900/30">
                  <div className="text-3xl font-black text-zinc-700 shrink-0 font-mono">{item.numeral}</div>
                  <div>
                    <h3 className="text-lg font-black text-white mb-2 tracking-tight">
                      {lang === 'es' ? item.titleEs : item.titleEn}
                    </h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      {lang === 'es' ? item.descEs : item.descEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Topics covered */}
        <section className="py-20 border-b border-zinc-900">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-12">
              {lang === 'es' ? 'Áreas de cobertura' : 'Areas of coverage'}
            </h2>
            <div className="flex flex-wrap gap-3">
              {[
                lang === 'es' ? 'Senescencia celular' : 'Cellular senescence',
                lang === 'es' ? 'Autofagia y ayuno' : 'Autophagy & fasting',
                lang === 'es' ? 'Suplementación basada en evidencia' : 'Evidence-based supplementation',
                lang === 'es' ? 'Optimización del sueño' : 'Sleep optimization',
                lang === 'es' ? 'Función mitocondrial' : 'Mitochondrial function',
                lang === 'es' ? 'Nootrópicos y cognición' : 'Nootropics & cognition',
                lang === 'es' ? 'Ejercicio y longevidad' : 'Exercise & longevity',
                lang === 'es' ? 'Microbioma intestinal' : 'Gut microbiome',
                lang === 'es' ? 'Cronobiología' : 'Chronobiology',
                lang === 'es' ? 'Epigenética' : 'Epigenetics',
                lang === 'es' ? 'Péptidos y factores de crecimiento' : 'Peptides & growth factors',
                lang === 'es' ? 'Metabolismo y composición corporal' : 'Metabolism & body composition',
              ].map((topic) => (
                <span key={topic} className="bg-zinc-900 border border-zinc-700 rounded-full px-4 py-2 text-sm text-zinc-300 font-medium">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-6">
              {lang === 'es' ? '¿Preguntas o sugerencias?' : 'Questions or suggestions?'}
            </h2>
            <p className="text-zinc-400 mb-10 max-w-lg mx-auto">
              {lang === 'es'
                ? 'Si eres investigador, quieres proponer un estudio para análisis, o simplemente tienes una pregunta, escríbenos.'
                : 'If you\'re a researcher, want to suggest a study for analysis, or simply have a question, reach out.'}
            </p>
            <Link
              href={`/${lang}/contact`}
              className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-xl transition-all duration-200 hover:scale-105 text-sm uppercase tracking-widest"
            >
              {lang === 'es' ? 'Contactar' : 'Contact us'}
              <span>→</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer lang={lang} dict={dict} />
    </div>
  );
}
