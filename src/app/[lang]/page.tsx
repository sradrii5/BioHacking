import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getDictionary } from '@/lib/dictionaries';
import NewsletterForm from '@/components/NewsletterForm';
import { AdSenseUnit } from '@/components/AdSenseUnit';
import Footer from '@/components/Footer';

const ARTICLES_PER_PAGE = 16;

interface Props {
  params: Promise<{ lang: 'en' | 'es' }>;
  searchParams: Promise<{ cat?: string; page?: string }>;
}

export default async function Home({ params, searchParams }: Props) {
  const { lang } = await params;
  const { cat, page } = await searchParams;
  const dict = await getDictionary(lang);
  const supabase = getSupabaseAdmin();
  const currentPage = Math.max(1, parseInt(page || '1', 10));
  const offset = (currentPage - 1) * ARTICLES_PER_PAGE;

  // 1. Fetch articles with pagination
  let query = supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .eq('seo_metadata->>locale', lang);

  if (cat && cat !== 'Recomendaciones') {
    query = query.eq('seo_metadata->>category', cat);
  }

  const { data: articles, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + ARTICLES_PER_PAGE);

  // Translation mapping for categories
  const categoryDisplayNames: Record<string, string> = {
    'Protocolos': dict.nav.protocols,
    'Recomendaciones': dict.nav.supplements,
    'Ciencia': dict.nav.science
  };

  const displayCat = cat ? (categoryDisplayNames[cat] || cat) : null;

  // 2. Fetch products if category is Recomendaciones
  const { data: products } = cat === 'Recomendaciones'
    ? await supabase.from('products').select('*').eq('lang', lang).limit(24)
    : { data: null };

  if (error) {
    console.error('Error fetching articles:', error);
    return <div className="p-20 text-center">{lang === 'es' ? 'Error cargando artículos.' : 'Error loading articles.'}</div>;
  }

  const featuredArticle = currentPage === 1 && !cat ? articles?.[0] : null;
  const remainingArticles = featuredArticle ? articles?.slice(1) : articles;
  const hasMore = (articles?.length ?? 0) >= ARTICLES_PER_PAGE;

  // Helper to identify gadgets
  const isGadget = (name: string) => name.toLowerCase().match(/band|gtr|gafas|glasses|manta|sauna|reloj|watch/);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Navigation */}
      <nav className="bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between max-w-7xl">
          {/* Logo */}
          <Link href={`/${lang}`} className="text-base md:text-lg font-bold tracking-tight flex items-center gap-2.5">
            <img src="/favicon.ico" alt="Logo" className="w-6 h-6 object-contain" />
            <span className="hidden xs:inline text-zinc-400 font-medium">LONGEVITY</span>
            <span className="text-blue-400 font-bold">BIOHACKER</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            <Link href={`/${lang}?cat=Protocolos`} className={`hover:text-zinc-200 transition-colors ${cat === 'Protocolos' ? 'text-zinc-200' : ''}`}>{dict.nav.protocols}</Link>
            <Link href={`/${lang}?cat=Recomendaciones`} className={`hover:text-zinc-200 transition-colors ${cat === 'Recomendaciones' ? 'text-zinc-200' : ''}`}>{dict.nav.supplements}</Link>
            <Link href={`/${lang}?cat=Ciencia`} className={`hover:text-zinc-200 transition-colors ${cat === 'Ciencia' ? 'text-zinc-200' : ''}`}>{dict.nav.science}</Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex gap-0.5 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
              <Link href="/es" className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${lang === 'es' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>ES</Link>
              <Link href="/en" className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${lang === 'en' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>EN</Link>
            </div>
            {/* CTA */}
            <Link
              href="#newsletter-section"
              className="bg-zinc-100 text-zinc-900 px-4 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wide hover:bg-white transition-all active:scale-95"
            >
              <span className="md:hidden">Join</span>
              <span className="hidden md:inline">{dict.nav.newsletter}</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <main className="container mx-auto px-4 md:px-6 py-10 md:py-16 max-w-7xl">

        {/* Category Header */}
        {cat && (
          <div className="mb-12 pb-8 border-b border-zinc-800">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight font-heading">
              {displayCat}
            </h2>
            <p className="text-zinc-500 text-sm mt-3">
              {lang === 'es' ? 'Protocolos de vanguardia y ciencia aplicada' : 'Cutting-edge protocols and applied science'}
            </p>
          </div>
        )}

        {/* Products section */}
        {cat === 'Recomendaciones' && products && products.length > 0 && (
          <section className="mb-20 space-y-16">
            {products.filter((p: any) => !isGadget(p.name)).length > 0 && (
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-8 flex items-center gap-3">
                  <span className="w-8 h-px bg-zinc-800" />
                  {lang === 'es' ? 'Suplementación de Precisión' : 'Precision Supplementation'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products
                    .filter((p: any) => !isGadget(p.name))
                    .map((product: any) => (
                      <ProductCard key={product.id} product={product} dict={dict} />
                    ))}
                </div>
              </div>
            )}

            {products.filter((p: any) => isGadget(p.name)).length > 0 && (
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-8 flex items-center gap-3">
                  <span className="w-8 h-px bg-zinc-800" />
                  {lang === 'es' ? 'Tecnología & Bio-Gadgets' : 'Technology & Bio-Gadgets'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products
                    .filter((p: any) => isGadget(p.name))
                    .map((product: any) => (
                      <ProductCard key={product.id} product={product} dict={dict} />
                    ))}
                </div>
              </div>
            )}
            <div className="border-b border-zinc-800" />
          </section>
        )}

        {/* Empty state */}
        {((cat !== 'Recomendaciones' && articles && articles.length === 0) ||
          (cat === 'Recomendaciones' && (!products || products.length === 0) && (!articles || articles.length === 0))) && (
            <div className="py-24 text-center max-w-xl mx-auto">
              <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-zinc-800">
                <svg className="w-7 h-7 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-zinc-100 mb-4 tracking-tight">
                {cat === 'Protocolos'
                  ? (lang === 'es' ? 'Protocolos en preparación' : 'Protocols in preparation')
                  : (lang === 'es' ? 'Próximamente' : 'Coming soon')}
              </h3>
              <p className="text-zinc-500 leading-relaxed mb-8 text-sm">
                {cat === 'Protocolos'
                  ? (lang === 'es'
                    ? 'Estamos transformando los últimos descubrimientos científicos en guías paso a paso.'
                    : 'We are transforming the latest scientific discoveries into step-by-step guides.')
                  : (lang === 'es'
                    ? 'Estamos procesando nuevos estudios. Vuelve pronto.'
                    : 'We are processing new studies. Check back soon.')}
              </p>
              <Link href={`/${lang}`} className="inline-block bg-zinc-900 border border-zinc-800 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-all">
                {lang === 'es' ? 'Explorar ciencia reciente' : 'Explore recent science'}
              </Link>
            </div>
          )}

        {/* Featured Article Hero */}
        {featuredArticle && (
          <section className="mb-10 md:mb-16">
            <Link href={`/${lang}/${featuredArticle.slug}`} className="group relative block overflow-hidden rounded-2xl bg-zinc-900 aspect-[4/3] md:aspect-[21/9] border border-zinc-800/80">
              {featuredArticle.cover_image_url ? (
                <Image
                  src={featuredArticle.cover_image_url}
                  alt={featuredArticle.cover_image_alt || featuredArticle.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 90vw"
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-800" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/40 to-transparent" />

              <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-3xl">
                <span className="inline-block px-2.5 py-1 bg-zinc-800/80 text-zinc-300 rounded-md text-[10px] font-semibold uppercase tracking-wider mb-4 border border-zinc-700/60">
                  {dict.home.featured}
                </span>
                <h2 className="text-xl md:text-4xl font-bold text-white leading-tight mb-3 group-hover:text-blue-300 transition-colors font-heading tracking-tight">
                  {featuredArticle.title}
                </h2>
                <p className="text-zinc-400 text-sm md:text-base line-clamp-2 leading-relaxed">
                  {featuredArticle.tl_dr}
                </p>
              </div>
            </Link>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Article Grid */}
          <div className="lg:col-span-8">
            {/* Section label — clean, no tracking overkill */}
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-8 h-px bg-zinc-800" />
              {dict.home.latest_studies}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {remainingArticles?.map((article) => (
                <Link
                  key={article.id}
                  href={`/${lang}/${article.slug}`}
                  className="group bg-zinc-900/80 rounded-xl overflow-hidden border border-zinc-800/80 hover:border-zinc-700 hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                >
                  {/* Thumbnail */}
                  {article.cover_image_url && (
                    <div className="relative w-full h-44 overflow-hidden shrink-0">
                      <Image
                        src={article.cover_image_url}
                        alt={article.cover_image_alt || article.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 to-transparent" />
                    </div>
                  )}

                  <div className="p-5 md:p-6 flex-1 flex flex-col">
                    {/* Meta row */}
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <span className="text-zinc-500 text-xs">
                        {new Date(article.created_at).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US')}
                      </span>
                      <span className="text-zinc-700">·</span>
                      <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${
                        article.seo_metadata?.category === 'Protocolos'
                          ? 'bg-blue-950/60 text-blue-400 border border-blue-800/40'
                          : 'bg-zinc-800/60 text-zinc-400'
                      }`}>
                        {article.seo_metadata?.category
                          ? (categoryDisplayNames[article.seo_metadata.category] || article.seo_metadata.category)
                          : (categoryDisplayNames['Ciencia'] || 'Ciencia')}
                      </span>
                    </div>

                    <h4 className="text-base md:text-lg font-bold text-zinc-100 leading-snug mb-3 group-hover:text-blue-300 transition-colors font-heading tracking-tight flex-1">
                      {article.title}
                    </h4>
                    <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed">
                      {article.tl_dr}
                    </p>

                    <div className="mt-4 pt-4 border-t border-zinc-800/60">
                      <span className="text-blue-400 text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                        {dict.home.read_more}
                        <span>→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {(hasMore || currentPage > 1) && (
              <div className="mt-12 flex items-center justify-center gap-3">
                {currentPage > 1 && (
                  <Link
                    href={`/${lang}${cat ? `?cat=${cat}&` : '?'}page=${currentPage - 1}`}
                    className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-semibold hover:bg-zinc-800 hover:border-zinc-700 transition-all"
                  >
                    ← {lang === 'es' ? 'Anterior' : 'Previous'}
                  </Link>
                )}
                {hasMore && (
                  <Link
                    href={`/${lang}${cat ? `?cat=${cat}&` : '?'}page=${currentPage + 1}`}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all"
                  >
                    {lang === 'es' ? 'Ver más artículos' : 'Load more'} →
                  </Link>
                )}
              </div>
            )}

            {/* Home AdSense */}
            <AdSenseUnit
              slot="home_in_feed"
              className="mt-16 h-48"
            />
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8" id="newsletter-section">
            <NewsletterForm lang={lang} />

            {/* Categories */}
            <section className="bg-zinc-900/60 rounded-xl p-6 border border-zinc-800/60">
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-5">{dict.home.categories}</p>
              <div className="space-y-1">
                {[
                  { name: lang === 'es' ? 'Protocolos' : 'Protocols', key: 'Protocolos' },
                  { name: lang === 'es' ? 'Recomendaciones' : 'Recommendations', key: 'Recomendaciones' },
                  { name: lang === 'es' ? 'Ciencia' : 'Science', key: 'Ciencia' },
                ].map((category) => (
                  <Link
                    key={category.key}
                    href={`/${lang}?cat=${category.key}`}
                    className={`flex items-center justify-between group py-2.5 px-3 rounded-lg transition-colors ${
                      cat === category.key
                        ? 'bg-zinc-800 text-zinc-100'
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                    }`}
                  >
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className="text-zinc-600 text-xs group-hover:translate-x-0.5 transition-transform">→</span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Sidebar AdSense */}
            <AdSenseUnit
              slot="sidebar_skyscraper"
              className="h-[600px]"
            />
          </aside>
        </div>
      </main>

      <Footer lang={lang} dict={dict} />
    </div>
  );
}
