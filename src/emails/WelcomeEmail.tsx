import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  lang: string;
}

export const WelcomeEmail = ({ lang = 'es' }: WelcomeEmailProps) => {
  const baseUrl = 'https://www.biohackerage.com';

  return (
    <Html>
      <Head />
      <Preview>{lang === 'es' ? '¡Bienvenido a Biohacker Age!' : 'Welcome to Biohacker Age!'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>BIOHACKER<span style={blueText}>AGE</span></Text>
          </Section>
          
          <Section style={content}>
            <Heading style={heading}>
              {lang === 'es' ? '¡La optimización comienza ahora!' : 'Optimization starts now!'}
            </Heading>
            <Text style={paragraph}>
              {lang === 'es' 
                ? 'Gracias por unirte a nuestra comunidad de élite. A partir de mañana, recibirás cada día a las 06:00 AM un resumen con los descubrimientos más punteros sobre longevidad, biohacking y ciencia de vanguardia.' 
                : 'Thank you for joining our elite community. Starting tomorrow, every day at 06:00 AM you will receive a summary of the most cutting-edge discoveries in longevity, biohacking, and advanced science.'}
            </Text>
            <Text style={paragraph}>
              {lang === 'es'
                ? 'Nuestro objetivo es simple: hackear el tiempo y codificar el futuro.'
                : 'Our goal is simple: hack time and code the future.'}
            </Text>
            
            <Section style={buttonContainer}>
              <Link href={baseUrl} style={button}>
                {lang === 'es' ? 'Explorar la Web' : 'Explore the Web'}
              </Link>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Coding Longevity. Coding the Future.
            </Text>
            <Link href={`${baseUrl}/unsubscribe`} style={unsubscribeLink}>
              {lang === 'es' ? 'Darse de baja' : 'Unsubscribe'}
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

const main = {
  backgroundColor: '#020617',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
};

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '40px',
};

const logoText = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '900',
  letterSpacing: '-1px',
  margin: '0',
};

const blueText = {
  color: '#3b82f6',
};

const content = {
  backgroundColor: '#0f172a',
  borderRadius: '24px',
  padding: '40px',
  border: '1px solid #1e293b',
};

const heading = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '900',
  textAlign: 'center' as const,
  marginBottom: '30px',
};

const paragraph = {
  color: '#94a3b8',
  fontSize: '16px',
  lineHeight: '1.6',
  marginBottom: '20px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '30px',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: '900',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const footer = {
  marginTop: '40px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '800',
  margin: '0 0 10px 0',
};

const unsubscribeLink = {
  color: '#3b82f6',
  fontSize: '12px',
  textDecoration: 'underline',
};
