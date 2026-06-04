import { getDictionary } from '@/lib/dictionaries';
import { LegalLayout } from '@/components/LegalLayout';

export async function generateMetadata({ params }: { params: Promise<{ lang: 'en' | 'es' }> }) {
  const { lang } = await params;
  return {
    title: lang === 'es'
      ? 'Política de Privacidad | Biohacker Age'
      : 'Privacy Policy | Biohacker Age',
    description: lang === 'es'
      ? 'Información sobre cómo recopilamos, usamos y protegemos sus datos personales en Biohacker Age.'
      : 'Information on how we collect, use and protect your personal data at Biohacker Age.',
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: 'en' | 'es' }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <LegalLayout title={dict.legal.privacy_title} lang={lang} dict={dict}>
      {lang === 'es' ? (
        <>
          <p>Última actualización: 4 de junio de 2026</p>

          <h2>1. Responsable del Tratamiento</h2>
          <p>
            El responsable del tratamiento de los datos personales recogidos en este sitio web es
            <strong> Biohacker Age</strong>, accesible en <strong>www.biohackerage.com</strong>.
            Para cualquier consulta relacionada con la privacidad, puede contactarnos en:{' '}
            <strong>privacy@biohackerage.com</strong>.
          </p>

          <h2>2. Datos que Recopilamos</h2>
          <p>Recopilamos los siguientes tipos de datos:</p>
          <ul>
            <li><strong>Datos proporcionados voluntariamente:</strong> nombre y dirección de correo electrónico cuando se suscribe a nuestra newsletter o nos contacta mediante el formulario de contacto.</li>
            <li><strong>Datos de navegación (cookies):</strong> información técnica como dirección IP (anonimizada), tipo de navegador, páginas visitadas y duración de la sesión, recopilada automáticamente a través de cookies y tecnologías similares.</li>
            <li><strong>Datos de publicidad:</strong> a través de Google AdSense, se pueden recopilar datos de comportamiento de navegación para mostrar anuncios personalizados.</li>
          </ul>

          <h2>3. Finalidad del Tratamiento</h2>
          <p>Sus datos se utilizan exclusivamente para:</p>
          <ul>
            <li>Enviar la newsletter y comunicaciones editoriales solicitadas.</li>
            <li>Responder a consultas enviadas a través del formulario de contacto.</li>
            <li>Analizar el tráfico del sitio web para mejorar la experiencia de usuario (mediante Google Analytics).</li>
            <li>Mostrar publicidad relevante a través de Google AdSense.</li>
          </ul>

          <h2>4. Base Jurídica del Tratamiento</h2>
          <ul>
            <li><strong>Consentimiento explícito</strong> para el envío de newsletter y para el uso de cookies no esenciales.</li>
            <li><strong>Interés legítimo</strong> para el análisis estadístico del tráfico con datos anonimizados.</li>
            <li><strong>Obligación legal</strong> cuando la ley nos requiera conservar ciertos datos.</li>
          </ul>

          <h2>5. Cookies y Tecnologías de Seguimiento</h2>
          <p>Este sitio utiliza los siguientes tipos de cookies:</p>
          <ul>
            <li><strong>Cookies esenciales:</strong> necesarias para el funcionamiento básico del sitio. No requieren consentimiento.</li>
            <li><strong>Cookies de análisis (Google Analytics):</strong> recopilan datos de uso de forma anonimizada para mejorar el contenido. Requieren su consentimiento.</li>
            <li><strong>Cookies de publicidad (Google AdSense):</strong> utilizadas por Google para mostrar anuncios basados en sus intereses y visitas previas. Google puede usar estos datos conforme a su <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Política de Privacidad</a>. Puede optar por no recibir publicidad personalizada en <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Configuración de anuncios de Google</a>.</li>
          </ul>
          <p>Puede gestionar o deshabilitar las cookies desde la configuración de su navegador en cualquier momento.</p>

          <h2>6. Retención de Datos</h2>
          <ul>
            <li><strong>Datos de newsletter:</strong> conservados mientras mantenga la suscripción activa. Se eliminan en un plazo de 30 días tras la solicitud de baja.</li>
            <li><strong>Datos de contacto:</strong> eliminados en un plazo de 12 meses desde la última comunicación.</li>
            <li><strong>Datos de análisis:</strong> anonimizados y retenidos según la configuración de Google Analytics (por defecto, 26 meses).</li>
          </ul>

          <h2>7. Transferencia Internacional de Datos</h2>
          <p>
            Utilizamos servicios de terceros (Google, Vercel, Supabase) que pueden transferir datos fuera del Espacio Económico Europeo. Estos proveedores están sujetos a mecanismos de transferencia adecuados, como las Cláusulas Contractuales Tipo aprobadas por la Comisión Europea o el Marco de Privacidad de Datos UE-EE.UU.
          </p>

          <h2>8. Sus Derechos (RGPD)</h2>
          <p>Si reside en el Espacio Económico Europeo, tiene derecho a:</p>
          <ul>
            <li><strong>Acceso:</strong> solicitar una copia de los datos que conservamos sobre usted.</li>
            <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
            <li><strong>Supresión ("derecho al olvido"):</strong> solicitar la eliminación de sus datos.</li>
            <li><strong>Limitación del tratamiento:</strong> solicitar que limitemos el uso de sus datos.</li>
            <li><strong>Portabilidad:</strong> recibir sus datos en un formato estructurado y legible por máquina.</li>
            <li><strong>Oposición:</strong> oponerse al tratamiento basado en interés legítimo.</li>
            <li><strong>Retirada del consentimiento:</strong> en cualquier momento, sin que ello afecte a la licitud del tratamiento previo.</li>
          </ul>
          <p>Para ejercer cualquiera de estos derechos, contacte con nosotros en <strong>privacy@biohackerage.com</strong>. Responderemos en un plazo máximo de 30 días.</p>

          <h2>9. Menores de Edad</h2>
          <p>Este sitio web no está dirigido a menores de 16 años y no recopila intencionadamente datos de menores. Si tiene conocimiento de que un menor nos ha proporcionado información personal, contacte con nosotros para proceder a su eliminación.</p>

          <h2>10. Cambios en esta Política</h2>
          <p>Nos reservamos el derecho de actualizar esta Política de Privacidad. Cualquier cambio significativo será notificado en esta página con la fecha de actualización revisada. Le recomendamos que revise esta página periódicamente.</p>

          <h2>11. Reclamaciones</h2>
          <p>
            Si considera que el tratamiento de sus datos no cumple con la normativa vigente, tiene derecho a presentar una reclamación ante la autoridad de control competente. En España, esta es la <strong>Agencia Española de Protección de Datos (AEPD)</strong>, en <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</a>.
          </p>
        </>
      ) : (
        <>
          <p>Last updated: June 4, 2026</p>

          <h2>1. Data Controller</h2>
          <p>
            The data controller for personal data collected on this website is <strong>Biohacker Age</strong>,
            accessible at <strong>www.biohackerage.com</strong>. For any privacy-related inquiries,
            you can contact us at: <strong>privacy@biohackerage.com</strong>.
          </p>

          <h2>2. Data We Collect</h2>
          <p>We collect the following types of data:</p>
          <ul>
            <li><strong>Voluntarily provided data:</strong> name and email address when you subscribe to our newsletter or contact us via the contact form.</li>
            <li><strong>Browsing data (cookies):</strong> technical information such as anonymized IP address, browser type, pages visited, and session duration, collected automatically through cookies and similar technologies.</li>
            <li><strong>Advertising data:</strong> through Google AdSense, browsing behavior data may be collected to show personalized ads.</li>
          </ul>

          <h2>3. Purpose of Processing</h2>
          <p>Your data is used exclusively to:</p>
          <ul>
            <li>Send the newsletter and editorial communications you requested.</li>
            <li>Respond to inquiries submitted through the contact form.</li>
            <li>Analyze website traffic to improve user experience (via Google Analytics).</li>
            <li>Display relevant advertising through Google AdSense.</li>
          </ul>

          <h2>4. Legal Basis for Processing</h2>
          <ul>
            <li><strong>Explicit consent</strong> for newsletter delivery and for the use of non-essential cookies.</li>
            <li><strong>Legitimate interest</strong> for statistical traffic analysis using anonymized data.</li>
            <li><strong>Legal obligation</strong> when required by law to retain certain data.</li>
          </ul>

          <h2>5. Cookies and Tracking Technologies</h2>
          <p>This site uses the following types of cookies:</p>
          <ul>
            <li><strong>Essential cookies:</strong> necessary for basic website functionality. No consent required.</li>
            <li><strong>Analytics cookies (Google Analytics):</strong> collect anonymized usage data to improve content. Require your consent.</li>
            <li><strong>Advertising cookies (Google AdSense):</strong> used by Google to show ads based on your interests and previous visits. Google may use this data in accordance with their <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>. You can opt out of personalized advertising at <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ad Settings</a>.</li>
          </ul>
          <p>You can manage or disable cookies from your browser settings at any time.</p>

          <h2>6. Data Retention</h2>
          <ul>
            <li><strong>Newsletter data:</strong> retained while your subscription is active. Deleted within 30 days of an unsubscribe request.</li>
            <li><strong>Contact data:</strong> deleted within 12 months of the last communication.</li>
            <li><strong>Analytics data:</strong> anonymized and retained per Google Analytics settings (default: 26 months).</li>
          </ul>

          <h2>7. International Data Transfers</h2>
          <p>
            We use third-party services (Google, Vercel, Supabase) that may transfer data outside the European Economic Area. These providers are subject to appropriate transfer mechanisms, such as Standard Contractual Clauses approved by the European Commission or the EU-U.S. Data Privacy Framework.
          </p>

          <h2>8. Your Rights (GDPR)</h2>
          <p>If you reside in the European Economic Area, you have the right to:</p>
          <ul>
            <li><strong>Access:</strong> request a copy of the data we hold about you.</li>
            <li><strong>Rectification:</strong> correct inaccurate or incomplete data.</li>
            <li><strong>Erasure ("right to be forgotten"):</strong> request deletion of your data.</li>
            <li><strong>Restriction of processing:</strong> request that we limit the use of your data.</li>
            <li><strong>Data portability:</strong> receive your data in a structured, machine-readable format.</li>
            <li><strong>Objection:</strong> object to processing based on legitimate interest.</li>
            <li><strong>Withdrawal of consent:</strong> at any time, without affecting the lawfulness of prior processing.</li>
          </ul>
          <p>To exercise any of these rights, contact us at <strong>privacy@biohackerage.com</strong>. We will respond within 30 days.</p>

          <h2>9. Minors</h2>
          <p>This website is not directed at individuals under 16 years of age and does not intentionally collect data from minors. If you become aware that a minor has provided us with personal information, please contact us for deletion.</p>

          <h2>10. Changes to This Policy</h2>
          <p>We reserve the right to update this Privacy Policy. Any significant changes will be announced on this page with a revised update date. We recommend you review this page periodically.</p>

          <h2>11. Complaints</h2>
          <p>
            If you believe the processing of your data does not comply with applicable law, you have the right to lodge a complaint with the competent supervisory authority in your country of residence.
          </p>
        </>
      )}
    </LegalLayout>
  );
}
