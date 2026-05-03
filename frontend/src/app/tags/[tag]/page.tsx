'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Hash,
  Loader2,
  MessageCircle,
  Star as StarIcon,
  Users,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { NewsList } from '@/components/shared/news-list';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui';
import api from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import type { ApiResponse, TagDetails, TagPostSummary, TagSpecialist } from '@/types';

export default function TagDetailsPage() {
  const params = useParams<{ tag: string }>();
  const tagName = decodeURIComponent(params.tag);
  const [data, setData] = useState<TagDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postsTab, setPostsTab] = useState<'recent' | 'discussed'>('recent');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get<ApiResponse<TagDetails>>(`/tags/${encodeURIComponent(tagName)}/details`)
      .then((res) => {
        if (!cancelled) setData(res.data.data);
      })
      .catch(() => {
        if (!cancelled) setError('Tag not found');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tagName]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center items-center py-24">
          <Loader2 size={28} className="animate-spin text-tyrian/60" />
        </div>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto py-16 text-center text-cloud-muted text-sm">
          {error ?? 'Not found'}
        </div>
      </AppShell>
    );
  }

  const grew = data.growthPercent >= 0;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-xl text-cloud bg-tyrian text-lg font-semibold"
            style={data.tag.color ? { backgroundColor: data.tag.color } : undefined}
          >
            <Hash size={20} />
          </span>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-cloud-ink">#{data.tag.name}</h1>
            <p className="text-sm text-cloud-muted">
              {data.totalPosts.toLocaleString()} posts ·{' '}
              {data.totalProjects.toLocaleString()} projects
            </p>
          </div>
        </div>

        {/* Activity stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Posts (24h)" value={data.postsLast24h} />
          <Stat label="Posts (7d)" value={data.postsLast7d} />
          <Stat
            label="Growth WoW"
            value={`${grew ? '+' : ''}${data.growthPercent}%`}
            tone={grew ? 'pos' : 'neg'}
            icon={grew ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
          />
          <Stat label="Specialists" value={data.specialists.length} />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Posts (main column) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-cloud-ink">
                {postsTab === 'recent' ? 'Recent posts' : 'Most discussed'}
              </h2>
              <div className="flex items-center rounded-md border border-cloud-deep overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setPostsTab('recent')}
                  className={`px-3 h-7 transition-colors ${
                    postsTab === 'recent'
                      ? 'bg-tyrian text-cloud'
                      : 'bg-white text-cloud-ink hover:bg-cloud-soft'
                  }`}
                >
                  Recent
                </button>
                <button
                  type="button"
                  onClick={() => setPostsTab('discussed')}
                  className={`px-3 h-7 transition-colors ${
                    postsTab === 'discussed'
                      ? 'bg-tyrian text-cloud'
                      : 'bg-white text-cloud-ink hover:bg-cloud-soft'
                  }`}
                >
                  Most discussed
                </button>
              </div>
            </div>
            <PostList
              posts={postsTab === 'recent' ? data.posts : data.discussions}
              empty={
                postsTab === 'recent'
                  ? 'No posts with this tag yet.'
                  : 'No discussions yet.'
              }
            />
          </div>

          {/* Side column */}
          <div className="space-y-6">
            <section>
              <h2 className="text-sm font-semibold text-cloud-ink mb-2">News</h2>
              <NewsList tag={data.tag.name} showHeader={false} pageSize={5} emptyText="No news for this tag." />
            </section>

            <section>
              <h2 className="text-sm font-semibold text-cloud-ink mb-2">
                Related projects
              </h2>
              {data.projects.length === 0 ? (
                <Card tone="light">
                  <p className="text-center py-4 text-xs text-cloud-muted">
                    No projects with this tag.
                  </p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {data.projects.map((p) => (
                    <Card key={p.id} tone="light">
                      <Link
                        href={`/projects/${p.id}`}
                        className="text-sm font-medium text-cloud-ink hover:text-tyrian truncate block"
                      >
                        {p.name}
                      </Link>
                      {p.description && (
                        <p className="mt-0.5 text-xs text-cloud-muted line-clamp-2">
                          {p.description}
                        </p>
                      )}
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-cloud-muted">
                        <span className="flex items-center gap-1">
                          <StarIcon size={10} /> {p.starsCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={10} /> {p.membersCount}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-sm font-semibold text-cloud-ink mb-2">Specialists</h2>
              {data.specialists.length === 0 ? (
                <Card tone="light">
                  <p className="text-center py-4 text-xs text-cloud-muted">
                    No specialists yet.
                  </p>
                </Card>
              ) : (
                <Card tone="light">
                  <ul className="divide-y divide-cloud-deep -my-2">
                    {data.specialists.map((s) => (
                      <SpecialistRow key={s.id} s={s} />
                    ))}
                  </ul>
                </Card>
              )}
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function PostList({ posts, empty }: { posts: TagPostSummary[]; empty: string }) {
  if (posts.length === 0) {
    return (
      <Card tone="light">
        <p className="text-center py-6 text-xs text-cloud-muted">{empty}</p>
      </Card>
    );
  }
  return (
    <div className="space-y-3">
      {posts.map((p) => (
        <Card key={p.id} tone="light">
          <Link
            href={`/posts/${p.id}`}
            className="block text-base font-semibold text-cloud-ink hover:text-tyrian"
          >
            {p.title}
          </Link>
          {p.preview && (
            <p className="mt-1 text-sm text-cloud-muted line-clamp-2">{p.preview}</p>
          )}
          <div className="mt-2 flex items-center gap-3 text-xs text-cloud-muted">
            {p.authorUsername && (
              <Link href={`/u/${p.authorUsername}`} className="hover:text-tyrian">
                {p.authorDisplayName || `@${p.authorUsername}`}
              </Link>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={12} /> {timeAgo(p.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={12} /> {p.commentsCount}
            </span>
            <span>♥ {p.likesCount}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number | string;
  tone?: 'pos' | 'neg';
  icon?: React.ReactNode;
}) {
  const valueClass =
    tone === 'pos' ? 'text-moss-velvet' : tone === 'neg' ? 'text-red-600' : 'text-cloud-ink';
  return (
    <div className="rounded-xl border border-cloud-deep bg-white p-3">
      <p className="text-xs text-cloud-muted">{label}</p>
      <p className={`mt-1 text-xl font-semibold flex items-center gap-1 ${valueClass}`}>
        {icon}
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

function SpecialistRow({ s }: { s: TagSpecialist }) {
  return (
    <li className="py-2 flex items-center gap-3">
      <Avatar
        name={s.displayName || s.username}
        src={s.avatarUrl || undefined}
        size="sm"
      />
      <div className="flex-1 min-w-0">
        <Link
          href={`/u/${s.username}`}
          className="text-sm font-medium text-cloud-ink hover:text-tyrian truncate block"
        >
          {s.displayName || s.username}
        </Link>
        {s.headline && (
          <p className="text-[11px] text-cloud-muted truncate">{s.headline}</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-semibold text-banana-deep">
          {s.reputationScore.toLocaleString()}
        </p>
        <p className="text-[10px] text-cloud-muted uppercase tracking-wide">
          {s.matchedVia}
        </p>
      </div>
    </li>
  );
}
