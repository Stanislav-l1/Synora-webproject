'use client';

import { Globe } from 'lucide-react';
import { useLocale } from './provider';
import { LOCALES, type Locale } from './messages';
import { cn } from '@/lib/utils';

const LABELS: Record<Locale, string> = { en: 'EN', ru: 'RU' };

export function LocaleSwitcher({
  className,
  tone = 'light',
}: {
  className?: string;
  tone?: 'light' | 'dark';
}) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-1 py-0.5 text-xs font-medium',
        tone === 'dark'
          ? 'bg-moss-velvet/60 border-moss-velvet text-cloud'
          : 'bg-cloud-soft/80 border-cloud-deep text-cloud-ink',
        className,
      )}
    >
      <Globe size={12} className="ml-1 opacity-60" aria-hidden />
      {LOCALES.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            aria-pressed={active}
            className={cn(
              'px-2 py-0.5 rounded-full transition-colors',
              active
                ? tone === 'dark'
                  ? 'bg-banana text-moss-deep'
                  : 'bg-tyrian text-cloud'
                : 'opacity-70 hover:opacity-100',
            )}
          >
            {LABELS[l]}
          </button>
        );
      })}
    </div>
  );
}
