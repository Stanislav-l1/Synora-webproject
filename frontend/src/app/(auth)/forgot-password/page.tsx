'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-primary px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-content-primary">Reset password</h1>
          <p className="text-sm text-content-secondary">
            {sent
              ? 'Check your email for the reset link.'
              : "Enter your email and we'll send you a reset link."}
          </p>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <CheckCircle2 size={40} className="text-success" />
            <p className="text-sm text-content-secondary text-center">
              If an account with that email exists, a reset link has been sent.
            </p>
            <Link href="/login"
              className="text-sm text-accent hover:underline flex items-center gap-1">
              <ArrowLeft size={14} /> Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            {error && <p className="text-xs text-danger">{error}</p>}
            <Button type="submit" className="w-full" loading={loading} disabled={!email}>
              Send reset link
            </Button>
            <div className="text-center">
              <Link href="/login"
                className="text-sm text-content-secondary hover:text-content-primary flex items-center justify-center gap-1">
                <ArrowLeft size={14} /> Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
