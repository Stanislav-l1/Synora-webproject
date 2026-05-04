'use client';

import { Quote } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { useT } from '@/lib/i18n';

function TestimonialCard({
  quote, name, role, delay,
}: { quote: string; name: string; role: string; delay: number }) {
  return (
    <ScrollReveal delay={delay} className="h-full">
      <div className="h-full flex flex-col bg-retro-bg border border-retro-ink/10 rounded-2xl p-6 hover:border-tyrian/30 transition-colors">
        <Quote size={20} className="text-tyrian/50 mb-4 shrink-0" />
        <p className="text-retro-text-muted leading-relaxed text-sm flex-1 mb-5">{quote}</p>
        <div>
          <p className="font-semibold text-retro-ink text-sm">{name}</p>
          <p className="text-xs text-retro-text-muted mt-0.5">{role}</p>
        </div>
      </div>
    </ScrollReveal>
  );
}

export function TestimonialsSection() {
  const t = useT();

  const testimonials = [
    { quote: t.landing.t1Quote, name: t.landing.t1Name, role: t.landing.t1Role },
    { quote: t.landing.t2Quote, name: t.landing.t2Name, role: t.landing.t2Role },
    { quote: t.landing.t3Quote, name: t.landing.t3Name, role: t.landing.t3Role },
    { quote: t.landing.t4Quote, name: t.landing.t4Name, role: t.landing.t4Role },
    { quote: t.landing.t5Quote, name: t.landing.t5Name, role: t.landing.t5Role },
    { quote: t.landing.t6Quote, name: t.landing.t6Name, role: t.landing.t6Role },
  ];

  return (
    <section className="relative bg-retro-bg py-24 px-6 overflow-hidden">
      <div className="blob-tyrian w-[360px] h-[360px] bottom-0 left-[-10%] opacity-25 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        <ScrollReveal className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-banana-soft text-moss-deep text-xs font-medium tracking-wider uppercase mb-4">
            {t.landing.testimonialsBadge}
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-retro-ink mb-4">
            {t.landing.testimonialsHeadline}
          </h2>
          <p className="text-retro-text-muted text-lg max-w-xl mx-auto">
            {t.landing.testimonialsSubtitle}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((item, i) => (
            <TestimonialCard key={i} {...item} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}
