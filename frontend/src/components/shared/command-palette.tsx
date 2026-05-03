'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Command as CommandIcon,
  Search,
  Home,
  Compass,
  FolderKanban,
  MessageSquare,
  Calendar,
  Bell,
  Bookmark,
  Users as UsersIcon,
  User,
  Settings,
  Plus,
  Sparkles,
  CreditCard,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

type Cmd = {
  id: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  action: () => void;
  keywords?: string;
};

export function CommandPaletteTrigger() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const commands = useMemo<Cmd[]>(
    () => [
      { id: 'home',       label: 'Go to Feed',          hint: '/feed',      icon: Home,         action: () => go('/feed'),        keywords: 'home feed' },
      { id: 'explore',    label: 'Explore',             hint: '/search',    icon: Compass,      action: () => go('/search'),      keywords: 'search explore' },
      { id: 'projects',   label: 'Projects',            hint: '/projects',  icon: FolderKanban, action: () => go('/projects'),    keywords: 'repos repositories projects' },
      { id: 'messages',   label: 'Messages',            hint: '/messages',  icon: MessageSquare,action: () => go('/messages'),    keywords: 'chat dms messages' },
      { id: 'calendar',   label: 'Calendar',            hint: '/calendar',  icon: Calendar,     action: () => go('/calendar'),    keywords: 'events meetings calendar' },
      { id: 'people',     label: 'People',              hint: '/people',    icon: UsersIcon,    action: () => go('/people'),      keywords: 'friends people network' },
      { id: 'notifications', label: 'Notifications',    hint: '/notifications', icon: Bell,     action: () => go('/notifications'), keywords: 'alerts notifications' },
      { id: 'saved',      label: 'Saved',               hint: '/saved',     icon: Bookmark,     action: () => go('/saved'),       keywords: 'bookmarks saved' },
      { id: 'profile',    label: 'My profile',          hint: '/profile',   icon: User,         action: () => go('/profile'),     keywords: 'profile me account' },
      { id: 'settings',   label: 'Settings',            hint: '/settings',  icon: Settings,     action: () => go('/settings'),    keywords: 'settings preferences' },
      { id: 'security',   label: 'Security',            hint: '/settings/security', icon: ShieldCheck, action: () => go('/settings/security'), keywords: 'password 2fa security' },
      { id: 'billing',    label: 'Billing',             hint: '/billing',   icon: CreditCard,   action: () => go('/billing'),     keywords: 'plan billing invoice' },
      { id: 'new-post',   label: 'Create post',         hint: 'create',     icon: Plus,         action: () => go('/feed?compose=1'), keywords: 'new post create' },
      { id: 'new-project',label: 'Create project',      hint: 'create',     icon: Plus,         action: () => go('/projects?new=1'), keywords: 'new project create' },
      { id: 'new-event',  label: 'Create calendar event', hint: 'create',   icon: Plus,         action: () => go('/calendar?new=1'), keywords: 'new event meeting' },
      { id: 'ai',         label: 'Open AI Assistant',   hint: 'assistant',  icon: Sparkles,     action: () => { setOpen(false); window.dispatchEvent(new CustomEvent('synora:open-ai')); }, keywords: 'ai assistant bot' },
    ],
    // router is stable, exhaustive-deps safe
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      [c.label, c.hint, c.keywords].filter(Boolean).join(' ').toLowerCase().includes(q),
    );
  }, [commands, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (open && e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      filtered[activeIdx]?.action();
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Quick actions"
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 h-9 px-2.5 rounded-md text-cloud/80 hover:text-cloud hover:bg-moss-velvet transition-colors"
      >
        <CommandIcon size={16} />
        <span className="text-xs font-mono text-cloud/60">⌘K</span>
      </button>
      <button
        type="button"
        aria-label="Quick actions"
        onClick={() => setOpen(true)}
        className="md:hidden p-2 rounded-md text-cloud/80 hover:text-cloud hover:bg-moss-velvet transition-colors"
      >
        <CommandIcon size={20} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] bg-black/40 flex items-start justify-center pt-24 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white border border-cloud-deep rounded-lg shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-3 h-11 border-b border-cloud-deep">
              <Search size={16} className="text-cloud-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Type a command or jump to…"
                className="flex-1 h-full bg-transparent outline-none text-sm text-cloud-ink placeholder:text-cloud-muted"
              />
              <span className="text-[10px] font-mono text-cloud-muted border border-cloud-deep rounded px-1.5 py-0.5">
                ESC
              </span>
            </div>
            <ul className="max-h-80 overflow-y-auto py-1">
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-cloud-muted">No results.</li>
              )}
              {filtered.map((c, i) => {
                const Icon = c.icon;
                const active = i === activeIdx;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIdx(i)}
                      onClick={c.action}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left ${
                        active ? 'bg-tyrian/10' : 'hover:bg-cloud-soft'
                      }`}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-cloud-soft text-cloud-ink/70">
                        <Icon size={14} />
                      </span>
                      <span className="flex-1 min-w-0 text-sm text-cloud-ink truncate">{c.label}</span>
                      {c.hint && <span className="text-[11px] text-cloud-muted font-mono">{c.hint}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
