'use client';

import { ScrollReveal } from './ScrollReveal';
import { useT } from '@/lib/i18n';

const PARTNERS = [
  'Acme Corp', 'ByteForge', 'Novex Labs', 'StackHive',
  'CloudPeak', 'DevNest', 'OpenCraft', 'PulseIO',
  'Acme Corp', 'ByteForge', 'Novex Labs', 'StackHive',
  'CloudPeak', 'DevNest', 'OpenCraft', 'PulseIO',
];

export function PartnersSection() {
  const t = useT();

  return (
    <section className="bg-retro-bg border-y border-retro-ink/8 py-10 overflow-hidden">
      <ScrollReveal className="text-center mb-6">
        <p className="text-xs uppercase tracking-widest text-retro-text-muted font-medium">
          {t.landing.partnersBadge}
        </p>
      </ScrollReveal>

      {/* Marquee */}
      <div className="relative flex">
        <div className="flex animate-marquee whitespace-nowrap">
          {PARTNERS.map((name, i) => (
            <span
              key={i}
              className="inline-flex items-center mx-8 text-retro-ink/40 font-semibold text-lg tracking-tight select-none"
            >
              {name}
            </span>
          ))}
        </div>
        <div className="flex animate-marquee whitespace-nowrap" aria-hidden>
          {PARTNERS.map((name, i) => (
            <span
              key={i}
              className="inline-flex items-center mx-8 text-retro-ink/40 font-semibold text-lg tracking-tight select-none"
            >
              {name}
            </span>
          ))}
        </div>
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-retro-bg to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-retro-bg to-transparent" />
      </div>
    </section>
  );
}
