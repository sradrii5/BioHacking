'use client';

import { useState } from 'react';

interface NewsletterFormProps {
  lang: string;
}

// Exportación nombrada para los archivos que usan import { NewsletterForm }
export function NewsletterForm({ lang }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, lang })
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setEmail('');
        setMessage(lang === 'es' ? '¡Bienvenido a la era de la longevidad! 🧬' : 'Welcome to the longevity era! 🧬');
      } else {
        throw new Error(data.error || 'Error unknown');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || (lang === 'es' ? 'Algo ha fallado. Reintenta.' : 'Something went wrong. Try again.'));
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/60 p-6 md:p-8 rounded-xl relative overflow-hidden">
      {/* Subtle accent */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-600/8 rounded-full blur-[60px] pointer-events-none" />
      
      <div className="relative z-10">
        <h2 className="text-lg font-bold tracking-tight mb-2 font-heading">
          {lang === 'es' ? 'Ciencia en tu bandeja' : 'Science in your inbox'}
        </h2>
        <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
          {lang === 'es'
            ? 'Los estudios más relevantes de la semana, curados y analizados.'
            : 'The most relevant studies of the week, curated and analyzed.'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input 
            type="email" 
            required
            placeholder={lang === 'es' ? 'tu@email.com' : 'you@email.com'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-5 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-zinc-700"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm py-3 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {status === 'loading' 
              ? (lang === 'es' ? 'Procesando...' : 'Processing...') 
              : (lang === 'es' ? 'Suscribirme' : 'Subscribe Now')}
          </button>
        </form>

        {status !== 'idle' && (
          <p className={`mt-6 text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2 ${status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {message}
          </p>
        )}

        <p className="mt-6 text-[10px] text-zinc-600 leading-relaxed">
          {lang === 'es'
            ? 'Sin spam. Cancelación en un clic.'
            : 'No spam. Unsubscribe anytime.'}
        </p>
      </div>
    </div>
  );
}

// Exportación por defecto para los archivos que usan import NewsletterForm
export default NewsletterForm;
