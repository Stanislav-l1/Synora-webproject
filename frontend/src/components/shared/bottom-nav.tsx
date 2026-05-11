'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  CheckSquare,
  Users,
  MessageSquare,
  User,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/store/useChatStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useT } from '@/lib/i18n';

type Tab = {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (path: string) => boolean;
  badgeKey?: 'chat' | 'notifications';
};

export function BottomNav() {
  const pathname = usePathname() || '/';
  const t = useT();

  const tabs: Tab[] = [
    {
      href: '/feed',
      label: t.nav.home,
      icon: Home,
      match: (p) => p === '/' || p.startsWith('/feed'),
      badgeKey: 'notifications',
    },
    {
      href: '/tasks',
      label: t.nav.tasks,
      icon: CheckSquare,
      match: (p) => p.startsWith('/tasks'),
    },
    {
      href: '/communities',
      label: t.nav.communities,
      icon: Users,
      match: (p) => p.startsWith('/communities'),
    },
    {
      href: '/messages',
      label: t.nav.messages,
      icon: MessageSquare,
      match: (p) => p.startsWith('/messages'),
      badgeKey: 'chat',
    },
    {
      href: '/profile',
      label: t.nav.profile,
      icon: User,
      match: (p) => p.startsWith('/profile') || p.startsWith('/u/'),
    },
  ];
  const chats = useChatStore((s) => s.chats);
  const chatUnread = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const notifUnread = useNotificationStore((s) => s.unreadCount);

  return (
    <nav
      aria-label="Primary"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-moss border-t border-moss-deep pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.match(pathname);
          const badge =
            tab.badgeKey === 'chat' ? chatUnread :
            tab.badgeKey === 'notifications' ? notifUnread : 0;

          return (
            <li key={tab.href} className="flex">
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors',
                  'active:scale-[0.96]',
                  active ? 'text-banana' : 'text-cloud/70 hover:text-cloud',
                )}
              >
                <span
                  className={cn(
                    'relative flex items-center justify-center rounded-full transition-all',
                    active ? 'bg-banana/15 h-8 w-12' : 'h-8 w-12',
                  )}
                >
                  <Icon
                    size={active ? 22 : 20}
                    strokeWidth={active ? 2.25 : 1.75}
                  />
                  {badge > 0 && (
                    <span className="absolute -top-0.5 right-1.5 min-w-[16px] h-4 px-1 bg-banana text-moss-deep rounded-full text-[10px] font-semibold flex items-center justify-center">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </span>
                <span className={cn('text-[10px] leading-none', active && 'font-semibold')}>
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
