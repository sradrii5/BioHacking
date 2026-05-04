'use client';

import { useState, FormEvent, use } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage({ params: paramsPromise, searchParams: searchParamsPromise }: any) {
  const router = useRouter();
  const params: any = use(paramsPromise);
  const searchParams: any = use(searchParamsPromise);
  
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // Redirect to where they came from, or default admin panel
        const dest = searchParams?.from || `/${params.lang}/admin`;
        router.push(dest);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Contraseña incorrecta');
      }
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />

      <div className="relative w-full max-w-sm">
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter text-white">
            MISSION<span className="text-blue-500">CONTROL</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-2">Acceso restringido</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block"
              >
                Contraseña de Admin
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3">
                <span className="text-rose-400 text-sm font-medium">⚠️ {error}</span>
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${
                loading
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'
              }`}
            >
              {loading ? 'Verificando...' : 'Acceder al panel'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-700 text-xs mt-6">
          BioHacking Admin v1.0 — Acceso solo para administradores
        </p>
      </div>
    </div>
  );
}
