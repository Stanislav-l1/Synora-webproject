import type { Metadata } from 'next';
import Script from 'next/script';
import { LocaleProvider } from '@/lib/i18n';
import { ThemeProvider } from '@/lib/theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'Synora — IT Community Platform',
  description: 'Projects, collaboration, learning and networking for developers',
};

const themeInitScript = `(function(){try{var s=localStorage.getItem('synora.theme');var m=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;var t=(s==='light'||s==='dark')?s:(m?'dark':'light');if(t==='dark'){document.documentElement.classList.add('dark');}document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script id="theme-init" strategy="beforeInteractive">{themeInitScript}</Script>
      </head>
      <body>
        <ThemeProvider>
          <LocaleProvider>{children}</LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
