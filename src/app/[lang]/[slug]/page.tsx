import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getSupabaseAdmin } from '@/lib/supabase';
import { ScientificSourceCard } from '@/components/ScientificSourceCard';
import { NewsletterForm } from '@/components/NewsletterForm';
import { AdSenseUnit } from '@/components/AdSenseUnit';
import { AITransformerService } from '@/lib/services/ai-transformer';
import { Footer } from '@/components/Footer';
import { TrustScoreTooltip } from '@/components/TrustScoreTooltip';
import { AuthorBio } from '@/components/AuthorBio';
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
  const { data: article } = await supabase
    .from('articles')
    .select('title, tl_dr, cover_image_url')
    .eq('slug', slug)
    .single();

  const imageUrl = article?.cover_image_url || 'https://www.biohackerage.com/og-image.png';

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
      url: `https://www.biohackerage.com/${lang}/${slug}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article?.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article?.title,
      description: article?.tl_dr,
      images: [imageUrl],
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
  let sourceUrl = article.seo_metadata?.source_url || study?.source_url || null;

  if (!sourceUrl) {
    const titleSnippet = article.title.substring(0, 40);
    const { data: matchedStudy } = await supabase
      .from('studies')
      .select('source_url')
      .ilike('title', `%${titleSnippet}%`)
      .limit(1)
      .single();
    sourceUrl = matchedStudy?.source_url || null;
  }

  // Clean tl_dr
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

  // Schema.org Article JSON-LD
  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: cleanTldr || article.tl_dr,
    image: article.cover_image_url
      ? [article.cover_image_url]
      : ['https://www.biohackerage.com/og-image.png'],
    datePublished: article.created_at,
    dateModified: article.updated_at || article.created_at,
    author: {
      '@type': 'Organization',
      name: 'Biohacker Age Editorial Team',
      url: `https://www.biohackerage.com/${lang}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Biohacker Age',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.biohackerage.com/android-chrome-512x512.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.biohackerage.com/${lang}/${slug}`,
    },
    ...(sourceUrl && {
      citation: {
        '@type': 'ScholarlyArticle',
        url: sourceUrl,
      },
    }),
  };

  return (
    <article className="min-h-screen bg-zinc-950 pb-20 text-zinc-50 font-sans">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
      />

      {/* Hero Section */}
      <header className="relative pt-12 md:pt-24 pb-16 overflow-hidden">
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

      {/* Cover Image — full width between hero and content */}
      {article.cover_image_url && (
        <div className="container mx-auto px-4 max-w-5xl mb-0 -mt-4">
          <div className="relative w-full aspect-[21/9] overflow-hidden rounded-[2rem] shadow-2xl border border-zinc-800">
            <Image
              src={article.cover_image_url}
              alt={article.cover_image_alt || article.title}
              fill
              sizes="(max-width: 768px) 100vw, 80vw"
              className="object-cover"
              priority
            />
            {/* Unsplash attribution (required by Unsplash ToS) */}
            {article.cover_image_credit && (
              <a
                href={article.cover_image_credit_url || 'https://unsplash.com?utm_source=biohackerage&utm_medium=referral'}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="absolute bottom-3 right-3 text-[9px] text-white/50 hover:text-white/80 transition-colors bg-zinc-950/60 px-2 py-1 rounded-full backdrop-blur-sm"
              >
                📷 {article.cover_image_credit} / Unsplash
              </a>
            )}
          </div>
        </div>
      )}

      {/* Content Section */}
      <main className="container mx-auto px-4 max-w-[1600px] py-12">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 lg:gap-16">

          {/* Spacer for XL */}
          <div className="hidden xl:block xl:col-span-2"></div>

          {/* Main Content Area */}
          <div className="xl:col-span-7 space-y-12">
            <div className="bg-zinc-900/50 backdrop-blur-sm p-8 md:p-16 rounded-[3rem] border border-zinc-800/50 shadow-2xl">

              {/* Author Bio — E-E-A-T */}
              <AuthorBio lang={lang} />

              <div
                className="prose prose-invert prose-xl max-w-none
                  prose-headings:text-white prose-headings:font-black prose-headings:tracking-tighter prose-headings:font-heading
                  prose-p:text-zinc-300 prose-p:leading-[1.8] prose-p:font-medium
                  prose-strong:text-white prose-strong:font-black
                  prose-a:text-blue-400 prose-a:no-underline prose-a:border-b-2 prose-a:border-blue-500/30 hover:prose-a:border-blue-500 transition-all
                  prose-ul:list-disc prose-li:text-zinc-300"
                dangerouslySetInnerHTML={{
                  __html: finalContent
                    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/__(.*?)__/g, '<strong>$1</strong>')
                    .replace(/^\- (.*$)/gim, '<li>$1</li>')
                    .replace(/\n\n/g, '</p><p>')
                    .replace(/\n/g, '<br/>')
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

            {/* Newsletter */}
            <NewsletterForm lang={lang} />
          </div>

          {/* Sidebar */}
          <aside className="xl:col-span-3 space-y-8">
            <div className="xl:sticky xl:top-12 space-y-8">
              <section>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4">{dict.article.scientific_evidence}</h4>
                <ScientificSourceCard
                  title={study?.title || article.title}
                  sourceUrl={sourceUrl || '#'}
                  publishDate={study?.publish_date || article.created_at}
                  trustScore={article.trust_score}
                  dict={dict.common}
                />
              </section>

              {/* AdSense Sidebar */}
              <AdSenseUnit
                slot="article_sidebar"
                className="h-[300px] xl:h-[600px]"
              />
            </div>
          </aside>
        </div>
      </main>
      <Footer lang={lang} dict={dict} />
    </article>
  );
}
