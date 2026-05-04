'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  pending:    { label: 'En cola',      color: 'text-yellow-400', dot: 'bg-yellow-400 animate-pulse' },
  processing: { label: 'Procesando',   color: 'text-blue-400',   dot: 'bg-blue-400 animate-pulse' },
  done:       { label: 'Completado',   color: 'text-emerald-400',dot: 'bg-emerald-400' },
  failed:     { label: 'Fallido',      color: 'text-rose-400',   dot: 'bg-rose-400' },
};

export default function AdminDashboardClient({ lang, recentArticles, products }: any) {
  const [query, setQuery] = useState('');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [queueJobs, setQueueJobs] = useState<any[]>([]);
  const [selectedSocial, setSelectedSocial] = useState<any>(null);
  const [genLoading, setGenLoading] = useState<string | null>(null);
  
  // CMS State
  const [articles, setArticles] = useState<any[]>(recentArticles || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(articles.length >= 50);
  const [loadingMore, setLoadingMore] = useState(false);

  // Poll queue status every 10s
  const fetchQueue = useCallback(async () => {
    const { data } = await supabase
      .from('ingestion_queue')
      .select('id, query, locale, status, error_message, created_at, processed_at')
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setQueueJobs(data);
  }, []);

  const loadMoreArticles = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    const from = nextPage * 50;
    const to = from + 49;

    try {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, created_at, trust_score, seo_metadata')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (data && data.length > 0) {
        setArticles(prev => [...prev, ...data]);
        setPage(nextPage);
        setHasMore(data.length === 50);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm('¿Estás seguro de que quieres borrar este artículo? Esta acción no se puede deshacer.')) return;
    
    setIsDeleting(articleId);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setArticles(prev => prev.filter(a => a.id !== articleId));
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Error al borrar el artículo');
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.seo_metadata?.locale || 'es').includes(searchTerm.toLowerCase())
  );

  const handleRetryJob = async (jobId: string) => {
    await supabase
      .from('ingestion_queue')
      .update({ status: 'pending', error_message: null })
      .eq('id', jobId);
    fetchQueue();
  };

  const handleGenerateSocial = async (articleId: string) => {
    setGenLoading(articleId);
    try {
      const res = await fetch('/api/admin/generate-social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId })
      });
      const data = await res.json();
      if (data.success) {
        alert('Social Pack generado! Recargando datos...');
        // Refresh local list
        const { data: updated } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
        if (updated) setArticles(updated);
      }
    } catch (err) {
      alert('Error generando el pack');
    } finally {
      setGenLoading(null);
    }
  };

  const handleBatchIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/ingest/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, count, locale: lang })
      });
      const data = await res.json();
      if (data.queued > 0) {
        await fetchQueue();
      } else {
        alert(data.message || 'No se encontraron artículos.');
      }
    } catch (err) {
      alert('Error en la ingesta');
    } finally {
      setLoading(false);
      setQuery('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado! 🚀');
  };

  const handleClearQueue = async () => {
    if (!confirm('¿Quieres limpiar el historial de la cola (Completados y Fallidos)?')) return;
    
    const { error } = await supabase
      .from('ingestion_queue')
      .delete()
      .in('status', ['done', 'failed']);
    
    if (error) alert('Error: ' + error.message);
    else fetchQueue();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Sidebar: Ingestion & Control */}
      <div className="lg:col-span-4 space-y-8">
        <section className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Nueva Ingesta
          </h2>
          <form onSubmit={handleBatchIngest} className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Búsqueda PubMed</label>
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="NMN, Longevity..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Cantidad</label>
              <select 
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white"
              >
                {[1, 3, 5, 10, 20].map(n => <option key={n} value={n}>{n} Artículos</option>)}
              </select>
            </div>
            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${
                loading ? 'bg-slate-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              {loading ? 'Cargando...' : '📥 Iniciar Ingesta'}
            </button>
          </form>
        </section>

        {/* Queue Monitor */}
        <section className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Cola Activa
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={handleClearQueue}
                title="Limpiar completados"
                className="text-[9px] font-black uppercase tracking-widest bg-slate-800 text-slate-400 px-2 py-1.5 rounded-lg border border-slate-700 hover:text-white"
              >
                🧹
              </button>
              <button 
                onClick={async () => {
                  const res = await fetch('/api/cron/worker', {
                    headers: { 'Authorization': `Bearer biohacker_secret_2026` }
                  });
                  const data = await res.json();
                  alert(`Sesión finalizada: ${data.processed} artículos procesados.`);
                  fetchQueue();
                  // Refresh articles
                  const { data: updated } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
                  if (updated) setArticles(updated);
                }}
                className="text-[9px] font-black uppercase tracking-widest bg-emerald-600/20 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/30"
              >
                ⚡ Procesar
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {queueJobs.map((job) => {
              const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.pending;
              return (
                <div key={job.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold truncate max-w-[140px]">{job.query}</span>
                    <span className={`text-[10px] font-black uppercase ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  {job.status === 'failed' && (
                    <button onClick={() => handleRetryJob(job.id)} className="mt-2 text-[9px] text-yellow-500 font-black">🔄 Reintentar</button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* CMS: Article Management */}
      <div className="lg:col-span-8 space-y-8">
        <section className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Gestor de Contenidos</h2>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Buscar artículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-full px-6 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
              />
              <span className="absolute right-4 top-3 opacity-30">🔍</span>
            </div>
          </div>

          <div className="space-y-6">
            {filteredArticles.length === 0 ? (
              <p className="text-slate-600 text-center py-20 italic font-medium">No se han encontrado artículos que coincidan con la búsqueda.</p>
            ) : (
              filteredArticles.map((article: any) => (
                <div key={article.id} className="group animate-in fade-in duration-500">
                  <div className="flex items-center justify-between p-6 bg-slate-950 rounded-3xl border border-slate-800 hover:border-blue-500/30 transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest bg-blue-900/40 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                          {article.seo_metadata?.locale || 'es'}
                        </span>
                        <span className="text-slate-600 text-[10px] font-bold">
                          {new Date(article.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg truncate pr-4">{article.title}</h3>
                      
                      <div className="flex gap-4 items-center mt-4">
                        <button 
                          onClick={() => setSelectedSocial(selectedSocial === article.id ? null : article.id)}
                          className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400"
                        >
                          {selectedSocial === article.id ? '✕ Ocultar' : '📱 Social Pack'}
                        </button>
                        
                        <button 
                          onClick={() => handleDeleteArticle(article.id)}
                          disabled={isDeleting === article.id}
                          className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-400 disabled:opacity-30"
                        >
                          {isDeleting === article.id ? 'Borrando...' : '🗑️ Eliminar'}
                        </button>

                        <Link 
                          href={`/${lang}/admin/edit/${article.id}`}
                          className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400"
                        >
                          ✏️ Editar
                        </Link>

                        <a 
                          href={`/${article.seo_metadata?.locale || 'es'}/${article.slug}`}
                          target="_blank"
                          className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white"
                        >
                          👁️ Ver Web
                        </a>
                      </div>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <div className={`font-black text-xl ${article.trust_score > 80 ? 'text-emerald-500' : 'text-blue-500'}`}>
                        {article.trust_score}%
                      </div>
                      <div className="text-[9px] uppercase font-bold text-slate-600 tracking-tighter">Trust Score</div>
                    </div>
                  </div>

                  {/* Social Pack Detail */}
                  {selectedSocial === article.id && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2 mt-2 animate-in slide-in-from-top-2 duration-300">
                      <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-black uppercase text-blue-400">Twitter Thread</span>
                          <button onClick={() => copyToClipboard(article.seo_metadata?.social?.twitter)} className="text-[9px] bg-blue-600 px-3 py-1 rounded-full font-bold">Copiar</button>
                        </div>
                        <p className="text-xs text-slate-300 whitespace-pre-wrap line-clamp-6">{article.seo_metadata?.social?.twitter || 'N/A'}</p>
                      </div>
                      <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-black uppercase text-emerald-400">LinkedIn Post</span>
                          <button onClick={() => copyToClipboard(article.seo_metadata?.social?.linkedin)} className="text-[9px] bg-emerald-600 px-3 py-1 rounded-full font-bold">Copiar</button>
                        </div>
                        <p className="text-xs text-slate-300 whitespace-pre-wrap line-clamp-6">{article.seo_metadata?.social?.linkedin || 'N/A'}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {hasMore && (
            <div className="mt-12 text-center">
              <button 
                onClick={loadMoreArticles}
                disabled={loadingMore}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-10 py-4 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50"
              >
                {loadingMore ? 'Cargando...' : '↓ Cargar más artículos'}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
