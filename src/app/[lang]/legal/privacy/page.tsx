import { getDictionary } from '@/lib/dictionaries';
import { LegalLayout } from '@/components/LegalLayout';

export default async function PrivacyPage({ params }: { params: Promise<{ lang: 'en' | 'es' }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <LegalLayout title={dict.legal.privacy_title} lang={lang} dict={dict}>
      {lang === 'es' ? (
        <>
          <p>Última actualización: 4 de mayo de 2026</p>
          <h2>1. Introducción</h2>
          <p>En Longevity Biohacker, nos tomamos muy en serio su privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos su información cuando visita nuestro sitio web.</p>
          
          <h2>2. Información que recopilamos</h2>
          <p>Recopilamos información que usted nos proporciona directamente, como su nombre y correo electrónico cuando se suscribe a nuestra newsletter. También recopilamos datos de navegación de forma automática a través de cookies para mejorar su experiencia.</p>
          
          <h2>3. Uso de Google AdSense</h2>
          <p>Utilizamos Google AdSense para mostrar anuncios. Google utiliza cookies para publicar anuncios basados en sus visitas anteriores a nuestro sitio web o a otros sitios web en Internet.</p>
          
          <h2>4. Sus derechos</h2>
          <p>Usted tiene derecho a acceder, corregir o eliminar su información personal en cualquier momento poniéndose en contacto con nosotros.</p>
        </>
      ) : (
        <>
          <p>Last updated: May 4, 2026</p>
          <h2>1. Introduction</h2>
          <p>At Longevity Biohacker, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your information when you visit our website.</p>
          
          <h2>2. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as your name and email when you subscribe to our newsletter. We also collect browsing data automatically through cookies to enhance your experience.</p>
          
          <h2>3. Google AdSense</h2>
          <p>We use Google AdSense to show ads. Google uses cookies to serve ads based on your previous visits to our website or other websites on the Internet.</p>
          
          <h2>4. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information at any time by contacting us.</p>
        </>
      )}
    </LegalLayout>
  );
}
