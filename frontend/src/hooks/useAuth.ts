'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export function useAuth({ redirectTo = '/login', requireAuth = true } = {}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    if (!user && isAuthenticated) {
      fetchCurrentUser();
    }
  }, [user, isAuthenticated, fetchCurrentUser]);

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isLoading, requireAuth, isAuthenticated, router, redirectTo]);

  return { user, isAuthenticated, isLoading };
}
