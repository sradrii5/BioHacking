import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getDictionary } from '@/lib/dictionaries';

interface Props {
  params: Promise<{ lang: 'en' | 'es' }>;
  searchParams: Promise<{ cat?: string }>;
}

export default async function Home({ params, searchParams }: Props) {
  const { lang } = await params;
  const { cat } = await searchParams;
  const dict = await getDictionary(lang);
  const supabase = getSupabaseAdmin();

  // 1. Fetch articles
  let query = supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .eq('seo_metadata->>locale', lang);

  if (cat) {
    query = query.eq('seo_metadata->>category', cat);
  }

  const { data: articles, error } = await query.order('created_at', { ascending: false });

  // 2. Fetch products if category is Recomendaciones
  const { data: products } = cat === 'Recomendaciones' 
    ? await supabase.from('products').select('*').eq('lang', lang).limit(24)
    : { data: null };

  if (error) {
    console.error('Error fetching articles:', error);
    return <div className="p-20 text-center">{lang === 'es' ? 'Error cargando artículos.' : 'Error loading articles.'}</div>;
  }

  const featuredArticle = articles?.[0];
  const remainingArticles = articles?.slice(1);

  // Helper to identify gadgets
  const isGadget = (name: string) => name.toLowerCase().match(/band|gtr|gafas|glasses|manta|sauna|reloj|watch/);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Premium Navigation Header */}
      <nav className="bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href={`/${lang}`} className="text-xl md:text-2xl font-black tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs">LB</div>
            LONGEVITY<span className="text-blue-500">BIOHACKER</span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
            <Link href={`/${lang}?cat=Protocolos`} className={`hover:text-blue-400 transition-colors ${cat === 'Protocolos' ? 'text-blue-500' : ''}`}>{dict.nav.protocols}</Link>
            <Link href={`/${lang}?cat=Recomendaciones`} className={`hover:text-blue-400 transition-colors ${cat === 'Recomendaciones' ? 'text-blue-500' : ''}`}>{dict.nav.supplements}</Link>
            <Link href={`/${lang}?cat=Ciencia`} className={`hover:text-blue-400 transition-colors ${cat === 'Ciencia' ? 'text-blue-500' : ''}`}>{dict.nav.science}</Link>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <Link href="/es" className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'es' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}>ES</Link>
              <Link href="/en" className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'en' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}>EN</Link>
            </div>
            <Link 
              href="#newsletter-section"
              className="bg-white text-black px-5 md:px-8 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-lg shadow-white/5 active:scale-95"
            >
              {dict.nav.newsletter}
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <main className="container mx-auto px-4 py-8 md:py-16 max-w-7xl">
        
        {cat && (
          <div className="mb-16 border-l-4 border-blue-600 pl-8 py-2">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white font-heading">
              {cat}
            </h2>
            <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-4">
              {lang === 'es' ? 'Protocolos de Vanguardia y Ciencia Aplicada' : 'Cutting-edge Protocols and Applied Science'}
            </p>
          </div>
        )}

        {cat === 'Recomendaciones' && products && products.length > 0 && (
          <section className="mb-20 space-y-20">
            {/* Supplements Subsection */}
            {products.filter((p: any) => !isGadget(p.name)).length > 0 && (
              <div>
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                  <span className="w-12 h-[1px] bg-zinc-800"></span>
                  {lang === 'es' ? 'Suplementación de Precisión' : 'Precision Supplementation'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {products
                    .filter((p: any) => !isGadget(p.name))
                    .map((product: any) => (
                      <ProductCard key={product.id} product={product} dict={dict} />
                    ))}
                </div>
              </div>
            )}

            {/* Gadgets Subsection */}
            {products.filter((p: any) => isGadget(p.name)).length > 0 && (
              <div>
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                  <span className="w-12 h-[1px] bg-zinc-800"></span>
                  {lang === 'es' ? 'Tecnología & Bio-Gadgets' : 'Technology & Bio-Gadgets'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {products
                    .filter((p: any) => isGadget(p.name))
                    .map((product: any) => (
                      <ProductCard key={product.id} product={product} dict={dict} />
                    ))}
                </div>
              </div>
            )}
            <div className="mt-12 border-b border-zinc-800"></div>
          </section>
        )}

        {articles && articles.length === 0 && (
          <div className="py-20 text-center">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-black text-zinc-100 mb-2">
              {cat === 'Recomendaciones' && products && products.length > 0
                ? (lang === 'es' ? 'Próximamente: Ciencia Aplicada' : 'Coming Soon: Applied Science')
                : (lang === 'es' ? 'No hay artículos en esta categoría aún' : 'No articles in this category yet')}
            </h3>
            <p className="text-zinc-500 font-medium max-w-md mx-auto">
              {cat === 'Recomendaciones' && products && products.length > 0
                ? (lang === 'es' ? 'Estamos analizando los últimos estudios sobre estas herramientas y compuestos. ¡Vuelve pronto!' : 'We are analyzing the latest studies on these tools and compounds. Check back soon!')
                : (lang === 'es' ? 'Estamos procesando nuevos estudios. Vuelve pronto.' : 'We are processing new studies. Check back soon.')}
            </p>
            {!cat && (
              <Link href={`/${lang}`} className="inline-block mt-8 text-blue-600 font-black uppercase tracking-widest text-xs border-b-2 border-blue-600 pb-1">
                {lang === 'es' ? 'Volver a la Home' : 'Back to Home'}
              </Link>
            )}
          </div>
        )}
        
        {/* Featured Article (Hero) - Only show if not filtering or if it's the first one */}
        {featuredArticle && !cat && (
          <section className="mb-20">
            <Link href={`/${lang}/${featuredArticle.slug}`} className="group relative block overflow-hidden rounded-[3rem] bg-zinc-900 aspect-[21/9] shadow-2xl border border-zinc-800">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/40 to-transparent z-10"></div>
              {/* Decorative element */}
              <div className="absolute inset-0 bg-blue-600 mix-blend-overlay opacity-10"></div>
              
              <div className="absolute bottom-0 left-0 p-8 md:p-16 z-20 max-w-3xl">
                <span className="inline-block px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-xl shadow-blue-900/40">
                  {dict.home.featured} • {dict.common.trust_score}: {featuredArticle.trust_score}%
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6 group-hover:text-blue-400 transition-colors font-heading">
                  {featuredArticle.title}
                </h2>
                <p className="text-zinc-400 text-lg md:text-xl line-clamp-2 font-medium leading-relaxed italic">
                  "{featuredArticle.tl_dr}"
                </p>
              </div>
            </Link>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Article Grid */}
          <div className="lg:col-span-8">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-8">{dict.home.latest_studies}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {remainingArticles?.map((article) => (
                <Link 
                  key={article.id} 
                  href={`/${lang}/${article.slug}`}
                  className="group bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-zinc-800 shadow-sm hover:shadow-2xl hover:border-zinc-700 hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="p-8 flex-1">
                    <div className="flex items-center justify-between mb-6">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                        article.trust_score > 90 
                          ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/20' 
                          : 'bg-blue-950/30 text-blue-400 border-blue-500/20'
                      }`}>
                        {dict.common.trust_score}: {article.trust_score}%
                      </span>
                      <span className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                        {new Date(article.created_at).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US')}
                      </span>
                    </div>
                    <h4 className="text-xl font-black text-white leading-tight mb-4 group-hover:text-blue-400 transition-colors font-heading">
                      {article.title}
                    </h4>
                    <p className="text-zinc-500 text-sm line-clamp-3 leading-relaxed mb-6 font-medium">
                      {article.tl_dr}
                    </p>
                  </div>
                  <div className="px-8 pb-8">
                    <div className="flex items-center text-blue-500 text-[10px] font-black uppercase tracking-widest group-hover:gap-2 transition-all">
                      {dict.home.read_more} <span>→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Home AdSense Placeholder */}
            <div className="mt-16 p-12 bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-[3rem] flex items-center justify-center text-zinc-600 text-[10px] uppercase tracking-[0.3em] font-black h-48 text-center text-balance">
              {lang === 'es' ? 'Espacio Publicitario (AdSense In-Feed)' : 'Advertising Space (AdSense In-Feed)'}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-10" id="newsletter-section">
            {/* Newsletter Card */}
            <section className="bg-gradient-to-br from-blue-900/40 to-zinc-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden border border-blue-500/20 group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/20 rounded-full blur-[60px] group-hover:bg-blue-600/30 transition-colors"></div>
              <h4 className="text-2xl font-black mb-4 relative z-10 leading-tight font-heading">{dict.newsletter.title_sidebar}</h4>
              <p className="text-zinc-400 text-sm mb-8 relative z-10 leading-relaxed font-medium">
                {dict.newsletter.description_sidebar}
              </p>
              <form className="space-y-4 relative z-10">
                <input 
                  type="email" 
                  placeholder={dict.newsletter.placeholder} 
                  className="w-full px-6 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-all font-medium text-sm"
                />
                <button className="w-full bg-white hover:bg-blue-500 hover:text-white text-black font-black py-4 rounded-2xl transition-all shadow-xl uppercase tracking-widest text-[10px] active:scale-95">
                  {dict.newsletter.button}
                </button>
              </form>
            </section>

            <section className="bg-zinc-900 rounded-[3rem] p-10 border border-zinc-800 shadow-sm">
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6">{dict.home.categories}</h4>
              <div className="space-y-4">
                {[
                  { name: lang === 'es' ? 'Protocolos' : 'Protocols', key: 'Protocolos' },
                  { name: lang === 'es' ? 'Recomendaciones' : 'Recommendations', key: 'Recomendaciones' },
                  { name: lang === 'es' ? 'Ciencia' : 'Science', key: 'Ciencia' },
                ].map((category) => (
                  <Link 
                    key={category.key} 
                    href={`/${lang}?cat=${category.key}`} 
                    className={`flex items-center justify-between group py-2 text-sm ${cat === category.key ? 'text-blue-500' : 'text-zinc-400'}`}
                  >
                    <span className="font-black uppercase tracking-widest group-hover:text-blue-400 transition-colors">{category.name}</span>
                    <span className="text-zinc-700 text-xs font-black group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Sidebar AdSense */}
            <div className="bg-zinc-900 w-full h-[600px] rounded-[3rem] border border-zinc-800 flex items-center justify-center text-zinc-600 text-[10px] uppercase tracking-[0.3em] font-bold text-center p-8 text-balance">
              {lang === 'es' ? 'Publicidad (AdSense Skyscraper)' : 'Advertising (AdSense Skyscraper)'}
            </div>
          </aside>
        </div>
      </main>

      {/* Premium Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-zinc-600 text-sm font-black uppercase tracking-[0.4em] mb-6 font-heading">
            LONGEVITY<span className="text-blue-500">BIOHACKER</span>
          </p>
          <p className="text-zinc-700 text-[9px] max-w-md mx-auto leading-relaxed uppercase tracking-[0.2em] font-black">
            {lang === 'es' ? 'La plataforma líder en análisis de ciencia aplicada a la longevidad humana.' : 'The leading platform for analysis of science applied to human longevity.'}
            <br />
            <span className="mt-4 block opacity-50">© 2026 {lang === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

