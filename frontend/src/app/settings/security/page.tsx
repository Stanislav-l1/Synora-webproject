'use client';

import { useState } from 'react';
import { ShieldCheck, KeyRound, Smartphone, LogOut } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

export default function SecurityPage() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  async function changePassword() {
    setMsg(null);
    if (next.length < 8) {
      setMsg({ kind: 'err', text: 'New password must be at least 8 characters.' });
      return;
    }
    if (next !== confirm) {
      setMsg({ kind: 'err', text: 'New passwords do not match.' });
      return;
    }
    setSaving(true);
    try {
      await api.post('/auth/change-password', { currentPassword: current, newPassword: next });
      setMsg({ kind: 'ok', text: 'Password updated.' });
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch {
      setMsg({ kind: 'err', text: 'Could not update password.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-feed mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-2 text-cloud-ink">
          <ShieldCheck size={20} />
          <h1 className="text-lg font-semibold">Security</h1>
        </div>

        <section className="rounded-lg border border-cloud-deep bg-cloud-soft p-6 space-y-4">
          <div className="flex items-center gap-2">
            <KeyRound size={16} className="text-tyrian" />
            <h2 className="text-sm font-semibold text-cloud-ink">Change password</h2>
          </div>
          <Input
            type="password"
            label="Current password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
          />
          <Input
            type="password"
            label="New password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
          />
          <Input
            type="password"
            label="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
          {msg && (
            <p className={`text-xs ${msg.kind === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
              {msg.text}
            </p>
          )}
          <Button
            type="button"
            onClick={changePassword}
            loading={saving}
            disabled={!current || !next || !confirm}
            size="sm"
          >
            Update password
          </Button>
        </section>

        <section className="rounded-lg border border-cloud-deep bg-white p-6">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone size={16} className="text-tyrian" />
            <h2 className="text-sm font-semibold text-cloud-ink">Two-factor authentication</h2>
          </div>
          <p className="text-sm text-cloud-muted">
            2FA with authenticator apps is coming soon.
          </p>
        </section>

        <section className="rounded-lg border border-cloud-deep bg-white p-6">
          <div className="flex items-center gap-2 mb-2">
            <LogOut size={16} className="text-tyrian" />
            <h2 className="text-sm font-semibold text-cloud-ink">Active sessions</h2>
          </div>
          <p className="text-sm text-cloud-muted">
            Session management will let you sign out of other devices. Planned.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
