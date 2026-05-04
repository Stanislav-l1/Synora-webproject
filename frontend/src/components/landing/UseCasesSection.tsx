'use client';

import { useState } from 'react';
import { User, Users, Globe, GraduationCap } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function UseCasesSection() {
  const t = useT();
  const [active, setActive] = useState(0);

  const cases = [
    {
      icon: User,
      tab: t.landing.uc1Tab,
      title: t.landing.uc1Title,
      desc: t.landing.uc1Desc,
      visual: [
        { label: 'Projects', val: '12', color: 'bg-tyrian/20 text-tyrian' },
        { label: 'Posts', val: '48', color: 'bg-banana/30 text-moss-deep' },
        { label: 'Reputation', val: '1,240', color: 'bg-moss/20 text-moss-deep' },
      ],
    },
    {
      icon: Users,
      tab: t.landing.uc2Tab,
      title: t.landing.uc2Title,
      desc: t.landing.uc2Desc,
      visual: [
        { label: 'Members', val: '8', color: 'bg-tyrian/20 text-tyrian' },
        { label: 'Tasks done', val: '34', color: 'bg-banana/30 text-moss-deep' },
        { label: 'Messages', val: '1.2k', color: 'bg-moss/20 text-moss-deep' },
      ],
    },
    {
      icon: Globe,
      tab: t.landing.uc3Tab,
      title: t.landing.uc3Title,
      desc: t.landing.uc3Desc,
      visual: [
        { label: 'Members', val: '340', color: 'bg-tyrian/20 text-tyrian' },
        { label: 'Events', val: '18', color: 'bg-banana/30 text-moss-deep' },
        { label: 'Courses', val: '5', color: 'bg-moss/20 text-moss-deep' },
      ],
    },
    {
      icon: GraduationCap,
      tab: t.landing.uc4Tab,
      title: t.landing.uc4Title,
      desc: t.landing.uc4Desc,
      visual: [
        { label: 'Courses', val: '3', color: 'bg-tyrian/20 text-tyrian' },
        { label: 'Contributions', val: '27', color: 'bg-banana/30 text-moss-deep' },
        { label: 'Reputation', val: '580', color: 'bg-moss/20 text-moss-deep' },
      ],
    },
  ];

  const current = cases[active];
  const Icon = current.icon;

  return (
    <section id="use-cases" className="bg-retro-bg-alt py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-banana-soft text-moss-deep text-xs font-medium tracking-wider uppercase mb-4">
            {t.landing.useCasesBadge}
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-retro-ink mb-4">
            {t.landing.useCasesHeadline}
          </h2>
          <p className="text-retro-text-muted text-lg max-w-2xl mx-auto">
            {t.landing.useCasesSubtitle}
          </p>
        </ScrollReveal>

        {/* Tab bar */}
        <ScrollReveal className="flex flex-wrap justify-center gap-2 mb-10">
          {cases.map((c, i) => {
            const TabIcon = c.icon;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all',
                  active === i
                    ? 'bg-tyrian text-cloud shadow-lg shadow-tyrian/20'
                    : 'border border-retro-ink/15 text-retro-ink/70 hover:border-tyrian/40 hover:text-tyrian',
                )}
              >
                <TabIcon size={14} />
                {c.tab}
              </button>
            );
          })}
        </ScrollReveal>

        {/* Content panel */}
        <ScrollReveal key={active}>
          <div className="bg-retro-bg rounded-2xl border border-retro-ink/10 p-8 md:p-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-tyrian/10 mb-5">
                <Icon size={22} className="text-tyrian" />
              </div>
              <h3 className="font-serif text-2xl md:text-3xl text-retro-ink mb-4">
                {current.title}
              </h3>
              <p className="text-retro-text-muted leading-relaxed">
                {current.desc}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {current.visual.map((v) => (
                <div
                  key={v.label}
                  className="text-center rounded-xl border border-retro-ink/8 bg-retro-bg-alt p-5"
                >
                  <p className={cn('text-3xl font-bold mb-1', v.color)}>{v.val}</p>
                  <p className="text-xs text-retro-text-muted uppercase tracking-wide">{v.label}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
