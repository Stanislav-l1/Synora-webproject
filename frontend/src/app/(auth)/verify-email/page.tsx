'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';

type Status = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get('token') ?? '';

  const [status, setStatus] = useState<Status>('loading');
  const [error, setError]   = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setError('Missing token'); return; }
    api.post('/auth/verify-email', { token })
      .then(() => {
        setStatus('success');
        setTimeout(() => router.push('/login'), 2500);
      })
      .catch((err) => {
        setStatus('error');
        setError(err?.response?.data?.message ?? 'Invalid or expired verification link.');
      });
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-primary px-4">
      <div className="w-full max-w-sm text-center space-y-4">
        {status === 'loading' && (
          <>
            <Loader2 size={40} className="text-accent animate-spin mx-auto" />
            <p className="text-sm text-content-secondary">Verifying your email…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 size={40} className="text-success mx-auto" />
            <h1 className="text-xl font-bold text-content-primary">Email verified!</h1>
            <p className="text-sm text-content-secondary">Redirecting to login…</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle size={40} className="text-danger mx-auto" />
            <h1 className="text-xl font-bold text-content-primary">Verification failed</h1>
            <p className="text-sm text-content-secondary">{error}</p>
            <Link href="/login" className="inline-block text-sm text-accent hover:underline">
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
