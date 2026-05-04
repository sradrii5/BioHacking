'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton({ lang }: { lang: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push(`/${lang}/admin/login`);
    router.refresh();
  };

  return (
    <button
      id="logout-button"
      onClick={handleLogout}
      className="px-4 py-3 rounded-2xl border border-slate-700 text-slate-500 hover:text-rose-400 hover:border-rose-500/50 text-xs font-black uppercase tracking-widest transition-all"
    >
      Salir →
    </button>
  );
}
