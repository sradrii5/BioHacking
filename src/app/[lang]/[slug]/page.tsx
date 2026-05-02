import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase';
import { ScientificSourceCard } from '@/components/ScientificSourceCard';
import { NewsletterForm } from '@/components/NewsletterForm';
import { AdSenseUnit } from '@/components/AdSenseUnit';
import { AITransformerService } from '@/lib/services/ai-transformer';

import { getDictionary } from '@/lib/dictionaries';

interface Props {
  params: Promise<{
    lang: 'en' | 'es';
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = getSupabaseAdmin();
  const { data: article } = await supabase.from('articles').select('title, tl_dr').eq('slug', slug).single();

  return {
    title: `${article?.title} | Longevity Biohacker`,
    description: article?.tl_dr,
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
            <div className="group relative flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full shadow-2xl">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                {dict.common.trust_score}: <span className="text-blue-500">{article.trust_score}%</span>
              </span>
              <div className="relative flex items-center">
                <button className="w-5 h-5 rounded-full bg-zinc-800 text-[9px] flex items-center justify-center font-black hover:bg-blue-600 transition-colors cursor-help border border-zinc-700">
                  i
                </button>
                {/* Custom Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-left">
                  <p className="text-[9px] text-zinc-400 leading-relaxed font-medium">
                    {lang === 'es'
                      ? 'Nivel de confianza calculado por IA analizando el rigor del estudio, la muestra (n) y el factor de impacto de la fuente científica.'
                      : 'Trust Score calculated by AI analyzing study rigor, sample size (n), and the scientific source impact factor.'}
                  </p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-zinc-800"></div>
                </div>
              </div>
            </div>
            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
              {new Date(article.created_at).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US')}
            </span>
          </div>

          <h1 className="text-4xl md:text-7xl font-black text-white leading-[1.05] mb-12 tracking-tighter text-balance font-heading">
            {article.title}
          </h1>

          {article.tl_dr && (
            <div className="relative group max-w-3xl mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 p-8 md:p-12 rounded-[2.5rem] shadow-2xl">
                <h3 className="text-emerald-500 font-black uppercase tracking-[0.3em] text-[10px] mb-6 flex items-center justify-center gap-3">
                  <span className="w-8 h-[1px] bg-emerald-500/30"></span>
                  {dict.article.executive_summary}
                  <span className="w-8 h-[1px] bg-emerald-500/30"></span>
                </h3>
                <p className="text-zinc-100 text-lg md:text-2xl leading-relaxed italic font-medium">
                  "{article.tl_dr.replace(/<[^>]*>/g, '')}"
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Content Section */}
      <main className="container mx-auto px-4 max-w-7xl py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
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
                }}
              />

              {/* Medical Disclaimer */}
              <div className="mt-24 pt-12 border-t border-zinc-800 text-zinc-500 text-[11px] leading-relaxed italic bg-zinc-950/50 p-8 rounded-[2rem] border border-zinc-800">
                <p className="mb-4 font-black text-zinc-400 uppercase tracking-widest text-[10px]">{dict.article.medical_disclaimer_title}</p>
                <p>
                  {dict.article.medical_disclaimer}
                </p>
              </div>
            </div>

            {/* Newsletter Subscription Section */}
            <NewsletterForm />
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

              {/* Newsletter Premium Card */}
              <NewsletterForm />

              {/* AdSense Sidebar Placeholder */}
              <AdSenseUnit 
                slot="article_sidebar" 
                className="h-[600px]"
              />
            </div>
          </aside>
        </div>
      </main>
    </article>
  );
}
