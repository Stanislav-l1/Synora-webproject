'use client';

import Link from 'next/link';
import { Github, Twitter } from 'lucide-react';
import { useT } from '@/lib/i18n';

export function LandingFooter() {
  const t = useT();

  const footerLinks: Record<string, { label: string; href: string }[]> = {
    [t.landing.footerProduct]: [
      { label: t.landing.navFeatures, href: '#features' },
      { label: t.nav.projects, href: '/projects' },
      { label: t.landing.navCommunity, href: '#community' },
    ],
    [t.landing.footerCompany]: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  };

  return (
    <footer className="bg-retro-bg-alt border-t border-retro-border py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-retro-accent flex items-center justify-center text-white font-serif text-lg font-bold">
                S
              </div>
              <span className="font-serif text-xl text-retro-text">Synora</span>
            </Link>
            <p className="text-sm text-retro-text-muted leading-relaxed">
              {t.landing.footerTagline}
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-retro-text mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-retro-text-muted hover:text-retro-text transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-retro-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-retro-text-muted">
            &copy; {new Date().getFullYear()} Synora. {t.landing.footerRights}
          </p>
          <div className="flex items-center gap-4">
            <a href="#" aria-label="GitHub" className="text-retro-text-muted hover:text-retro-text transition-colors">
              <Github size={18} />
            </a>
            <a href="#" aria-label="Twitter" className="text-retro-text-muted hover:text-retro-text transition-colors">
              <Twitter size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
