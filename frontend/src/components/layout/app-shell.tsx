'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useWebSocket } from '@/hooks/useWebSocket';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, _hydrated, hydrate, fetchCurrentUser } = useAuthStore();
  const { fetchUnreadCount } = useNotificationStore();
  const router = useRouter();

  // Mount WebSocket once per authenticated session (not per page)
  useWebSocket();

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

  // Initial unread count + periodic refresh (WS is the primary path; this is a safety net)
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60_000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);

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
