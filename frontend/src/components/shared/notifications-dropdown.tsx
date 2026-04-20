'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Heart,
  MessageCircle,
  MessageSquare,
  UserPlus,
  Users,
  Award,
  CheckSquare,
  Loader2,
  Check,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { cn, timeAgo } from '@/lib/utils';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useT } from '@/lib/i18n';
import type { Notification } from '@/types';

function iconFor(type: Notification['type']) {
  switch (type) {
    case 'POST_LIKE':
    case 'COMMENT_LIKE':
      return <Heart size={12} />;
    case 'POST_COMMENT':
    case 'COMMENT_REPLY':
      return <MessageCircle size={12} />;
    case 'MESSAGE_RECEIVED':
      return <MessageSquare size={12} />;
    case 'FOLLOW':
      return <UserPlus size={12} />;
    case 'PROJECT_INVITE':
    case 'PROJECT_JOIN':
      return <Users size={12} />;
    case 'TASK_ASSIGNED':
    case 'TASK_COMPLETED':
      return <CheckSquare size={12} />;
    case 'REPUTATION_MILESTONE':
      return <Award size={12} />;
    default:
      return <Bell size={12} />;
  }
}

function messageFor(n: Notification, t: ReturnType<typeof useT>): string {
  const name = n.actorDisplayName || n.actorUsername || t.notifications.someone;
  switch (n.type) {
    case 'POST_LIKE':
      return t.notifications.postLike.replace('{name}', name);
    case 'POST_COMMENT':
      return t.notifications.postComment.replace('{name}', name);
    case 'COMMENT_REPLY':
      return t.notifications.commentReply.replace('{name}', name);
    case 'COMMENT_LIKE':
      return t.notifications.commentLike.replace('{name}', name);
    case 'FOLLOW':
      return t.notifications.follow.replace('{name}', name);
    case 'PROJECT_INVITE':
      return t.notifications.projectInvite.replace('{name}', name);
    case 'PROJECT_JOIN':
      return t.notifications.projectJoin.replace('{name}', name);
    case 'TASK_ASSIGNED':
      return t.notifications.taskAssigned.replace('{name}', name);
    case 'TASK_COMPLETED':
      return t.notifications.taskCompleted.replace('{name}', name);
    case 'MESSAGE_RECEIVED':
      return t.notifications.messageReceived.replace('{name}', name);
    case 'REPUTATION_MILESTONE':
      return t.notifications.reputationMilestone;
    case 'SYSTEM':
    default:
      return t.notifications.systemNotice;
  }
}

function linkFor(n: Notification): string | null {
  switch (n.type) {
    case 'POST_LIKE':
    case 'POST_COMMENT':
    case 'COMMENT_REPLY':
    case 'COMMENT_LIKE':
      if (n.type === 'POST_LIKE' && n.entityId) return `/posts/${n.entityId}`;
      if (n.payload && typeof n.payload === 'object' && 'postId' in n.payload) {
        return `/posts/${(n.payload as { postId: string }).postId}`;
      }
      return null;
    case 'FOLLOW':
      return n.actorUsername ? `/profile/${n.actorUsername}` : null;
    case 'PROJECT_INVITE':
    case 'PROJECT_JOIN':
    case 'TASK_ASSIGNED':
    case 'TASK_COMPLETED':
      return n.entityType === 'PROJECT' && n.entityId ? `/projects/${n.entityId}` : null;
    case 'MESSAGE_RECEIVED':
      return '/messages';
    default:
      return null;
  }
}

export function NotificationsDropdown() {
  const t = useT();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!open) return;
    fetchNotifications(0);
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, fetchNotifications]);

  async function handleItemClick(n: Notification) {
    if (!n.read) {
      await markAsRead(n.id);
    }
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t.nav.notifications}
        className="relative p-2 rounded-md text-cloud/80 hover:text-cloud hover:bg-moss-velvet transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-tyrian-glow text-cloud rounded-full text-[10px] font-semibold flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-h-[70vh] bg-cloud border border-cloud-deep rounded-lg shadow-xl overflow-hidden flex flex-col z-50">
          <div className="flex items-center justify-between px-4 h-12 border-b border-cloud-deep shrink-0">
            <h3 className="text-sm font-semibold text-cloud-ink">{t.nav.notifications}</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] text-tyrian hover:text-tyrian-soft transition-colors flex items-center gap-1"
              >
                <Check size={12} /> {t.notifications.markAllRead}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hidden">
            {isLoading && notifications.length === 0 ? (
              <div className="flex justify-center py-8">
                <Loader2 size={18} className="animate-spin text-tyrian/60" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10 text-cloud-muted text-xs">
                {t.notifications.empty}
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => {
                const href = linkFor(n);
                const body = (
                  <>
                    <div className="relative shrink-0">
                      <Avatar
                        name={n.actorDisplayName || n.actorUsername || '?'}
                        src={n.actorAvatarUrl ?? undefined}
                        size="sm"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-tyrian text-cloud rounded-full flex items-center justify-center border-2 border-cloud">
                        {iconFor(n.type)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-cloud-ink leading-relaxed">{messageFor(n, t)}</p>
                      <p className="text-[10px] text-cloud-muted mt-0.5">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <span className="w-2 h-2 bg-tyrian rounded-full shrink-0 mt-1" />}
                  </>
                );
                const className = cn(
                  'flex items-start gap-3 px-4 py-3 border-b border-cloud-deep last:border-0 transition-colors text-left w-full',
                  !n.read ? 'bg-tyrian/5' : 'hover:bg-cloud-deep/40',
                );
                return href ? (
                  <Link key={n.id} href={href} onClick={() => handleItemClick(n)} className={className}>
                    {body}
                  </Link>
                ) : (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleItemClick(n)}
                    className={className}
                  >
                    {body}
                  </button>
                );
              })
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block text-center h-10 leading-10 text-xs text-tyrian hover:bg-cloud-deep/40 border-t border-cloud-deep shrink-0 transition-colors"
          >
            {t.notifications.viewAll}
          </Link>
        </div>
      )}
    </div>
  );
}
