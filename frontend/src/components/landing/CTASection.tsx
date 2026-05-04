'use client';

import Link from 'next/link';
import { ArrowRight, UserPlus, Sparkles, GitBranch } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { useT } from '@/lib/i18n';

export function CTASection() {
  const t = useT();

  const steps = [
    { icon: UserPlus,   label: t.landing.ctaStep1, num: '01' },
    { icon: Sparkles,   label: t.landing.ctaStep2, num: '02' },
    { icon: GitBranch,  label: t.landing.ctaStep3, num: '03' },
  ];

  return (
    <section className="relative bg-moss-deep py-24 px-6 overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-tyrian via-banana to-tyrian" />
      <div className="blob-tyrian w-[500px] h-[500px] -top-32 -left-32 opacity-60" />
      <div className="blob-banana w-[420px] h-[420px] -bottom-28 -right-28 opacity-50" />

      <div className="relative max-w-4xl mx-auto">
        <ScrollReveal className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl text-cloud mb-4 leading-tight">
            {t.landing.ctaHeadline}
          </h2>
          <p className="text-cloud/70 text-lg max-w-xl mx-auto leading-relaxed">
            {t.landing.ctaSubtitle}
          </p>
        </ScrollReveal>

        {/* Onboarding steps */}
        <ScrollReveal className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {steps.map(({ icon: Icon, label, num }, i) => (
            <div
              key={num}
              className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              {i < steps.length - 1 && (
                <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
                  <ArrowRight size={16} className="text-cloud/30" />
                </div>
              )}
              <span className="text-xs font-mono text-cloud/30 mb-3">{num}</span>
              <div className="w-10 h-10 rounded-xl bg-tyrian/20 flex items-center justify-center mb-3">
                <Icon size={18} className="text-banana" />
              </div>
              <p className="text-sm font-medium text-cloud/80">{label}</p>
            </div>
          ))}
        </ScrollReveal>

        <ScrollReveal className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
            {t.auth.haveAccount} {t.auth.signIn} →
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
