import Link from 'next/link';

interface Props {
  lang: string;
}

/**
 * AuthorBio — Editorial team attribution block.
 * Required for Google E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness).
 * Displayed on every article page above the content.
 */
export function AuthorBio({ lang }: Props) {
  const isEs = lang === 'es';

  return (
    <div className="flex items-start gap-5 py-8 border-y border-zinc-800/60 mb-10">
      {/* Avatar */}
      <div className="shrink-0 w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold text-xs">
        AC
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-sm font-black text-white tracking-tight">
            Adrian Castro
          </span>
          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-950/40 border border-blue-500/20 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            {isEs ? 'Revisado editorialmente' : 'Editorially reviewed'}
          </span>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed max-w-xl">
          {isEs
            ? 'Adrian Castro creó Biohacker Age para tener un sitio donde seguir de cerca la investigación en longevidad y optimización biológica sin depender de titulares sensacionalistas. El contenido se elabora con asistencia de IA a partir de literatura científica y se revisa editorialmente antes de publicarse.'
            : 'Adrian Castro created Biohacker Age to have a place to closely follow longevity and biological optimization research without relying on sensationalist headlines. Content is produced with AI assistance from scientific literature and is editorially reviewed before publishing.'}
        </p>
        <Link
          href={`/${lang}/about`}
          className="inline-flex items-center gap-1 mt-2 text-xs text-zinc-600 hover:text-blue-400 transition-colors"
        >
          {isEs ? 'Sobre nuestra metodología' : 'About our methodology'} →
        </Link>
      </div>
    </div>
  );
}

export default AuthorBio;
