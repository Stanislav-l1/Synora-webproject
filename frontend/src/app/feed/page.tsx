'use client';

import { useState, useEffect } from 'react';
import { ImagePlus, Send, Loader2 } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { RightPanel } from '@/components/layout/right-panel';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/shared/post-card';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import type { ApiResponse, PageResponse } from '@/types';
import { useT } from '@/lib/i18n';

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

export default function FeedPage() {
  const t = useT();
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [postText, setPostText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<ApiResponse<PageResponse<PostSummary>>>('/posts?page=0&size=20')
      .then((res) => setPosts(res.data.data.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handlePost() {
    const text = postText.trim();
    if (!text) return;
    setSubmitting(true);
    try {
      const firstLine = text.split('\n')[0].trim();
      const title = firstLine.length > 120 ? firstLine.slice(0, 117) + '...' : firstLine;
      const preview = text.length > 280 ? text.slice(0, 277) + '...' : text;
      await api.post('/posts', { title, content: text, preview });
      setPostText('');
      const res = await api.get<ApiResponse<PageResponse<PostSummary>>>('/posts?page=0&size=20');
      setPosts(res.data.data.content);
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="flex">
        {/* Feed content */}
        <div className="flex-1 max-w-feed mx-auto px-4 py-6 space-y-4">
          {/* Compose box */}
          <div className="bg-cloud-soft border border-cloud-deep rounded-lg p-4 shadow-sm">
            <div className="flex gap-3">
              <Avatar name={user?.displayName || user?.username || '?'} size="md" />
              <div className="flex-1">
                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder={t.feed.composePlaceholder}
                  className="w-full bg-transparent text-sm text-cloud-ink placeholder:text-cloud-muted resize-none focus:outline-none min-h-[60px]"
                  rows={2}
                />
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-cloud-deep">
                  <button type="button" className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs text-cloud-ink/70 hover:text-tyrian hover:bg-cloud-deep transition-colors">
                    <ImagePlus size={16} />
                    {t.feed.addMedia}
                  </button>
                  <Button
                    type="button"
                    size="sm"
                    icon={<Send size={14} />}
                    loading={submitting}
                    onClick={handlePost}
                    disabled={!postText.trim()}
                  >
                    {t.feed.post}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={24} className="animate-spin text-tyrian/60" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-cloud-muted text-sm">
              {t.feed.empty}
            </div>
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

        {/* Right panel */}
        <RightPanel />
      </div>
    </AppShell>
  );
}
