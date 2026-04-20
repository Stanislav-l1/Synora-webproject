'use client';

import { useEffect, useState, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getAccessToken } from '@/lib/auth';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useChatStore } from '@/store/useChatStore';
import type { Notification, Message } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || '/ws';

// ─── Module-level singleton ─────────────────────────────────────
// A single STOMP client is shared across the whole app so that
// AppShell (global notifications) and the /messages page (chat messages)
// do not open two separate WebSocket connections.

let client: Client | null = null;
let connecting = false;
const connectedListeners = new Set<(connected: boolean) => void>();
let connectedState = false;

function setConnected(v: boolean) {
  connectedState = v;
  connectedListeners.forEach((l) => l(v));
}

function ensureClient(
  token: string,
  onConnectCallback: () => void,
): Client {
  if (client) return client;

  client = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  });

  client.onConnect = () => {
    setConnected(true);
    onConnectCallback();
  };
  client.onDisconnect = () => setConnected(false);
  client.onStompError = () => setConnected(false);
  client.onWebSocketClose = () => setConnected(false);

  return client;
}

export function getClient(): Client | null {
  return client;
}

export function publishMessage(chatId: string, content: string, replyToId?: string) {
  client?.publish({
    destination: `/app/chat/${chatId}/send`,
    body: JSON.stringify({ content, replyToId }),
  });
}

export function publishTyping(chatId: string) {
  client?.publish({
    destination: `/app/chat/${chatId}/typing`,
    body: '{}',
  });
}

/**
 * Mount once in AppShell. Opens the singleton connection,
 * subscribes to personal notifications, and keeps unreadCount in sync.
 */
export function useWebSocket() {
  const [connected, setConnectedLocal] = useState(connectedState);
  const { user, isAuthenticated } = useAuthStore();
  const { addNotification, fetchUnreadCount } = useNotificationStore();
  const { activeChat, addMessage, updateLastMessage, setTyping, clearTyping } = useChatStore();

  // Subscribe local state to global
  useEffect(() => {
    connectedListeners.add(setConnectedLocal);
    return () => { connectedListeners.delete(setConnectedLocal); };
  }, []);

  // Connect / disconnect based on auth
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isAuthenticated) {
      if (client?.connected) client.deactivate();
      client = null;
      setConnected(false);
      return;
    }
    if (client || connecting) return;

    const token = getAccessToken();
    if (!token || !user) return;

    connecting = true;
    const c = ensureClient(token, () => {
      c.subscribe(`/user/${user.id}/queue/notifications`, (msg: IMessage) => {
        const notification: Notification = JSON.parse(msg.body);
        addNotification(notification);

        if (typeof document !== 'undefined' && document.hidden
            && typeof window !== 'undefined' && 'Notification' in window
            && window.Notification.permission === 'granted') {
          const title = notification.actorDisplayName || notification.actorUsername || 'Synora';
          new window.Notification(title, { body: renderNotificationBody(notification) });
        }
      });
      fetchUnreadCount();
    });
    c.activate();
    connecting = false;
  }, [isAuthenticated, user, addNotification, fetchUnreadCount]);

  // Subscribe to active chat topic when connected + activeChat set
  useEffect(() => {
    if (!connected || !client?.connected || !activeChat) return;

    const chatId = activeChat.id;

    const msgSub = client.subscribe(`/topic/chat.${chatId}`, (msg: IMessage) => {
      const message: Message = JSON.parse(msg.body);
      addMessage(message);
      updateLastMessage(chatId, message);
    });

    const typingSub = client.subscribe(`/topic/chat.${chatId}.typing`, (msg: IMessage) => {
      const data = JSON.parse(msg.body);
      if (data.userId === user?.id) return;
      const label = data.displayName || data.username;
      setTyping(chatId, label);
      setTimeout(() => clearTyping(chatId, label), 3000);
    });

    return () => {
      msgSub.unsubscribe();
      typingSub.unsubscribe();
    };
  }, [connected, activeChat, addMessage, updateLastMessage, setTyping, clearTyping, user?.id]);

  const sendMessage = useCallback((chatId: string, content: string, replyToId?: string) => {
    publishMessage(chatId, content, replyToId);
  }, []);

  const sendTyping = useCallback((chatId: string) => {
    publishTyping(chatId);
  }, []);

  return { sendMessage, sendTyping, connected };
}

function renderNotificationBody(n: Notification): string {
  switch (n.type) {
    case 'POST_LIKE':            return 'liked your post';
    case 'POST_COMMENT':         return 'commented on your post';
    case 'COMMENT_REPLY':        return 'replied to your comment';
    case 'COMMENT_LIKE':         return 'liked your comment';
    case 'PROJECT_INVITE':       return 'invited you to a project';
    case 'PROJECT_JOIN':         return 'joined your project';
    case 'TASK_ASSIGNED':        return 'assigned you a task';
    case 'TASK_COMPLETED':       return 'completed a task';
    case 'MESSAGE_RECEIVED':     return 'sent you a message';
    case 'FOLLOW':               return 'started following you';
    case 'REPUTATION_MILESTONE': return 'New reputation milestone!';
    default:                     return '';
  }
}
