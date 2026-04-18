'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, UserPlus } from 'lucide-react';
import { Avatar, Button, Card, Skeleton, SkeletonText } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useT } from '@/lib/i18n';

type TrendingTag = { tag: string; posts: number };
type SuggestedUser = { id: string; username: string; displayName: string; bio?: string; avatarUrl?: string | null };
type UserStats = { posts: number; reputation: number; followers: number; projects: number };

function unwrap<T>(payload: unknown): T | null {
  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    return (payload as { data: T }).data;
  }
  return (payload as T) ?? null;
}

export function RightPanel() {
  const t = useT();
  const { user } = useAuthStore();
  const [trending, setTrending] = useState<TrendingTag[] | null>(null);
  const [suggested, setSuggested] = useState<SuggestedUser[] | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/tags/trending', { params: { limit: 5 } });
        if (!cancelled) setTrending(unwrap<TrendingTag[]>(res.data) || []);
      } catch {
        if (!cancelled) setTrending([]);
      }
    })();
    (async () => {
      try {
        const res = await api.get('/users/suggested', { params: { limit: 3 } });
        if (!cancelled) setSuggested(unwrap<SuggestedUser[]>(res.data) || []);
      } catch {
        if (!cancelled) setSuggested([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`/users/${user.id}/stats`);
        if (!cancelled) setStats(unwrap<UserStats>(res.data));
      } catch {
        if (!cancelled) setStats({ posts: 0, reputation: 0, followers: 0, projects: 0 });
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  async function onFollow(id: string) {
    setFollowingIds((prev) => new Set(prev).add(id));
    try {
      await api.post(`/users/${id}/follow`);
    } catch {
      setFollowingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <aside className="hidden xl:block w-right-panel shrink-0 sticky top-navbar h-[calc(100vh-theme(spacing.navbar))] overflow-y-auto scrollbar-hidden p-4 space-y-4">
      {/* Trending */}
      <Card tone="light">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-tyrian" />
          <h3 className="text-sm font-semibold text-cloud-ink">{t.rightPanel.trending}</h3>
        </div>
        {trending === null ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        ) : trending.length === 0 ? (
          <p className="text-xs text-cloud-muted">{t.rightPanel.noTrending}</p>
        ) : (
          <div className="space-y-2.5">
            {trending.map((topic) => (
              <Link
                key={topic.tag}
                href={`/tags/${topic.tag}`}
                className="flex items-center justify-between group"
              >
                <span className="text-sm text-cloud-ink/80 group-hover:text-tyrian transition-colors">
                  #{topic.tag}
                </span>
                <span className="text-xs text-cloud-muted">{topic.posts} {t.rightPanel.posts.toLowerCase()}</span>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Suggested users */}
      <Card tone="light">
        <div className="flex items-center gap-2 mb-3">
          <UserPlus size={16} className="text-tyrian" />
          <h3 className="text-sm font-semibold text-cloud-ink">{t.rightPanel.whoToFollow}</h3>
        </div>
        {suggested === null ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1"><SkeletonText lines={2} /></div>
              </div>
            ))}
          </div>
        ) : suggested.length === 0 ? (
          <p className="text-xs text-cloud-muted">{t.rightPanel.noSuggested}</p>
        ) : (
          <div className="space-y-3">
            {suggested.map((u) => {
              const isFollowing = followingIds.has(u.id);
              return (
                <div key={u.id} className="flex items-center gap-3">
                  <Avatar name={u.displayName || u.username} src={u.avatarUrl || undefined} size="sm" />
                  <div className="flex-1 min-w-0">
                    <Link href={`/u/${u.username}`} className="block">
                      <p className="text-sm font-medium text-cloud-ink truncate hover:text-tyrian transition-colors">
                        {u.displayName || u.username}
                      </p>
                    </Link>
                    <p className="text-xs text-cloud-muted truncate">{u.bio || `@${u.username}`}</p>
                  </div>
                  <Button
                    variant={isFollowing ? 'secondary' : 'primary'}
                    size="sm"
                    disabled={isFollowing}
                    onClick={() => onFollow(u.id)}
                  >
                    {isFollowing ? t.common.following : t.common.follow}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Your stats */}
      <Card tone="light">
        <h3 className="text-sm font-semibold text-cloud-ink mb-3">{t.rightPanel.yourStats}</h3>
        {stats === null ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-5 w-12 mx-auto" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: t.rightPanel.posts, value: stats.posts },
              { label: t.rightPanel.reputation, value: stats.reputation },
              { label: t.rightPanel.followers, value: stats.followers },
              { label: t.rightPanel.projects, value: stats.projects },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-lg font-semibold text-cloud-ink">{s.value.toLocaleString()}</p>
                <p className="text-xs text-cloud-muted">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </aside>
  );
}
