'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Loader2, Newspaper } from 'lucide-react';
import { Card } from '@/components/ui';
import api from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import type { ApiResponse, NewsItem, PageResponse } from '@/types';

interface NewsListProps {
  tag?: string;
  pageSize?: number;
  emptyText?: string;
  showHeader?: boolean;
}

export function NewsList({
  tag,
  pageSize = 20,
  emptyText = 'No news yet.',
  showHeader = true,
}: NewsListProps) {
  const [items, setItems] = useState<NewsItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    const params: Record<string, string | number> = { page: 0, size: pageSize };
    if (tag) params.tag = tag;
    api
      .get<ApiResponse<PageResponse<NewsItem>>>('/news', { params })
      .then((res) => {
        if (!cancelled) setItems(res.data.data.content);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [tag, pageSize]);

  if (items === null) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 size={20} className="animate-spin text-tyrian/60" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showHeader && (
        <div className="flex items-center gap-2">
          <Newspaper size={16} className="text-tyrian" />
          <h3 className="text-sm font-semibold text-cloud-ink">News</h3>
        </div>
      )}

      {items.length === 0 ? (
        <Card tone="light">
          <p className="text-center py-6 text-xs text-cloud-muted">{emptyText}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <NewsCard key={n.id} item={n} />
          ))}
        </div>
      )}
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <Card tone="light">
      <div className="flex gap-3">
        {item.imageUrl && (
          <div
            className="hidden sm:block w-24 h-24 shrink-0 rounded-md bg-cover bg-center bg-cloud-soft"
            style={{ backgroundImage: `url(${item.imageUrl})` }}
            aria-hidden
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] text-cloud-muted">
            {item.source && <span>{item.source}</span>}
            {item.source && <span>·</span>}
            <span>{timeAgo(item.publishedAt)}</span>
          </div>
          <a
            href={item.url ?? '#'}
            target={item.url ? '_blank' : undefined}
            rel={item.url ? 'noopener noreferrer' : undefined}
            className="mt-1 block text-base font-semibold text-cloud-ink hover:text-tyrian"
          >
            <span className="inline-flex items-center gap-1">
              {item.title}
              {item.url && <ExternalLink size={12} className="opacity-60" />}
            </span>
          </a>
          {item.summary && (
            <p className="mt-1 text-sm text-cloud-muted line-clamp-3">{item.summary}</p>
          )}
          {item.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.tags.map((t) => (
                <Link
                  key={t}
                  href={`/tags/${encodeURIComponent(t)}`}
                  className="text-[10px] uppercase tracking-wide rounded px-1.5 py-0.5 border border-cloud-deep text-cloud-muted hover:text-tyrian hover:border-tyrian"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
