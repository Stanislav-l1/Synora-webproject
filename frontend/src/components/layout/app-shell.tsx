'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';
import { useAuthStore } from '@/store/useAuthStore';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, _hydrated, hydrate, fetchCurrentUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!_hydrated) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (!user) {
      fetchCurrentUser();
    }
  }, [_hydrated, isAuthenticated, user, fetchCurrentUser, router]);

  if (!_hydrated || !isAuthenticated) return null;

  return (
    <>
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="pt-navbar lg:pl-sidebar min-h-screen bg-theme-bg text-theme-text">
        {children}
      </main>
    </>
  );
}
