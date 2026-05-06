import Link from 'next/link';

interface Props {
  lang: string;
  dict: any;
}

export default function Footer({ lang, dict }: Props) {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 py-20 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-zinc-600 text-sm font-black uppercase tracking-[0.4em] mb-8 font-heading">
          LONGEVITY<span className="text-blue-500">BIOHACKER</span>
        </p>
        
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-10 text-[10px] font-black uppercase tracking-widest text-zinc-500">
          <Link href={`/${lang}/legal/privacy`} className="hover:text-blue-500 transition-colors">
            {dict.footer.privacy}
          </Link>
          <Link href={`/${lang}/legal/terms`} className="hover:text-blue-500 transition-colors">
            {dict.footer.terms}
          </Link>
          <Link href={`/${lang}/legal/disclaimer`} className="hover:text-blue-500 transition-colors">
            {dict.footer.disclaimer}
          </Link>
        </div>

        <p className="text-zinc-700 text-[9px] max-w-md mx-auto leading-relaxed uppercase tracking-[0.2em] font-black">
          {lang === 'es' 
            ? 'La plataforma líder en análisis de ciencia aplicada a la longevidad humana.' 
            : 'The leading platform for analysis of science applied to human longevity.'}
          <br />
          <span className="mt-4 block opacity-50">© 2026 {dict.footer.rights}</span>
        </p>
      </div>
    </footer>
  );
}
