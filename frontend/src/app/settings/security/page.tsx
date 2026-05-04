'use client';

import { useState, useEffect } from 'react';
import {
  ShieldCheck, KeyRound, Smartphone, LogOut, Globe,
  CheckCircle2, AlertCircle, Loader2, Trash2, RefreshCw,
  Monitor, TabletSmartphone, Eye, EyeOff,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse } from '@/types';

interface Session {
  id: string; deviceName: string; deviceType: string;
  ipAddress: string; lastActiveAt: string; createdAt: string; current: boolean;
}
interface LoginEntry {
  id: string; ipAddress: string; deviceType: string;
  success: boolean; failureReason?: string; createdAt: string;
}
interface SecurityDashboard {
  twoFactorEnabled: boolean; activeSessions: number;
  failedLoginsLast24h: number; profilePublic: boolean;
}
interface TwoFactorSetup {
  otpAuthUri: string; secret: string; backupCodes: string[];
}
interface Privacy {
  profileVisibility: string; showEmail: boolean;
  showActivity: boolean; showOnlineStatus: boolean;
}

type Section = 'password' | '2fa' | 'sessions' | 'history' | 'privacy';

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={16} className="text-tyrian" />
      <h2 className="text-sm font-semibold text-content-primary">{title}</h2>
    </div>
  );
}

function Msg({ kind, text }: { kind: 'ok' | 'err'; text: string }) {
  return (
    <p className={cn('text-xs flex items-center gap-1.5',
      kind === 'ok' ? 'text-success' : 'text-danger')}>
      {kind === 'ok' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
      {text}
    </p>
  );
}

export default function SecurityPage() {
  const [dashboard, setDashboard]   = useState<SecurityDashboard | null>(null);
  const [sessions, setSessions]     = useState<Session[]>([]);
  const [history, setHistory]       = useState<LoginEntry[]>([]);
  const [privacy, setPrivacy]       = useState<Privacy | null>(null);
  const [setup2fa, setSetup2fa]     = useState<TwoFactorSetup | null>(null);
  const [loading, setLoading]       = useState(true);

  // Password change
  const [current, setCurrent]       = useState('');
  const [next, setNext]             = useState('');
  const [confirm, setConfirm]       = useState('');
  const [pwdSaving, setPwdSaving]   = useState(false);
  const [pwdMsg, setPwdMsg]         = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [showPwd, setShowPwd]       = useState(false);

  // 2FA
  const [totpCode, setTotpCode]     = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [twoFaMsg, setTwoFaMsg]     = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [twoFaSaving, setTwoFaSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<ApiResponse<SecurityDashboard>>('/security/dashboard'),
      api.get<ApiResponse<Session[]>>('/security/sessions'),
      api.get<ApiResponse<LoginEntry[]>>('/security/login-history'),
      api.get<ApiResponse<Privacy>>('/security/privacy'),
    ]).then(([d, s, h, p]) => {
      setDashboard(d.data.data);
      setSessions(s.data.data);
      setHistory(h.data.data);
      setPrivacy(p.data.data);
    }).finally(() => setLoading(false));
  }, []);

  async function changePassword() {
    setPwdMsg(null);
    if (next.length < 8) { setPwdMsg({ kind: 'err', text: 'New password must be at least 8 characters.' }); return; }
    if (next !== confirm) { setPwdMsg({ kind: 'err', text: 'Passwords do not match.' }); return; }
    setPwdSaving(true);
    try {
      await api.post('/auth/change-password', { currentPassword: current, newPassword: next });
      setPwdMsg({ kind: 'ok', text: 'Password updated successfully.' });
      setCurrent(''); setNext(''); setConfirm('');
    } catch {
      setPwdMsg({ kind: 'err', text: 'Could not update password.' });
    } finally { setPwdSaving(false); }
  }

  async function start2FASetup() {
    setTwoFaMsg(null);
    setTwoFaSaving(true);
    try {
      const res = await api.post<ApiResponse<TwoFactorSetup>>('/security/2fa/setup');
      setSetup2fa(res.data.data);
    } catch { setTwoFaMsg({ kind: 'err', text: 'Could not initiate 2FA setup.' }); }
    finally { setTwoFaSaving(false); }
  }

  async function enable2FA() {
    setTwoFaMsg(null);
    setTwoFaSaving(true);
    try {
      await api.post('/security/2fa/enable', { code: totpCode });
      setTwoFaMsg({ kind: 'ok', text: '2FA enabled successfully.' });
      setSetup2fa(null);
      setTotpCode('');
      setDashboard(d => d ? { ...d, twoFactorEnabled: true } : d);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setTwoFaMsg({ kind: 'err', text: msg ?? 'Invalid code.' });
    } finally { setTwoFaSaving(false); }
  }

  async function disable2FA() {
    setTwoFaMsg(null);
    if (!disableCode) { setTwoFaMsg({ kind: 'err', text: 'Enter your current 2FA code.' }); return; }
    setTwoFaSaving(true);
    try {
      await api.delete('/security/2fa', { data: { code: disableCode } });
      setTwoFaMsg({ kind: 'ok', text: '2FA disabled.' });
      setDisableCode('');
      setDashboard(d => d ? { ...d, twoFactorEnabled: false } : d);
    } catch { setTwoFaMsg({ kind: 'err', text: 'Invalid code.' }); }
    finally { setTwoFaSaving(false); }
  }

  async function revokeSession(id: string) {
    await api.delete(`/security/sessions/${id}`);
    setSessions(prev => prev.filter(s => s.id !== id));
  }

  async function updatePrivacy(patch: Partial<Privacy>) {
    const updated = { ...privacy, ...patch } as Privacy;
    setPrivacy(updated);
    await api.put('/security/privacy', patch);
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center py-32">
          <Loader2 size={24} className="animate-spin text-tyrian/60" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-feed mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-tyrian" />
          <h1 className="text-lg font-semibold text-content-primary">Security & Privacy</h1>
        </div>

        {/* Summary cards */}
        {dashboard && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border-default bg-surface-secondary p-4">
              <p className="text-xs text-content-tertiary">2FA status</p>
              <p className={cn('text-sm font-semibold mt-1',
                dashboard.twoFactorEnabled ? 'text-success' : 'text-amber-400')}>
                {dashboard.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div className="rounded-xl border border-border-default bg-surface-secondary p-4">
              <p className="text-xs text-content-tertiary">Active sessions</p>
              <p className="text-sm font-semibold text-content-primary mt-1">{dashboard.activeSessions}</p>
            </div>
            {dashboard.failedLoginsLast24h > 0 && (
              <div className="col-span-2 rounded-xl border border-danger/30 bg-danger/10 p-4 flex items-center gap-2">
                <AlertCircle size={14} className="text-danger shrink-0" />
                <p className="text-xs text-danger">
                  {dashboard.failedLoginsLast24h} failed login attempt{dashboard.failedLoginsLast24h > 1 ? 's' : ''} in the last 24h
                </p>
              </div>
            )}
          </div>
        )}

        {/* Change password */}
        <section className="rounded-xl border border-border-default bg-surface-secondary p-5 space-y-4">
          <SectionHeader icon={KeyRound} title="Change password" />
          <div className="relative">
            <Input type={showPwd ? 'text' : 'password'} label="Current password"
              value={current} onChange={e => setCurrent(e.target.value)} autoComplete="current-password" />
            <button type="button" onClick={() => setShowPwd(v => !v)}
              className="absolute right-3 top-8 text-content-tertiary hover:text-content-primary">
              {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <Input type="password" label="New password (min 8 chars)"
            value={next} onChange={e => setNext(e.target.value)} autoComplete="new-password" />
          <Input type="password" label="Confirm new password"
            value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" />
          {pwdMsg && <Msg kind={pwdMsg.kind} text={pwdMsg.text} />}
          <Button size="sm" loading={pwdSaving} onClick={changePassword}
            disabled={!current || !next || !confirm}>
            Update password
          </Button>
        </section>

        {/* 2FA */}
        <section className="rounded-xl border border-border-default bg-surface-secondary p-5 space-y-4">
          <SectionHeader icon={Smartphone} title="Two-factor authentication (TOTP)" />
          {twoFaMsg && <Msg kind={twoFaMsg.kind} text={twoFaMsg.text} />}

          {!dashboard?.twoFactorEnabled && !setup2fa && (
            <div className="space-y-3">
              <p className="text-xs text-content-secondary">
                Add an extra layer of security using an authenticator app (Google Authenticator, Authy, etc.).
              </p>
              <Button size="sm" loading={twoFaSaving} onClick={start2FASetup}>Set up 2FA</Button>
            </div>
          )}

          {!dashboard?.twoFactorEnabled && setup2fa && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-surface-tertiary space-y-2">
                <p className="text-xs text-content-secondary font-medium">1. Scan this QR code in your authenticator app, or enter the key manually:</p>
                <div className="flex gap-2 items-center flex-wrap">
                  <code className="text-xs bg-surface-primary px-2 py-1 rounded font-mono text-tyrian break-all">
                    {setup2fa.secret}
                  </code>
                  <button type="button"
                    onClick={() => navigator.clipboard.writeText(setup2fa.secret)}
                    className="text-xs text-content-tertiary hover:text-content-primary underline">
                    Copy
                  </button>
                </div>
                <a href={setup2fa.otpAuthUri} className="text-xs text-tyrian hover:underline">
                  Open in authenticator app
                </a>
              </div>
              <div className="p-4 rounded-lg bg-surface-tertiary space-y-2">
                <p className="text-xs text-content-secondary font-medium">2. Save these backup codes in a safe place:</p>
                <div className="grid grid-cols-2 gap-1">
                  {setup2fa.backupCodes.map(c => (
                    <code key={c} className="text-xs font-mono bg-surface-primary px-2 py-1 rounded text-content-primary">{c}</code>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-content-secondary font-medium">3. Enter the 6-digit code from your app to confirm:</p>
                <Input label="Verification code" value={totpCode}
                  onChange={e => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" loading={twoFaSaving} onClick={enable2FA} disabled={totpCode.length !== 6}>
                  Enable 2FA
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSetup2fa(null)}>Cancel</Button>
              </div>
            </div>
          )}

          {dashboard?.twoFactorEnabled && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-success text-sm">
                <CheckCircle2 size={15} />
                <span>2FA is active on your account</span>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-content-tertiary">Enter your current TOTP code to disable 2FA:</p>
                <Input label="Current 2FA code" value={disableCode}
                  onChange={e => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000" />
              </div>
              <Button size="sm" variant="danger" loading={twoFaSaving} onClick={disable2FA}
                disabled={disableCode.length !== 6}>
                Disable 2FA
              </Button>
            </div>
          )}
        </section>

        {/* Active sessions */}
        <section className="rounded-xl border border-border-default bg-surface-secondary p-5 space-y-4">
          <SectionHeader icon={Monitor} title="Active sessions" />
          {sessions.length === 0 ? (
            <p className="text-xs text-content-tertiary">No active sessions.</p>
          ) : (
            <div className="space-y-2">
              {sessions.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-tertiary gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <TabletSmartphone size={15} className={cn('shrink-0',
                      s.current ? 'text-tyrian' : 'text-content-tertiary')} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-content-primary">
                        {s.deviceName}
                        {s.current && <span className="ml-1.5 text-[10px] text-tyrian font-semibold">current</span>}
                      </p>
                      <p className="text-[10px] text-content-tertiary">
                        {s.ipAddress} · {new Date(s.lastActiveAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!s.current && (
                    <button type="button" aria-label="Revoke session" onClick={() => revokeSession(s.id)}
                      className="p-1.5 text-content-tertiary hover:text-danger rounded transition-colors shrink-0">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Login history */}
        <section className="rounded-xl border border-border-default bg-surface-secondary p-5 space-y-4">
          <SectionHeader icon={LogOut} title="Login history" />
          {history.length === 0 ? (
            <p className="text-xs text-content-tertiary">No login history yet.</p>
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {history.map(h => (
                <div key={h.id} className="flex items-center justify-between py-2 border-b border-border-default last:border-0">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full shrink-0',
                      h.success ? 'bg-success' : 'bg-danger')} />
                    <div>
                      <p className="text-xs text-content-primary">{h.ipAddress || 'Unknown IP'}</p>
                      {!h.success && h.failureReason && (
                        <p className="text-[10px] text-danger">{h.failureReason}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-content-tertiary">
                    {new Date(h.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Privacy */}
        <section className="rounded-xl border border-border-default bg-surface-secondary p-5 space-y-4">
          <SectionHeader icon={Globe} title="Privacy settings" />
          {privacy && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-content-secondary mb-1.5 block">Profile visibility</label>
                <div className="flex gap-2 flex-wrap">
                  {(['PUBLIC', 'FOLLOWERS', 'PRIVATE'] as const).map(v => (
                    <button key={v} type="button"
                      onClick={() => updatePrivacy({ profileVisibility: v })}
                      className={cn('px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors',
                        privacy.profileVisibility === v
                          ? 'bg-tyrian text-white border-tyrian'
                          : 'bg-surface-tertiary text-content-secondary border-border-default hover:border-border-hover')}>
                      {v.charAt(0) + v.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {([
                { key: 'showEmail', label: 'Show email on profile' },
                { key: 'showActivity', label: 'Show activity feed' },
                { key: 'showOnlineStatus', label: 'Show online status' },
              ] as { key: keyof Privacy; label: string }[]).map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-content-secondary">{label}</span>
                  <button type="button"
                    onClick={() => updatePrivacy({ [key]: !privacy[key] })}
                    className={cn('relative inline-flex h-5 w-9 rounded-full transition-colors',
                      privacy[key] ? 'bg-tyrian' : 'bg-surface-tertiary border border-border-hover')}>
                    <span className={cn('inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5',
                      privacy[key] ? 'translate-x-4' : 'translate-x-0.5')} />
                  </button>
                </label>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
