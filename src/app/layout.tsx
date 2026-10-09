import type { Metadata } from 'next';
import { Inter, Noto_Serif_Bengali, Anek_Bangla } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Providers } from '@/context/Providers';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import NavigationProgress from '@/components/NavigationProgress';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-serif-bengali',
  display: 'swap',
});

const anekBangla = Anek_Bangla({
  subsets: ['bengali', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-anek-bangla',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_BD',
    title: 'BDNEEDS | Best Online Shopping in Bangladesh for Gadgets & Clothing',
    description:
      'Shop the best gadgets, clothing, stationary, and lifestyle products online in Bangladesh. Enjoy fast delivery, best prices, and premium customer service at BDNeeds.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BDNEEDS | Best Online Shopping in Bangladesh',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  title: {
    template: '%s | BDNEEDS',
    default: 'BDNEEDS | Best Online Shopping in Bangladesh',
  },
  description:
    'Shop the best gadgets, clothing, stationary, and lifestyle products online in Bangladesh. Enjoy fast delivery, best prices, and premium customer service at BDNeeds.',
  keywords: [
    'online shopping bangladesh',
    'buy gadgets online bd',
    'clothing online bd',
    'stationary shop bd',
    'ecommerce bangladesh',
    'BDNeeds',
  ],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoSerifBengali.variable} ${anekBangla.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[#ffffff] text-[#0B132B]" suppressHydrationWarning>
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'BDNEEDS',
              url: SITE_URL,
              logo: `${SITE_URL}/logo.png`,
              sameAs: [
                'https://www.facebook.com/bdneeds.com.bd',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+8801533659634',
                contactType: 'customer service',
                areaServed: 'BD',
                availableLanguage: ['en', 'bn'],
              },
            }),
          }}
        />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
        <NavigationProgress />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
