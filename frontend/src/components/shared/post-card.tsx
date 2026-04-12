'use client';

import Link from 'next/link';
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PostCardProps {
  author: {
    name: string;
    handle: string;
    avatar?: string;
  };
  content: string;
  tags?: string[];
  image?: string;
  likes: number;
  comments: number;
  timeAgo: string;
  liked?: boolean;
  bookmarked?: boolean;
}

export function PostCard({
  author,
  content,
  tags,
  image,
  likes,
  comments,
  timeAgo,
  liked = false,
  bookmarked = false,
}: PostCardProps) {
  return (
    <article className="bg-surface-secondary border border-border rounded-md p-4 hover:border-border-hover transition-colors animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${author.handle}`}>
            <Avatar name={author.name} src={author.avatar} size="md" />
          </Link>
          <div>
            <Link
              href={`/profile/${author.handle}`}
              className="text-sm font-semibold text-content-primary hover:text-accent-light transition-colors"
            >
              {author.name}
            </Link>
            <p className="text-xs text-content-tertiary">
              {author.handle} &middot; {timeAgo}
            </p>
          </div>
        </div>
        <button className="p-1.5 rounded-sm text-content-tertiary hover:text-content-secondary hover:bg-surface-tertiary transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="mt-3">
        <p className="text-sm text-content-primary leading-relaxed whitespace-pre-line">
          {content}
        </p>
      </div>

      {/* Image */}
      {image && (
        <div className="mt-3 rounded-md overflow-hidden border border-border">
          <img src={image} alt="" className="w-full object-cover max-h-96" />
        </div>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Link key={tag} href={`/tags/${tag}`}>
              <Badge variant="accent">#{tag}</Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 pt-3 border-t border-border flex items-center gap-1">
        <button
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-colors',
            liked
              ? 'text-danger bg-danger-muted'
              : 'text-content-secondary hover:text-danger hover:bg-danger-muted',
          )}
        >
          <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
          {likes}
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium text-content-secondary hover:text-accent-light hover:bg-accent-muted transition-colors">
          <MessageCircle size={14} />
          {comments}
        </button>
        <button
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-colors',
            bookmarked
              ? 'text-warning bg-warning-muted'
              : 'text-content-secondary hover:text-warning hover:bg-warning-muted',
          )}
        >
          <Bookmark size={14} fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium text-content-secondary hover:text-info hover:bg-info-muted transition-colors ml-auto">
          <Share2 size={14} />
        </button>
      </div>
    </article>
  );
}
