'use client';

import { useState } from 'react';

interface NewsletterFormProps {
  lang: string;
}

export default function NewsletterForm({ lang }: NewsletterFormProps) {
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
      setMessage(lang === 'es' ? 'Algo ha fallado. ¿Email válido?' : 'Something went wrong. Valid email?');
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
      {/* Decorative element */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-[80px] group-hover:bg-blue-500/30 transition-all duration-700"></div>
      
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4 italic uppercase">
          {lang === 'es' ? 'Únete a la' : 'Join the'} <span className="text-blue-500">Elite</span>
        </h2>
        <p className="text-slate-400 font-medium mb-8 text-sm md:text-base">
          {lang === 'es' 
            ? 'Recibe los últimos protocolos de longevidad y biohacking directamente en tu bandeja de entrada.' 
            : 'Get the latest longevity and biohacking protocols delivered straight to your inbox.'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <input 
            type="email" 
            required
            placeholder={lang === 'es' ? 'tu@email.com' : 'you@email.com'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-slate-950/50 border border-slate-700 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
          />
          <button 
            type="submit"
            disabled={status === 'loading'}
            className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs px-10 py-4 rounded-2xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-50"
          >
            {status === 'loading' 
              ? (lang === 'es' ? 'Procesando...' : 'Processing...') 
              : (lang === 'es' ? 'Suscribirme' : 'Subscribe')}
          </button>
        </form>

        {status !== 'idle' && (
          <p className={`mt-6 text-sm font-bold animate-in fade-in slide-in-from-top-2 ${status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {message}
          </p>
        )}

        <p className="mt-8 text-[10px] text-slate-500 font-medium leading-relaxed">
          {lang === 'es' 
            ? 'Al suscribirte, aceptas nuestra política de privacidad. Cero spam, solo ciencia.' 
            : 'By subscribing, you agree to our privacy policy. Zero spam, pure science.'}
        </p>
      </div>
    </div>
  );
}
