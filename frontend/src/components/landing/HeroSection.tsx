'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Code2, MessageSquare, Users, GitBranch, Calendar } from 'lucide-react';

const floatingCards = [
  {
    icon: <Code2 size={16} />,
    label: 'New Project',
    detail: 'synora-cli v2.0',
    className: 'top-[15%] left-[5%] rotate-[-6deg]',
    animation: 'animate-float',
  },
  {
    icon: <MessageSquare size={16} />,
    label: 'Alex shared',
    detail: 'Just shipped dark mode!',
    className: 'top-[8%] right-[8%] rotate-[4deg]',
    animation: 'animate-float-delayed',
  },
  {
    icon: <Users size={16} />,
    label: 'Community',
    detail: 'Rust Devs — 2.4k members',
    className: 'bottom-[20%] left-[2%] rotate-[3deg]',
    animation: 'animate-float-slow',
  },
  {
    icon: <GitBranch size={16} />,
    label: 'Pull Request',
    detail: '#142 merged',
    className: 'bottom-[25%] right-[5%] rotate-[-3deg]',
    animation: 'animate-float',
  },
  {
    icon: <Calendar size={16} />,
    label: 'Event',
    detail: 'WebDev Conf — Tomorrow',
    className: 'top-[45%] right-[2%] rotate-[2deg]',
    animation: 'animate-float-delayed',
  },
];

const headlineWords = ['Where', 'developers', 'build,', 'share,', 'and', 'grow', 'together.'];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-retro-bg pt-16">
      {/* Subtle radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(204,120,92,0.06)_0%,_transparent_70%)]" />

      {/* Floating cards */}
      <div className="absolute inset-0 hidden lg:block">
        {floatingCards.map((card, i) => (
          <div
            key={i}
            className={`absolute ${card.className} ${card.animation}`}
          >
            <div className="retro-card px-4 py-3 flex items-center gap-3 select-none">
              <div className="w-8 h-8 rounded-lg bg-retro-bg-alt flex items-center justify-center text-retro-accent shrink-0">
                {card.icon}
              </div>
              <div>
                <p className="text-xs font-medium text-retro-text">{card.label}</p>
                <p className="text-xs text-retro-text-muted">{card.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl leading-[1.1] text-retro-ink mb-6">
          {headlineWords.map((word, i) => (
            <motion.span
              key={i}
              className={`inline-block mr-[0.3em] ${
                word === 'build,' || word === 'share,' || word === 'grow'
                  ? 'italic text-retro-accent'
                  : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: 'easeOut' }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          className="text-lg md:text-xl text-retro-text-muted max-w-xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1, ease: 'easeOut' }}
        >
          The platform for developers to collaborate on projects, share ideas,
          build communities, and attend events — all in one place.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3, ease: 'easeOut' }}
        >
          <Link
            href="/register"
            className="bg-retro-accent hover:bg-retro-accent-hover text-white font-medium px-8 py-3 rounded-full text-base transition-colors shadow-sm"
          >
            Join Synora
          </Link>
          <Link
            href="#features"
            className="border border-retro-border hover:border-retro-accent text-retro-text font-medium px-8 py-3 rounded-full text-base transition-colors"
          >
            Explore Features
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
