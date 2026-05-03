'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Hash, Loader2, TrendingUp } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui';
import api from '@/lib/api';
import type { ApiResponse, TrendingTag } from '@/types';

function unwrap<T>(payload: unknown): T | null {
  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    return (payload as { data: T }).data;
  }
  return (payload as T) ?? null;
}

export default function TrendingPage() {
  const [tags, setTags] = useState<TrendingTag[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<ApiResponse<TrendingTag[]>>('/tags/trending', { params: { limit: 30 } })
      .then((res) => {
        if (!cancelled) setTags(unwrap<TrendingTag[]>(res.data) || []);
      })
      .catch(() => {
        if (!cancelled) setTags([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-tyrian" />
          <h1 className="text-2xl font-bold text-cloud-ink">Trending</h1>
        </div>
        <p className="text-sm text-cloud-muted">
          Topics being discussed across Synora right now.
        </p>

        {tags === null ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="animate-spin text-tyrian/60" />
          </div>
        ) : tags.length === 0 ? (
          <Card tone="light">
            <p className="text-center py-8 text-xs text-cloud-muted">
              No trending topics yet.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tags.map((t, i) => (
              <Link
                key={t.tag}
                href={`/tags/${encodeURIComponent(t.tag)}`}
                className="group rounded-xl border border-cloud-deep bg-white px-4 py-3 hover:border-tyrian transition-colors flex items-center gap-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-tyrian/10 text-tyrian">
                  <Hash size={16} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-cloud-ink group-hover:text-tyrian truncate">
                    #{t.tag}
                  </p>
                  <p className="text-xs text-cloud-muted">
                    {t.posts.toLocaleString()} posts
                  </p>
                </div>
                <span className="text-[10px] text-cloud-muted">#{i + 1}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
