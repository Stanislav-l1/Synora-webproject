import type { Metadata } from 'next';
import Script from 'next/script';
import { LocaleProvider } from '@/lib/i18n';
import { ThemeProvider } from '@/lib/theme';
import { ToastContainer } from '@/components/ui/toast';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://synoraa.space'),
  title: {
    default: 'Synora — IT Community Platform',
    template: '%s · Synora',
  },
  description: 'GitHub meets a social network. Projects, kanban, real-time chat, courses and reputation — built for developers and IT communities.',
  applicationName: 'Synora',
  authors: [{ name: 'Synora' }],
  keywords: ['developers', 'community', 'projects', 'collaboration', 'open source', 'kanban', 'github alternative'],
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    siteName: 'Synora',
    title: 'Synora — IT Community Platform',
    description: 'Projects, real-time chat, courses and reputation. A platform built for developers and IT communities.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Synora — IT Community Platform',
    description: 'Projects, real-time chat, courses and reputation. Built for developers.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Synora',
  },
  themeColor: '#F2ECE0',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
};

const themeInitScript = `(function(){try{var s=localStorage.getItem('synora.theme');var t=(s==='light'||s==='dark')?s:'light';if(t==='dark'){document.documentElement.classList.add('dark');}document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script id="theme-init" strategy="beforeInteractive">{themeInitScript}</Script>
      </head>
      <body>
        <ThemeProvider>
          <LocaleProvider>{children}</LocaleProvider>
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
