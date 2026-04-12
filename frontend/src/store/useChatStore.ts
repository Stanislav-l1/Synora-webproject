'use client';

import { create } from 'zustand';
import api from '@/lib/api';
import type { Chat, Message, ApiResponse, PageResponse } from '@/types';

interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Message[];
  isLoading: boolean;
  typingUsers: Map<string, string>;

  fetchChats: () => Promise<void>;
  setActiveChat: (chat: Chat | null) => void;
  fetchMessages: (chatId: string, page?: number) => Promise<void>;
  addMessage: (message: Message) => void;
  setTyping: (chatId: string, username: string) => void;
  clearTyping: (chatId: string, username: string) => void;
  updateLastMessage: (chatId: string, message: Message) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChat: null,
  messages: [],
  isLoading: false,
  typingUsers: new Map(),

  fetchChats: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get<ApiResponse<Chat[]>>('/chats');
      set({ chats: res.data.data });
    } finally {
      set({ isLoading: false });
    }
  },

  setActiveChat: (chat) => {
    set({ activeChat: chat, messages: [] });
  },

  fetchMessages: async (chatId, page = 0) => {
    set({ isLoading: true });
    try {
      const res = await api.get<ApiResponse<PageResponse<Message>>>(`/chats/${chatId}/messages`, {
        params: { page, size: 50 },
      });
      const data = res.data.data;
      if (page === 0) {
        set({ messages: data.content.reverse() });
      } else {
        set({ messages: [...data.content.reverse(), ...get().messages] });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  addMessage: (message) => {
    set({ messages: [...get().messages, message] });
  },

  setTyping: (chatId, username) => {
    const map = new Map(get().typingUsers);
    map.set(`${chatId}:${username}`, username);
    set({ typingUsers: map });
  },

  clearTyping: (chatId, username) => {
    const map = new Map(get().typingUsers);
    map.delete(`${chatId}:${username}`);
    set({ typingUsers: map });
  },

  updateLastMessage: (chatId, message) => {
    set({
      chats: get().chats.map((c) =>
        c.id === chatId ? { ...c, lastMessage: message } : c,
      ),
    });
  },
}));
