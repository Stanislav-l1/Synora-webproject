'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Heart, MessageCircle, Bookmark, Share2,
  Eye, Calendar, Loader2, MoreHorizontal,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { PostComments } from '@/components/shared/post-comments';
import { cn, timeAgo } from '@/lib/utils';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from '@/store/useToastStore';
import type { Post } from '@/types';

const REACTIONS = [
  { type: 'LIKE', emoji: '👍' },
  { type: 'LOVE', emoji: '❤️' },
  { type: 'FIRE', emoji: '🔥' },
  { type: 'CLAP', emoji: '👏' },
  { type: 'LAUGH', emoji: '😂' },
  { type: 'THINKING', emoji: '🤔' },
] as const;

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [showReactions, setShowReactions] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/posts/${id}`)
      .then((res) => {
        const data: Post = res.data?.data ?? res.data;
        setPost(data);
        setLiked(!!data.liked);
        setBookmarked(!!data.bookmarked);
        setLikesCount(data.likesCount);
        setCommentsCount(data.commentsCount);
      })
      .catch((err) => {
        if (err?.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function toggleLike() {
    if (!user) { toast.info('Sign in to like posts'); return; }
    setLiked((v) => !v);
    setLikesCount((v) => v + (liked ? -1 : 1));
    try { await api.post(`/posts/${id}/like`); } catch { setLiked((v) => !v); setLikesCount((v) => v + (liked ? 1 : -1)); }
  }

  async function toggleBookmark() {
    if (!user) { toast.info('Sign in to save posts'); return; }
    setBookmarked((v) => !v);
    try { await api.post(`/posts/${id}/bookmark`); toast.success(bookmarked ? 'Removed from saved' : 'Saved!'); }
    catch { setBookmarked((v) => !v); }
  }

  function handleShare() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).catch(() => null);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto py-6 px-4 space-y-4">
          <Skeleton className="h-8 w-24" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex gap-3 items-center">
              <Skeleton className="w-9 h-9 rounded-full" />
              <SkeletonText lines={2} />
            </div>
          </div>
          <SkeletonText lines={10} />
        </div>
      </AppShell>
    );
  }

  if (notFound || !post) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto py-16 px-4 text-center">
          <p className="text-4xl mb-4">🔍</p>
          <h2 className="text-lg font-bold text-cloud-ink mb-2">Post not found</h2>
          <p className="text-cloud-muted text-sm mb-6">This post may have been deleted or moved.</p>
          <Button variant="primary" onClick={() => router.push('/feed')}>Back to feed</Button>
        </div>
      </AppShell>
    );
  }

  const display = post.authorDisplayName || post.authorUsername;
  const tags = post.tags || [];

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto py-6 px-4">
        {/* Back */}
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-cloud-muted hover:text-cloud-ink transition-colors mb-5"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Article */}
        <article className="bg-cloud border border-cloud-deep rounded-2xl overflow-hidden mb-4">
          {/* Cover image */}
          {post.coverUrl && (
            <img src={post.coverUrl} alt="" className="w-full h-52 object-cover" />
          )}

          <div className="p-6">
            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {tags.map((t) => (
                  <Link key={t.id} href={`/tags/${t.name}`}>
                    <Badge variant="default" className="text-xs cursor-pointer hover:bg-tyrian/10">
                      #{t.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Title */}
            {post.title && (
              <h1 className="text-2xl font-bold text-cloud-ink leading-tight mb-4">{post.title}</h1>
            )}

            {/* Author */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-cloud-deep">
              <Link href={`/u/${post.authorUsername}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Avatar
                  name={display}
                  src={post.authorAvatarUrl || undefined}
                  size="sm"
                />
                <div>
                  <p className="text-sm font-semibold text-cloud-ink">{display}</p>
                  <div className="flex items-center gap-2 text-[11px] text-cloud-muted">
                    <Calendar size={10} />
                    <span>{timeAgo(post.createdAt)}</span>
                    <span>·</span>
                    <Eye size={10} />
                    <span>{post.viewsCount.toLocaleString()} views</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Content */}
            <div className="prose prose-sm max-w-none text-cloud-ink/90 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>

          {/* Actions bar */}
          <div className="px-6 py-3 border-t border-cloud-deep flex items-center gap-1">
            {/* Like */}
            <div className="relative" onMouseLeave={() => setShowReactions(false)}>
              <button
                type="button"
                onClick={toggleLike}
                onMouseEnter={() => setShowReactions(true)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all',
                  liked ? 'text-red-500 bg-red-50' : 'text-cloud-muted hover:bg-cloud-deep/50',
                )}
              >
                <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                <span className="font-medium">{likesCount}</span>
              </button>
              {showReactions && (
                <div className="absolute bottom-full left-0 mb-1 flex gap-1 bg-cloud border border-cloud-deep rounded-xl px-2 py-1.5 shadow-lg z-10">
                  {REACTIONS.map((r) => (
                    <button
                      key={r.type}
                      type="button"
                      onClick={() => { toggleLike(); setShowReactions(false); }}
                      className="text-lg hover:scale-125 transition-transform"
                    >
                      {r.emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Comments */}
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-cloud-muted hover:bg-cloud-deep/50 transition-all"
            >
              <MessageCircle size={16} />
              <span className="font-medium">{commentsCount}</span>
            </button>

            {/* Bookmark */}
            <button
              type="button"
              onClick={toggleBookmark}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all',
                bookmarked ? 'text-tyrian bg-tyrian/10' : 'text-cloud-muted hover:bg-cloud-deep/50',
              )}
            >
              <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
            </button>

            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-cloud-muted hover:bg-cloud-deep/50 transition-all"
            >
              <Share2 size={16} />
              <span className="text-xs">{copied ? 'Copied!' : 'Share'}</span>
            </button>
          </div>
        </article>

        {/* Comments */}
        <div className="bg-cloud border border-cloud-deep rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-cloud-ink mb-4">
            Comments ({commentsCount})
          </h2>
          <PostComments postId={id} onCountChange={(d) => setCommentsCount((c) => c + d)} />
        </div>
      </div>
    </AppShell>
  );
}
