'use client';

import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { ProfileView } from '@/components/shared/profile-view';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocale } from '@/lib/i18n';

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const { user } = useAuthStore();
  const { locale } = useLocale();
  const username = Array.isArray(params.username) ? params.username[0] : params.username;
  const isOwn = !!user?.username && user.username === username;

  return (
    <AppShell>
      <ProfileView username={username} isOwn={isOwn} locale={locale as 'ru' | 'en'} />
    </AppShell>
  );
}
