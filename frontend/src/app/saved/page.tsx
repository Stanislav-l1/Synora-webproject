'use client';

import { useEffect, useState } from 'react';
import { Loader2, Bookmark } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { PostCard } from '@/components/shared/post-card';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import type { ApiResponse, PageResponse, PostSummary } from '@/types';

export default function SavedPage() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ApiResponse<PageResponse<PostSummary>>>('/posts/saved?page=0&size=20')
      .then((res) => setPosts(res.data.data.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="max-w-feed mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center gap-2 text-cloud-ink">
          <Bookmark size={20} />
          <h1 className="text-lg font-semibold">Saved posts</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-tyrian/60" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-cloud-muted text-sm">
            Nothing saved yet. Bookmark posts to find them here.
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUsername={user?.username}
              onChange={(next) => setPosts((ps) => ps.map((p) => (p.id === next.id ? next : p)))}
              onRemove={(id) => setPosts((ps) => ps.filter((p) => p.id !== id))}
            />
          ))
        )}
      </div>
    </AppShell>
  );
}
