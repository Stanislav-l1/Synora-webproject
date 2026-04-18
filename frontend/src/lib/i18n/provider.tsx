'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { messages, type Locale, type Messages, LOCALES } from './messages';

const STORAGE_KEY = 'synora.locale';
const DEFAULT_LOCALE: Locale = 'en';

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Messages;
};

const LocaleContext = createContext<Ctx | null>(null);

function detectInitial(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && (LOCALES as string[]).includes(stored)) return stored as Locale;
  const nav = window.navigator.language?.toLowerCase() || '';
  if (nav.startsWith('ru')) return 'ru';
  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const initial = detectInitial();
    setLocaleState(initial);
    document.documentElement.lang = initial;
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, l);
      document.documentElement.lang = l;
    }
  }, []);

  const value: Ctx = { locale, setLocale, t: messages[locale] };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

export function useT(): Messages {
  return useLocale().t;
}
