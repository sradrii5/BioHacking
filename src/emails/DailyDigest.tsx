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

interface DailyDigestEmailProps {
  title: string;
  tldr: string;
  slug: string;
  lang: string;
}

export const DailyDigestEmail = ({
  title,
  tldr,
  slug,
  lang = 'es',
}: DailyDigestEmailProps) => {
  const baseUrl = 'https://www.biohackerage.com';
  const articleUrl = `${baseUrl}/${lang}/${slug}`;

  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>BIOHACKER<span style={blueText}>AGE</span></Text>
          </Section>
          
          <Section style={content}>
            <Heading style={heading}>
              {lang === 'es' ? 'Tu dosis diaria de longevidad' : 'Your daily longevity dose'}
            </Heading>
            <Text style={articleTitle}>{title}</Text>
            <Text style={paragraph}>{tldr}</Text>
            
            <Section style={buttonContainer}>
              <Link href={articleUrl} style={button}>
                {lang === 'es' ? 'Leer Protocolo Completo' : 'Read Full Protocol'}
              </Link>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Coding Longevity. Coding the Future.
            </Text>
            <Text style={footerSubtext}>
              {lang === 'es' 
                ? 'Has recibido este email porque estás suscrito a Biohacker Age.' 
                : 'You are receiving this because you are subscribed to Biohacker Age.'}
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

export default DailyDigestEmail;

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
  color: '#94a3b8',
  fontSize: '12px',
  fontWeight: '900',
  textTransform: 'uppercase' as const,
  letterSpacing: '2px',
  marginBottom: '20px',
  textAlign: 'center' as const,
};

const articleTitle = {
  color: '#ffffff',
  fontSize: '22px',
  fontWeight: '800',
  lineHeight: '1.4',
  marginBottom: '20px',
};

const paragraph = {
  color: '#94a3b8',
  fontSize: '16px',
  lineHeight: '1.6',
  marginBottom: '30px',
};

const buttonContainer = {
  textAlign: 'center' as const,
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

const footerSubtext = {
  color: '#475569',
  fontSize: '12px',
  margin: '0 0 20px 0',
};

const unsubscribeLink = {
  color: '#3b82f6',
  fontSize: '12px',
  textDecoration: 'underline',
};
