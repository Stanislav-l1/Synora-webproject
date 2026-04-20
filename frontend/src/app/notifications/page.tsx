'use client';

import { useEffect, useState } from 'react';
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
import { AppShell } from '@/components/layout/app-shell';
import { Avatar } from '@/components/ui/avatar';
import { cn, timeAgo } from '@/lib/utils';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useT } from '@/lib/i18n';
import type { Notification } from '@/types';

function iconFor(type: Notification['type']) {
  switch (type) {
    case 'POST_LIKE':
    case 'COMMENT_LIKE':
      return <Heart size={14} />;
    case 'POST_COMMENT':
    case 'COMMENT_REPLY':
      return <MessageCircle size={14} />;
    case 'MESSAGE_RECEIVED':
      return <MessageSquare size={14} />;
    case 'FOLLOW':
      return <UserPlus size={14} />;
    case 'PROJECT_INVITE':
    case 'PROJECT_JOIN':
      return <Users size={14} />;
    case 'TASK_ASSIGNED':
    case 'TASK_COMPLETED':
      return <CheckSquare size={14} />;
    case 'REPUTATION_MILESTONE':
      return <Award size={14} />;
    default:
      return <Bell size={14} />;
  }
}

function messageFor(n: Notification, t: ReturnType<typeof useT>): string {
  const name = n.actorDisplayName || n.actorUsername || t.notifications.someone;
  switch (n.type) {
    case 'POST_LIKE': return t.notifications.postLike.replace('{name}', name);
    case 'POST_COMMENT': return t.notifications.postComment.replace('{name}', name);
    case 'COMMENT_REPLY': return t.notifications.commentReply.replace('{name}', name);
    case 'COMMENT_LIKE': return t.notifications.commentLike.replace('{name}', name);
    case 'FOLLOW': return t.notifications.follow.replace('{name}', name);
    case 'PROJECT_INVITE': return t.notifications.projectInvite.replace('{name}', name);
    case 'PROJECT_JOIN': return t.notifications.projectJoin.replace('{name}', name);
    case 'TASK_ASSIGNED': return t.notifications.taskAssigned.replace('{name}', name);
    case 'TASK_COMPLETED': return t.notifications.taskCompleted.replace('{name}', name);
    case 'MESSAGE_RECEIVED': return t.notifications.messageReceived.replace('{name}', name);
    case 'REPUTATION_MILESTONE': return t.notifications.reputationMilestone;
    default: return t.notifications.systemNotice;
  }
}

function linkFor(n: Notification): string | null {
  if (n.type === 'FOLLOW') return n.actorUsername ? `/profile/${n.actorUsername}` : null;
  if (n.type === 'MESSAGE_RECEIVED') return '/messages';
  if (n.entityType === 'PROJECT' && n.entityId) return `/projects/${n.entityId}`;
  if (n.entityType === 'POST' && n.entityId) return `/posts/${n.entityId}`;
  if (n.payload && typeof n.payload === 'object' && 'postId' in n.payload) {
    return `/posts/${(n.payload as { postId: string }).postId}`;
  }
  return null;
}

export default function NotificationsPage() {
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
  const [pushState, setPushState] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default');

  useEffect(() => {
    fetchNotifications(0);
    fetchUnreadCount();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushState(window.Notification.permission as 'default' | 'granted' | 'denied');
    } else {
      setPushState('unsupported');
    }
  }, [fetchNotifications, fetchUnreadCount]);

  async function requestPush() {
    if (!('Notification' in window)) return;
    const perm = await window.Notification.requestPermission();
    setPushState(perm as 'default' | 'granted' | 'denied');
  }

  async function handleClick(n: Notification) {
    if (!n.read) await markAsRead(n.id);
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-cloud-ink">{t.notifications.title}</h1>
            {unreadCount > 0 && (
              <p className="text-xs text-cloud-muted mt-1">
                {unreadCount} {unreadCount === 1 ? 'unread' : 'unread'}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 h-9 text-xs text-tyrian hover:bg-tyrian/10 rounded-sm transition-colors"
            >
              <Check size={14} /> {t.notifications.markAllRead}
            </button>
          )}
        </div>

        {pushState !== 'granted' && pushState !== 'unsupported' && (
          <div className="mb-4 flex items-center justify-between gap-3 p-3 bg-tyrian/5 border border-tyrian/20 rounded-lg">
            <div className="flex items-center gap-3 min-w-0">
              <Bell size={16} className="text-tyrian shrink-0" />
              <p className="text-xs text-cloud-ink">
                {pushState === 'denied' ? t.notifications.pushDenied : t.notifications.enablePush}
              </p>
            </div>
            {pushState === 'default' && (
              <button
                type="button"
                onClick={requestPush}
                className="shrink-0 px-3 h-8 bg-tyrian text-cloud rounded-sm text-xs font-medium hover:bg-tyrian-soft transition-colors"
              >
                {t.common.submit}
              </button>
            )}
          </div>
        )}

        <div className="bg-cloud-soft border border-cloud-deep rounded-lg overflow-hidden">
          {isLoading && notifications.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 size={22} className="animate-spin text-tyrian/60" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-cloud-muted text-sm">
              {t.notifications.empty}
            </div>
          ) : (
            notifications.map((n) => {
              const href = linkFor(n);
              const body = (
                <>
                  <div className="relative shrink-0">
                    <Avatar
                      name={n.actorDisplayName || n.actorUsername || '?'}
                      src={n.actorAvatarUrl ?? undefined}
                      size="md"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-tyrian text-cloud rounded-full flex items-center justify-center border-2 border-cloud-soft">
                      {iconFor(n.type)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-cloud-ink leading-relaxed">{messageFor(n, t)}</p>
                    <p className="text-xs text-cloud-muted mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className="w-2.5 h-2.5 bg-tyrian rounded-full shrink-0 mt-1.5" />}
                </>
              );
              const className = cn(
                'flex items-start gap-3 px-4 py-3.5 border-b border-cloud-deep last:border-0 transition-colors text-left w-full',
                !n.read ? 'bg-tyrian/5 hover:bg-tyrian/10' : 'hover:bg-cloud-deep/40',
              );
              return href ? (
                <Link key={n.id} href={href} onClick={() => handleClick(n)} className={className}>
                  {body}
                </Link>
              ) : (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleClick(n)}
                  className={className}
                >
                  {body}
                </button>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
