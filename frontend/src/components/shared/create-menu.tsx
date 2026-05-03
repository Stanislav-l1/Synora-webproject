'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  FileText,
  FolderKanban,
  CalendarPlus,
  MessageSquarePlus,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';

type Item = {
  href: string;
  label: string;
  description?: string;
  icon: LucideIcon;
};

const items: Item[] = [
  { href: '/feed?compose=1',    label: 'New post',    description: 'Share an update',            icon: FileText },
  { href: '/projects?new=1',    label: 'New project', description: 'Start a repo',               icon: FolderKanban },
  { href: '/calendar?new=1',    label: 'New event',   description: 'Schedule a meeting',         icon: CalendarPlus },
  { href: '/messages?new=1',    label: 'New chat',    description: 'Start a conversation',       icon: MessageSquarePlus },
  { href: '/people',            label: 'Invite',      description: 'Invite someone to Synora',   icon: UserPlus },
];

export function CreateMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Create"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="p-2 rounded-md text-cloud/80 hover:text-cloud hover:bg-moss-velvet transition-colors"
      >
        <Plus size={20} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-72 bg-white border border-cloud-deep rounded-lg shadow-xl overflow-hidden z-50"
        >
          <div className="px-3 py-2 border-b border-cloud-deep">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-cloud-muted">Create</p>
          </div>
          <ul className="py-1">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-3 py-2.5 hover:bg-cloud-soft transition-colors"
                  >
                    <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-tyrian/10 text-tyrian">
                      <Icon size={16} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-cloud-ink">{item.label}</span>
                      {item.description && (
                        <span className="block text-xs text-cloud-muted">{item.description}</span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
