'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Star, Users, GitFork, Globe, Lock,
  Plus, MoreHorizontal, AlertCircle, CheckCircle2,
  Clock, ArrowUpDown, Loader2, Pencil,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { cn, timeAgo } from '@/lib/utils';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from '@/store/useToastStore';
import type { Project, KanbanColumn, ProjectMember, Task, TaskPriority } from '@/types';

type Tab = 'overview' | 'board' | 'members';

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  LOW:      'bg-zinc-100 text-zinc-500',
  MEDIUM:   'bg-blue-100 text-blue-600',
  HIGH:     'bg-orange-100 text-orange-600',
  CRITICAL: 'bg-red-100 text-red-600',
};

const MOCK_COLUMNS: KanbanColumn[] = [
  {
    id: 'c1', projectId: '', name: 'Backlog', position: 0,
    tasks: [
      { id: 't1', projectId: '', columnId: 'c1', title: 'Design onboarding flow', description: null, status: 'BACKLOG', priority: 'MEDIUM', assigneeId: null, assigneeUsername: null, position: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 't2', projectId: '', columnId: 'c1', title: 'Write API documentation', description: null, status: 'BACKLOG', priority: 'LOW', assigneeId: null, assigneeUsername: null, position: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ],
  },
  {
    id: 'c2', projectId: '', name: 'In Progress', position: 1,
    tasks: [
      { id: 't3', projectId: '', columnId: 'c2', title: 'Implement auth module', description: 'JWT + refresh rotation', status: 'IN_PROGRESS', priority: 'HIGH', assigneeId: null, assigneeUsername: 'slin', position: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 't4', projectId: '', columnId: 'c2', title: 'Set up CI/CD pipeline', description: null, status: 'IN_PROGRESS', priority: 'CRITICAL', assigneeId: null, assigneeUsername: 'mwebb', position: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ],
  },
  {
    id: 'c3', projectId: '', name: 'Review', position: 2,
    tasks: [
      { id: 't5', projectId: '', columnId: 'c3', title: 'Code review: post module', description: null, status: 'REVIEW', priority: 'MEDIUM', assigneeId: null, assigneeUsername: null, position: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ],
  },
  {
    id: 'c4', projectId: '', name: 'Done', position: 3,
    tasks: [
      { id: 't6', projectId: '', columnId: 'c4', title: 'Project scaffolding', description: null, status: 'DONE', priority: 'HIGH', assigneeId: null, assigneeUsername: null, position: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 't7', projectId: '', columnId: 'c4', title: 'Database schema v1', description: null, status: 'DONE', priority: 'HIGH', assigneeId: null, assigneeUsername: null, position: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ],
  },
];

function hashColor(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  const hue = Math.abs(h) % 360;
  return `hsl(${hue} 60% 55%)`;
}

function ProjectCover({ name, className }: { name: string; className?: string }) {
  const c1 = hashColor(name);
  const c2 = hashColor(name + '1');
  return (
    <div
      className={cn('rounded-xl', className)}
      style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
    />
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState<Tab>('overview');
  const [starred, setStarred] = useState(false);
  const [starsCount, setStarsCount] = useState(0);
  const [columns] = useState<KanbanColumn[]>(MOCK_COLUMNS);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.allSettled([
      api.get(`/projects/${id}`),
      api.get(`/projects/${id}/members`),
    ]).then(([projRes, membersRes]) => {
      if (projRes.status === 'fulfilled') {
        const p: Project = projRes.value.data?.data ?? projRes.value.data;
        setProject(p);
        setStarsCount(p.starsCount);
      } else {
        setNotFound(true);
      }
      if (membersRes.status === 'fulfilled') {
        const m = membersRes.value.data?.data ?? membersRes.value.data;
        setMembers(Array.isArray(m) ? m : m?.content ?? []);
      }
    }).finally(() => setLoading(false));
  }, [id]);

  async function toggleStar() {
    if (!user) { toast.info('Sign in to star projects'); return; }
    setStarred((v) => !v);
    setStarsCount((v) => v + (starred ? -1 : 1));
    try { await api.post(`/projects/${id}/star`); }
    catch { setStarred((v) => !v); setStarsCount((v) => v + (starred ? 1 : -1)); }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto py-6 px-4 space-y-4">
          <Skeleton className="h-6 w-24" />
          <div className="flex gap-4">
            <Skeleton className="w-20 h-20 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-7 w-48" />
              <SkeletonText lines={2} />
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (notFound || !project) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto py-16 px-4 text-center">
          <p className="text-4xl mb-4">🔍</p>
          <h2 className="text-lg font-bold text-cloud-ink mb-2">Project not found</h2>
          <p className="text-cloud-muted text-sm mb-6">This project may be private or no longer exists.</p>
          <Button variant="primary" onClick={() => router.push('/projects')}>Browse projects</Button>
        </div>
      </AppShell>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'board',    label: 'Board' },
    { id: 'members',  label: `Members (${project.membersCount})` },
  ];

  const totalTasks = columns.reduce((a, c) => a + c.tasks.length, 0);
  const doneTasks  = columns.find((c) => c.name === 'Done')?.tasks.length ?? 0;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto py-6 px-4">
        {/* Back */}
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-cloud-muted hover:text-cloud-ink transition-colors mb-5"
        >
          <ArrowLeft size={16} /> Projects
        </button>

        {/* Header */}
        <div className="bg-cloud border border-cloud-deep rounded-2xl p-6 mb-4">
          <div className="flex items-start gap-4">
            <ProjectCover name={project.name} className="w-16 h-16 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-cloud-ink truncate">{project.name}</h1>
                <span className="shrink-0">
                  {project.isPublic
                    ? <Globe size={14} className="text-cloud-muted" />
                    : <Lock size={14} className="text-cloud-muted" />}
                </span>
              </div>
              {project.description && (
                <p className="text-sm text-cloud-muted mb-3 leading-relaxed">{project.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-sm text-cloud-muted">
                <Link href={`/u/${project.ownerUsername}`} className="hover:text-tyrian transition-colors">
                  @{project.ownerUsername}
                </Link>
                <span>·</span>
                <span className="flex items-center gap-1"><Users size={13} />{project.membersCount}</span>
                <span>·</span>
                <span>{timeAgo(project.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={toggleStar}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
                  starred ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'bg-cloud border-cloud-deep text-cloud-muted hover:border-cloud-ink',
                )}
              >
                <Star size={14} fill={starred ? 'currentColor' : 'none'} />
                <span>{starsCount}</span>
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {totalTasks > 0 && (
            <div className="mt-5 pt-4 border-t border-cloud-deep">
              <div className="flex items-center justify-between text-xs text-cloud-muted mb-1.5">
                <span>{doneTasks} / {totalTasks} tasks completed</span>
                <span>{Math.round((doneTasks / totalTasks) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-cloud-deep rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${Math.round((doneTasks / totalTasks) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-cloud-deep/40 p-1 rounded-xl">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                tab === t.id ? 'bg-cloud shadow-sm text-cloud-ink' : 'text-cloud-muted hover:text-cloud-ink',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === 'overview' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total tasks',    value: totalTasks,                icon: <ArrowUpDown size={16} className="text-cloud-muted" /> },
              { label: 'Completed',      value: doneTasks,                 icon: <CheckCircle2 size={16} className="text-green-500" /> },
              { label: 'In progress',    value: columns[1]?.tasks.length ?? 0, icon: <Clock size={16} className="text-blue-500" /> },
              { label: 'Members',        value: project.membersCount,      icon: <Users size={16} className="text-tyrian" /> },
            ].map((s) => (
              <div key={s.label} className="bg-cloud border border-cloud-deep rounded-xl p-4 text-center">
                <div className="flex justify-center mb-2">{s.icon}</div>
                <p className="text-2xl font-bold text-cloud-ink">{s.value}</p>
                <p className="text-xs text-cloud-muted">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Board tab */}
        {tab === 'board' && (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-3 min-w-max">
              {columns.map((col) => (
                <div key={col.id} className="w-64 shrink-0">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-xs font-semibold text-cloud-muted uppercase tracking-wide">
                      {col.name} <span className="ml-1 text-cloud-muted/60">({col.tasks.length})</span>
                    </span>
                    <button type="button" className="text-cloud-muted hover:text-cloud-ink transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {col.tasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                    {col.tasks.length === 0 && (
                      <div className="h-16 border-2 border-dashed border-cloud-deep rounded-xl flex items-center justify-center">
                        <p className="text-xs text-cloud-muted">Drop here</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members tab */}
        {tab === 'members' && (
          <div className="bg-cloud border border-cloud-deep rounded-2xl overflow-hidden">
            {members.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-cloud-muted text-sm">No members loaded</p>
              </div>
            ) : (
              members.map((m, i) => (
                <div
                  key={m.userId}
                  className={cn(
                    'flex items-center gap-3 px-5 py-3',
                    i < members.length - 1 && 'border-b border-cloud-deep',
                  )}
                >
                  <Avatar name={m.displayName || m.username} src={m.avatarUrl || undefined} size="sm" />
                  <div className="flex-1 min-w-0">
                    <Link href={`/u/${m.username}`} className="text-sm font-medium text-cloud-ink hover:text-tyrian transition-colors truncate block">
                      {m.displayName || m.username}
                    </Link>
                    <p className="text-xs text-cloud-muted">@{m.username}</p>
                  </div>
                  <Badge variant={m.role === 'OWNER' ? 'accent' : 'default'} className="text-[10px] uppercase">
                    {m.role.toLowerCase()}
                  </Badge>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function TaskCard({ task }: { task: Task }) {
  return (
    <div className="bg-cloud border border-cloud-deep rounded-xl p-3 hover:border-tyrian/30 transition-colors cursor-pointer group">
      <p className="text-sm text-cloud-ink leading-snug mb-2">{task.title}</p>
      <div className="flex items-center justify-between">
        <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded', PRIORITY_COLOR[task.priority])}>
          {task.priority}
        </span>
        {task.assigneeUsername && (
          <Avatar name={task.assigneeUsername} size="xs" />
        )}
      </div>
    </div>
  );
}
