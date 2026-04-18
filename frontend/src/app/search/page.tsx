'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { TabBar } from '@/components/ui/tab-bar';
import { PostCard } from '@/components/shared/post-card';
import { ProjectCard } from '@/components/shared/project-card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import type { ApiResponse, PageResponse, Post, Project, UserProfile } from '@/types';
import { useT } from '@/lib/i18n';

type SearchTab = 'posts' | 'projects' | 'users';

function SearchContent() {
  const t = useT();
  const tabs = [
    { id: 'posts' as const, label: t.search.tabPosts },
    { id: 'projects' as const, label: t.search.tabProjects },
    { id: 'users' as const, label: t.search.tabUsers },
  ];
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchTab>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const endpoint = `/search/${activeTab}`;
        const res = await api.get<ApiResponse<PageResponse<Post | Project | UserProfile>>>(endpoint, {
          params: { q: query, page: 0, size: 20 },
        });
        const data = res.data.data.content;
        if (activeTab === 'posts') setPosts(data as Post[]);
        else if (activeTab === 'projects') setProjects(data as Project[]);
        else setUsers(data as UserProfile[]);
      } catch {
        // Search failed silently
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, activeTab]);

  return (
    <div className="max-w-feed mx-auto px-4 py-6 space-y-4">
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-cloud-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.search.placeholder}
          className="w-full bg-white border border-cloud-deep rounded-md pl-10 pr-4 py-2.5 text-sm text-cloud-ink placeholder:text-cloud-muted focus:outline-none focus:border-tyrian transition-colors"
          autoFocus
        />
      </div>

      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as SearchTab)}
      />

      {isLoading && (
        <div className="text-center py-12 text-cloud-muted text-sm">{t.common.searching}</div>
      )}

      {!isLoading && !query.trim() && (
        <div className="text-center py-12 text-cloud-muted text-sm">
          {t.search.empty}
        </div>
      )}

      {/* Posts results */}
      {!isLoading && activeTab === 'posts' && posts.length > 0 && (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              author={{
                name: post.authorDisplayName || post.authorUsername,
                handle: `@${post.authorUsername}`,
              }}
              content={post.content}
              tags={post.tags}
              likes={post.likesCount}
              comments={post.commentsCount}
              liked={post.liked}
              bookmarked={post.bookmarked}
              timeAgo={post.createdAt}
            />
          ))}
        </div>
      )}

      {/* Projects results */}
      {!isLoading && activeTab === 'projects' && projects.length > 0 && (
        <div className="grid gap-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              description={project.description || ''}
              members={project.membersCount}
              stars={project.starsCount}
              progress={0}
            />
          ))}
        </div>
      )}

      {/* Users results */}
      {!isLoading && activeTab === 'users' && users.length > 0 && (
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 p-3 bg-cloud-soft border border-cloud-deep rounded-md hover:border-tyrian/40 transition-colors"
            >
              <Avatar name={u.displayName || u.username} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-cloud-ink truncate">
                  {u.displayName || u.username}
                </p>
                <p className="text-xs text-cloud-muted">@{u.username}</p>
              </div>
              <div className="text-xs text-cloud-muted">
                {u.reputationScore} rep
              </div>
              <Button type="button" size="sm" variant="secondary">
                {t.common.follow}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && query.trim() &&
        ((activeTab === 'posts' && posts.length === 0) ||
         (activeTab === 'projects' && projects.length === 0) ||
         (activeTab === 'users' && users.length === 0)) && (
        <div className="text-center py-12 text-cloud-muted text-sm">
          {t.search.noResults.replace('{tab}', activeTab).replace('{query}', query)}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <AppShell>
      <Suspense fallback={
        <div className="max-w-feed mx-auto px-4 py-6 text-center text-cloud-muted text-sm">
          …
        </div>
      }>
        <SearchContent />
      </Suspense>
    </AppShell>
  );
}
