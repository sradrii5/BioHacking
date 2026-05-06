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
    <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
      {/* Decorative element */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-[80px] group-hover:bg-blue-500/20 transition-all duration-700"></div>
      
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-black tracking-tighter mb-4 italic uppercase">
          {lang === 'es' ? 'Únete a la' : 'Join the'} <span className="text-blue-500">Elite</span>
        </h2>
        <p className="text-zinc-500 font-medium mb-8 text-[11px] md:text-xs leading-relaxed uppercase tracking-widest">
          {lang === 'es' 
            ? 'Protocolos de longevidad en tu bandeja de entrada.' 
            : 'Longevity protocols in your inbox.'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input 
            type="email" 
            required
            placeholder={lang === 'es' ? 'tu@email.com' : 'you@email.com'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-3.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-zinc-700"
          />
          <button 
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] text-[10px] py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] disabled:opacity-50"
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

        <p className="mt-8 text-[9px] text-zinc-600 font-black uppercase tracking-widest leading-relaxed">
          {lang === 'es' 
            ? 'Cero spam, solo ciencia.' 
            : 'Zero spam, pure science.'}
        </p>
      </div>
    </div>
  );
}

// Exportación por defecto para los archivos que usan import NewsletterForm
export default NewsletterForm;
