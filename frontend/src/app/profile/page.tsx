'use client';

import { useState, useEffect } from 'react';
import { MapPin, LinkIcon, Calendar, Star, Loader2 } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { TabBar } from '@/components/ui/tab-bar';
import { PostCard } from '@/components/shared/post-card';
import { ProjectCard } from '@/components/shared/project-card';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import type { ApiResponse, PageResponse } from '@/types';
import { useT, useLocale } from '@/lib/i18n';

interface UserProfile {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  location: string | null;
  reputationScore: number;
  createdAt: string;
}

interface PostSummary {
  id: string;
  authorUsername: string;
  authorDisplayName: string | null;
  authorAvatarUrl: string | null;
  title: string | null;
  preview: string | null;
  likesCount: number;
  commentsCount: number;
  tags: { id: number; name: string }[];
  createdAt: string;
}

interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  starsCount: number;
  membersCount: number;
  tags: { id: number; name: string }[];
  createdAt: string;
}

interface FollowStats {
  followers: number;
  following: number;
}

export default function ProfilePage() {
  const t = useT();
  const { locale } = useLocale();
  const tabs = [
    { id: 'posts', label: t.profile.tabPosts },
    { id: 'projects', label: t.profile.tabProjects },
    { id: 'activity', label: t.profile.tabActivity },
  ];
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('posts');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [followStats, setFollowStats] = useState<FollowStats>({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.username) return;

    const username = user.username;

    Promise.all([
      api.get<ApiResponse<UserProfile>>(`/users/${username}/profile`),
      api.get<ApiResponse<PageResponse<PostSummary>>>(`/posts/by/${username}?page=0&size=20`),
      api.get<ApiResponse<PageResponse<ProjectSummary>>>(`/projects/by/${username}?page=0&size=20`),
    ])
      .then(([profileRes, postsRes, projectsRes]) => {
        setProfile(profileRes.data.data);
        setPosts(postsRes.data.data.content);
        setProjects(projectsRes.data.data.content);

        const profileId = profileRes.data.data.id;
        return api.get<ApiResponse<FollowStats>>(`/users/${profileId}/follow-stats`);
      })
      .then((statsRes) => setFollowStats(statsRes.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.username]);

  const displayName = profile?.displayName || profile?.username || user?.displayName || user?.username || 'User';
  const handle = profile ? `@${profile.username}` : '';

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center items-center py-24">
          <Loader2 size={28} className="animate-spin text-tyrian/60" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        {/* Banner */}
        <div className="h-48 bg-gradient-to-br from-tyrian via-tyrian-glow to-moss-velvet relative">
          <div className="absolute inset-0 bg-gradient-to-t from-cloud/60 to-transparent" />
        </div>

        {/* Profile header */}
        <div className="px-6 relative">
          {/* Avatar */}
          <div className="-mt-12 mb-4 flex items-end justify-between">
            <div className="ring-4 ring-cloud rounded-full">
              <Avatar
                name={displayName}
                src={profile?.avatarUrl || undefined}
                size="xl"
              />
            </div>
            <div className="flex gap-2 mb-2">
              <Button variant="secondary" size="sm">{t.profile.editProfile}</Button>
              <Button variant="primary" size="sm">{t.common.share}</Button>
            </div>
          </div>

          {/* Info */}
          <div>
            <h1 className="text-2xl font-bold text-cloud-ink">{displayName}</h1>
            <p className="text-sm text-cloud-ink/70">{handle}</p>
            {profile?.bio && (
              <p className="text-sm text-cloud-ink mt-2 max-w-lg">{profile.bio}</p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-cloud-muted">
              {profile?.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {profile.location}
                </span>
              )}
              {profile?.websiteUrl && (
                <a
                  href={profile.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-tyrian transition-colors"
                >
                  <LinkIcon size={12} /> {profile.websiteUrl.replace(/^https?:\/\//, '')}
                </a>
              )}
              {profile?.createdAt && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> {t.profile.joined} {new Date(profile.createdAt).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', { month: 'long', year: 'numeric' })}
                </span>
              )}
              {profile && (
                <span className="flex items-center gap-1 text-banana-deep">
                  <Star size={12} /> {profile.reputationScore.toLocaleString()} {t.profile.reputation}
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-4 text-sm">
              <span>
                <strong className="text-cloud-ink">{posts.length}</strong>{' '}
                <span className="text-cloud-muted">{t.profile.posts}</span>
              </span>
              <span>
                <strong className="text-cloud-ink">{followStats.followers.toLocaleString()}</strong>{' '}
                <span className="text-cloud-muted">{t.profile.followers}</span>
              </span>
              <span>
                <strong className="text-cloud-ink">{followStats.following.toLocaleString()}</strong>{' '}
                <span className="text-cloud-muted">{t.profile.following}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 mt-6">
          <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* Tab content */}
        <div className="px-6 py-6">
          {activeTab === 'posts' && (
            <div className="space-y-4 max-w-feed">
              {posts.length === 0 ? (
                <div className="text-center py-12 text-cloud-muted text-sm">{t.profile.noPosts}</div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    author={{
                      name: post.authorDisplayName || post.authorUsername,
                      handle: `@${post.authorUsername}`,
                      avatar: post.authorAvatarUrl || undefined,
                    }}
                    content={post.preview || post.title || ''}
                    tags={post.tags?.map((t) => t.name)}
                    likes={post.likesCount}
                    comments={post.commentsCount}
                    timeAgo={timeAgo(post.createdAt)}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              {projects.length === 0 ? (
                <div className="text-center py-12 text-cloud-muted text-sm">{t.profile.noProjects}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      id={project.id}
                      name={project.name}
                      description={project.description || ''}
                      tags={project.tags?.map((t) => t.name)}
                      members={project.membersCount}
                      stars={project.starsCount}
                      progress={0}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="flex items-center justify-center py-16 text-cloud-muted text-sm">
              {t.profile.activitySoon}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
