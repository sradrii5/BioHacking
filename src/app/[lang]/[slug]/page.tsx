import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase';
import { ScientificSourceCard } from '@/components/ScientificSourceCard';
import { NewsletterForm } from '@/components/NewsletterForm';
import { AdSenseUnit } from '@/components/AdSenseUnit';
import { AITransformerService } from '@/lib/services/ai-transformer';
import { Footer } from '@/components/Footer';
import { TrustScoreTooltip } from '@/components/TrustScoreTooltip';


import { getDictionary } from '@/lib/dictionaries';

interface Props {
  params: Promise<{
    lang: 'en' | 'es';
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props) {
  const { lang, slug } = await params;
  const supabase = getSupabaseAdmin();
  const { data: article } = await supabase.from('articles').select('title, tl_dr').eq('slug', slug).single();

  return {
    title: `${article?.title} | Longevity Biohacker`,
    description: article?.tl_dr,
    alternates: {
      canonical: `/${lang}/${slug}`,
    },
    openGraph: {
      title: article?.title,
      description: article?.tl_dr,
      type: 'article',
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { lang, slug } = await params;
  const dict = await getDictionary(lang);
  const supabase = getSupabaseAdmin();
  const transformer = new AITransformerService();

  // Fetch article, source study AND products for auto-linking
  const [articleRes, productsRes] = await Promise.all([
    supabase
      .from('articles')
      .select(`*, studies (*)`)
      .eq('slug', slug)
      .single(),
    supabase
      .from('products')
      .select('keywords, affiliate_link')
  ]);

  const { data: article, error } = articleRes;
  const { data: products } = productsRes;

  if (error || !article) {
    console.error('Error fetching article:', error);
    return notFound();
  }

  const study = article.studies;
  // Get source URL: 1st from seo_metadata, 2nd from FK join, 3rd fuzzy match in studies table
  let sourceUrl = article.seo_metadata?.source_url || study?.source_url || null;

  if (!sourceUrl) {
    // Fallback: find study by matching the first 40 chars of article title
    const titleSnippet = article.title.substring(0, 40);
    const { data: matchedStudy } = await supabase
      .from('studies')
      .select('source_url')
      .ilike('title', `%${titleSnippet}%`)
      .limit(1)
      .single();
    sourceUrl = matchedStudy?.source_url || null;
  }

  // Clean tl_dr: remove 'tl;dr:' or 'TL;DR:' prefix if present
  const cleanTldr = article.tl_dr
    ? article.tl_dr.replace(/^tl;dr[:\s]*/i, '').replace(/<[^>]*>/g, '').trim()
    : null;

  // Inject affiliate links
  let finalContent = article.content_html.replace(/```html\n?|```\n?/g, '').trim();
  if (products) {
    const productList = products.map((p: any) => ({
      keywords: p.keywords,
      link: p.affiliate_link
    }));
    finalContent = transformer.injectAffiliateLinks(finalContent, productList);
  }

  return (
    <article className="min-h-screen bg-zinc-950 pb-20 text-zinc-50 font-sans">
      {/* Hero Section */}
      <header className="relative pt-12 md:pt-24 pb-16 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-600/10 blur-[120px] rounded-full -z-10"></div>

        <div className="container mx-auto px-4 max-w-4xl text-center">
          {/* Back Button */}
          <Link
            href={`/${lang}`}
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-12 text-[10px] font-black uppercase tracking-[0.3em] group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> {lang === 'es' ? 'Volver al Inicio' : 'Back to Home'}
          </Link>

          <div className="flex items-center justify-center gap-4 mb-8">
            <TrustScoreTooltip 
              score={article.trust_score}
              label={dict.common.trust_score}
              description={lang === 'es'
                ? 'Nivel de confianza calculado por IA analizando el rigor del estudio, la muestra (n) y el factor de impacto de la fuente científica.'
                : 'Trust Score calculated by AI analyzing study rigor, sample size (n), and the scientific source impact factor.'
              }
            />
            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
              {new Date(article.created_at).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US')}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-12 tracking-tighter text-balance font-heading">
            {article.title}
          </h1>

          {cleanTldr && (
            <div className="relative group max-w-3xl mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 p-8 md:p-12 rounded-[2.5rem] shadow-2xl">
                <h3 className="text-emerald-500 font-black uppercase tracking-[0.3em] text-[10px] mb-6 flex items-center justify-center gap-3">
                  <span className="w-8 h-[1px] bg-emerald-500/30"></span>
                  {lang === 'es' ? 'RESUMEN EJECUTIVO' : 'EXECUTIVE SUMMARY'}
                  <span className="w-8 h-[1px] bg-emerald-500/30"></span>
                </h3>
                <p className="text-zinc-100 text-lg md:text-2xl leading-relaxed italic font-medium">
                  &ldquo;{cleanTldr}&rdquo;
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Content Section */}
      <main className="container mx-auto px-4 max-w-7xl py-12">
        <div className="flex flex-col lg:flex-row gap-16 justify-center">
          {/* Main Content */}
          <div className="w-full max-w-4xl space-y-12">
            <div className="bg-zinc-900/50 backdrop-blur-sm p-8 md:p-16 rounded-[3rem] border border-zinc-800/50 shadow-2xl">
              <div
                className="prose prose-invert prose-xl max-w-none 
                  prose-headings:text-white prose-headings:font-black prose-headings:tracking-tighter prose-headings:font-heading
                  prose-p:text-zinc-300 prose-p:leading-[1.8] prose-p:font-medium
                  prose-strong:text-white prose-strong:font-black
                  prose-a:text-blue-400 prose-a:no-underline prose-a:border-b-2 prose-a:border-blue-500/30 hover:prose-a:border-blue-500 transition-all
                  prose-ul:list-disc prose-li:text-zinc-300"
                dangerouslySetInnerHTML={{
                  __html: finalContent
                    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/^\n/gm, '<br/>')
                }}
              />

              {/* Original Source Link */}
              {sourceUrl && (
                <div className="mt-12 flex justify-center">
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-zinc-900 border border-zinc-700 hover:border-blue-500 rounded-2xl text-sm font-bold text-zinc-300 hover:text-white transition-all group"
                  >
                    <span className="text-blue-500">↗</span>
                    {lang === 'es' ? 'Leer estudio original' : 'Read original study'}
                  </a>
                </div>
              )}

              {/* Medical Disclaimer */}
              <div className="mt-24 pt-12 border-t border-zinc-800 text-zinc-500 text-[11px] leading-relaxed italic bg-zinc-950/50 p-8 rounded-[2rem] border border-zinc-800">
                <p className="mb-4 font-black text-zinc-400 uppercase tracking-widest text-[10px]">{dict.article.medical_disclaimer_title}</p>
                <p>
                  {dict.article.medical_disclaimer}
                </p>
              </div>
            </div>

            {/* Newsletter Subscription Section */}
            <NewsletterForm lang={lang} />
          </div>

          {/* Sidebar / Info */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="sticky top-12 space-y-8">
              {study && (
                <section>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4">{dict.article.scientific_evidence}</h4>
                  <ScientificSourceCard
                    title={study.title}
                    sourceUrl={study.source_url}
                    publishDate={study.publish_date}
                    trustScore={article.trust_score}
                    dict={dict.common}
                  />
                </section>
              )}

              {/* Newsletter Premium Card Removed to avoid duplication */}

              {/* AdSense Sidebar Placeholder */}
              <AdSenseUnit 
                slot="article_sidebar" 
                className="h-[600px]"
              />
            </div>
          </aside>
        </div>
      </main>
      <Footer lang={lang} dict={dict} />
    </article>
  );
}
