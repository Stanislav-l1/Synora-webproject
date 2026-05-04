'use client';

import { Shield, Code2, Globe, Lock } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { useT } from '@/lib/i18n';

export function TrustSection() {
  const t = useT();

  const stats = [
    { val: t.landing.trustStat1Val, label: t.landing.trustStat1Label },
    { val: t.landing.trustStat2Val, label: t.landing.trustStat2Label },
    { val: t.landing.trustStat3Val, label: t.landing.trustStat3Label },
    { val: t.landing.trustStat4Val, label: t.landing.trustStat4Label },
  ];

  const tags = [
    { icon: Lock,   label: t.landing.trustTag1 },
    { icon: Shield, label: t.landing.trustTag2 },
    { icon: Code2,  label: t.landing.trustTag3 },
    { icon: Globe,  label: t.landing.trustTag4 },
  ];

  return (
    <section className="relative bg-retro-bg-alt py-20 px-6 overflow-hidden">
      <div className="blob-moss w-[400px] h-[400px] -top-24 -right-24 opacity-30 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        <ScrollReveal className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-banana-soft text-moss-deep text-xs font-medium tracking-wider uppercase mb-4">
            {t.landing.trustBadge}
          </span>
        </ScrollReveal>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((s, i) => (
            <ScrollReveal key={s.label} delay={i * 0.1} className="text-center">
              <p className="font-serif text-4xl md:text-5xl text-retro-ink mb-1">{s.val}</p>
              <p className="text-sm text-retro-text-muted uppercase tracking-wider">{s.label}</p>
            </ScrollReveal>
          ))}
        </div>

        {/* Trust tags */}
        <ScrollReveal className="flex flex-wrap justify-center gap-3">
          {tags.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-retro-ink/15 text-sm text-retro-ink/70 bg-retro-bg"
            >
              <Icon size={14} className="text-tyrian" />
              {label}
            </span>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
