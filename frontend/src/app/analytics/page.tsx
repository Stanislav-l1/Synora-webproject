'use client';

import { useState, useEffect } from 'react';
import {
  BarChart2, Eye, Users, Heart, MessageSquare,
  TrendingUp, TrendingDown, FolderGit2, FileText,
  Loader2, Star,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse } from '@/types';

interface DayCount { date: string; count: number }
interface Summary {
  profileViews30d: number;
  uniqueProfileViewers30d: number;
  postImpressions30d: number;
  followerCount: number;
  followerGrowth30d: number;
  reputationScore: number;
  engagementRate: number;
  profileViewsByDay: DayCount[];
}
interface PostItem {
  id: string; title: string;
  views: number; likes: number; comments: number; reposts: number;
  createdAt: string;
}
interface ProjectItem {
  id: string; name: string;
  members: number; stars: number; createdAt: string;
}

type Tab = 'overview' | 'posts' | 'projects';

function StatCard({ label, value, sub, icon: Icon, trend }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="rounded-xl border border-border-default bg-surface-secondary p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-content-tertiary font-medium uppercase tracking-wider">{label}</span>
        <Icon size={16} className="text-tyrian/60" />
      </div>
      <div>
        <p className="text-2xl font-bold text-content-primary">{value}</p>
        {sub && (
          <p className={cn('text-xs mt-0.5 flex items-center gap-1',
            trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-content-tertiary')}>
            {trend === 'up' && <TrendingUp size={11} />}
            {trend === 'down' && <TrendingDown size={11} />}
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function Sparkline({ data }: { data: DayCount[] }) {
  if (!data || data.length === 0) {
    return <div className="h-20 flex items-center justify-center text-xs text-content-tertiary">No data yet</div>;
  }
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-0.5 h-20">
      {data.map((d, i) => (
        <div
          key={i}
          className="flex-1 bg-tyrian/40 hover:bg-tyrian/70 rounded-t transition-colors cursor-default"
          style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? '4px' : '2px' }}
          title={`${d.date}: ${d.count} views`}
        />
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [tab, setTab]           = useState<Tab>('overview');
  const [summary, setSummary]   = useState<Summary | null>(null);
  const [posts, setPosts]       = useState<PostItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<ApiResponse<Summary>>('/analytics/summary'),
      api.get<ApiResponse<PostItem[]>>('/analytics/posts'),
      api.get<ApiResponse<ProjectItem[]>>('/analytics/projects'),
    ]).then(([s, p, pr]) => {
      setSummary(s.data.data);
      setPosts(p.data.data);
      setProjects(pr.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center py-32">
          <Loader2 size={28} className="animate-spin text-tyrian/60" />
        </div>
      </AppShell>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'posts',    label: `Posts (${posts.length})` },
    { id: 'projects', label: `Projects (${projects.length})` },
  ];

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart2 size={20} className="text-tyrian" />
          <h1 className="text-xl font-bold text-content-primary">Analytics</h1>
          <span className="text-xs text-content-tertiary ml-1">Last 30 days</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border-default">
          {tabs.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                tab === t.id
                  ? 'border-tyrian text-tyrian'
                  : 'border-transparent text-content-secondary hover:text-content-primary',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && summary && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <StatCard label="Profile views" value={summary.profileViews30d}
                sub={`${summary.uniqueProfileViewers30d} unique`} icon={Eye} />
              <StatCard label="Post impressions" value={summary.postImpressions30d}
                icon={FileText} />
              <StatCard label="Followers" value={summary.followerCount}
                sub={summary.followerGrowth30d > 0 ? `+${summary.followerGrowth30d} this month` : undefined}
                trend={summary.followerGrowth30d > 0 ? 'up' : 'neutral'}
                icon={Users} />
              <StatCard label="Engagement rate" value={`${summary.engagementRate}%`}
                sub="likes + comments / views" icon={Heart} />
              <StatCard label="Reputation" value={summary.reputationScore} icon={Star} />
            </div>

            <div className="rounded-xl border border-border-default bg-surface-secondary p-5">
              <p className="text-sm font-medium text-content-secondary mb-3">Profile views — 30 days</p>
              <Sparkline data={summary.profileViewsByDay} />
              {summary.profileViewsByDay?.length > 0 && (
                <div className="flex justify-between text-[10px] text-content-tertiary mt-1">
                  <span>{summary.profileViewsByDay[0]?.date}</span>
                  <span>{summary.profileViewsByDay[summary.profileViewsByDay.length - 1]?.date}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Posts */}
        {tab === 'posts' && (
          <div className="rounded-xl border border-border-default overflow-hidden">
            {posts.length === 0 ? (
              <div className="py-16 text-center text-content-tertiary text-sm">No published posts</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-default bg-surface-tertiary">
                    <th className="text-left px-4 py-3 text-xs text-content-tertiary font-medium">Post</th>
                    <th className="text-right px-4 py-3 text-xs text-content-tertiary font-medium"><Eye size={12} className="inline" /> Views</th>
                    <th className="text-right px-4 py-3 text-xs text-content-tertiary font-medium"><Heart size={12} className="inline" /> Likes</th>
                    <th className="text-right px-4 py-3 text-xs text-content-tertiary font-medium"><MessageSquare size={12} className="inline" /> Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((p, i) => (
                    <tr key={p.id} className={cn('border-b border-border-default last:border-0',
                      i % 2 === 0 ? 'bg-surface-secondary' : 'bg-surface-primary')}>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-medium text-content-primary truncate">{p.title}</p>
                        <p className="text-xs text-content-tertiary">
                          {new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right text-content-secondary">{p.views.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-content-secondary">{p.likes.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-content-secondary">{p.comments.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Projects */}
        {tab === 'projects' && (
          <div className="rounded-xl border border-border-default overflow-hidden">
            {projects.length === 0 ? (
              <div className="py-16 text-center text-content-tertiary text-sm">No projects yet</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-default bg-surface-tertiary">
                    <th className="text-left px-4 py-3 text-xs text-content-tertiary font-medium">Project</th>
                    <th className="text-right px-4 py-3 text-xs text-content-tertiary font-medium"><Users size={12} className="inline" /> Members</th>
                    <th className="text-right px-4 py-3 text-xs text-content-tertiary font-medium"><Star size={12} className="inline" /> Stars</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p, i) => (
                    <tr key={p.id} className={cn('border-b border-border-default last:border-0',
                      i % 2 === 0 ? 'bg-surface-secondary' : 'bg-surface-primary')}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-content-primary">{p.name}</p>
                        <p className="text-xs text-content-tertiary">
                          {new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right text-content-secondary">{p.members}</td>
                      <td className="px-4 py-3 text-right text-content-secondary">{p.stars}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
