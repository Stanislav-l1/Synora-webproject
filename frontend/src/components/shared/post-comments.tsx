'use client';

import { useEffect, useState } from 'react';
import { Loader2, Send, Trash2 } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import api from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import type { ApiResponse, PageResponse, Comment } from '@/types';

interface PostCommentsProps {
  postId: string;
  onCountChange?: (delta: number) => void;
}

export function PostComments({ postId, onCountChange }: PostCommentsProps) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get<ApiResponse<PageResponse<Comment>>>(`/posts/${postId}/comments?page=0&size=50`)
      .then((res) => { if (!cancelled) setComments(res.data.data.content); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [postId]);

  async function submit() {
    const content = text.trim();
    if (!content) return;
    setSending(true);
    try {
      const res = await api.post<ApiResponse<Comment>>(`/posts/${postId}/comments`, { content });
      setComments((cs) => [...cs, res.data.data]);
      setText('');
      onCountChange?.(1);
    } finally {
      setSending(false);
    }
  }

  async function remove(id: string) {
    await api.delete(`/posts/${postId}/comments/${id}`);
    setComments((cs) => cs.map((c) => (c.id === id ? { ...c, deleted: true, content: '[deleted]' } : c)));
    onCountChange?.(-1);
  }

  return (
    <div className="mt-3 pt-3 border-t border-cloud-deep space-y-3">
      {loading ? (
        <div className="flex justify-center py-3"><Loader2 size={16} className="animate-spin text-tyrian/60" /></div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {comments.length === 0 && <div className="text-xs text-cloud-muted">No comments yet.</div>}
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2 text-sm group">
              <Avatar name={c.authorDisplayName || c.authorUsername} src={c.authorAvatarUrl || undefined} size="sm" />
              <div className="flex-1 bg-cloud-soft/60 rounded-md px-2.5 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-cloud-ink">{c.authorDisplayName || c.authorUsername}</span>
                  <span className="text-[10px] text-cloud-muted">{timeAgo(c.createdAt)}</span>
                </div>
                <p className={`text-xs leading-relaxed whitespace-pre-line ${c.deleted ? 'italic text-cloud-muted' : 'text-cloud-ink'}`}>
                  {c.content}
                </p>
              </div>
              {!c.deleted && user?.username === c.authorUsername && (
                <button
                  type="button"
                  onClick={() => remove(c.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-cloud-muted hover:text-red-600"
                  aria-label="delete"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {user && (
        <div className="flex items-center gap-2">
          <Avatar name={user.displayName || user.username} size="sm" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
            placeholder="Write a comment…"
            className="flex-1 bg-cloud-soft/60 border border-cloud-deep rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:border-tyrian"
          />
          <button
            type="button"
            disabled={!text.trim() || sending}
            onClick={submit}
            className="p-1.5 rounded-md text-tyrian hover:bg-tyrian-muted disabled:opacity-40"
            aria-label="send"
          >
            <Send size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
