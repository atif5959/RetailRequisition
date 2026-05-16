import './globals.css';
import type { Metadata, Viewport } from 'next';
import ThemeProvider from '@/components/ThemeProvider';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const SITE_NAME = 'TCS Retail Requisition';
const DEFAULT_DESCRIPTION =
  'Submit, track and manage retail stock requisitions online. Fast approvals, real-time status updates, and full visibility for your operations team.';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    'retail requisition',
    'stock management',
    'TCS logistics',
    'supply chain',
    'order management',
    'Pakistan courier',
  ],
  authors:  [{ name: 'TCS' }],
  creator:  'TCS',
  publisher: 'TCS',

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  openGraph: {
    type:        'website',
    locale:      'en_PK',
    url:         APP_URL,
    siteName:    SITE_NAME,
    title:       SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  },

  twitter: {
    card:        'summary_large_image',
    title:       SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  },

  alternates: {
    canonical: APP_URL,
  },
};

export const viewport: Viewport = {
  themeColor:  '#dc2626',
  colorScheme: 'light dark',
  width:       'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external image CDN */}
        <link rel="preconnect" href="https://www.cognitoforms.com" />
        <link rel="dns-prefetch" href="https://www.cognitoforms.com" />
      </head>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
