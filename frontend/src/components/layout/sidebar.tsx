'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Compass,
  FolderKanban,
  MessageSquare,
  Calendar,
  GraduationCap,
  CircleUser,
  Users,
  Building2,
  Bookmark,
  SlidersHorizontal,
  AtSign,
  X,
  Briefcase,
  Github,
  Shield,
  Zap,
  CreditCard,
  BadgeCheck,
  Globe,
  BarChart2,
  Sparkles,
  Lightbulb,
  Trophy,
  Gift,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';
import { useAuthStore } from '@/store/useAuthStore';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

type NavItem = { href: string; label: string; icon: LucideIcon };

const trendingTags = ['react', 'typescript', 'rust', 'devops', 'ai'];

function NavLink({
  item,
  isActive,
  expanded,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  expanded: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'group relative flex items-center rounded-xl transition-colors duration-150',
        isActive
          ? 'bg-white/10 text-cloud font-medium'
          : 'text-moss-soft hover:text-cloud hover:bg-white/5',
      )}
      style={{
        padding: expanded ? '8px 10px' : '8px 0',
        justifyContent: expanded ? 'flex-start' : 'center',
        gap: expanded ? '10px' : '0',
        minHeight: 36,
      }}
    >
      {/* Golden active indicator bar */}
      <span
        aria-hidden
        className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 rounded-full transition-all',
          isActive ? 'opacity-100' : 'opacity-0',
        )}
        style={{
          width: 3,
          height: isActive ? 18 : 0,
          background: '#C9A020',
        }}
      />

      <span className="shrink-0 flex items-center justify-center" style={{ width: 20, height: 20 }}>
        <Icon size={16} strokeWidth={isActive ? 2.2 : 1.6} />
      </span>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.18 }}
            className="whitespace-nowrap overflow-hidden text-[13px]"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Tooltip when collapsed */}
      {!expanded && (
        <span
          className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 text-[12px] font-medium text-cloud/90 border border-white/10 shadow-lg"
          style={{ background: 'rgba(27,46,36,0.97)' }}
        >
          {item.label}
        </span>
      )}
    </Link>
  );
}

function SectionLabel({ label, expanded }: { label: string; expanded: boolean }) {
  return (
    <AnimatePresence initial={false}>
      {expanded ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="px-2 mb-2 text-[10px] font-semibold text-moss-soft uppercase tracking-[0.06em] whitespace-nowrap"
        >
          {label}
        </motion.p>
      ) : (
        <div style={{ height: 4 }} />
      )}
    </AnimatePresence>
  );
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname() || '';
  const t = useT();
  const { user } = useAuthStore();
  const [hoverExpanded, setHoverExpanded] = useState(false);

  // On mobile, the sidebar is controlled by `open` (drawer mode) and is always expanded.
  // On desktop, it's collapsed by default and expands on hover.
  const expanded = open || hoverExpanded;

  const mainNav: NavItem[] = [
    { href: '/feed', label: t.nav.home, icon: LayoutDashboard },
    { href: '/search', label: t.nav.explore, icon: Compass },
    { href: '/projects', label: t.nav.projects, icon: FolderKanban },
    { href: '/messages', label: t.nav.messages, icon: MessageSquare },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/events', label: 'Events', icon: Globe },
    { href: '/analytics', label: 'Analytics', icon: BarChart2 },
    { href: '/career', label: 'Career', icon: Briefcase },
    { href: '/repositories', label: 'Repositories', icon: Github },
    { href: '/communities', label: 'Communities', icon: Building2 },
    { href: '/people', label: 'People', icon: Users },
    { href: '/courses', label: t.nav.courses, icon: GraduationCap },
    { href: '/assistant', label: t.nav.aiAssistant, icon: Sparkles },
    { href: '/discover', label: t.nav.discover, icon: Lightbulb },
    { href: '/profile', label: t.nav.profile, icon: CircleUser },
  ];

  const secondaryNav: NavItem[] = [
    { href: '/saved', label: t.nav.bookmarks, icon: Bookmark },
    { href: '/tags', label: t.nav.trendingTags, icon: AtSign },
    { href: '/leaderboard', label: t.nav.leaderboard, icon: Trophy },
    { href: '/referral', label: t.nav.referral, icon: Gift },
    { href: '/billing', label: 'Billing', icon: CreditCard },
    { href: '/verification', label: 'Verification', icon: BadgeCheck },
    { href: '/settings', label: t.nav.settings, icon: SlidersHorizontal },
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

      <motion.aside
        className={cn(
          'fixed top-navbar left-0 z-40 h-[calc(100vh-theme(spacing.navbar))]',
          'bg-moss border-r border-moss-deep flex flex-col overflow-hidden',
          'lg:translate-x-0 transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:transition-none',
        )}
        animate={{
          width: expanded ? 220 : 52,
        }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        onMouseEnter={() => setHoverExpanded(true)}
        onMouseLeave={() => setHoverExpanded(false)}
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

        {/* Nav */}
        <nav
          className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hidden pb-4"
          style={{ padding: expanded ? '0 10px' : '0 6px' }}
        >
          <div className="mt-3">
            <SectionLabel label="Workspace" expanded={expanded} />
            <div className="space-y-0.5">
              {mainNav.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={isActive(item.href)}
                  expanded={expanded}
                  onClick={onClose}
                />
              ))}
            </div>
          </div>

          <div className="mt-5">
            <SectionLabel label="Personal" expanded={expanded} />
            <div className="space-y-0.5">
              {secondaryNav.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={isActive(item.href)}
                  expanded={expanded}
                  onClick={onClose}
                />
              ))}
            </div>
          </div>

          {user?.role === 'ADMIN' && (
            <div className="mt-5">
              <SectionLabel label="Admin" expanded={expanded} />
              <div className="space-y-0.5">
                <NavLink
                  item={{ href: '/admin', label: 'Admin Panel', icon: Shield }}
                  isActive={pathname.startsWith('/admin')}
                  expanded={expanded}
                  onClick={onClose}
                />
              </div>
            </div>
          )}

          {/* Trending — only when expanded */}
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                className="mt-5"
              >
                <p className="px-2 mb-2 text-[10px] font-semibold text-moss-soft uppercase tracking-[0.06em] whitespace-nowrap">
                  Trending
                </p>
                <div className="flex flex-wrap gap-1.5 px-2">
                  {trendingTags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/tags/${tag}`}
                      className="px-2 py-0.5 text-[11px] rounded-md text-moss-soft hover:text-cloud bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Footer */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="px-4 pb-4 shrink-0 space-y-3"
            >
              {(!user?.subscriptionTier || user.subscriptionTier === 'FREE') && (
                <Link
                  href="/pricing"
                  onClick={onClose}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-tyrian/20 hover:bg-tyrian/30 transition-colors"
                >
                  <Zap size={14} className="text-tyrian shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-cloud leading-tight whitespace-nowrap">Upgrade to Pro</p>
                    <p className="text-[10px] text-moss-soft leading-tight truncate">Private projects &amp; AI tools</p>
                  </div>
                </Link>
              )}
              <p className="text-[11px] text-moss-soft whitespace-nowrap">© 2026 Synora</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </>
  );
}
