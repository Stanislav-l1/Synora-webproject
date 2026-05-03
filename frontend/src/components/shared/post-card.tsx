'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, Repeat2,
  Pin, PinOff, EyeOff, Flag, Pencil, Trash2, Smile, Check,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/lib/utils';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { PostComments } from './post-comments';
import type { PostSummary, ReactionType } from '@/types';

interface PostCardProps {
  post: PostSummary;
  currentUsername?: string | null;
  onChange?: (next: PostSummary) => void;
  onRemove?: (id: string) => void;
}

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'LIKE',     emoji: '👍', label: 'Like' },
  { type: 'LOVE',     emoji: '❤️', label: 'Love' },
  { type: 'FIRE',     emoji: '🔥', label: 'Fire' },
  { type: 'CLAP',     emoji: '👏', label: 'Clap' },
  { type: 'LAUGH',    emoji: '😂', label: 'Laugh' },
  { type: 'THINKING', emoji: '🤔', label: 'Thinking' },
];

function reactionEmoji(type?: ReactionType | null) {
  return REACTIONS.find((r) => r.type === type)?.emoji;
}

export function PostCard({ post, currentUsername, onChange, onRemove }: PostCardProps) {
  const { user } = useAuthStore();
  const isOwn = !!currentUsername && currentUsername === post.authorUsername;
  const [menuOpen, setMenuOpen] = useState(false);
  const [reactionsOpen, setReactionsOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.preview || post.title || '');
  const [reporting, setReporting] = useState(false);
  const [reportText, setReportText] = useState('');
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const reactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (reactRef.current && !reactRef.current.contains(e.target as Node)) setReactionsOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const display = post.authorDisplayName || post.authorUsername;
  const tags = post.tags?.map((t) => t.name) || [];
  const totalReactions =
    (post.reactions ? Object.values(post.reactions).reduce((a, b) => a + b, 0) : 0) + post.likesCount;

  async function toggleLike() {
    if (!user) return;
    const wasLiked = !!post.liked;
    onChange?.({ ...post, liked: !wasLiked, likesCount: post.likesCount + (wasLiked ? -1 : 1) });
    try {
      await api.post(`/posts/${post.id}/like`);
    } catch {
      onChange?.(post);
    }
  }

  async function setReaction(type: ReactionType) {
    if (!user) return;
    setReactionsOpen(false);
    const prev = post.myReaction;
    const reactions = { ...(post.reactions || {}) };
    if (prev) reactions[prev] = Math.max(0, (reactions[prev] || 1) - 1);
    if (prev === type) {
      delete reactions[type];
      onChange?.({ ...post, myReaction: null, reactions });
      try { await api.delete(`/posts/${post.id}/reaction`); } catch {}
      return;
    }
    reactions[type] = (reactions[type] || 0) + 1;
    onChange?.({ ...post, myReaction: type, reactions });
    try { await api.put(`/posts/${post.id}/reaction`, null, { params: { type } }); } catch {}
  }

  async function toggleBookmark() {
    if (!user) return;
    onChange?.({ ...post, bookmarked: !post.bookmarked });
    try { await api.post(`/posts/${post.id}/bookmark`); } catch { onChange?.(post); }
  }

  async function repost() {
    if (!user || isOwn) return;
    try {
      await api.post(`/posts/${post.id}/repost`);
      onChange?.({ ...post, reposted: true, repostsCount: post.repostsCount + 1 });
    } catch {}
  }

  async function togglePin() {
    setMenuOpen(false);
    try {
      const res = await api.post<{ data: boolean }>(`/posts/${post.id}/pin`);
      onChange?.({ ...post, pinned: res.data.data });
    } catch {}
  }

  async function hide() {
    setMenuOpen(false);
    try {
      await api.post(`/posts/${post.id}/hide`);
      onRemove?.(post.id);
    } catch {}
  }

  async function remove() {
    setMenuOpen(false);
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${post.id}`);
      onRemove?.(post.id);
    } catch {}
  }

  async function saveEdit() {
    try {
      const firstLine = editContent.split('\n')[0].trim();
      const title = firstLine.length > 120 ? firstLine.slice(0, 117) + '…' : firstLine;
      const preview = editContent.length > 280 ? editContent.slice(0, 277) + '…' : editContent;
      await api.patch(`/posts/${post.id}`, { title, content: editContent, preview });
      onChange?.({ ...post, title, preview });
      setEditing(false);
    } catch {}
  }

  async function submitReport() {
    const reason = reportText.trim();
    if (!reason) return;
    try {
      await api.post('/reports', { entityId: post.id, entityType: 'POST', reason: reason.slice(0, 100), description: reason });
      setReporting(false);
      setReportText('');
      alert('Report submitted');
    } catch {}
  }

  async function share() {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/posts/${post.id}` : `/posts/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  const reactionIcon = reactionEmoji(post.myReaction);

  const rendered = post.repostOf ? post.repostOf : post;
  const image = rendered.coverUrl;

  return (
    <article className="bg-cloud-soft border border-cloud-deep rounded-lg p-4 hover:border-moss-soft hover:shadow-md transition-all duration-200 animate-fade-in">
      {post.repostOf && (
        <div className="flex items-center gap-1.5 mb-2 text-xs text-cloud-muted">
          <Repeat2 size={12} />
          <Link href={`/u/${post.authorUsername}`} className="hover:text-tyrian">{display} reposted</Link>
        </div>
      )}
      {post.pinned && !post.repostOf && (
        <div className="flex items-center gap-1.5 mb-2 text-xs text-moss-deep">
          <Pin size={12} /> Pinned
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/u/${rendered.authorUsername}`}>
            <Avatar name={rendered.authorDisplayName || rendered.authorUsername} src={rendered.authorAvatarUrl || undefined} size="md" />
          </Link>
          <div>
            <Link href={`/u/${rendered.authorUsername}`} className="text-sm font-semibold text-cloud-ink hover:text-tyrian transition-colors">
              {rendered.authorDisplayName || rendered.authorUsername}
            </Link>
            <p className="text-xs text-cloud-muted">
              @{rendered.authorUsername} · {timeAgo(rendered.createdAt)}
            </p>
          </div>
        </div>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            aria-label="more"
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1.5 rounded-md text-cloud-muted hover:text-cloud-ink hover:bg-cloud-deep transition-colors"
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-52 bg-white border border-cloud-deep rounded-md shadow-lg z-40 overflow-hidden">
              <MenuItem icon={<Share2 size={14} />} onClick={() => { setMenuOpen(false); share(); }}>
                {copied ? 'Link copied' : 'Copy link'}
              </MenuItem>
              {isOwn ? (
                <>
                  <MenuItem icon={<Pencil size={14} />} onClick={() => { setMenuOpen(false); setEditing(true); }}>Edit</MenuItem>
                  <MenuItem icon={post.pinned ? <PinOff size={14} /> : <Pin size={14} />} onClick={togglePin}>
                    {post.pinned ? 'Unpin' : 'Pin'}
                  </MenuItem>
                  <MenuItem icon={<Trash2 size={14} />} danger onClick={remove}>Delete</MenuItem>
                </>
              ) : (
                <>
                  <MenuItem icon={<EyeOff size={14} />} onClick={hide}>Hide</MenuItem>
                  <MenuItem icon={<Flag size={14} />} onClick={() => { setMenuOpen(false); setReporting(true); }}>Report</MenuItem>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {editing ? (
        <div className="mt-3">
          <textarea
            aria-label="Edit post"
            placeholder="Edit post…"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full bg-white border border-cloud-deep rounded-md p-2 text-sm focus:outline-none focus:border-tyrian min-h-[100px]"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setEditing(false)} className="px-3 py-1.5 text-sm rounded-md text-cloud-ink hover:bg-cloud-deep">Cancel</button>
            <button type="button" onClick={saveEdit} className="px-3 py-1.5 text-sm rounded-md bg-tyrian text-cloud hover:bg-tyrian-soft">Save</button>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          {rendered.title && <h3 className="text-sm font-semibold text-cloud-ink">{rendered.title}</h3>}
          {rendered.preview && <p className="text-sm text-cloud-ink leading-relaxed whitespace-pre-line mt-1">{rendered.preview}</p>}
        </div>
      )}

      {image && (
        <div className="mt-3 rounded-md overflow-hidden border border-cloud-deep">
          <img src={image} alt="" className="w-full object-cover max-h-96" />
        </div>
      )}

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Link key={tag} href={`/tags/${tag}`}>
              <Badge variant="accent">#{tag}</Badge>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-cloud-deep flex items-center gap-1">
        <div
          ref={reactRef}
          className="relative"
          onMouseEnter={() => setReactionsOpen(true)}
          onMouseLeave={() => setReactionsOpen(false)}
        >
          <button
            type="button"
            aria-label="like"
            onClick={() => (post.myReaction ? setReaction(post.myReaction) : toggleLike())}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              post.liked || post.myReaction
                ? 'text-tyrian bg-tyrian-muted'
                : 'text-cloud-ink/70 hover:text-tyrian hover:bg-tyrian-muted',
            )}
          >
            {reactionIcon ? (
              <span className="text-base leading-none">{reactionIcon}</span>
            ) : (
              <Heart size={14} fill={post.liked ? 'currentColor' : 'none'} />
            )}
            {totalReactions}
          </button>
          {reactionsOpen && user && (
            <div className="absolute bottom-full left-0 mb-1 flex items-center gap-1 bg-white border border-cloud-deep rounded-full px-2 py-1 shadow-lg z-30">
              {REACTIONS.map((r) => (
                <button
                  key={r.type}
                  type="button"
                  onClick={() => setReaction(r.type)}
                  title={r.label}
                  className={cn(
                    'text-lg hover:scale-125 transition-transform leading-none',
                    post.myReaction === r.type && 'scale-125',
                  )}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setCommentsOpen((v) => !v)}
          aria-label="comments"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-cloud-ink/70 hover:text-tyrian hover:bg-tyrian-muted transition-colors"
        >
          <MessageCircle size={14} />
          {post.commentsCount}
        </button>

        <button
          type="button"
          onClick={repost}
          aria-label="repost"
          disabled={isOwn}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
            post.reposted
              ? 'text-moss-deep bg-moss/10'
              : 'text-cloud-ink/70 hover:text-moss-deep hover:bg-moss/10',
            isOwn && 'opacity-40 cursor-not-allowed',
          )}
        >
          <Repeat2 size={14} />
          {post.repostsCount}
        </button>

        <button
          type="button"
          onClick={toggleBookmark}
          aria-label="bookmark"
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
            post.bookmarked
              ? 'text-moss-deep bg-banana-soft'
              : 'text-cloud-ink/70 hover:text-moss-deep hover:bg-banana-soft',
          )}
        >
          <Bookmark size={14} fill={post.bookmarked ? 'currentColor' : 'none'} />
        </button>

        <button
          type="button"
          onClick={share}
          aria-label="share"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-cloud-ink/70 hover:text-moss hover:bg-moss/10 transition-colors ml-auto"
        >
          {copied ? <Check size={14} /> : <Share2 size={14} />}
        </button>
      </div>

      {commentsOpen && (
        <PostComments
          postId={post.id}
          onCountChange={(delta) => onChange?.({ ...post, commentsCount: post.commentsCount + delta })}
        />
      )}

      {reporting && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setReporting(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg p-4 w-full max-w-md">
            <h3 className="text-sm font-semibold text-cloud-ink mb-2">Report post</h3>
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Reason…"
              className="w-full border border-cloud-deep rounded-md p-2 text-sm focus:outline-none focus:border-tyrian min-h-[80px]"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button type="button" onClick={() => setReporting(false)} className="px-3 py-1.5 text-sm rounded-md hover:bg-cloud-deep">Cancel</button>
              <button type="button" onClick={submitReport} disabled={!reportText.trim()} className="px-3 py-1.5 text-sm rounded-md bg-tyrian text-cloud disabled:opacity-40">Submit</button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function MenuItem({
  icon, onClick, children, danger,
}: { icon: React.ReactNode; onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-cloud-soft',
        danger ? 'text-red-600' : 'text-cloud-ink',
      )}
    >
      {icon} {children}
    </button>
  );
}
