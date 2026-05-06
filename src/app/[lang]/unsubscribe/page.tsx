import Link from 'next/link';
import { getDictionary } from '@/lib/dictionaries';
import UnsubscribeForm from '@/components/UnsubscribeForm';
import Footer from '@/components/Footer';

interface Props {
  params: Promise<{ lang: 'en' | 'es' }>;
}

export default async function UnsubscribePage({ params }: Props) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col">
      {/* Simple Header */}
      <nav className="bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <Link href={`/${lang}`} className="text-lg md:text-2xl font-black tracking-tighter flex items-center gap-2">
            <img src="/favicon.ico" alt="Logo" className="w-6 h-6 md:w-8 md:h-8 object-contain" />
            <span className="hidden xs:inline">LONGEVITY</span><span className="text-blue-500">BIOHACKER</span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-4 py-20">
        <UnsubscribeForm lang={lang} dict={dict} />
      </main>

      <Footer lang={lang} dict={dict} />
    </div>
  );
}
