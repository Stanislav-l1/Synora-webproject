'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { TerminalPulse } from './TerminalPulse';
import { useT } from '@/lib/i18n';

const ITALIC_WORDS = new Set(['build,', 'share,', 'grow', 'строят,', 'делятся', 'растут']);

export function HeroSection() {
  const t = useT();
  const headlineWords = t.landing.heroHeadline.split(' ');
  return (
    <section className="relative min-h-[calc(100vh-64px)] flex items-center overflow-hidden bg-retro-bg pt-24 pb-16">
      {/* Decorative blobs */}
      <div className="blob-tyrian w-[520px] h-[520px] -top-40 -left-40 opacity-70 animate-blob" />
      <div className="blob-banana w-[480px] h-[480px] top-1/3 -right-40 opacity-80 animate-blob [animation-delay:4s]" />
      <div className="blob-moss w-[360px] h-[360px] -bottom-24 left-1/4 opacity-50 animate-blob [animation-delay:8s]" />

      {/* Paper grain */}
      <div className="absolute inset-0 paper-noise opacity-60 pointer-events-none" aria-hidden />

      {/* Ribbons */}
      <div className="ribbon w-[260px] top-[22%] left-[5%] animate-ribbon" />
      <div className="ribbon w-[180px] bottom-[18%] right-[8%] animate-ribbon [animation-delay:2s]" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
        {/* Left: headline + CTAs */}
        <div className="text-left">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-banana-soft border border-banana-deep/40 text-moss-deep text-xs font-medium mb-6"
          >
            <Sparkles size={14} className="text-tyrian" />
            {t.landing.heroBadge}
          </motion.div>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl leading-[1.05] text-retro-ink mb-6 tracking-tight">
            {headlineWords.map((word, i) => (
              <motion.span
                key={i}
                className={`inline-block mr-[0.25em] ${
                  ITALIC_WORDS.has(word) ? 'italic text-gradient' : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.08, ease: 'easeOut' }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            className="text-lg md:text-xl text-retro-text-muted max-w-xl mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9, ease: 'easeOut' }}
          >
            {t.landing.heroSubtitle}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1, ease: 'easeOut' }}
          >
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 bg-tyrian hover:bg-tyrian-soft text-cloud font-medium px-7 py-3.5 rounded-full text-base transition-all shadow-tyrian hover:shadow-lg hover:-translate-y-0.5"
            >
              {t.landing.heroJoin}
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 border border-retro-border hover:border-tyrian text-retro-text hover:text-tyrian font-medium px-7 py-3.5 rounded-full text-base transition-all"
            >
              {t.landing.heroExplore}
            </Link>
          </motion.div>

          <motion.div
            className="mt-10 flex items-center gap-6 text-sm text-retro-text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tyrian" />
              {t.landing.heroTagNetwork}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-banana-deep" />
              {t.landing.heroTagChat}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-moss" />
              {t.landing.heroTagRep}
            </div>
          </motion.div>
        </div>

        {/* Right: terminal animation */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
          className="relative"
        >
          <TerminalPulse limit={30} />
        </motion.div>
      </div>
    </section>
  );
}
