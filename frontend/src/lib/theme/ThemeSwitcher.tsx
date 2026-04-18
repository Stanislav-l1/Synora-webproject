'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from './provider';
import { cn } from '@/lib/utils';

interface ThemeSwitcherProps {
  tone?: 'light' | 'dark';
  className?: string;
}

export function ThemeSwitcher({ tone = 'light', className }: ThemeSwitcherProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const base = 'inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors';
  const toneClass =
    tone === 'dark'
      ? 'text-cloud/80 hover:text-banana hover:bg-moss-velvet'
      : 'text-cloud-ink/70 hover:text-tyrian hover:bg-cloud-deep';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light' : 'Dark'}
      className={cn(base, toneClass, className)}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
