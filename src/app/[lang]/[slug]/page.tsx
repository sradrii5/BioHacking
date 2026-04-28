import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase';
import { ScientificSourceCard } from '@/components/ScientificSourceCard';
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
    <article className="min-h-screen bg-slate-50 pb-20">
      {/* AdSense Top Placeholder */}
      <div className="bg-slate-200 w-full h-24 flex items-center justify-center text-slate-400 text-[10px] uppercase tracking-[0.3em] font-bold">
        {lang === 'es' ? 'Publicidad (AdSense Top Leaderboard)' : 'Advertising (AdSense Top Leaderboard)'}
      </div>

      {/* Hero Section */}
      <header className="bg-white border-b border-slate-200 pt-16 pb-12 shadow-sm">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-2 mb-6">
            <span className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-xs font-black uppercase tracking-widest">
              {dict.common.trust_score}: {article.trust_score}%
            </span>
            <span className="text-slate-400 text-sm font-medium">
              {dict.article.updated}: {new Date(article.created_at).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US')}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight text-balance">
            {article.title}
          </h1>

          {article.tl_dr && (
            <div className="bg-emerald-50 border-l-8 border-emerald-500 p-8 rounded-r-3xl mb-8 shadow-inner">
              <h3 className="text-emerald-800 font-black uppercase tracking-[0.2em] text-[10px] mb-3">{dict.article.executive_summary}</h3>
              <p className="text-emerald-900 text-xl leading-relaxed italic font-medium">
                "{article.tl_dr}"
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Content Section */}
      <main className="container mx-auto px-4 max-w-6xl py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            <div className="bg-white p-8 md:p-16 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
              <div 
                className="prose prose-slate prose-xl max-w-none 
                  prose-headings:text-slate-900 prose-headings:font-black prose-headings:tracking-tight
                  prose-p:text-slate-800 prose-p:leading-[1.8]
                  prose-strong:text-slate-900 prose-strong:font-bold
                  prose-a:text-blue-600 prose-a:font-bold hover:prose-a:text-blue-800
                  prose-ul:list-disc prose-li:text-slate-800"
                dangerouslySetInnerHTML={{ 
                  __html: finalContent 
                }}
              />

              {/* AdSense In-Article Placeholder */}
              <div className="my-16 p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center text-slate-400 text-[10px] uppercase tracking-[0.3em] font-bold h-64 text-center">
                {lang === 'es' ? 'Bloque Publicitario (AdSense In-Article)' : 'Ad Block (AdSense In-Article)'}
              </div>

              {/* Medical Disclaimer */}
              <div className="mt-20 pt-10 border-t border-slate-100 text-slate-400 text-xs leading-relaxed italic bg-slate-50 p-8 rounded-2xl">
                <p className="mb-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">{dict.article.medical_disclaimer_title}</p>
                <p>
                  {dict.article.medical_disclaimer}
                </p>
              </div>
            </div>
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
              <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/30 rounded-full blur-[60px]"></div>
                <h4 className="text-2xl font-black mb-4 relative z-10 tracking-tight leading-tight">{dict.newsletter.title_premium}</h4>
                <p className="text-slate-400 text-sm mb-8 relative z-10 leading-relaxed font-medium">
                  {dict.newsletter.description_premium}
                </p>
                <div className="space-y-4 relative z-10">
                  <input 
                    type="email" 
                    placeholder={dict.newsletter.placeholder} 
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  />
                  <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-900/40 uppercase tracking-widest text-xs">
                    {dict.newsletter.button}
                  </button>
                </div>
              </section>

              {/* AdSense Sidebar Placeholder */}
              <div className="bg-slate-200 w-full h-[600px] rounded-[2.5rem] flex items-center justify-center text-slate-400 text-[10px] uppercase tracking-[0.3em] font-bold text-center p-8 text-balance">
                {lang === 'es' ? 'Publicidad (AdSense Skyscraper)' : 'Advertising (AdSense Skyscraper)'}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </article>
  );
}
