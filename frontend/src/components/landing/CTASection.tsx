'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { useT } from '@/lib/i18n';

export function CTASection() {
  const t = useT();
  return (
    <section className="relative bg-moss-deep py-24 px-6 overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-tyrian via-banana to-tyrian" />

      <div className="blob-tyrian w-[500px] h-[500px] -top-32 -left-32 opacity-60" />
      <div className="blob-banana w-[420px] h-[420px] -bottom-28 -right-28 opacity-50" />

      <ScrollReveal className="relative max-w-3xl mx-auto text-center">
        <h2 className="font-serif text-4xl md:text-5xl text-cloud mb-4 leading-tight">
          {t.landing.ctaHeadline}
        </h2>
        <p className="text-cloud/70 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          {t.landing.ctaSubtitle}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 bg-banana hover:bg-banana-deep text-moss-deep font-semibold px-8 py-3.5 rounded-full text-base transition-all shadow-lg hover:shadow-tyrian hover:-translate-y-0.5"
          >
            {t.landing.ctaButton}
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/login"
            className="text-cloud/70 hover:text-cloud text-sm font-medium transition-colors"
          >
            {t.auth.haveAccount} {t.auth.signIn} &rarr;
          </Link>
        </div>
      </ScrollReveal>
    </section>
  );
}
