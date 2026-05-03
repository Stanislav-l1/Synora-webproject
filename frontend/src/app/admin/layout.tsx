'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Flag, Shield, BadgeCheck,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Navbar } from '@/components/layout/navbar';
import { cn } from '@/lib/utils';

const adminNav = [
  { href: '/admin',                  label: 'Dashboard',     icon: LayoutDashboard, exact: true },
  { href: '/admin/users',            label: 'Users',         icon: Users },
  { href: '/admin/reports',          label: 'Reports',       icon: Flag },
  { href: '/admin/verifications',    label: 'Verifications', icon: BadgeCheck },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router   = useRouter();
  const pathname = usePathname() || '';

  useEffect(() => {
    if (user && user.role !== 'ADMIN') router.push('/feed');
    if (!user) router.push('/login');
  }, [user, router]);

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-surface-primary">
      <Navbar />
      <div className="flex pt-navbar">
        {/* Admin sidebar */}
        <aside className="w-56 shrink-0 h-[calc(100vh-theme(spacing.navbar))] sticky top-navbar bg-surface-secondary border-r border-border-default flex flex-col">
          <div className="px-4 py-4 border-b border-border-default">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-accent" />
              <span className="text-sm font-semibold text-content-primary">Admin Panel</span>
            </div>
          </div>
          <nav className="flex-1 px-2 py-3 space-y-0.5">
            {adminNav.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    active
                      ? 'bg-accent/10 text-accent font-medium'
                      : 'text-content-secondary hover:text-content-primary hover:bg-surface-tertiary',
                  )}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
