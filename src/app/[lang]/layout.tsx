import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import "../globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export async function generateMetadata({ params }: { params: Promise<{ lang: 'en' | 'es' }> }) {
  const { lang } = await params;
  
  const titles = {
    es: "Biohacker Age | Protocolos de Longevidad y Biohacking",
    en: "Biohacker Age | Longevity Protocols and Biohacking"
  };
  
  const descriptions = {
    es: "Descubre los últimos avances científicos en longevidad, optimización biológica y protocolos de biohacking para vivir más y mejor.",
    en: "Discover the latest scientific breakthroughs in longevity, biological optimization, and biohacking protocols to live longer and better."
  };

  return {
    title: titles[lang] || titles.es,
    description: descriptions[lang] || descriptions.es,
    metadataBase: new URL('https://www.biohackerage.com'),
    alternates: {
      canonical: `/${lang}`,
      languages: {
        'es-ES': '/es',
        'en-US': '/en',
        'x-default': '/es',
      },
    },
    verification: {
      google: '6NUlRe1_WR9euIXpytbvKZXQSGmq4c9L2usoMAQkmzU',
    },
    icons: {
      icon: [
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon.ico' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
      other: [
        { rel: 'android-chrome', url: '/android-chrome-192x192.png', sizes: '192x192' },
        { rel: 'android-chrome', url: '/android-chrome-512x512.png', sizes: '512x512' },
      ],
    },
    manifest: '/site.webmanifest',
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  
  return (
    <html
      lang={lang}
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Google AdSense Verification */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          ></script>
        )}
        {children}
        <Analytics />
      </body>
    </html>
  );
}
