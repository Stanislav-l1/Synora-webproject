import Link from 'next/link';
import { Github, Twitter } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Projects', href: '/projects' },
    { label: 'Communities', href: '#community' },
    { label: 'Events', href: '#features' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
};

export function LandingFooter() {
  return (
    <footer className="bg-retro-bg-alt border-t border-retro-border py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-retro-accent flex items-center justify-center text-white font-serif text-lg font-bold">
                S
              </div>
              <span className="font-serif text-xl text-retro-text">Synora</span>
            </Link>
            <p className="text-sm text-retro-text-muted leading-relaxed">
              Where developers build, share, and grow together.
            </p>
          </div>

          {/* Links */}
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

        {/* Bottom */}
        <div className="border-t border-retro-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-retro-text-muted">
            &copy; {new Date().getFullYear()} Synora. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-retro-text-muted hover:text-retro-text transition-colors">
              <Github size={18} />
            </a>
            <a href="#" className="text-retro-text-muted hover:text-retro-text transition-colors">
              <Twitter size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
