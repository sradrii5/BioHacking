import Link from 'next/link';
import { Footer } from './Footer';

interface Props {
  title: string;
  children: React.ReactNode;
  lang: string;
  dict: any;
}

export function LegalLayout({ title, children, lang, dict }: Props) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans">
      <nav className="bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800 h-20 flex items-center shrink-0">
        <div className="container mx-auto px-4">
          <Link href={`/${lang}`} className="text-xl font-black tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs">LB</div>
            LONGEVITY<span className="text-blue-500">BIOHACKER</span>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 max-w-3xl py-16 md:py-24 flex-1">
        <Link
          href={`/${lang}`}
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-12 text-[10px] font-black uppercase tracking-[0.3em] group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> {dict.legal.back_to_home}
        </Link>

        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-16 tracking-tighter font-heading">
          {title}
        </h1>

        <div className="prose prose-invert prose-lg max-w-none 
          prose-headings:text-white prose-headings:font-black prose-headings:tracking-tighter prose-headings:font-heading
          prose-p:text-zinc-400 prose-p:leading-relaxed
          prose-strong:text-white prose-strong:font-black
          prose-li:text-zinc-400">
          {children}
        </div>
      </main>

      <Footer lang={lang} dict={dict} />
    </div>
  );
}
