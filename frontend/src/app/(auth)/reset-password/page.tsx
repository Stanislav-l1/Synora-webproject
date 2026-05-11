'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

export default function ResetPasswordPage() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const token         = searchParams.get('token') ?? '';

  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setDone(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? 'Invalid or expired reset link.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-primary px-4">
        <div className="text-center space-y-3">
          <p className="text-content-secondary">Invalid reset link.</p>
          <Link href="/forgot-password" className="text-accent hover:underline text-sm">
            Request a new one
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-primary px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-content-primary">Set new password</h1>
          <p className="text-sm text-content-secondary">Choose a strong password.</p>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <CheckCircle2 size={40} className="text-success" />
            <p className="text-sm text-content-secondary">Password updated! Redirecting to login…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input type="password" label="New password (min 8 chars)"
              value={password} onChange={e => setPassword(e.target.value)}
              autoComplete="new-password" required />
            <Input type="password" label="Confirm new password"
              value={confirm} onChange={e => setConfirm(e.target.value)}
              autoComplete="new-password" required />
            {error && <p className="text-xs text-danger">{error}</p>}
            <Button type="submit" className="w-full" loading={loading}
              disabled={!password || !confirm}>
              Reset password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
