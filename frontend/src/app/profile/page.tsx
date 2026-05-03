'use client';

import { Loader2 } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { ProfileView } from '@/components/shared/profile-view';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocale } from '@/lib/i18n';

export default function ProfilePage() {
  const { locale } = useLocale();
  const { user } = useAuthStore();

  if (!user?.username) {
    return (
      <AppShell>
        <div className="flex justify-center items-center py-24">
          <Loader2 size={28} className="animate-spin text-tyrian/60" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ProfileView username={user.username} isOwn locale={locale as 'ru' | 'en'} />
    </AppShell>
  );
}
