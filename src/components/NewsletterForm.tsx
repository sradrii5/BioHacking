'use client';

import { useState } from 'react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error);
      }
    } catch (err) {
      setStatus('error');
      setMessage('Algo salió mal');
    }
  };

  return (
    <section className="bg-gradient-to-br from-blue-900/20 to-zinc-900 p-12 rounded-[3rem] border border-blue-500/20 text-center relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -z-10 group-hover:bg-blue-600/20 transition-colors"></div>
      
      <h3 className="text-2xl md:text-3xl font-black text-white mb-4 font-heading">
        ¿Quieres más ciencia aplicada?
      </h3>
      <p className="text-zinc-400 mb-8 max-w-lg mx-auto font-medium">
        Únete a biohackers que optimizan su biología semanalmente con estudios revisados por pares.
      </p>

      {status === 'success' ? (
        <div className="bg-emerald-500/20 text-emerald-400 p-6 rounded-2xl font-black uppercase tracking-widest text-xs border border-emerald-500/30 max-w-md mx-auto">
          {message} ✨
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto w-full">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tu mejor email..." 
            required
            disabled={status === 'loading'}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 text-white"
          />
          <button 
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-500 hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            {status === 'loading' ? 'Cargando...' : 'Unirme ahora'}
          </button>
        </form>
      )}
      {status === 'error' && (
        <p className="mt-4 text-rose-500 text-[10px] font-black uppercase tracking-widest">{message}</p>
      )}
    </section>
  );
}
