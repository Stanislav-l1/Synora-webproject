'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Compass,
  FolderKanban,
  MessageSquare,
  GraduationCap,
  User,
  Bookmark,
  Settings,
  Hash,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const mainNav = [
  { href: '/feed', label: 'Home', icon: Home },
  { href: '/search', label: 'Explore', icon: Compass },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/courses', label: 'Courses', icon: GraduationCap },
  { href: '/profile', label: 'Profile', icon: User },
];

const secondaryNav = [
  { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { href: '/tags', label: 'Tags', icon: Hash },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const trendingTags = ['react', 'typescript', 'rust', 'devops', 'ai'];

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-surface-overlay lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-navbar left-0 z-40 w-sidebar h-[calc(100vh-theme(spacing.navbar))]',
          'bg-surface-secondary border-r border-border',
          'flex flex-col',
          'transition-transform duration-200 ease-out',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-end p-2 lg:hidden">
          <button
            onClick={onClose}
            className="p-2 rounded-sm text-content-secondary hover:text-content-primary hover:bg-surface-tertiary"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-hidden px-3 py-2">
          <div className="space-y-0.5">
            {mainNav.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-accent-muted text-accent-light'
                      : 'text-content-secondary hover:text-content-primary hover:bg-surface-tertiary',
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="my-4 border-t border-border" />

          <div className="space-y-0.5">
            {secondaryNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-accent-muted text-accent-light'
                      : 'text-content-secondary hover:text-content-primary hover:bg-surface-tertiary',
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="my-4 border-t border-border" />

          {/* Trending tags */}
          <div className="px-3">
            <p className="text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-2">
              Trending
            </p>
            <div className="flex flex-wrap gap-1.5">
              {trendingTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${tag}`}
                  className="px-2 py-1 text-xs rounded-full bg-surface-tertiary text-content-secondary hover:text-accent-light hover:bg-accent-muted transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <p className="text-xs text-content-tertiary">&copy; 2026 Synora</p>
        </div>
      </aside>
    </>
  );
}
