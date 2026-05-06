'use client';

import Link from 'next/link';
import { MessageSquare, Menu, Search as SearchIcon } from 'lucide-react';
import {
  NotificationsDropdown,
  ProfileDropdown,
  CreateMenu,
  AiAssistantButton,
  CommandPaletteTrigger,
  SmartSearch,
} from '@/components/shared';
import { useChatStore } from '@/store/useChatStore';
import { useT, LocaleSwitcher } from '@/lib/i18n';
import { ThemeSwitcher } from '@/lib/theme';

interface NavbarProps {
  onMenuToggle?: () => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const t = useT();
  const chats = useChatStore((s) => s.chats);
  const chatUnread = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  return (
    <header
      className="fixed left-0 right-0 z-50 h-navbar bg-moss/95 backdrop-blur-md border-b border-moss-deep transition-[top] duration-300"
      style={{ top: 'var(--banner-h, 0px)' }}
    >
      <div className="flex items-center justify-between h-full px-4 gap-3">
        {/* Left: Logo + Menu toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
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

        {/* Center: Smart Search */}
        <div className="flex-1 max-w-md mx-2 hidden md:block">
          <SmartSearch placeholder={t.nav.searchPlaceholder} />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Link
            href="/search"
            aria-label="Search"
            className="md:hidden p-2 rounded-md text-cloud/80 hover:text-cloud hover:bg-moss-velvet transition-colors"
          >
            <SearchIcon size={20} />
          </Link>
          <CommandPaletteTrigger />
          <CreateMenu />
          <AiAssistantButton />
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
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
