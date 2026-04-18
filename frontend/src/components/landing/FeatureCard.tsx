import { ReactNode } from 'react';
import { ScrollReveal } from './ScrollReveal';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
  accent?: 'tyrian' | 'banana' | 'moss';
}

const accentMap = {
  tyrian: 'text-tyrian bg-tyrian-muted group-hover:bg-tyrian group-hover:text-cloud',
  banana: 'text-moss-deep bg-banana-soft group-hover:bg-banana group-hover:text-moss-deep',
  moss:   'text-moss bg-moss/10 group-hover:bg-moss group-hover:text-cloud',
};

export function FeatureCard({ icon, title, description, delay = 0, accent = 'tyrian' }: FeatureCardProps) {
  return (
    <ScrollReveal delay={delay}>
      <div className="retro-card card-tyrian-glow group p-7 h-full">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors duration-200 ${accentMap[accent]}`}>
          {icon}
        </div>
        <h3 className="font-serif text-2xl text-retro-text mb-2">{title}</h3>
        <p className="text-sm text-retro-text-muted leading-relaxed">{description}</p>
      </div>
    </ScrollReveal>
  );
}
