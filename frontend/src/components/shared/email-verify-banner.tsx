'use client';

import { useState } from 'react';
import { Mail, X } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';

export function EmailVerifyBanner() {
  const user = useAuthStore(s => s.user);
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!user || user.emailVerified !== false || dismissed) return null;

  async function resend() {
    if (!user) return;
    setSending(true);
    try {
      await api.post('/auth/resend-verification', { email: user.email });
      setSent(true);
    } catch { /* swallow */ }
    finally { setSending(false); }
  }

  return (
    <div className="bg-warning-muted border border-warning/40 rounded-lg px-4 py-3 flex items-center gap-3 mb-4">
      <Mail size={18} className="text-warning shrink-0" />
      <div className="flex-1 text-sm">
        <span className="text-content-primary font-medium">Verify your email</span>
        <span className="text-content-secondary ml-2">
          {sent ? 'Verification link sent — check your inbox.' : `Confirm ${user.email} to unlock all features.`}
        </span>
      </div>
      {!sent && (
        <button
          onClick={resend}
          disabled={sending}
          className="text-sm text-accent hover:underline disabled:opacity-50"
        >
          {sending ? 'Sending…' : 'Resend'}
        </button>
      )}
      <button onClick={() => setDismissed(true)} className="text-content-tertiary hover:text-content-primary">
        <X size={16} />
      </button>
    </div>
  );
}
