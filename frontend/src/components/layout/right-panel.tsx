'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Zap, GitBranch, UserPlus, Check, ExternalLink, Star, Package,
} from 'lucide-react';
import { Avatar, Skeleton, SkeletonText } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type TrendingTag = { tag: string; posts: number };
type SuggestedUser = { id: string; username: string; displayName: string; bio?: string; avatarUrl?: string | null };
type UserStats = { posts: number; reputation: number; followers: number; projects: number };

function unwrap<T>(payload: unknown): T | null {
  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    return (payload as { data: T }).data;
  }
  return (payload as T) ?? null;
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mt-5 mb-3">
      <span className="text-[10px] font-bold text-cloud-muted/80 uppercase tracking-wider whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-cloud-deep" />
    </div>
  );
}

function QuickActions() {
  const router = useRouter();
  const t = useT();
  const actions = [
    { id: 'post',    label: t.rightPanel.quickPost,    icon: Zap,       href: '/feed' },
    { id: 'project', label: t.rightPanel.quickProject, icon: GitBranch, href: '/projects?new=1' },
    { id: 'collab',  label: t.rightPanel.quickCollab,  icon: UserPlus,  href: '/people' },
  ];
  return (
    <div className="flex gap-1.5">
      {actions.map((qa) => {
        const Icon = qa.icon;
        return (
          <button
            key={qa.id}
            type="button"
            onClick={() => router.push(qa.href)}
            className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl bg-cloud-soft border border-cloud-deep hover:bg-cloud-deep/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-150"
          >
            <Icon size={14} className="text-cloud-ink/60" />
            <span className="text-[10px] font-semibold text-cloud-ink/70">{qa.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function TrendingList({ items }: { items: TrendingTag[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="flex flex-col">
      {items.map((item, i) => {
        const isOpen = expanded === item.tag;
        return (
          <button
            key={item.tag}
            type="button"
            onClick={() => setExpanded(isOpen ? null : item.tag)}
            className={cn(
              'rounded-xl px-3 py-2.5 text-left transition-colors',
              isOpen ? 'bg-cloud-deep/60' : 'hover:bg-cloud-deep/30',
            )}
          >
            <div className="flex items-start gap-2.5">
              <span className="shrink-0 mt-0.5 text-[10px] font-bold text-cloud-muted/70 w-3.5 text-right">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <Package size={11} className="text-cloud-muted shrink-0" />
                  <span className="text-xs font-bold text-cloud-ink truncate">#{item.tag}</span>
                  <span className="text-[9px] font-semibold text-cloud-muted px-1.5 rounded bg-cloud-deep">
                    {item.posts} {item.posts === 1 ? 'post' : 'posts'}
                  </span>
                </div>
                {!isOpen && (
                  <p className="text-[11px] text-cloud-muted truncate">
                    Click to see actions
                  </p>
                )}
              </div>
            </div>

            {isOpen && (
              <div className="flex items-center gap-1.5 mt-2 ml-6">
                <ExpandedActions tag={item.tag} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ExpandedActions({ tag }: { tag: string }) {
  const t = useT();
  return (
    <>
      <Link
        href={`/tags/${tag}`}
        className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-tyrian/10 text-tyrian text-[10px] font-semibold hover:bg-tyrian/15"
      >
        <ExternalLink size={9} />
        {t.rightPanel.open}
      </Link>
      <button
        type="button"
        onClick={(e) => e.preventDefault()}
        className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cloud-deep/50 text-cloud-muted text-[10px] hover:bg-cloud-deep"
      >
        <Star size={9} />
        {t.rightPanel.save}
      </button>
    </>
  );
}

function SuggestedList({
  users,
  followingIds,
  onFollow,
}: {
  users: SuggestedUser[];
  followingIds: Set<string>;
  onFollow: (id: string) => void;
}) {
  const t = useT();
  return (
    <div className="flex flex-col gap-1">
      {users.map((u) => {
        const isFollowing = followingIds.has(u.id);
        return (
          <div
            key={u.id}
            className="flex items-center justify-between gap-2 px-2 py-2 rounded-xl hover:bg-cloud-deep/40 transition-colors"
          >
            <Link href={`/u/${u.username}`} className="flex items-center gap-2 min-w-0 flex-1">
              <Avatar name={u.displayName || u.username} src={u.avatarUrl || undefined} size="sm" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-cloud-ink truncate">
                  {u.displayName || u.username}
                </p>
                <p className="text-[10px] text-cloud-muted truncate">@{u.username}</p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => !isFollowing && onFollow(u.id)}
              disabled={isFollowing}
              className={cn(
                'shrink-0 px-2.5 py-1 rounded-lg text-cloud text-[10px] font-semibold transition-all flex items-center gap-1 active:scale-95',
                isFollowing ? 'bg-success' : 'bg-tyrian hover:bg-tyrian-soft',
              )}
            >
              {isFollowing && <Check size={9} />}
              {isFollowing ? t.rightPanel.followingAction : t.rightPanel.followAction}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function StatsGrid({ stats }: { stats: UserStats }) {
  const t = useT();
  const items = [
    { label: t.rightPanel.posts, value: stats.posts },
    { label: t.rightPanel.reputation, value: stats.reputation },
    { label: t.rightPanel.followers, value: stats.followers },
    { label: t.rightPanel.projects, value: stats.projects },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((s) => (
        <div
          key={s.label}
          className="flex flex-col items-center justify-center py-3 rounded-xl bg-cloud-soft border border-cloud-deep hover:bg-cloud-deep/30 transition-colors"
        >
          <span className="text-lg font-bold text-cloud-ink leading-none">
            {s.value.toLocaleString()}
          </span>
          <span className="text-[10px] text-cloud-muted mt-1">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function ActivitySparkline() {
  const t = useT();
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const heights = [3, 7, 5, 9, 4, 8, 6];
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const max = Math.max(...heights);
  return (
    <div className="mt-3 px-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-cloud-muted">{t.rightPanel.activity}</span>
        <span className="text-[10px] font-semibold text-success">{t.rightPanel.activityTrend}</span>
      </div>
      <div className="flex items-end gap-1 px-1 h-9">
        {heights.map((h, i) => (
          <div
            key={i}
            className={cn(
              'flex-1 rounded-sm transition-all',
              i === todayIdx ? 'bg-tyrian' : 'bg-cloud-deep',
            )}
            style={{ height: `${(h / max) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1 px-1">
        {days.map((d) => (
          <span key={d} className="text-[9px] text-cloud-muted/70">{d}</span>
        ))}
      </div>
    </div>
  );
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
        const res = await api.get('/users/suggested', { params: { limit: 4 } });
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
    <aside className="hidden xl:flex flex-col w-right-panel shrink-0 sticky top-[calc(var(--banner-h,0px)+theme(spacing.navbar))] h-[calc(100vh-var(--banner-h,0px)-theme(spacing.navbar))] overflow-y-auto scrollbar-hidden border-l border-cloud-deep bg-cloud px-3.5 py-4">
      <QuickActions />

      <Divider label={t.rightPanel.trending} />
      {trending === null ? (
        <div className="space-y-2 px-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : trending.length === 0 ? (
        <p className="text-xs text-cloud-muted px-3">{t.rightPanel.noTrending}</p>
      ) : (
        <TrendingList items={trending} />
      )}

      <Divider label={t.rightPanel.whoToFollow} />
      {suggested === null ? (
        <div className="space-y-3 px-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-7 h-7 rounded-full" />
              <div className="flex-1"><SkeletonText lines={2} /></div>
            </div>
          ))}
        </div>
      ) : suggested.length === 0 ? (
        <p className="text-xs text-cloud-muted px-3">{t.rightPanel.noSuggested}</p>
      ) : (
        <SuggestedList users={suggested} followingIds={followingIds} onFollow={onFollow} />
      )}

      <Divider label={t.rightPanel.yourStats} />
      {stats === null ? (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <StatsGrid stats={stats} />
          <ActivitySparkline />
        </>
      )}

      <p className="mt-6 text-center text-[10px] text-cloud-muted/60">© 2026 Synora</p>
    </aside>
  );
}
