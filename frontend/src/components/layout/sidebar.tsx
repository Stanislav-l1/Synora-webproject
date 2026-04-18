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
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

type NavItem = { href: string; label: string; icon: LucideIcon };

const trendingTags = ['react', 'typescript', 'rust', 'devops', 'ai'];

function StepNavLink({
  item,
  isActive,
  onClose,
}: {
  item: NavItem;
  isActive: boolean;
  onClose: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={cn(
        'group relative flex items-center gap-4 pl-2 pr-3 py-2.5 text-sm transition-colors duration-150 rounded-md',
        isActive
          ? 'text-cloud font-semibold bg-moss-deep/50'
          : 'text-moss-soft hover:text-cloud hover:bg-moss-velvet/60',
      )}
    >
      {/* Step dot on the guide line */}
      <span
        aria-hidden
        className={cn(
          'relative z-10 flex items-center justify-center w-4 h-4 rounded-full border-2 shrink-0 transition-all duration-200',
          isActive
            ? 'border-banana bg-banana shadow-[0_0_0_4px_rgba(247,231,161,0.18)]'
            : 'border-moss-soft bg-moss group-hover:border-cloud group-hover:bg-moss-velvet',
        )}
      >
        {isActive && <span className="w-1 h-1 rounded-full bg-moss-deep" />}
      </span>

      <Icon size={16} className="shrink-0 opacity-80" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname() || '';
  const t = useT();

  const mainNav: NavItem[] = [
    { href: '/feed', label: t.nav.home, icon: Home },
    { href: '/search', label: t.nav.explore, icon: Compass },
    { href: '/projects', label: t.nav.projects, icon: FolderKanban },
    { href: '/messages', label: t.nav.messages, icon: MessageSquare },
    { href: '/courses', label: t.nav.courses, icon: GraduationCap },
    { href: '/profile', label: t.nav.profile, icon: User },
  ];

  const secondaryNav: NavItem[] = [
    { href: '/bookmarks', label: t.nav.bookmarks, icon: Bookmark },
    { href: '/tags', label: t.nav.trendingTags, icon: Hash },
    { href: '/settings', label: t.nav.settings, icon: Settings },
  ];

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href + '/'));

  return (
    <>
      {/* Backdrop (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-moss-deep/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-navbar left-0 z-40 w-sidebar h-[calc(100vh-theme(spacing.navbar))]',
          'bg-moss border-r border-moss-deep',
          'flex flex-col',
          'transition-transform duration-200 ease-out',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-end p-2 lg:hidden">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 rounded-md text-cloud/80 hover:text-cloud hover:bg-moss-velvet"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation with vertical stepper guide */}
        <nav className="flex-1 overflow-y-auto scrollbar-hidden px-4 py-4">
          <p className="pl-8 text-[10px] font-semibold text-moss-soft uppercase tracking-[0.15em] mb-3">
            Workspace
          </p>

          {/* Main nav — stepper */}
          <div className="relative">
            {/* Vertical guide line */}
            <span
              aria-hidden
              className="absolute left-[15px] top-1 bottom-1 w-px bg-moss-velvet"
            />
            <div className="space-y-0.5">
              {mainNav.map((item) => (
                <StepNavLink
                  key={item.href}
                  item={item}
                  isActive={isActive(item.href)}
                  onClose={onClose}
                />
              ))}
            </div>
          </div>

          <div className="my-5 mx-2 border-t border-moss-velvet" />

          <p className="pl-8 text-[10px] font-semibold text-moss-soft uppercase tracking-[0.15em] mb-3">
            Personal
          </p>
          <div className="relative">
            <span
              aria-hidden
              className="absolute left-[15px] top-1 bottom-1 w-px bg-moss-velvet"
            />
            <div className="space-y-0.5">
              {secondaryNav.map((item) => (
                <StepNavLink
                  key={item.href}
                  item={item}
                  isActive={isActive(item.href)}
                  onClose={onClose}
                />
              ))}
            </div>
          </div>

          <div className="my-5 mx-2 border-t border-moss-velvet" />

          {/* Trending tags */}
          <div className="px-2">
            <p className="text-[10px] font-semibold text-moss-soft uppercase tracking-[0.15em] mb-3">
              Trending
            </p>
            <div className="flex flex-wrap gap-1.5">
              {trendingTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${tag}`}
                  className="px-2 py-1 text-xs rounded-full bg-moss-velvet text-cloud/80 hover:text-moss-deep hover:bg-banana transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-moss-deep">
          <p className="text-xs text-moss-soft">&copy; 2026 Synora</p>
        </div>
      </aside>
    </>
  );
}
