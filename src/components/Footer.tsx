import Link from 'next/link';

interface Props {
  lang: string;
  dict: any;
}

export function Footer({ lang, dict }: Props) {
  const isEs = lang === 'es';

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 py-20 mt-auto">
      <div className="container mx-auto px-4">
        {/* Top row: brand + nav links */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-12 mb-16">
          {/* Brand */}
          <div className="max-w-xs">
            <p className="text-zinc-400 text-sm font-black uppercase tracking-[0.4em] mb-3 font-heading">
              LONGEVITY<span className="text-blue-500">BIOHACKER</span>
            </p>
            <p className="text-zinc-600 text-xs leading-relaxed">
              {isEs
                ? 'Plataforma de análisis científico aplicado a la longevidad y optimización biológica.'
                : 'Scientific analysis platform applied to longevity and biological optimization.'}
            </p>
          </div>

          {/* Link groups */}
          <div className="flex flex-wrap gap-x-16 gap-y-8">
            {/* Platform */}
            <div>
              <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] mb-4">
                {isEs ? 'Plataforma' : 'Platform'}
              </p>
              <div className="flex flex-col gap-3">
                <Link href={`/${lang}`} className="text-zinc-400 hover:text-white text-xs font-semibold transition-colors">
                  {isEs ? 'Inicio' : 'Home'}
                </Link>
                <Link href={`/${lang}?cat=Protocolos`} className="text-zinc-400 hover:text-white text-xs font-semibold transition-colors">
                  {dict.nav.protocols}
                </Link>
                <Link href={`/${lang}?cat=Recomendaciones`} className="text-zinc-400 hover:text-white text-xs font-semibold transition-colors">
                  {dict.nav.supplements}
                </Link>
                <Link href={`/${lang}?cat=Ciencia`} className="text-zinc-400 hover:text-white text-xs font-semibold transition-colors">
                  {dict.nav.science}
                </Link>
              </div>
            </div>

            {/* Company */}
            <div>
              <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] mb-4">
                {isEs ? 'Empresa' : 'Company'}
              </p>
              <div className="flex flex-col gap-3">
                <Link href={`/${lang}/about`} className="text-zinc-400 hover:text-white text-xs font-semibold transition-colors">
                  {isEs ? 'Sobre Nosotros' : 'About Us'}
                </Link>
                <Link href={`/${lang}/contact`} className="text-zinc-400 hover:text-white text-xs font-semibold transition-colors">
                  {isEs ? 'Contacto' : 'Contact'}
                </Link>
              </div>
            </div>

            {/* Legal */}
            <div>
              <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] mb-4">
                {isEs ? 'Legal' : 'Legal'}
              </p>
              <div className="flex flex-col gap-3">
                <Link href={`/${lang}/legal/privacy`} className="text-zinc-400 hover:text-white text-xs font-semibold transition-colors">
                  {dict.footer.privacy}
                </Link>
                <Link href={`/${lang}/legal/terms`} className="text-zinc-400 hover:text-white text-xs font-semibold transition-colors">
                  {dict.footer.terms}
                </Link>
                <Link href={`/${lang}/legal/disclaimer`} className="text-zinc-400 hover:text-white text-xs font-semibold transition-colors">
                  {dict.footer.disclaimer}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <p className="text-zinc-700 text-[9px] uppercase tracking-[0.2em] font-black">
            © 2026 Biohacker Age · {dict.footer.rights}
          </p>
          <p className="text-zinc-800 text-[9px] uppercase tracking-[0.15em] font-black max-w-md">
            {isEs
              ? 'Contenido exclusivamente informativo. No constituye consejo médico.'
              : 'Content for informational purposes only. Not medical advice.'}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
