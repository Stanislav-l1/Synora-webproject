'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, FileText, FolderGit2, Users } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { TabBar } from '@/components/ui/tab-bar';
import { PostCard } from '@/components/shared/post-card';
import { ProjectCard } from '@/components/shared/project-card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import type { ApiResponse, PageResponse, Post, Project, UserProfile } from '@/types';

type SearchTab = 'posts' | 'projects' | 'users';

const tabs = [
  { id: 'posts' as const, label: 'Posts' },
  { id: 'projects' as const, label: 'Projects' },
  { id: 'users' as const, label: 'Users' },
];

function SearchContent() {
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
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts, projects, people..."
          className="w-full bg-surface-secondary border border-border rounded-md pl-10 pr-4 py-2.5 text-sm text-content-primary placeholder:text-content-tertiary focus:outline-none focus:border-accent transition-colors"
          autoFocus
        />
      </div>

      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as SearchTab)}
      />

      {isLoading && (
        <div className="text-center py-12 text-content-secondary text-sm">Searching...</div>
      )}

      {!isLoading && !query.trim() && (
        <div className="text-center py-12 text-content-tertiary text-sm">
          Type something to search
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
              className="flex items-center gap-3 p-3 bg-surface-secondary border border-border rounded-md hover:border-border-hover transition-colors"
            >
              <Avatar name={u.displayName || u.username} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-content-primary truncate">
                  {u.displayName || u.username}
                </p>
                <p className="text-xs text-content-secondary">@{u.username}</p>
              </div>
              <div className="text-xs text-content-tertiary">
                {u.reputationScore} rep
              </div>
              <Button size="sm" variant="secondary">
                Follow
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
        <div className="text-center py-12 text-content-tertiary text-sm">
          No {activeTab} found for &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <AppShell>
      <Suspense fallback={
        <div className="max-w-feed mx-auto px-4 py-6 text-center text-content-secondary text-sm">
          Loading...
        </div>
      }>
        <SearchContent />
      </Suspense>
    </AppShell>
  );
}
