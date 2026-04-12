import { ReactNode } from 'react';
import { ScrollReveal } from './ScrollReveal';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
}

export function FeatureCard({ icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <ScrollReveal delay={delay}>
      <div className="retro-card p-6 h-full transition-all duration-200">
        <div className="w-12 h-12 rounded-xl bg-retro-bg-alt flex items-center justify-center text-retro-accent mb-4">
          {icon}
        </div>
        <h3 className="font-serif text-xl text-retro-text mb-2">{title}</h3>
        <p className="text-sm text-retro-text-muted leading-relaxed">{description}</p>
      </div>
    </ScrollReveal>
  );
}
