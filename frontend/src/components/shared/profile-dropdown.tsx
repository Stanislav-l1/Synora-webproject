'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Rss,
  Users as UsersIcon,
  FolderGit2,
  UserPlus,
  Settings,
  Bell,
  CreditCard,
  ShieldCheck,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/useAuthStore';

type Item =
  | { kind: 'link'; href: string; label: string; icon: LucideIcon }
  | { kind: 'action'; label: string; icon: LucideIcon; onClick: () => void; danger?: boolean }
  | { kind: 'divider' };

export function ProfileDropdown() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
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

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.push('/login');
  };

  const items: Item[] = [
    { kind: 'link', href: '/profile', label: 'Profile', icon: User },
    { kind: 'link', href: '/subscriptions', label: 'Subscriptions', icon: Rss },
    { kind: 'link', href: '/communities', label: 'Communities', icon: UsersIcon },
    { kind: 'link', href: '/projects', label: 'Repositories', icon: FolderGit2 },
    { kind: 'link', href: '/people', label: 'Friends', icon: UserPlus },
    { kind: 'divider' },
    { kind: 'link', href: '/settings', label: 'Settings', icon: Settings },
    { kind: 'link', href: '/notifications', label: 'Notifications', icon: Bell },
    { kind: 'link', href: '/billing', label: 'Billing', icon: CreditCard },
    { kind: 'link', href: '/settings/security', label: 'Security', icon: ShieldCheck },
    { kind: 'divider' },
    { kind: 'action', label: 'Logout', icon: LogOut, onClick: handleLogout, danger: true },
  ];

  const name = user?.displayName || user?.username || '?';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Profile menu"
        className="block ring-2 ring-transparent hover:ring-banana/40 rounded-full transition-all"
      >
        <Avatar name={name} size="sm" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 bg-cloud-soft border border-cloud-deep rounded-lg shadow-xl py-1 z-50"
        >
          <div className="px-3 py-2 border-b border-cloud-deep">
            <p className="text-sm font-semibold text-cloud-ink truncate">{name}</p>
            {user?.username && (
              <p className="text-xs text-cloud-muted truncate">@{user.username}</p>
            )}
          </div>

          {items.map((item, i) => {
            if (item.kind === 'divider') {
              return <div key={`d-${i}`} className="my-1 border-t border-cloud-deep" />;
            }
            const Icon = item.icon;
            const base =
              'flex items-center gap-2.5 px-3 py-2 text-sm transition-colors';
            if (item.kind === 'action') {
              return (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  onClick={item.onClick}
                  className={`${base} w-full text-left ${
                    item.danger
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-cloud-ink hover:bg-cloud-deep'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={`${base} text-cloud-ink hover:bg-cloud-deep`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
