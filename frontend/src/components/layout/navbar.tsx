'use client';

import Link from 'next/link';
import { Search, Bell, MessageSquare, Menu } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onMenuToggle?: () => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-navbar bg-surface-secondary/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: Logo + Menu toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-sm text-content-secondary hover:text-content-primary hover:bg-surface-tertiary transition-colors"
          >
            <Menu size={20} />
          </button>
          <Link href="/feed" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-lg font-semibold text-content-primary hidden sm:block">
              Synora
            </span>
          </Link>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" size={16} />
            <input
              type="text"
              placeholder="Search posts, projects, people..."
              className={cn(
                'w-full h-9 pl-9 pr-4 bg-surface-tertiary border border-transparent rounded-sm text-sm text-content-primary',
                'placeholder:text-content-tertiary',
                'focus:outline-none focus:bg-surface-input focus:border-border-hover',
                'transition-all duration-150',
              )}
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <button className="md:hidden p-2 rounded-sm text-content-secondary hover:text-content-primary hover:bg-surface-tertiary transition-colors">
            <Search size={20} />
          </button>
          <Link
            href="/messages"
            className="relative p-2 rounded-sm text-content-secondary hover:text-content-primary hover:bg-surface-tertiary transition-colors"
          >
            <MessageSquare size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
          </Link>
          <button className="relative p-2 rounded-sm text-content-secondary hover:text-content-primary hover:bg-surface-tertiary transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
          </button>
          <div className="ml-2 pl-2 border-l border-border">
            <Link href="/profile" className="block">
              <Avatar name="John Doe" size="sm" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
