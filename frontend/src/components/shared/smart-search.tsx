'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Clock, ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const RECENT_KEY = 'synora:recent-searches';
const MAX_RECENT = 6;

const QUICK_LINKS: { label: string; href: string }[] = [
  { label: 'Trending posts', href: '/feed' },
  { label: 'Explore projects', href: '/projects' },
  { label: 'People to follow', href: '/people' },
  { label: 'My calendar', href: '/calendar' },
];

function loadRecents(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string').slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function saveRecents(list: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
  } catch {
    /* noop */
  }
}

export function SmartSearch({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [recents, setRecents] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecents(loadRecents());
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable;
      if (!isTyping && e.key === '/') {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (focused && e.key === 'Escape') {
        inputRef.current?.blur();
        setFocused(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [focused]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function submit(q: string) {
    const term = q.trim();
    if (!term) return;
    const next = [term, ...recents.filter((r) => r !== term)].slice(0, MAX_RECENT);
    setRecents(next);
    saveRecents(next);
    setFocused(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  function clearRecent(term: string) {
    const next = recents.filter((r) => r !== term);
    setRecents(next);
    saveRecents(next);
  }

  const showPanel = focused;

  return (
    <div ref={ref} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
        }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-moss-soft" size={16} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder={placeholder}
            className={cn(
              'w-full h-9 pl-9 pr-16 bg-moss-deep border border-moss-velvet rounded-md text-sm text-cloud',
              'placeholder:text-moss-soft',
              'focus:outline-none focus:border-banana/60 focus:ring-1 focus:ring-banana/30',
              'transition-all duration-150',
            )}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center text-[10px] font-mono text-moss-soft border border-moss-velvet rounded px-1.5 py-0.5">
            /
          </span>
        </div>
      </form>

      {showPanel && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-cloud-deep rounded-lg shadow-xl overflow-hidden z-50">
          {query.trim() && (
            <button
              type="button"
              onClick={() => submit(query)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-cloud-soft text-left"
            >
              <Search size={14} className="text-cloud-muted" />
              <span className="flex-1 text-sm text-cloud-ink truncate">
                Search for &quot;<span className="font-medium">{query.trim()}</span>&quot;
              </span>
              <ArrowRight size={14} className="text-cloud-muted" />
            </button>
          )}

          {recents.length > 0 && (
            <div className="border-t border-cloud-deep">
              <div className="flex items-center justify-between px-3 pt-2 pb-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-cloud-muted">
                  Recent
                </p>
              </div>
              <ul className="pb-1">
                {recents.map((term) => (
                  <li
                    key={term}
                    className="group flex items-center gap-2 px-3 py-1.5 hover:bg-cloud-soft"
                  >
                    <Clock size={14} className="text-cloud-muted shrink-0" />
                    <button
                      type="button"
                      onClick={() => submit(term)}
                      className="flex-1 text-left text-sm text-cloud-ink truncate"
                    >
                      {term}
                    </button>
                    <button
                      type="button"
                      onClick={() => clearRecent(term)}
                      aria-label={`Remove ${term}`}
                      className="opacity-0 group-hover:opacity-100 text-cloud-muted hover:text-cloud-ink p-1"
                    >
                      <X size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="border-t border-cloud-deep">
            <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-cloud-muted">
              Quick links
            </p>
            <ul className="pb-1">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <button
                    type="button"
                    onClick={() => {
                      setFocused(false);
                      router.push(l.href);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-cloud-soft text-left text-sm text-cloud-ink"
                  >
                    <ArrowRight size={14} className="text-cloud-muted" />
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
