'use client';

import { GitBranch, MessageSquare, Users, Calendar } from 'lucide-react';
import { FeatureCard } from './FeatureCard';
import { ScrollReveal } from './ScrollReveal';
import { useT } from '@/lib/i18n';

export function FeaturesGrid() {
  const t = useT();

  const features = [
    {
      icon: <GitBranch size={24} />,
      title: t.landing.featureBuildTitle,
      description: t.landing.featureBuildDesc,
      accent: 'tyrian' as const,
    },
    {
      icon: <MessageSquare size={24} />,
      title: t.landing.featureShareTitle,
      description: t.landing.featureShareDesc,
      accent: 'banana' as const,
    },
    {
      icon: <Users size={24} />,
      title: t.landing.featureFindTitle,
      description: t.landing.featureFindDesc,
      accent: 'moss' as const,
    },
    {
      icon: <Calendar size={24} />,
      title: t.landing.featureLearnTitle,
      description: t.landing.featureLearnDesc,
      accent: 'tyrian' as const,
    },
  ];

  return (
    <section id="features" className="relative bg-retro-bg py-28 px-6 overflow-hidden">
      <div className="blob-banana w-[420px] h-[420px] -top-20 right-[-10%] opacity-60 pointer-events-none" />
      <div className="blob-tyrian w-[340px] h-[340px] bottom-[-10%] left-[-8%] opacity-40 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-banana-soft text-moss-deep text-xs font-medium tracking-wider uppercase mb-4">
            {t.landing.featuresBadge}
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-retro-ink mb-4">
            {t.landing.featuresHeadline}
            <span className="italic text-gradient">{t.landing.featuresHeadlineAccent}</span>
          </h2>
          <p className="text-retro-text-muted text-lg max-w-2xl mx-auto">
            {t.landing.featuresSubtitle}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              accent={feature.accent}
              delay={i * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
