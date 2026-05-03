'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';
import { BottomNav, OnboardingWizard } from '@/components/shared';
import { PushPermissionPrompt } from '@/components/shared/push-permission-prompt';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useServiceWorker } from '@/hooks/useServiceWorker';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const { user, isAuthenticated, _hydrated, hydrate, fetchCurrentUser } = useAuthStore();
  const { fetchUnreadCount } = useNotificationStore();
  const router = useRouter();

  useWebSocket();
  useServiceWorker();

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
      <main className="pt-navbar lg:pl-sidebar pb-16 lg:pb-0 min-h-screen bg-theme-bg text-theme-text">
        {children}
      </main>
      <BottomNav />
      <PushPermissionPrompt />
      {user && user.onboardingCompleted === false && !onboardingDismissed && (
        <OnboardingWizard onClose={() => setOnboardingDismissed(true)} />
      )}
    </>
  );
}
