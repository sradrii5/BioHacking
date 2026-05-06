'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UnsubscribeFormProps {
  lang: string;
  dict: any;
}

export default function UnsubscribeForm({ lang, dict }: UnsubscribeFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
          <span className="text-3xl">✅</span>
        </div>
        <p className="text-emerald-400 font-black uppercase tracking-widest text-xs mb-8">
          {dict.unsubscribe.success}
        </p>
        <button 
          onClick={() => router.push(`/${lang}`)}
          className="bg-zinc-900 hover:bg-zinc-800 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          {dict.unsubscribe.go_home}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group max-w-md mx-auto">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-[80px]"></div>
      
      <div className="relative z-10">
        <h1 className="text-2xl md:text-3xl font-black tracking-tighter mb-4 italic uppercase text-center">
          {dict.unsubscribe.title}
        </h1>
        <p className="text-zinc-500 font-medium mb-8 text-[11px] leading-relaxed uppercase tracking-widest text-center">
          {dict.unsubscribe.description}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            required
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-zinc-700"
          />
          <button 
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-[0.2em] text-[10px] py-4 rounded-xl transition-all shadow-lg shadow-rose-900/20 active:scale-[0.98] disabled:opacity-50"
          >
            {status === 'loading' ? '...' : dict.unsubscribe.button}
          </button>
        </form>

        {status === 'error' && (
          <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-rose-400 text-center animate-in fade-in slide-in-from-top-2">
            {dict.unsubscribe.error}
          </p>
        )}
      </div>
    </div>
  );
}
