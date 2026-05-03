'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, FileText, FolderKanban, Building2,
  Flag, AlertCircle, UserX, UserPlus, Loader2,
} from 'lucide-react';
import api from '@/lib/api';
import type { ApiResponse, AdminStats } from '@/types';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  sub?: string;
  href?: string;
  accent?: boolean;
}

function StatCard({ label, value, icon, sub, href, accent }: StatCardProps) {
  const inner = (
    <div className={`bg-surface-secondary border rounded-xl p-5 flex items-start gap-4 ${
      accent ? 'border-danger/30' : 'border-border-default'
    } ${href ? 'hover:border-border-hover transition-colors cursor-pointer' : ''}`}>
      <div className={`p-2.5 rounded-lg ${accent ? 'bg-danger/10 text-danger' : 'bg-accent/10 text-accent'}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-content-primary">{value.toLocaleString()}</p>
        <p className="text-sm text-content-secondary mt-0.5">{label}</p>
        {sub && <p className="text-xs text-content-tertiary mt-1">{sub}</p>}
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ApiResponse<AdminStats>>('/admin/stats')
      .then((r) => setStats(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-accent/60" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-content-primary mb-2">Dashboard</h1>
      <p className="text-sm text-content-secondary mb-8">Platform overview</p>

      {/* Users */}
      <h2 className="text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-3">Users</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total users"
          value={stats.totalUsers}
          icon={<Users size={18} />}
          href="/admin/users"
        />
        <StatCard
          label="New last 7 days"
          value={stats.newUsersLast7Days}
          icon={<UserPlus size={18} />}
          sub="Registered in the past week"
        />
        <StatCard
          label="Banned users"
          value={stats.bannedUsers}
          icon={<UserX size={18} />}
          href="/admin/users?banned=true"
          accent={stats.bannedUsers > 0}
        />
      </div>

      {/* Content */}
      <h2 className="text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-3">Content</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Posts"       value={stats.totalPosts}       icon={<FileText    size={18} />} />
        <StatCard label="Projects"    value={stats.totalProjects}    icon={<FolderKanban size={18} />} />
        <StatCard label="Communities" value={stats.totalCommunities} icon={<Building2   size={18} />} />
      </div>

      {/* Moderation */}
      <h2 className="text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-3">Moderation</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          label="Total reports"
          value={stats.totalReports}
          icon={<Flag size={18} />}
          href="/admin/reports"
        />
        <StatCard
          label="Pending reports"
          value={stats.pendingReports}
          icon={<AlertCircle size={18} />}
          href="/admin/reports?status=PENDING"
          accent={stats.pendingReports > 0}
          sub="Awaiting review"
        />
      </div>
    </div>
  );
}
