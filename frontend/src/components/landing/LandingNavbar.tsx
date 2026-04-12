'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Community', href: '#community' },
  { label: 'Feed', href: '#feed' },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-retro-bg/95 backdrop-blur-md border-b border-retro-border shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-retro-accent flex items-center justify-center text-white font-serif text-lg font-bold">
            S
          </div>
          <span className="font-serif text-xl text-retro-text tracking-tight">
            Synora
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-retro-text-muted hover:text-retro-text text-sm font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-retro-accent hover:after:w-full after:transition-all"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-retro-text-muted hover:text-retro-text text-sm font-medium transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="bg-retro-accent hover:bg-retro-accent-hover text-white text-sm font-medium px-5 py-2 rounded-full transition-colors"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-retro-text p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-retro-bg border-t border-retro-border px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block text-retro-text-muted hover:text-retro-text text-sm font-medium py-2"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-retro-border flex flex-col gap-2">
            <Link
              href="/login"
              className="text-retro-text-muted text-sm font-medium py-2"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-retro-accent text-white text-sm font-medium px-5 py-2 rounded-full text-center"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
