'use client';

import Link from 'next/link';
import { CheckSquare, FolderKanban } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';

export default function TasksPage() {
  return (
    <AppShell>
      <div className="max-w-feed mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center gap-2 text-cloud-ink">
          <CheckSquare size={20} />
          <h1 className="text-lg font-semibold">Tasks</h1>
        </div>

        <div className="rounded-lg border border-cloud-deep bg-cloud-soft p-6">
          <p className="text-sm text-cloud-muted">
            A cross-project view of your tasks is coming soon. For now, open a project to
            see its kanban board.
          </p>
          <Link
            href="/projects"
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-tyrian hover:underline"
          >
            <FolderKanban size={14} /> Browse projects
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
