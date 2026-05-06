'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Zap, X, ArrowRight } from 'lucide-react';
import { useT } from '@/lib/i18n';

const STORAGE_KEY = 'synora.announcement.dismissed';
const BANNER_HEIGHT = 36;

interface Props {
  /** Unique id of the announcement; bump it to re-show after content changes. */
  id?: string;
  /** Optional CTA href. */
  ctaHref?: string;
}

export function AnnouncementBanner({ id = 'ai-review-2026', ctaHref = '/assistant' }: Props) {
  const t = useT();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dismissed = window.localStorage.getItem(STORAGE_KEY);
    if (dismissed !== id) setVisible(true);
  }, [id]);

  // Push navbar/content down by exposing height as a CSS variable on :root.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty(
      '--banner-h',
      visible ? `${BANNER_HEIGHT}px` : '0px',
    );
  }, [visible]);

  function dismiss() {
    setVisible(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, id);
    }
  }

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          initial={{ y: -BANNER_HEIGHT }}
          animate={{ y: 0 }}
          exit={{ y: -BANNER_HEIGHT }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="fixed top-0 inset-x-0 z-[55] overflow-hidden"
          style={{ height: BANNER_HEIGHT }}
        >
          <div className="h-full bg-gradient-to-r from-tyrian via-tyrian-soft to-moss-deep text-cloud">
            <div className="flex items-center justify-between h-full px-4 sm:px-6 gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Zap size={14} className="text-banana shrink-0" />
                <span className="text-xs font-medium truncate">
                  {t.announcement.message}
                </span>
                <Link
                  href={ctaHref}
                  className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-banana hover:text-cloud transition-colors shrink-0"
                >
                  {t.announcement.cta}
                  <ArrowRight size={12} />
                </Link>
              </div>
              <button
                type="button"
                onClick={dismiss}
                aria-label={t.announcement.dismiss}
                className="shrink-0 p-1 rounded-md text-cloud/70 hover:text-cloud hover:bg-white/10 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
