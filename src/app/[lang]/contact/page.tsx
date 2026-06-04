'use client';

import { useState, use } from 'react';
import Link from 'next/link';

interface Props {
  lang: string;
}

export default function ContactPage({ params }: { params: Promise<{ lang: 'en' | 'es' }> }) {
  const unwrappedParams = use(params);
  return <ContactClient lang={unwrappedParams.lang} />;
}

function ContactClient({ lang }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const isEs = lang === 'es';

  const copy = {
    back: isEs ? '← Volver a la Home' : '← Back to Home',
    badge: isEs ? 'Contáctanos' : 'Get in touch',
    title: isEs ? <>Hablemos.<br /><span className="text-blue-500">Escríbenos.</span></> : <>Let's talk.<br /><span className="text-blue-500">Write to us.</span></>,
    subtitle: isEs
      ? 'Para colaboraciones editoriales, propuestas de estudio, prensa o cualquier consulta general.'
      : 'For editorial collaborations, study proposals, press inquiries, or any general question.',
    name: isEs ? 'Nombre' : 'Name',
    email: 'Email',
    subject: isEs ? 'Asunto' : 'Subject',
    message: isEs ? 'Mensaje' : 'Message',
    send: isEs ? 'Enviar mensaje' : 'Send message',
    sending: isEs ? 'Enviando...' : 'Sending...',
    success: isEs
      ? '✅ Mensaje recibido. Te responderemos en un plazo de 48 horas.'
      : '✅ Message received. We\'ll reply within 48 hours.',
    error: isEs
      ? '❌ No pudimos enviar el mensaje. Por favor, escríbenos directamente a contact@biohackerage.com'
      : '❌ Could not send message. Please write to us directly at contact@biohackerage.com',
    emailDirect: isEs ? 'O escríbenos directamente:' : 'Or write to us directly:',
    topics: isEs ? 'Podemos ayudarte con:' : 'We can help with:',
    topicList: isEs
      ? ['Proponer un estudio para análisis', 'Colaboraciones editoriales y prensa', 'Reportar un error en un artículo', 'Consultas sobre publicidad', 'Cualquier otra pregunta']
      : ['Propose a study for analysis', 'Editorial collaborations and press', 'Report an error in an article', 'Advertising inquiries', 'Any other question'],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Server error');
      }
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans">
      {/* Nav */}
      <nav className="bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800 h-20 flex items-center shrink-0">
        <div className="container mx-auto px-4">
          <Link href={`/${lang}`} className="text-xl font-black tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs">LB</div>
            LONGEVITY<span className="text-blue-500">BIOHACKER</span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link
            href={`/${lang}`}
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-12 text-[10px] font-black uppercase tracking-[0.3em] group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            {isEs ? 'Volver a la Home' : 'Back to Home'}
          </Link>

          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* Left: Info */}
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-blue-400 text-xs font-black uppercase tracking-widest">{copy.badge}</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-white leading-none mb-8 tracking-tighter">
                {copy.title}
              </h1>

              <p className="text-zinc-400 mb-12 leading-relaxed">{copy.subtitle}</p>

              <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">{copy.topics}</p>
              <ul className="space-y-3 mb-12">
                {copy.topicList.map((topic) => (
                  <li key={topic} className="flex items-center gap-3 text-zinc-300 text-sm">
                    <span className="text-blue-500">→</span>
                    {topic}
                  </li>
                ))}
              </ul>

              <div className="border-t border-zinc-800 pt-8">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">{copy.emailDirect}</p>
                <a
                  href="mailto:contact@biohackerage.com"
                  className="text-blue-400 hover:text-blue-300 font-bold transition-colors"
                >
                  contact@biohackerage.com
                </a>
              </div>
            </div>

            {/* Right: Form */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
              {status === 'success' ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-6">✅</div>
                  <p className="text-zinc-300 leading-relaxed">{copy.success}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">{copy.name}</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">{copy.subject}</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">{copy.message}</label>
                    <textarea
                      required
                      rows={6}
                      value={formData.message}
                      onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                  </div>

                  {status === 'error' && (
                    <p className="text-red-400 text-sm">{copy.error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl transition-all duration-200 hover:scale-[1.02] text-sm uppercase tracking-widest"
                  >
                    {status === 'sending' ? copy.sending : copy.send}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Minimal footer inline */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-8">
        <div className="container mx-auto px-4 text-center text-zinc-600 text-xs uppercase tracking-widest font-black">
          © 2026 Biohacker Age · {isEs ? 'Todos los derechos reservados' : 'All rights reserved'}
        </div>
      </footer>
    </div>
  );
}
