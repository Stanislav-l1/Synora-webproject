'use client';

import { Rss } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';

export default function SubscriptionsPage() {
  return (
    <AppShell>
      <div className="max-w-feed mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center gap-2 text-cloud-ink">
          <Rss size={20} />
          <h1 className="text-lg font-semibold">Subscriptions</h1>
        </div>
        <div className="text-center py-12 text-cloud-muted text-sm">
          You have no subscriptions yet. Follow tags, users and projects to see them here.
        </div>
      </div>
    </AppShell>
  );
}
