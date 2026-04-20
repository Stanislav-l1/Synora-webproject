'use client';

import Link from 'next/link';
import { Search, MessageSquare, Menu } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { NotificationsDropdown } from '@/components/shared';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import { useT, LocaleSwitcher } from '@/lib/i18n';
import { ThemeSwitcher } from '@/lib/theme';

interface NavbarProps {
  onMenuToggle?: () => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const t = useT();
  const { user } = useAuthStore();
  const chats = useChatStore((s) => s.chats);
  const chatUnread = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-navbar bg-moss/95 backdrop-blur-md border-b border-moss-deep">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: Logo + Menu toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            aria-label="Toggle menu"
            className="lg:hidden p-2 rounded-md text-cloud/80 hover:text-cloud hover:bg-moss-velvet transition-colors"
          >
            <Menu size={20} />
          </button>
          <Link href="/feed" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-banana rounded-lg flex items-center justify-center shadow-sm group-hover:rotate-[-6deg] transition-transform">
              <span className="text-moss-deep font-serif text-base font-bold">S</span>
            </div>
            <span className="text-lg font-serif text-cloud hidden sm:block tracking-tight">
              Synora
            </span>
          </Link>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-moss-soft" size={16} />
            <input
              type="text"
              placeholder={t.nav.searchPlaceholder}
              className={cn(
                'w-full h-9 pl-9 pr-4 bg-moss-deep border border-moss-velvet rounded-md text-sm text-cloud',
                'placeholder:text-moss-soft',
                'focus:outline-none focus:border-banana/60 focus:ring-1 focus:ring-banana/30',
                'transition-all duration-150',
              )}
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <button aria-label="Search" className="md:hidden p-2 rounded-md text-cloud/80 hover:text-cloud hover:bg-moss-velvet transition-colors">
            <Search size={20} />
          </button>
          <Link
            href="/messages"
            aria-label={t.nav.messages}
            className="relative p-2 rounded-md text-cloud/80 hover:text-cloud hover:bg-moss-velvet transition-colors"
          >
            <MessageSquare size={20} />
            {chatUnread > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-banana text-moss-deep rounded-full text-[10px] font-semibold flex items-center justify-center">
                {chatUnread > 99 ? '99+' : chatUnread}
              </span>
            )}
          </Link>
          <NotificationsDropdown />
          <div className="ml-2 hidden sm:flex items-center gap-1">
            <ThemeSwitcher tone="dark" />
            <LocaleSwitcher tone="dark" />
          </div>
          <div className="ml-2 pl-2 border-l border-moss-deep">
            <Link href="/profile" className="block ring-2 ring-transparent hover:ring-banana/40 rounded-full transition-all">
              <Avatar name={user?.displayName || user?.username || '?'} size="sm" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
