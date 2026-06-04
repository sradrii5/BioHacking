import { getDictionary } from '@/lib/dictionaries';
import { LegalLayout } from '@/components/LegalLayout';

export async function generateMetadata({ params }: { params: Promise<{ lang: 'en' | 'es' }> }) {
  const { lang } = await params;
  return {
    title: lang === 'es'
      ? 'Términos de Servicio | Biohacker Age'
      : 'Terms of Service | Biohacker Age',
    description: lang === 'es'
      ? 'Términos y condiciones de uso de Biohacker Age, la plataforma de análisis científico sobre longevidad y optimización biológica.'
      : 'Terms and conditions for using Biohacker Age, the scientific analysis platform for longevity and biological optimization.',
  };
}

export default async function TermsPage({ params }: { params: Promise<{ lang: 'en' | 'es' }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <LegalLayout title={dict.legal.terms_title} lang={lang} dict={dict}>
      {lang === 'es' ? (
        <>
          <p>Última actualización: 4 de junio de 2026</p>

          <h2>1. Aceptación de los Términos</h2>
          <p>
            Al acceder y utilizar Biohacker Age (<strong>www.biohackerage.com</strong>), usted acepta
            quedar vinculado por estos Términos de Servicio y todas las leyes y regulaciones aplicables.
            Si no está de acuerdo con alguno de estos términos, le rogamos que no utilice este sitio.
          </p>

          <h2>2. Descripción del Servicio</h2>
          <p>
            Biohacker Age es una plataforma editorial de divulgación científica especializada en longevidad,
            optimización biológica y biohacking. El contenido publicado consiste en análisis y síntesis de
            investigaciones científicas de acceso público, complementados con perspectivas editoriales orientadas
            a la aplicación práctica por parte de adultos sanos interesados en la autooptimización.
          </p>
          <p>
            Todo el contenido se fundamenta en estudios publicados en bases de datos académicas reconocidas
            (como PubMed/MEDLINE). Las referencias a los estudios originales se proporcionan en cada artículo.
          </p>

          <h2>3. Uso Permitido</h2>
          <p>Usted puede:</p>
          <ul>
            <li>Leer, compartir y citar el contenido con atribución apropiada a Biohacker Age.</li>
            <li>Suscribirse a la newsletter para recibir actualizaciones editoriales.</li>
            <li>Utilizar el contenido para su educación e información personal.</li>
          </ul>
          <p>Queda expresamente prohibido:</p>
          <ul>
            <li>Reproducir o distribuir el contenido de forma comercial sin autorización escrita.</li>
            <li>Scraping automatizado del sitio para cualquier fin.</li>
            <li>Utilizar el contenido de este sitio para elaborar diagnósticos médicos propios o de terceros.</li>
          </ul>

          <h2>4. Naturaleza Informativa del Contenido</h2>
          <p>
            Todo el contenido de Biohacker Age tiene carácter exclusivamente informativo y divulgativo.
            No constituye consejo médico, diagnóstico, prescripción ni tratamiento de ningún tipo.
            Para decisiones relacionadas con su salud, consulte siempre a un profesional sanitario cualificado.
          </p>
          <p>
            La ciencia de la longevidad y el biohacking es un campo en constante evolución. Los estudios
            citados reflejan el estado del conocimiento en su fecha de publicación y pueden ser actualizados,
            revisados o contradichos por investigaciones posteriores.
          </p>

          <h2>5. Propiedad Intelectual</h2>
          <p>
            El diseño, código, logotipos, marca y el contenido editorial original de Biohacker Age son
            propiedad de sus creadores y están protegidos por las leyes de propiedad intelectual aplicables.
            Los estudios científicos citados pertenecen a sus respectivos autores e instituciones.
          </p>

          <h2>6. Publicidad y Afiliados</h2>
          <p>
            Este sitio muestra publicidad a través de Google AdSense. Biohacker Age también puede incluir
            enlaces de afiliado a productos relacionados con el biohacking y la longevidad. Estos enlaces
            se identifican claramente. Las comisiones de afiliado no influyen en la selección ni en la
            valoración editorial del contenido científico.
          </p>

          <h2>7. Limitación de Responsabilidad</h2>
          <p>
            Biohacker Age no será responsable de ningún daño directo, indirecto, incidental o consecuente
            derivado del uso de este sitio o de la aplicación de su contenido. El uso de la información
            publicada es responsabilidad exclusiva del usuario.
          </p>

          <h2>8. Modificaciones</h2>
          <p>
            Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán
            efectivos en el momento de su publicación en esta página. Le recomendamos revisarlos periódicamente.
          </p>

          <h2>9. Ley Aplicable</h2>
          <p>
            Estos términos se rigen por la legislación española y europea aplicable. Cualquier disputa
            se someterá a la jurisdicción de los tribunales competentes.
          </p>
        </>
      ) : (
        <>
          <p>Last updated: June 4, 2026</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Biohacker Age (<strong>www.biohackerage.com</strong>), you agree to be
            bound by these Terms of Service and all applicable laws and regulations. If you do not agree
            with any of these terms, please do not use this site.
          </p>

          <h2>2. Description of the Service</h2>
          <p>
            Biohacker Age is an editorial platform specializing in science communication about longevity,
            biological optimization, and biohacking. Published content consists of analysis and synthesis
            of publicly available scientific research, complemented by editorial perspectives aimed at
            practical application by healthy adults interested in self-optimization.
          </p>
          <p>
            All content is grounded in studies published in recognized academic databases (such as PubMed/MEDLINE).
            References to the original studies are provided in each article.
          </p>

          <h2>3. Permitted Use</h2>
          <p>You may:</p>
          <ul>
            <li>Read, share, and cite content with appropriate attribution to Biohacker Age.</li>
            <li>Subscribe to the newsletter to receive editorial updates.</li>
            <li>Use content for personal education and information.</li>
          </ul>
          <p>The following are expressly prohibited:</p>
          <ul>
            <li>Reproducing or distributing content commercially without written authorization.</li>
            <li>Automated scraping of the site for any purpose.</li>
            <li>Using content from this site to make medical diagnoses for yourself or others.</li>
          </ul>

          <h2>4. Informational Nature of Content</h2>
          <p>
            All content on Biohacker Age is strictly informational and educational in nature.
            It does not constitute medical advice, diagnosis, prescription, or treatment of any kind.
            For decisions related to your health, always consult a qualified healthcare professional.
          </p>
          <p>
            Longevity science and biohacking is a rapidly evolving field. Studies cited reflect the state
            of knowledge at their publication date and may be updated, revised, or contradicted by
            subsequent research.
          </p>

          <h2>5. Intellectual Property</h2>
          <p>
            The design, code, logos, brand, and original editorial content of Biohacker Age are the
            property of their creators and are protected by applicable intellectual property laws.
            Scientific studies cited remain the property of their respective authors and institutions.
          </p>

          <h2>6. Advertising and Affiliates</h2>
          <p>
            This site displays advertising through Google AdSense. Biohacker Age may also include
            affiliate links to biohacking and longevity-related products. These links are clearly
            identified. Affiliate commissions do not influence the selection or editorial evaluation
            of scientific content.
          </p>

          <h2>7. Limitation of Liability</h2>
          <p>
            Biohacker Age shall not be liable for any direct, indirect, incidental, or consequential
            damages arising from the use of this site or the application of its content. Use of the
            published information is solely the responsibility of the user.
          </p>

          <h2>8. Modifications</h2>
          <p>
            We reserve the right to modify these terms at any time. Changes will be effective upon
            publication on this page. We recommend reviewing them periodically.
          </p>

          <h2>9. Governing Law</h2>
          <p>
            These terms are governed by applicable Spanish and European law. Any disputes will be
            submitted to the jurisdiction of the competent courts.
          </p>
        </>
      )}
    </LegalLayout>
  );
}
