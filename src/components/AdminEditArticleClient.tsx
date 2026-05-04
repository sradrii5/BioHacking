'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminEditArticleClient({ article, lang }: any) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: article.title,
    tl_dr: article.tl_dr,
    content: article.content_html || article.content,
    trust_score: article.trust_score,
    category: article.seo_metadata?.category || 'Ciencia',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`/api/admin/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      if (data.success) {
        alert('Artículo actualizado con éxito! ✨');
        router.push(`/${lang}/admin`);
        router.refresh();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Error al actualizar el artículo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-12">
      <div className="max-w-4xl mx-auto">
        <Link 
          href={`/${lang}/admin`}
          className="text-zinc-500 hover:text-white transition-colors mb-8 inline-block font-black uppercase tracking-widest text-[10px]"
        >
          ← Volver al Panel
        </Link>

        <h1 className="text-4xl font-black mb-12 tracking-tighter italic uppercase">Editar Artículo</h1>

        <form onSubmit={handleSubmit} className="space-y-8 bg-zinc-900 p-8 md:p-12 rounded-[2.5rem] border border-zinc-800 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
            <div className="md:col-span-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 block">Título del Artículo</label>
              <input 
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 block">Categoría</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm font-bold text-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                required
              >
                <option value="Ciencia">Ciencia</option>
                <option value="Protocolos">Protocolos</option>
                <option value="Recomendaciones">Recomendaciones</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 block">Trust Score (%)</label>
              <input 
                type="number"
                value={formData.trust_score}
                onChange={(e) => setFormData({...formData, trust_score: parseInt(e.target.value)})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-lg font-bold text-emerald-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 block">Resumen Ejecutivo (TL;DR)</label>
            <textarea 
              value={formData.tl_dr}
              onChange={(e) => setFormData({...formData, tl_dr: e.target.value})}
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm font-medium leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 block">Contenido del Análisis (Markdown soportado)</label>
            <textarea 
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              rows={15}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm font-mono leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
            />
          </div>

          <div className="flex gap-4 pt-6">
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98]"
            >
              {loading ? 'Guardando cambios...' : '💾 Guardar Cambios'}
            </button>
            <Link 
              href={`/${lang}/admin`}
              className="px-8 flex items-center justify-center border border-zinc-800 hover:bg-zinc-800 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
