'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getAccessToken } from '@/lib/auth';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useChatStore } from '@/store/useChatStore';
import type { Notification, Message } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || '/ws';

export function useWebSocket() {
  const clientRef = useRef<Client | null>(null);
  const { user, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { activeChat, addMessage, updateLastMessage, setTyping, clearTyping } = useChatStore();

  const connect = useCallback(() => {
    if (clientRef.current?.connected || !isAuthenticated) return;

    const token = getAccessToken();
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    client.onConnect = () => {
      // Subscribe to personal notifications
      if (user) {
        client.subscribe(`/user/${user.id}/queue/notifications`, (msg: IMessage) => {
          const notification: Notification = JSON.parse(msg.body);
          addNotification(notification);
        });
      }
    };

    client.activate();
    clientRef.current = client;
  }, [isAuthenticated, user, addNotification]);

  const disconnect = useCallback(() => {
    if (clientRef.current?.connected) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
  }, []);

  // Subscribe to chat messages when activeChat changes
  useEffect(() => {
    const client = clientRef.current;
    if (!client?.connected || !activeChat) return;

    const msgSub = client.subscribe(`/topic/chat.${activeChat.id}`, (msg: IMessage) => {
      const message: Message = JSON.parse(msg.body);
      addMessage(message);
      updateLastMessage(activeChat.id, message);
    });

    const typingSub = client.subscribe(`/topic/chat.${activeChat.id}.typing`, (msg: IMessage) => {
      const data = JSON.parse(msg.body);
      setTyping(activeChat.id, data.username);
      setTimeout(() => clearTyping(activeChat.id, data.username), 3000);
    });

    return () => {
      msgSub.unsubscribe();
      typingSub.unsubscribe();
    };
  }, [activeChat, addMessage, updateLastMessage, setTyping, clearTyping]);

  // Connect on auth, disconnect on logout
  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }
    return () => disconnect();
  }, [isAuthenticated, connect, disconnect]);

  const sendMessage = useCallback((chatId: string, content: string) => {
    clientRef.current?.publish({
      destination: `/app/chat/${chatId}/send`,
      body: JSON.stringify({ content }),
    });
  }, []);

  const sendTyping = useCallback((chatId: string) => {
    clientRef.current?.publish({
      destination: `/app/chat/${chatId}/typing`,
    });
  }, []);

  return { sendMessage, sendTyping, connect, disconnect };
}
