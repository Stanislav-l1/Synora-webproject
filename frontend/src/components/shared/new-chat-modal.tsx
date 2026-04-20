'use client';

import { useEffect, useMemo, useState } from 'react';
import { X, Search, Check, Loader2, Users, User as UserIcon } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useChatStore } from '@/store/useChatStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useT } from '@/lib/i18n';
import type { ApiResponse, PageResponse, UserProfile, Chat } from '@/types';

interface NewChatModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (chat: Chat) => void;
}

type Mode = 'direct' | 'group';

export function NewChatModal({ open, onClose, onCreated }: NewChatModalProps) {
  const t = useT();
  const { user } = useAuthStore();
  const { createDirect, createGroup } = useChatStore();

  const [mode, setMode] = useState<Mode>('direct');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<UserProfile[]>([]);
  const [groupName, setGroupName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setMode('direct');
      setQuery('');
      setResults([]);
      setSelected([]);
      setGroupName('');
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get<ApiResponse<PageResponse<UserProfile>>>('/search/users', {
          params: { q, page: 0, size: 20 },
        });
        const items = res.data.data.content.filter((u) => u.id !== user?.id);
        setResults(items);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query, open, user?.id]);

  const selectedIds = useMemo(() => new Set(selected.map((s) => s.id)), [selected]);

  if (!open) return null;

  function toggleSelect(u: UserProfile) {
    if (mode === 'direct') {
      setSelected([u]);
    } else {
      setSelected((prev) =>
        prev.find((s) => s.id === u.id) ? prev.filter((s) => s.id !== u.id) : [...prev, u],
      );
    }
  }

  async function handleSubmit() {
    setError(null);
    try {
      setSubmitting(true);
      if (mode === 'direct') {
        if (selected.length !== 1) {
          setError(t.messages.pickAtLeastOne);
          return;
        }
        const chat = await createDirect(selected[0].id);
        onCreated?.(chat);
        onClose();
      } else {
        if (selected.length < 1) {
          setError(t.messages.pickAtLeastOne);
          return;
        }
        const name = groupName.trim() || selected.map((s) => s.displayName || s.username).join(', ').slice(0, 80);
        const chat = await createGroup({
          type: 'GROUP',
          name,
          memberIds: selected.map((s) => s.id),
        });
        onCreated?.(chat);
        onClose();
      }
    } catch {
      setError('Failed to create chat');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-cloud rounded-lg border border-cloud-deep shadow-xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-4 h-14 border-b border-cloud-deep shrink-0">
          <h2 className="text-sm font-semibold text-cloud-ink">{t.messages.newChatTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-sm text-cloud-muted hover:text-cloud-ink hover:bg-cloud-deep transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex border-b border-cloud-deep shrink-0">
          <button
            type="button"
            onClick={() => {
              setMode('direct');
              setSelected([]);
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 h-10 text-xs font-medium transition-colors',
              mode === 'direct'
                ? 'text-tyrian border-b-2 border-tyrian'
                : 'text-cloud-muted hover:text-cloud-ink',
            )}
          >
            <UserIcon size={14} /> {t.messages.directTab}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('group');
              setSelected([]);
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 h-10 text-xs font-medium transition-colors',
              mode === 'group'
                ? 'text-tyrian border-b-2 border-tyrian'
                : 'text-cloud-muted hover:text-cloud-ink',
            )}
          >
            <Users size={14} /> {t.messages.groupTab}
          </button>
        </div>

        {mode === 'group' && (
          <div className="px-4 pt-3 shrink-0">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={t.messages.groupNamePlaceholder}
              className="w-full h-9 px-3 bg-white border border-cloud-deep rounded-sm text-xs text-cloud-ink placeholder:text-cloud-muted focus:outline-none focus:border-tyrian transition-colors"
            />
          </div>
        )}

        <div className="px-4 pt-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cloud-muted" size={14} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.messages.userSearchPlaceholder}
              className="w-full h-9 pl-8 pr-3 bg-white border border-cloud-deep rounded-sm text-xs text-cloud-ink placeholder:text-cloud-muted focus:outline-none focus:border-tyrian transition-colors"
            />
          </div>
        </div>

        {mode === 'group' && selected.length > 0 && (
          <div className="px-4 pt-2 flex flex-wrap gap-1.5 shrink-0">
            {selected.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSelect(s)}
                className="flex items-center gap-1.5 px-2 py-1 bg-tyrian/10 text-tyrian rounded-full text-[11px]"
              >
                <span>{s.displayName || s.username}</span>
                <X size={12} />
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto scrollbar-hidden mt-2">
          {searching ? (
            <div className="flex justify-center py-8">
              <Loader2 size={18} className="animate-spin text-tyrian/60" />
            </div>
          ) : query.trim().length < 2 ? (
            <div className="text-center py-8 text-cloud-muted text-xs">{t.messages.typeToSearch}</div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-cloud-muted text-xs">{t.messages.noUsersFound}</div>
          ) : (
            results.map((u) => {
              const picked = selectedIds.has(u.id);
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => toggleSelect(u)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                    picked ? 'bg-tyrian/10' : 'hover:bg-cloud-deep/50',
                  )}
                >
                  <Avatar name={u.displayName || u.username} src={u.avatarUrl ?? undefined} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-cloud-ink truncate">{u.displayName || u.username}</p>
                    <p className="text-[11px] text-cloud-muted truncate">@{u.username}</p>
                  </div>
                  {picked && <Check size={14} className="text-tyrian shrink-0" />}
                </button>
              );
            })
          )}
        </div>

        {error && (
          <div className="px-4 py-2 border-t border-cloud-deep text-xs text-danger shrink-0">{error}</div>
        )}

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-cloud-deep shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-3 h-9 text-xs text-cloud-muted hover:text-cloud-ink transition-colors disabled:opacity-50"
          >
            {t.common.cancel}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || selected.length === 0}
            className={cn(
              'px-4 h-9 rounded-sm text-xs font-medium transition-colors flex items-center gap-1.5',
              submitting || selected.length === 0
                ? 'bg-cloud-deep text-cloud-muted cursor-not-allowed'
                : 'bg-tyrian text-cloud hover:bg-tyrian-soft',
            )}
          >
            {submitting && <Loader2 size={12} className="animate-spin" />}
            {mode === 'direct' ? t.messages.startChat : t.messages.createGroup}
          </button>
        </div>
      </div>
    </div>
  );
}
