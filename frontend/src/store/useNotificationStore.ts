'use client';

import { create } from 'zustand';
import api from '@/lib/api';
import type { Notification, ApiResponse, PageResponse } from '@/types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;

  fetchNotifications: (page?: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async (page = 0) => {
    set({ isLoading: true });
    try {
      const res = await api.get<ApiResponse<PageResponse<Notification>>>('/notifications', {
        params: { page, size: 20 },
      });
      const data = res.data.data;
      if (page === 0) {
        set({ notifications: data.content });
      } else {
        set({ notifications: [...get().notifications, ...data.content] });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await api.get<ApiResponse<number>>('/notifications/unread-count');
      set({ unreadCount: res.data.data });
    } catch {
      // Silently fail for count
    }
  },

  markAsRead: async (id) => {
    await api.post(`/notifications/${id}/read`);
    set({
      notifications: get().notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
      unreadCount: Math.max(0, get().unreadCount - 1),
    });
  },

  markAllAsRead: async () => {
    await api.post('/notifications/read-all');
    set({
      notifications: get().notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    });
  },

  addNotification: (notification) => {
    set({
      notifications: [notification, ...get().notifications],
      unreadCount: get().unreadCount + 1,
    });
  },
}));
