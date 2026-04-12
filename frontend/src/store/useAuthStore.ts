'use client';

import { create } from 'zustand';
import api from '@/lib/api';
import { setTokens, clearTokens, getAccessToken } from '@/lib/auth';
import type { User, LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: !!getAccessToken(),

  login: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
      const { accessToken, refreshToken } = res.data.data;
      setTokens(accessToken, refreshToken);
      set({ isAuthenticated: true });

      const userRes = await api.get<ApiResponse<User>>('/users/me');
      set({ user: userRes.data.data });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
      const { accessToken, refreshToken } = res.data.data;
      setTokens(accessToken, refreshToken);
      set({ isAuthenticated: true });

      const userRes = await api.get<ApiResponse<User>>('/users/me');
      set({ user: userRes.data.data });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Logout even if server request fails
    } finally {
      clearTokens();
      set({ user: null, isAuthenticated: false });
    }
  },

  fetchCurrentUser: async () => {
    if (!getAccessToken()) return;
    set({ isLoading: true });
    try {
      const res = await api.get<ApiResponse<User>>('/users/me');
      set({ user: res.data.data, isAuthenticated: true });
    } catch {
      clearTokens();
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));
