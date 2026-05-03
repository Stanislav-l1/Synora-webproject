'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search, Shield, ShieldOff, UserX, UserCheck,
  ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import type { ApiResponse, PageResponse, AdminUser } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const ROLE_OPTIONS = [
  { value: '',           label: 'All roles' },
  { value: 'USER',       label: 'User' },
  { value: 'MODERATOR',  label: 'Moderator' },
  { value: 'ADMIN',      label: 'Admin' },
];

const STATUS_OPTIONS = [
  { value: '',      label: 'All' },
  { value: 'false', label: 'Active' },
  { value: 'true',  label: 'Banned' },
];

function roleBadgeVariant(role: string) {
  if (role === 'ADMIN')     return 'danger' as const;
  if (role === 'MODERATOR') return 'warning' as const;
  return 'default' as const;
}

export default function AdminUsersPage() {
  const searchParams = useSearchParams();

  const [users,   setUsers]   = useState<AdminUser[]>([]);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [page,    setPage]    = useState(0);
  const [loading, setLoading] = useState(true);

  const [q,        setQ]        = useState('');
  const [qInput,   setQInput]   = useState('');
  const [role,     setRole]     = useState('');
  const [banned,   setBanned]   = useState(searchParams.get('banned') ?? '');
  const [acting,   setActing]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), size: '30' });
      if (q)      params.set('q',      q);
      if (role)   params.set('role',   role);
      if (banned) params.set('banned', banned);

      const res = await api.get<ApiResponse<PageResponse<AdminUser>>>(
        `/admin/users?${params}`
      );
      const data = res.data.data;
      setUsers(data.content);
      setTotal(data.totalElements);
      setPages(data.totalPages);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, q, role, banned]);

  useEffect(() => { load(); }, [load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    setQ(qInput);
  }

  async function handleBan(user: AdminUser) {
    const reason = window.prompt(`Ban reason for @${user.username}:`) ?? '';
    setActing(user.id);
    try {
      await api.post(`/admin/users/${user.id}/ban`, { reason });
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, banned: true, banReason: reason } : u));
    } finally {
      setActing(null);
    }
  }

  async function handleUnban(user: AdminUser) {
    setActing(user.id);
    try {
      await api.post(`/admin/users/${user.id}/unban`);
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, banned: false, banReason: null } : u));
    } finally {
      setActing(null);
    }
  }

  async function handleRole(user: AdminUser, newRole: string) {
    setActing(user.id);
    try {
      await api.patch(`/admin/users/${user.id}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: newRole as AdminUser['role'] } : u));
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-content-primary mb-6">
        Users
        <span className="ml-2 text-base font-normal text-content-tertiary">({total.toLocaleString()})</span>
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
            <input
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder="Search username or email…"
              className="pl-9 pr-3 h-9 w-64 text-sm bg-surface-tertiary border border-border-default rounded-lg text-content-primary placeholder:text-content-tertiary focus:outline-none focus:border-border-accent"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">Go</Button>
        </form>

        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(0); }}
          className="h-9 px-3 text-sm bg-surface-tertiary border border-border-default rounded-lg text-content-primary focus:outline-none"
        >
          {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <select
          value={banned}
          onChange={(e) => { setBanned(e.target.value); setPage(0); }}
          className="h-9 px-3 text-sm bg-surface-tertiary border border-border-default rounded-lg text-content-primary focus:outline-none"
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-accent/60" />
        </div>
      ) : (
        <div className="bg-surface-secondary border border-border-default rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default bg-surface-tertiary">
                <th className="text-left px-4 py-3 text-xs font-semibold text-content-tertiary uppercase tracking-wide">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-content-tertiary uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-content-tertiary uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-content-tertiary uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-content-tertiary uppercase tracking-wide">Joined</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-content-tertiary uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-content-tertiary text-sm">
                    No users found
                  </td>
                </tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-tertiary/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.displayName || u.username} src={u.avatarUrl || undefined} size="sm" />
                      <div>
                        <p className="font-medium text-content-primary">{u.displayName || u.username}</p>
                        <p className="text-xs text-content-tertiary">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-content-secondary text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={acting === u.id || u.role === 'ADMIN'}
                      onChange={(e) => handleRole(u, e.target.value)}
                      className="text-xs bg-transparent border border-border-default rounded-md px-2 py-1 text-content-primary focus:outline-none disabled:opacity-40"
                    >
                      <option value="USER">User</option>
                      <option value="MODERATOR">Moderator</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {u.banned ? (
                      <span className="inline-flex items-center gap-1 text-xs text-danger bg-danger/10 border border-danger/20 rounded-full px-2 py-0.5">
                        <UserX size={10} /> Banned
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-success bg-success/10 border border-success/20 rounded-full px-2 py-0.5">
                        <UserCheck size={10} /> Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-content-tertiary">
                    {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {acting === u.id ? (
                      <Loader2 size={14} className="animate-spin text-accent/60 ml-auto" />
                    ) : u.role !== 'ADMIN' && (
                      u.banned ? (
                        <button
                          type="button"
                          onClick={() => handleUnban(u)}
                          className="inline-flex items-center gap-1 text-xs text-success hover:text-success/80 transition-colors"
                        >
                          <ShieldOff size={13} /> Unban
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleBan(u)}
                          className="inline-flex items-center gap-1 text-xs text-danger hover:text-danger/80 transition-colors"
                        >
                          <Shield size={13} /> Ban
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-content-secondary">
          <span>Page {page + 1} of {pages}</span>
          <div className="flex gap-2">
            <Button
              variant="secondary" size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              variant="secondary" size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= pages - 1}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
