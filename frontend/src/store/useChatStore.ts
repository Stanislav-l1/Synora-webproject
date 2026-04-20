'use client';

import { create } from 'zustand';
import api from '@/lib/api';
import type { Chat, Message, ApiResponse, PageResponse, CreateGroupChatRequest } from '@/types';

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
  createDirect: (otherUserId: string) => Promise<Chat>;
  createGroup: (req: CreateGroupChatRequest) => Promise<Chat>;
  openProjectChat: (projectId: string) => Promise<Chat>;
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

  createDirect: async (otherUserId) => {
    const res = await api.post<ApiResponse<Chat>>(`/chats/direct/${otherUserId}`);
    const chat = res.data.data;
    const existing = get().chats.find((c) => c.id === chat.id);
    set({
      chats: existing ? get().chats : [chat, ...get().chats],
      activeChat: chat,
      messages: [],
    });
    return chat;
  },

  createGroup: async (req) => {
    const res = await api.post<ApiResponse<Chat>>('/chats/group', req);
    const chat = res.data.data;
    set({
      chats: [chat, ...get().chats],
      activeChat: chat,
      messages: [],
    });
    return chat;
  },

  openProjectChat: async (projectId) => {
    const res = await api.get<ApiResponse<Chat>>(`/chats/project/${projectId}`);
    const chat = res.data.data;
    const existing = get().chats.find((c) => c.id === chat.id);
    set({
      chats: existing
        ? get().chats.map((c) => (c.id === chat.id ? chat : c))
        : [chat, ...get().chats],
      activeChat: chat,
      messages: [],
    });
    return chat;
  },
}));
