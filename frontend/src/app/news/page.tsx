'use client';

import { Newspaper } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { NewsList } from '@/components/shared/news-list';

export default function NewsPage() {
  return (
    <AppShell>
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Newspaper size={20} className="text-tyrian" />
          <h1 className="text-2xl font-bold text-cloud-ink">News</h1>
        </div>
        <p className="text-sm text-cloud-muted">
          Curated news from across the developer ecosystem.
        </p>

        <NewsList showHeader={false} pageSize={30} />
      </div>
    </AppShell>
  );
}
