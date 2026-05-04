import { getDictionary } from '@/lib/dictionaries';
import { LegalLayout } from '@/components/LegalLayout';

export default async function DisclaimerPage({ params }: { params: Promise<{ lang: 'en' | 'es' }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <LegalLayout title={dict.legal.disclaimer_title} lang={lang} dict={dict}>
      <div className="bg-blue-600/10 border border-blue-500/20 p-8 rounded-3xl mb-12">
        <p className="text-zinc-100 font-bold leading-relaxed mb-0">
          {dict.article.medical_disclaimer}
        </p>
      </div>

      {lang === 'es' ? (
        <>
          <h2>No es Consejo Médico</h2>
          <p>La información en Longevity Biohacker se proporciona únicamente con fines informativos y educativos. No pretende ser un sustituto del asesoramiento, diagnóstico o tratamiento médico profesional.</p>
          
          <h2>Consulte con un Profesional</h2>
          <p>Siempre busque el consejo de su médico u otro proveedor de salud calificado antes de comenzar cualquier nueva dieta, suplemento, programa de ejercicio o tratamiento biológico.</p>
          
          <h2>Enlaces de Afiliados</h2>
          <p>Algunos de los enlaces en este sitio pueden ser enlaces de afiliados, lo que significa que podemos recibir una pequeña comisión si usted realiza una compra a través de ellos, sin coste adicional para usted.</p>
        </>
      ) : (
        <>
          <h2>Not Medical Advice</h2>
          <p>The information on Longevity Biohacker is provided for informational and educational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment.</p>
          
          <h2>Consult with a Professional</h2>
          <p>Always seek the advice of your physician or other qualified health provider before starting any new diet, supplement, exercise program, or biological treatment.</p>
          
          <h2>Affiliate Disclosure</h2>
          <p>Some of the links on this site may be affiliate links, meaning we may receive a small commission if you make a purchase through them, at no extra cost to you.</p>
        </>
      )}
    </LegalLayout>
  );
}
