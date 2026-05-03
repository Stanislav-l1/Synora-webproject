'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users, Search, Plus, Globe, Lock, UserCheck, Loader2,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import type { ApiResponse, PageResponse, Community, CommunityPrivacy } from '@/types';

const PRIVACY_ICON: Record<CommunityPrivacy, React.ReactNode> = {
  PUBLIC:      <Globe size={12} />,
  PRIVATE:     <Lock size={12} />,
  INVITE_ONLY: <UserCheck size={12} />,
};

const PRIVACY_LABEL: Record<CommunityPrivacy, string> = {
  PUBLIC:      'Public',
  PRIVATE:     'Private',
  INVITE_ONLY: 'Invite only',
};

function CommunityCard({
  community,
  onJoin,
  onLeave,
}: {
  community: Community;
  onJoin: (slug: string) => void;
  onLeave: (slug: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleJoin(e: React.MouseEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onJoin(community.slug);
    } finally {
      setLoading(false);
    }
  }

  async function handleLeave(e: React.MouseEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onLeave(community.slug);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Link
      href={`/communities/${community.slug}`}
      className="block bg-surface-secondary border border-border-default rounded-xl overflow-hidden hover:border-border-hover transition-colors group"
    >
      {/* Banner */}
      <div className="h-20 bg-gradient-to-br from-accent/30 via-accent/10 to-transparent relative overflow-hidden">
        {community.bannerUrl && (
          <img src={community.bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>

      <div className="px-4 pb-4">
        <div className="-mt-6 mb-3">
          <div className="ring-2 ring-surface-secondary rounded-xl inline-block">
            <Avatar
              name={community.name}
              src={community.avatarUrl || undefined}
              size="md"
            />
          </div>
        </div>

        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-content-primary text-sm truncate group-hover:text-accent transition-colors">
              {community.name}
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] text-content-tertiary mt-0.5">
              {PRIVACY_ICON[community.privacy]} {PRIVACY_LABEL[community.privacy]}
            </span>
          </div>

          {community.myRole !== 'OWNER' && (
            <button
              type="button"
              onClick={community.member ? handleLeave : handleJoin}
              disabled={loading || community.privacy === 'PRIVATE'}
              className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                community.member
                  ? 'bg-accent/10 text-accent hover:bg-danger/10 hover:text-danger border border-accent/20 hover:border-danger/20'
                  : 'bg-accent text-white hover:bg-accent/90'
              } disabled:opacity-40`}
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : community.member ? 'Joined' : 'Join'}
            </button>
          )}
          {community.myRole === 'OWNER' && (
            <span className="shrink-0 px-2 py-0.5 rounded-md text-[11px] bg-accent/10 text-accent border border-accent/20">
              Owner
            </span>
          )}
        </div>

        {community.description && (
          <p className="text-xs text-content-secondary mt-2 line-clamp-2">
            {community.description}
          </p>
        )}

        <div className="flex items-center gap-3 mt-3 text-xs text-content-tertiary">
          <span className="flex items-center gap-1">
            <Users size={11} /> {community.membersCount.toLocaleString()} members
          </span>
          <span>{community.postsCount.toLocaleString()} posts</span>
        </div>
      </div>
    </Link>
  );
}

export default function CommunitiesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'discover' | 'joined'>('discover');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'joined' && user) {
        const res = await api.get<ApiResponse<PageResponse<Community>>>('/communities/my?page=0&size=30');
        setCommunities(res.data.data.content);
      } else {
        const q = search ? `&q=${encodeURIComponent(search)}` : '';
        const res = await api.get<ApiResponse<PageResponse<Community>>>(`/communities?page=0&size=30${q}`);
        setCommunities(res.data.data.content);
      }
    } catch {
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  }, [tab, search, user]);

  useEffect(() => { load(); }, [load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  async function handleJoin(slug: string) {
    if (!user) { router.push('/login'); return; }
    await api.post(`/communities/${slug}/join`);
    setCommunities((prev) => prev.map((c) => c.slug === slug ? { ...c, member: true, membersCount: c.membersCount + 1 } : c));
  }

  async function handleLeave(slug: string) {
    await api.delete(`/communities/${slug}/join`);
    if (tab === 'joined') {
      setCommunities((prev) => prev.filter((c) => c.slug !== slug));
    } else {
      setCommunities((prev) => prev.map((c) => c.slug === slug ? { ...c, member: false, membersCount: c.membersCount - 1 } : c));
    }
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-bold text-content-primary flex items-center gap-2">
              <Users size={20} className="text-accent" /> Communities
            </h1>
            <p className="text-sm text-content-secondary mt-0.5">
              Join developer groups, run courses and host events
            </p>
          </div>
          {user && (
            <Link href="/communities/create">
              <Button size="sm">
                <Plus size={14} className="mr-1" /> Create
              </Button>
            </Link>
          )}
        </div>

        {/* Tabs + Search */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="flex rounded-lg border border-border-default overflow-hidden">
            {(['discover', 'joined'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 text-sm capitalize transition-colors ${
                  tab === t
                    ? 'bg-accent text-white'
                    : 'text-content-secondary hover:text-content-primary hover:bg-surface-tertiary'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'discover' && (
            <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-0 max-w-xs">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search communities…"
                  className="w-full pl-9 pr-3 h-9 text-sm bg-surface-tertiary border border-border-default rounded-lg text-content-primary placeholder:text-content-tertiary focus:outline-none focus:border-border-accent"
                />
              </div>
              <Button type="submit" size="sm" variant="secondary">Go</Button>
            </form>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-surface-secondary rounded-xl animate-pulse" />
            ))}
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center py-16 text-content-tertiary">
            <Users size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-content-secondary">
              {tab === 'joined' ? "You haven't joined any communities yet" : 'No communities found'}
            </p>
            {tab === 'joined' && (
              <button
                type="button"
                onClick={() => setTab('discover')}
                className="mt-3 text-sm text-accent hover:underline"
              >
                Discover communities
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities.map((c) => (
              <CommunityCard
                key={c.id}
                community={c}
                onJoin={handleJoin}
                onLeave={handleLeave}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
