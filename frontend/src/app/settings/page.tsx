'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2, Save, ShieldCheck, ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import type { ApiResponse, User } from '@/types';
import { useT } from '@/lib/i18n';

export default function SettingsPage() {
  const t = useT();
  const router = useRouter();
  const { user } = useAuth();
  const { setUser } = useAuthStore();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [websiteUrl, setWebsiteUrl] = useState(user?.websiteUrl || '');
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'err', text: t.settings.avatarInvalidType });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'err', text: t.settings.avatarTooLarge });
      return;
    }

    setIsUploadingAvatar(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await api.post<ApiResponse<{ avatarUrl: string }>>(
        '/users/me/avatar',
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      setUser({ ...user!, avatarUrl: res.data.data.avatarUrl });
      setMessage({ type: 'ok', text: t.settings.avatarUpdated });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setMessage({ type: 'err', text: e?.response?.data?.message || t.settings.avatarFailed });
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await api.patch<ApiResponse<User>>('/users/me', {
        displayName: displayName || null,
        bio: bio || null,
        location: location || null,
        websiteUrl: websiteUrl || null,
        githubUrl: githubUrl || null,
      });
      setUser(res.data.data);
      setMessage({ type: 'ok', text: t.settings.saved });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setMessage({ type: 'err', text: err?.response?.data?.message || t.settings.saveFailed });
    } finally {
      setIsSaving(false);
    }
  }

  if (!user) return null;

  return (
    <AppShell>
      <div className="max-w-feed mx-auto px-4 py-6 space-y-6">
        <h1 className="text-xl font-semibold text-cloud-ink">{t.settings.title}</h1>

        <Card>
          <CardHeader>
            <h2 className="text-base font-medium text-cloud-ink">{t.settings.profileSection}</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar
                  src={user.avatarUrl}
                  name={user.displayName || user.username}
                  size="xl"
                />
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="sr-only"
                  aria-label={t.settings.changeAvatar}
                  title={t.settings.changeAvatar}
                  onChange={handleAvatarChange}
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  aria-label={t.settings.changeAvatar}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-tyrian rounded-full flex items-center justify-center text-cloud hover:bg-tyrian-soft transition-colors disabled:opacity-60"
                >
                  {isUploadingAvatar ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Camera size={14} />
                  )}
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-cloud-ink">@{user.username}</p>
                <p className="text-xs text-cloud-muted">{user.email}</p>
              </div>
            </div>

            <Input
              label={t.settings.displayName}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t.settings.displayNamePh}
            />

            <Textarea
              label={t.settings.bio}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t.settings.bioPh}
              rows={3}
            />

            <Input
              label={t.settings.location}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t.settings.locationPh}
            />

            <Input
              label={t.settings.website}
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://..."
            />

            <Input
              label={t.settings.github}
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username"
            />

            {message && (
              <p className={message.type === 'ok' ? 'text-xs text-moss-velvet' : 'text-xs text-tyrian'}>
                {message.text}
              </p>
            )}

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleSave}
                loading={isSaving}
                icon={<Save size={14} />}
              >
                {t.settings.saveChanges}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-medium text-cloud-ink">{t.settings.accountSection}</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label={t.settings.email} value={user.email} disabled />
            <Input label={t.settings.username} value={user.username} disabled />
            <p className="text-xs text-cloud-muted">
              {t.settings.contactSupport}
            </p>
          </CardContent>
        </Card>

        <button
          type="button"
          onClick={() => router.push('/settings/security')}
          className="w-full text-left"
        >
          <Card className="hover:border-border-hover transition-colors cursor-pointer">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-tyrian shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-cloud-ink">Security &amp; Privacy</p>
                    <p className="text-xs text-cloud-muted">Password, 2FA, sessions, privacy settings</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-cloud-muted" />
              </div>
            </CardContent>
          </Card>
        </button>

        <Card>
          <CardHeader>
            <h2 className="text-base font-medium text-tyrian">{t.settings.dangerZone}</h2>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cloud-ink">{t.settings.deleteAccount}</p>
                <p className="text-xs text-cloud-muted">
                  {t.settings.deleteWarning}
                </p>
              </div>
              <Button type="button" variant="danger" size="sm">
                {t.settings.deleteAccount}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
