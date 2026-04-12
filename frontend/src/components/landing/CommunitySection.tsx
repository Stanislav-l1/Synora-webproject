'use client';

import { useEffect, useRef, useState } from 'react';
import { ScrollReveal } from './ScrollReveal';

const stats = [
  { value: 10000, label: 'Developers', suffix: '+' },
  { value: 5000, label: 'Projects', suffix: '+' },
  { value: 500, label: 'Communities', suffix: '+' },
  { value: 200, label: 'Events', suffix: '+' },
];

const avatarColors = [
  'bg-rose-200', 'bg-blue-200', 'bg-emerald-200', 'bg-amber-200',
  'bg-violet-200', 'bg-cyan-200', 'bg-pink-200', 'bg-teal-200',
  'bg-orange-200', 'bg-indigo-200', 'bg-lime-200', 'bg-fuchsia-200',
];

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1500;
          const steps = 40;
          const increment = target / steps;
          let current = 0;
          const interval = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(interval);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  const formatted =
    count >= 1000 ? `${(count / 1000).toFixed(count >= target ? 0 : 1)}k` : `${count}`;

  return (
    <span ref={ref}>
      {formatted}
      {count >= target ? suffix : ''}
    </span>
  );
}

export function CommunitySection() {
  return (
    <section id="community" className="bg-retro-bg-alt py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-retro-ink mb-4">
            Join thousands of{' '}
            <span className="italic text-retro-accent">developers</span>
          </h2>
          <p className="text-retro-text-muted text-lg">
            A growing community of builders, learners, and creators.
          </p>
        </ScrollReveal>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 0.1}>
              <div className="text-center">
                <p className="font-serif text-4xl md:text-5xl text-retro-ink mb-1">
                  <CountUp target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-retro-text-muted">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Avatar row */}
        <ScrollReveal className="flex items-center justify-center">
          <div className="flex -space-x-3">
            {avatarColors.map((color, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-full ${color} border-2 border-retro-bg-alt`}
              />
            ))}
            <div className="w-10 h-10 rounded-full bg-retro-accent border-2 border-retro-bg-alt flex items-center justify-center text-white text-xs font-medium">
              +9k
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
