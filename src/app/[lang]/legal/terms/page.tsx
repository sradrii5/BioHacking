import { getDictionary } from '@/lib/dictionaries';
import { LegalLayout } from '@/components/LegalLayout';

export default async function TermsPage({ params }: { params: Promise<{ lang: 'en' | 'es' }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <LegalLayout title={dict.legal.terms_title} lang={lang} dict={dict}>
      {lang === 'es' ? (
        <>
          <p>Última actualización: 4 de mayo de 2026</p>
          <h2>1. Aceptación de los Términos</h2>
          <p>Al acceder a Longevity Biohacker, usted acepta cumplir con estos términos de servicio y todas las leyes y regulaciones aplicables.</p>
          
          <h2>2. Uso de la Información</h2>
          <p>El contenido de este sitio es puramente informativo. No somos responsables de cómo usted utilice la información proporcionada. Todo el contenido generado por IA está basado en estudios científicos, pero debe ser verificado.</p>
          
          <h2>3. Propiedad Intelectual</h2>
          <p>Todo el contenido, diseño y código de este sitio son propiedad de Longevity Biohacker y están protegidos por leyes de derechos de autor.</p>
          
          <h2>4. Limitación de Responsabilidad</h2>
          <p>Longevity Biohacker no se hace responsable de ningún daño directo o indirecto resultante del uso de este sitio web.</p>
        </>
      ) : (
        <>
          <p>Last updated: May 4, 2026</p>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing Longevity Biohacker, you agree to comply with these terms of service and all applicable laws and regulations.</p>
          
          <h2>2. Use of Information</h2>
          <p>The content on this site is purely informational. We are not responsible for how you use the information provided. All AI-generated content is based on scientific studies but should be verified.</p>
          
          <h2>3. Intellectual Property</h2>
          <p>All content, design, and code on this site are the property of Longevity Biohacker and are protected by copyright laws.</p>
          
          <h2>4. Limitation of Liability</h2>
          <p>Longevity Biohacker is not liable for any direct or indirect damages resulting from the use of this website.</p>
        </>
      )}
    </LegalLayout>
  );
}
