import { getSupabaseAdmin } from '@/lib/supabase';
import { getDictionary } from '@/lib/dictionaries';
import AdminDashboardClient from '@/components/AdminDashboardClient';
import LogoutButton from '@/components/LogoutButton';

interface Props {
  params: Promise<{ lang: 'en' | 'es' }>;
}

export default async function AdminPage({ params }: Props) {
  const { lang } = await params;
  const supabase = getSupabaseAdmin();
  
  // Fetch stats
  const { count: totalArticles } = await supabase.from('articles').select('*', { count: 'exact', head: true });
  const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true });
  
  // Fetch recent articles
  const { data: recentArticles } = await supabase
    .from('articles')
    .select('id, title, created_at, trust_score, seo_metadata')
    .order('created_at', { ascending: false })
    .limit(50);

  // Fetch all products
  const { data: products } = await supabase.from('products').select('*');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">MISSION<span className="text-blue-500">CONTROL</span></h1>
            <p className="text-slate-500 font-medium">Panel de administración bilingüe v1.0</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800">
              <span className="text-slate-500 text-xs font-black uppercase tracking-widest block mb-1">Artículos</span>
              <span className="text-2xl font-black">{totalArticles || 0}</span>
            </div>
            <div className="bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800">
              <span className="text-slate-500 text-xs font-black uppercase tracking-widest block mb-1">Productos</span>
              <span className="text-2xl font-black">{totalProducts || 0}</span>
            </div>
            <LogoutButton lang={lang} />
          </div>
        </header>

        <AdminDashboardClient 
          lang={lang} 
          recentArticles={recentArticles || []} 
          products={products || []}
        />
      </div>
    </div>
  );
}
