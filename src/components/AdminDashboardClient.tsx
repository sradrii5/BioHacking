'use client';

import { useState, useEffect, useCallback } from 'react';
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

  // Poll queue status every 10s
  const fetchQueue = useCallback(async () => {
    const { data } = await supabase
      .from('ingestion_queue')
      .select('id, query, locale, status, error_message, created_at, processed_at')
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setQueueJobs(data);
  }, []);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

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
        alert('Pack generado con éxito! Refresca para ver los cambios.');
        // In a real app we'd update the local state here
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
        await fetchQueue(); // Refresh queue immediately
      } else {
        alert(data.message || 'No se encontraron artículos para esta búsqueda.');
      }
    } catch (err) {
      alert('Error al encolar la ingesta');
    } finally {
      setLoading(false);
      setQuery('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado al portapapeles! 🚀');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Sidebar: Ingestion Form */}
      <div className="lg:col-span-4 space-y-8">
        <section className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Nueva Ingesta Masiva
          </h2>
          <form onSubmit={handleBatchIngest} className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Tema de Búsqueda (PubMed)</label>
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ej: NMN Longevity, Autophagy..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Cantidad de Artículos</label>
              <select 
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">1 Artículo</option>
                <option value="3">3 Artículos</option>
                <option value="5">5 Artículos</option>
                <option value="10">10 Artículos</option>
              </select>
            </div>
            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${
                loading ? 'bg-slate-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20'
              }`}
            >
              {loading ? 'Añadiendo a cola...' : '📥 Encolar Ingesta'}
            </button>
          </form>
        </section>

        {/* Queue Monitor */}
        <section className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-black flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Cola de Procesamiento
            </h2>
            <button 
              onClick={async () => {
                const res = await fetch('/api/cron/worker', {
                  headers: { 'Authorization': `Bearer biohacker_secret_2026` }
                });
                const data = await res.json();
                alert(data.message || (data.success ? 'Procesado con éxito' : 'Error en el worker'));
                fetchQueue();
              }}
              className="text-[9px] font-black uppercase tracking-widest bg-emerald-600/20 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/30 hover:bg-emerald-600/30 transition-all"
            >
              ⚡ Procesar Ahora
            </button>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-6">Actualización automática cada 10s</p>

          {queueJobs.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-4">La cola está vacía 📭</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {queueJobs.map((job) => {
                const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.pending;
                return (
                  <div key={job.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate max-w-[140px]">{job.query}</span>
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                        <span className={`text-[10px] font-black uppercase ${cfg.color}`}>{cfg.label}</span>
                      </div>
                    </div>
                    {job.error_message && (
                      <p className="text-[9px] text-rose-400 mt-1 truncate">{job.error_message}</p>
                    )}
                    {job.status === 'failed' && (
                      <button
                        onClick={() => handleRetryJob(job.id)}
                        className="mt-2 text-[9px] font-black uppercase tracking-widest text-yellow-500 hover:text-yellow-400"
                      >
                        🔄 Reintentar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Affiliate Quick List */}
        <section className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800">
          <h2 className="text-xl font-black mb-6">Productos Activos</h2>
          <div className="space-y-4">
            {products.map((p: any) => (
              <div key={p.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <p className="text-sm font-bold text-blue-400">{p.name}</p>
                <p className="text-[10px] text-slate-500 truncate mt-1">{p.affiliate_link}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Main Content: Recent Activity */}
      <div className="lg:col-span-8 space-y-8">
        <section className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800">
          <h2 className="text-2xl font-black mb-8">Última Actividad</h2>
          <div className="space-y-6">
            {recentArticles.map((article: any) => (
              <div key={article.id} className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-slate-950 rounded-3xl border border-slate-800 group hover:border-blue-500/50 transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-blue-900/50 text-blue-400 px-2 py-0.5 rounded">
                        {article.seo_metadata?.locale || 'es'}
                      </span>
                      <span className="text-slate-600 text-xs font-medium">
                        {new Date(article.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">{article.title}</h3>
                    
                    <div className="flex gap-4 items-center">
                      {article.seo_metadata?.social && (
                        <button 
                          onClick={() => setSelectedSocial(selectedSocial === article.id ? null : article.id)}
                          className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 hover:text-blue-400 transition-colors"
                        >
                          {selectedSocial === article.id ? '✕ Cerrar Pack' : '📱 Ver Social Pack'}
                        </button>
                      )}
                      
                      {(!article.seo_metadata?.social || article.seo_metadata?.social?.twitter?.includes('Could not generate')) && (
                        <button 
                          onClick={() => handleGenerateSocial(article.id)}
                          disabled={genLoading === article.id}
                          className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 hover:text-emerald-400 transition-colors disabled:text-slate-600"
                        >
                          {genLoading === article.id ? '⌛ Generando...' : article.seo_metadata?.social ? '🔄 Regenerar Pack' : '⚙️ Generar Social Pack'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-emerald-500 font-black text-xl">{article.trust_score}%</div>
                    <div className="text-[10px] uppercase font-bold text-slate-600 tracking-tighter text-nowrap">Trust Score</div>
                  </div>
                </div>

                {/* Social Pack Detail */}
                {selectedSocial === article.id && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Twitter (X) Thread</span>
                        <button onClick={() => copyToClipboard(article.seo_metadata?.social?.twitter)} className="text-[10px] bg-blue-600 px-3 py-1 rounded-full font-bold">Copiar</button>
                      </div>
                      <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {article.seo_metadata?.social?.twitter || 'No hay post generado para este artículo.'}
                      </p>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">LinkedIn Post</span>
                        <button onClick={() => copyToClipboard(article.seo_metadata?.social?.linkedin)} className="text-[10px] bg-emerald-600 px-3 py-1 rounded-full font-bold">Copiar</button>
                      </div>
                      <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {article.seo_metadata?.social?.linkedin || 'No hay post generado para este artículo.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-gradient-to-br from-blue-900/20 to-slate-900 rounded-[2.5rem] border border-slate-800">
            <h4 className="font-black text-slate-400 uppercase tracking-widest text-xs mb-4">Estrategia SEO</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              Tus artículos están siendo inyectados con metadatos dinámicos y JSON-LD. El próximo paso es generar el Sitemap automático.
            </p>
          </div>
          <div className="p-8 bg-gradient-to-br from-emerald-900/20 to-slate-900 rounded-[2.5rem] border border-slate-800">
            <h4 className="font-black text-slate-400 uppercase tracking-widest text-xs mb-4">Monetización</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              El motor de inyección de enlaces está escaneando palabras clave. Asegúrate de tener suficientes productos en la DB.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
