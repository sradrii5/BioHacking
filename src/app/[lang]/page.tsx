import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getDictionary } from '@/lib/dictionaries';

interface Props {
  params: Promise<{ lang: 'en' | 'es' }>;
}

export default async function Home({ params }: Props) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const supabase = getSupabaseAdmin();

  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .eq('seo_metadata->>locale', lang)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles:', error);
    return <div className="p-20 text-center">{lang === 'es' ? 'Error cargando artículos.' : 'Error loading articles.'}</div>;
  }

  const featuredArticle = articles?.[0];
  const remainingArticles = articles?.slice(1);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Premium Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href={`/${lang}`} className="text-2xl font-black text-slate-900 tracking-tighter">
            LONGEVITY<span className="text-blue-600">BIOHACKER</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
            <Link href="#" className="hover:text-blue-600 transition-colors">{dict.nav.protocols}</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">{dict.nav.supplements}</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">{dict.nav.science}</Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex gap-1 bg-slate-100 p-1 rounded-lg">
              <Link href="/es" className={`px-2 py-1 rounded md text-[10px] font-black ${lang === 'es' ? 'bg-white shadow-sm' : 'text-slate-400'}`}>ES</Link>
              <Link href="/en" className={`px-2 py-1 rounded md text-[10px] font-black ${lang === 'en' ? 'bg-white shadow-sm' : 'text-slate-400'}`}>EN</Link>
            </div>
            <button className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-600 transition-all">
              {dict.nav.newsletter}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <main className="container mx-auto px-4 py-12">
        
        {/* Featured Article (Hero) */}
        {featuredArticle && (
          <section className="mb-20">
            <Link href={`/${lang}/${featuredArticle.slug}`} className="group relative block overflow-hidden rounded-[3rem] bg-slate-900 aspect-[21/9] shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent z-10"></div>
              {/* Decorative element */}
              <div className="absolute inset-0 bg-blue-600 mix-blend-overlay opacity-20"></div>
              
              <div className="absolute bottom-0 left-0 p-8 md:p-16 z-20 max-w-3xl">
                <span className="inline-block px-4 py-1.5 bg-blue-600 text-white rounded-full text-xs font-black uppercase tracking-widest mb-6 shadow-lg shadow-blue-900/40">
                  {dict.home.featured} • {dict.common.trust_score}: {featuredArticle.trust_score}%
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6 group-hover:text-blue-400 transition-colors">
                  {featuredArticle.title}
                </h2>
                <p className="text-slate-300 text-lg md:text-xl line-clamp-2 font-medium leading-relaxed italic">
                  "{featuredArticle.tl_dr}"
                </p>
              </div>
            </Link>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Article Grid */}
          <div className="lg:col-span-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8">{dict.home.latest_studies}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {remainingArticles?.map((article) => (
                <Link 
                  key={article.id} 
                  href={`/${lang}/${article.slug}`}
                  className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="p-8 flex-1">
                    <div className="flex items-center justify-between mb-6">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        article.trust_score > 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {dict.common.trust_score}: {article.trust_score}%
                      </span>
                      <span className="text-slate-300 text-[10px] font-bold uppercase">
                        {new Date(article.created_at).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US')}
                      </span>
                    </div>
                    <h4 className="text-xl font-black text-slate-900 leading-tight mb-4 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed mb-6 font-medium">
                      {article.tl_dr}
                    </p>
                  </div>
                  <div className="px-8 pb-8">
                    <div className="flex items-center text-blue-600 text-xs font-black uppercase tracking-widest group-hover:gap-2 transition-all">
                      {dict.home.read_more} <span>→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Home AdSense Placeholder */}
            <div className="mt-16 p-12 bg-slate-100 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex items-center justify-center text-slate-400 text-[10px] uppercase tracking-[0.3em] font-bold h-48 text-center text-balance">
              {lang === 'es' ? 'Espacio Publicitario (AdSense In-Feed)' : 'Advertising Space (AdSense In-Feed)'}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-10">
            {/* Newsletter Card */}
            <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/30 rounded-full blur-[60px]"></div>
              <h4 className="text-2xl font-black mb-4 relative z-10 leading-tight">{dict.newsletter.title_sidebar}</h4>
              <p className="text-slate-400 text-sm mb-8 relative z-10 leading-relaxed font-medium">
                {dict.newsletter.description_sidebar}
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

            {/* Categories / Popular */}
            <section className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6">{dict.home.categories}</h4>
              <div className="space-y-4">
                {(lang === 'es' ? ['Longevidad', 'Nootrópicos', 'Ayuno', 'Suplementos', 'Sueño'] : ['Longevity', 'Nootropics', 'Fasting', 'Supplements', 'Sleep']).map((cat) => (
                  <Link key={cat} href="#" className="flex items-center justify-between group py-2">
                    <span className="text-slate-700 font-bold group-hover:text-blue-600 transition-colors">{cat}</span>
                    <span className="text-slate-300 text-xs font-black group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Sidebar AdSense */}
            <div className="bg-slate-200 w-full h-[600px] rounded-[2.5rem] flex items-center justify-center text-slate-400 text-[10px] uppercase tracking-[0.3em] font-bold text-center p-8 text-balance">
              {lang === 'es' ? 'Publicidad (AdSense Skyscraper)' : 'Advertising (AdSense Skyscraper)'}
            </div>
          </aside>
        </div>
      </main>

      {/* Premium Footer */}
      <footer className="bg-white border-t border-slate-200 py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.4em] mb-4">
            LONGEVITY<span className="text-blue-600">BIOHACKER</span>
          </p>
          <p className="text-slate-400 text-[10px] max-w-md mx-auto leading-relaxed uppercase tracking-widest font-bold">
            {lang === 'es' ? 'La plataforma líder en análisis de ciencia aplicada a la longevidad humana.' : 'The leading platform for analysis of science applied to human longevity.'}
            <br />© 2026 {lang === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
          </p>
        </div>
      </footer>
    </div>
  );
}

