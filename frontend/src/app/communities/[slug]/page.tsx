'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users, Globe, Lock, UserCheck, Settings, ArrowLeft,
  Loader2, Newspaper,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { TabBar } from '@/components/ui/tab-bar';
import { PostCard } from '@/components/shared/post-card';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import type {
  ApiResponse, PageResponse,
  Community, CommunityMember, CommunityPrivacy, PostSummary,
} from '@/types';

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

const ROLE_LABEL = { OWNER: 'Owner', MODERATOR: 'Mod', MEMBER: 'Member' };

export default function CommunityDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([
      api.get<ApiResponse<Community>>(`/communities/${slug}`),
      api.get<ApiResponse<PageResponse<PostSummary>>>(`/communities/${slug}/posts?page=0&size=20`),
      api.get<ApiResponse<PageResponse<CommunityMember>>>(`/communities/${slug}/members?page=0&size=50`),
    ])
      .then(([cRes, pRes, mRes]) => {
        setCommunity(cRes.data.data);
        setPosts(pRes.data.data.content);
        setMembers(mRes.data.data.content);
      })
      .catch(() => router.push('/communities'))
      .finally(() => setLoading(false));
  }, [slug, router]);

  async function handleJoin() {
    if (!user) { router.push('/login'); return; }
    setJoining(true);
    try {
      const res = await api.post<ApiResponse<Community>>(`/communities/${slug}/join`);
      setCommunity(res.data.data);
    } catch {
      /* noop */
    } finally {
      setJoining(false);
    }
  }

  async function handleLeave() {
    setJoining(true);
    try {
      await api.delete(`/communities/${slug}/join`);
      setCommunity((prev) => prev ? { ...prev, member: false, membersCount: prev.membersCount - 1 } : prev);
    } catch {
      /* noop */
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center items-center py-24">
          <Loader2 size={28} className="animate-spin text-accent/60" />
        </div>
      </AppShell>
    );
  }

  if (!community) return null;

  const isOwnerOrMod = community.myRole === 'OWNER' || community.myRole === 'MODERATOR';

  const tabs = [
    { id: 'posts',   label: 'Posts',   count: community.postsCount },
    { id: 'members', label: 'Members', count: community.membersCount },
  ];

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        {/* Banner */}
        <div className="h-48 bg-gradient-to-br from-accent/30 via-accent/10 to-surface-tertiary relative overflow-hidden">
          {community.bannerUrl && (
            <img src={community.bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-primary/60 to-transparent" />
        </div>

        {/* Header */}
        <div className="px-6 relative">
          <div className="-mt-12 mb-4 flex items-end justify-between">
            <div className="ring-4 ring-surface-primary rounded-xl">
              <Avatar name={community.name} src={community.avatarUrl || undefined} size="xl" />
            </div>
            <div className="flex gap-2 mb-2">
              {isOwnerOrMod && (
                <Link href={`/communities/${slug}/settings`}>
                  <Button variant="secondary" size="sm">
                    <Settings size={14} className="mr-1" /> Settings
                  </Button>
                </Link>
              )}
              {community.myRole !== 'OWNER' && community.privacy !== 'PRIVATE' && (
                <Button
                  variant={community.member ? 'secondary' : 'primary'}
                  size="sm"
                  loading={joining}
                  onClick={community.member ? handleLeave : handleJoin}
                >
                  {community.member ? 'Leave' : 'Join'}
                </Button>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-content-primary">{community.name}</h1>
              <span className="flex items-center gap-1 text-xs text-content-tertiary border border-border-default rounded-full px-2 py-0.5">
                {PRIVACY_ICON[community.privacy]} {PRIVACY_LABEL[community.privacy]}
              </span>
              {community.myRole && (
                <span className="text-xs bg-accent/10 text-accent border border-accent/20 rounded-full px-2 py-0.5">
                  {ROLE_LABEL[community.myRole]}
                </span>
              )}
            </div>

            {community.description && (
              <p className="text-sm text-content-secondary mt-2 max-w-lg">
                {community.description}
              </p>
            )}

            <div className="flex gap-6 mt-3 text-sm">
              <span>
                <strong className="text-content-primary">{community.membersCount.toLocaleString()}</strong>{' '}
                <span className="text-content-tertiary">members</span>
              </span>
              <span>
                <strong className="text-content-primary">{community.postsCount.toLocaleString()}</strong>{' '}
                <span className="text-content-tertiary">posts</span>
              </span>
            </div>

            <p className="text-xs text-content-tertiary mt-1">
              Created by{' '}
              <Link href={`/profile/${community.ownerUsername}`} className="hover:text-accent transition-colors">
                @{community.ownerUsername}
              </Link>
            </p>
          </div>
        </div>

        <div className="px-6 mt-6">
          <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <div className="px-6 py-6">
          {activeTab === 'posts' && (
            <div className="space-y-4 max-w-feed">
              {posts.length === 0 ? (
                <div className="text-center py-12 text-content-tertiary">
                  <Newspaper size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-content-secondary text-sm">No posts yet</p>
                  {community.member && (
                    <p className="text-xs text-content-tertiary mt-1">Be the first to post in this community</p>
                  )}
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUsername={user?.username ?? null}
                    onChange={(next) => setPosts((ps) => ps.map((p) => (p.id === next.id ? next : p)))}
                    onRemove={(id) => setPosts((ps) => ps.filter((p) => p.id !== id))}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-2 max-w-2xl">
              {members.map((m) => (
                <Link
                  key={m.userId}
                  href={`/profile/${m.username}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-secondary border border-border-default hover:border-border-hover transition-colors"
                >
                  <Avatar
                    name={m.displayName || m.username}
                    src={m.avatarUrl || undefined}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-content-primary truncate">
                      {m.displayName || m.username}
                    </p>
                    <p className="text-xs text-content-tertiary">@{m.username}</p>
                  </div>
                  {m.role !== 'MEMBER' && (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
                      m.role === 'OWNER'
                        ? 'bg-accent/10 text-accent border-accent/20'
                        : 'bg-info/10 text-info border-info/20'
                    }`}>
                      {ROLE_LABEL[m.role]}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
