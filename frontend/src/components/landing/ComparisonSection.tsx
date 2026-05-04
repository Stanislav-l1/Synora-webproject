'use client';

import { Check, Minus } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type Support = boolean | 'partial';

interface CompRow {
  feature: string;
  synora: Support;
  github: Support;
  discord: Support;
  devto: Support;
}

function Cell({ v }: { v: Support }) {
  if (v === true)    return <Check size={18} className="mx-auto text-tyrian" />;
  if (v === 'partial') return <span className="block w-4 h-0.5 mx-auto bg-banana-deep rounded" />;
  return <Minus size={18} className="mx-auto text-retro-ink/20" />;
}

export function ComparisonSection() {
  const t = useT();

  const rows: CompRow[] = [
    { feature: t.landing.compF1, synora: true,      github: false,     discord: false,   devto: true      },
    { feature: t.landing.compF2, synora: true,      github: false,     discord: true,    devto: false     },
    { feature: t.landing.compF3, synora: true,      github: true,      discord: false,   devto: false     },
    { feature: t.landing.compF4, synora: true,      github: false,     discord: true,    devto: 'partial' },
    { feature: t.landing.compF5, synora: true,      github: false,     discord: false,   devto: false     },
    { feature: t.landing.compF6, synora: true,      github: false,     discord: false,   devto: false     },
    { feature: t.landing.compF7, synora: true,      github: false,     discord: false,   devto: 'partial' },
    { feature: t.landing.compF8, synora: true,      github: 'partial', discord: false,   devto: false     },
  ];

  const cols = [
    { key: 'synora',  label: t.landing.compColSynora,  highlight: true  },
    { key: 'github',  label: t.landing.compColGitHub,  highlight: false },
    { key: 'discord', label: t.landing.compColDiscord, highlight: false },
    { key: 'devto',   label: t.landing.compColDevTo,   highlight: false },
  ];

  return (
    <section className="bg-retro-bg py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-banana-soft text-moss-deep text-xs font-medium tracking-wider uppercase mb-4">
            {t.landing.compBadge}
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-retro-ink mb-4">
            {t.landing.compHeadline}
          </h2>
          <p className="text-retro-text-muted text-lg max-w-2xl mx-auto">
            {t.landing.compSubtitle}
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="overflow-x-auto rounded-2xl border border-retro-ink/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-retro-bg-alt border-b border-retro-ink/10">
                  <th className="text-left px-6 py-4 font-medium text-retro-text-muted w-1/2" />
                  {cols.map((c) => (
                    <th
                      key={c.key}
                      className={cn(
                        'px-4 py-4 text-center font-semibold text-sm',
                        c.highlight
                          ? 'text-tyrian bg-tyrian/5 border-x border-tyrian/20'
                          : 'text-retro-ink/60',
                      )}
                    >
                      {c.label}
                      {c.highlight && (
                        <span className="block text-[10px] font-normal text-tyrian/60 mt-0.5 uppercase tracking-wide">
                          ★
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={cn(
                      'border-b border-retro-ink/8 last:border-0',
                      i % 2 === 0 ? 'bg-retro-bg' : 'bg-retro-bg-alt/50',
                    )}
                  >
                    <td className="px-6 py-4 text-retro-ink/80 font-medium">{row.feature}</td>
                    {cols.map((c) => (
                      <td
                        key={c.key}
                        className={cn(
                          'px-4 py-4 text-center',
                          c.highlight && 'bg-tyrian/5 border-x border-tyrian/10',
                        )}
                      >
                        <Cell v={row[c.key as keyof CompRow] as Support} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
