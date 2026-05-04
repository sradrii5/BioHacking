import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import Script from "next/script";
import "../globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return {
    title: "Biohacker Age | Protocolos de Longevidad y Biohacking",
    description: "Descubre los últimos avances científicos en longevidad, optimización biológica y protocolos de biohacking para vivir más y mejor.",
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
      </body>
    </html>
  );
}
