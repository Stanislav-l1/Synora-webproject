'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setTokens } from '@/lib/auth';
import { useAuthStore } from '@/store/useAuthStore';

export default function OAuthCallbackPage() {
  const searchParams    = useSearchParams();
  const router          = useRouter();
  const fetchCurrentUser = useAuthStore(s => s.fetchCurrentUser);

  useEffect(() => {
    const accessToken  = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const error        = searchParams.get('error');

    if (error || !accessToken || !refreshToken) {
      router.replace('/login?error=oauth_failed');
      return;
    }

    setTokens(accessToken, refreshToken);
    fetchCurrentUser().then(() => router.replace('/feed'));
  }, [searchParams, router, fetchCurrentUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cloud">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-tyrian border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-cloud-ink/60">Signing you in…</p>
      </div>
    </div>
  );
}
