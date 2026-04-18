'use client';

import { useState } from 'react';
import { Camera, Save } from 'lucide-react';
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
  const { user } = useAuth();
  const { setUser } = useAuthStore();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [websiteUrl, setWebsiteUrl] = useState(user?.websiteUrl || '');
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

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
                <Avatar name={user.displayName || user.username} size="xl" />
                <button
                  type="button"
                  aria-label={t.settings.changeAvatar}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-tyrian rounded-full flex items-center justify-center text-cloud hover:bg-tyrian-soft transition-colors"
                >
                  <Camera size={14} />
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
