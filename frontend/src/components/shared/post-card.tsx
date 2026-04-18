'use client';

import Link from 'next/link';
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';

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
  const t = useT();
  return (
    <article className="bg-cloud-soft border border-cloud-deep rounded-lg p-4 hover:border-moss-soft hover:shadow-md transition-all duration-200 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${author.handle}`}>
            <Avatar name={author.name} src={author.avatar} size="md" />
          </Link>
          <div>
            <Link
              href={`/profile/${author.handle}`}
              className="text-sm font-semibold text-cloud-ink hover:text-tyrian transition-colors"
            >
              {author.name}
            </Link>
            <p className="text-xs text-cloud-muted">
              {author.handle} &middot; {timeAgo}
            </p>
          </div>
        </div>
        <button type="button" aria-label="more" className="p-1.5 rounded-md text-cloud-muted hover:text-cloud-ink hover:bg-cloud-deep transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="mt-3">
        <p className="text-sm text-cloud-ink leading-relaxed whitespace-pre-line">
          {content}
        </p>
      </div>

      {/* Image */}
      {image && (
        <div className="mt-3 rounded-md overflow-hidden border border-cloud-deep">
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
      <div className="mt-3 pt-3 border-t border-cloud-deep flex items-center gap-1">
        <button
          type="button"
          aria-label="like"
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
            liked
              ? 'text-tyrian bg-tyrian-muted'
              : 'text-cloud-ink/70 hover:text-tyrian hover:bg-tyrian-muted',
          )}
        >
          <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
          {likes}
        </button>
        <button type="button" aria-label="comments" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-cloud-ink/70 hover:text-tyrian hover:bg-tyrian-muted transition-colors">
          <MessageCircle size={14} />
          {comments}
        </button>
        <button
          type="button"
          aria-label="bookmark"
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
            bookmarked
              ? 'text-moss-deep bg-banana-soft'
              : 'text-cloud-ink/70 hover:text-moss-deep hover:bg-banana-soft',
          )}
        >
          <Bookmark size={14} fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
        <button type="button" aria-label={t.common.share} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-cloud-ink/70 hover:text-moss hover:bg-moss/10 transition-colors ml-auto">
          <Share2 size={14} />
        </button>
      </div>
    </article>
  );
}
