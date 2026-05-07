'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Star, Users, Globe, Lock,
  Plus, CheckCircle2,
  Clock, ArrowUpDown, Loader2, X,
  Trash2, Calendar as CalendarIcon, Flag, User as UserIcon,
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
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [addingToColumn, setAddingToColumn] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.allSettled([
      api.get(`/projects/${id}`),
      api.get(`/projects/${id}/members`),
      api.get(`/projects/${id}/board`),
    ]).then(([projRes, membersRes, boardRes]) => {
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
      if (boardRes.status === 'fulfilled') {
        const board = boardRes.value.data?.data ?? boardRes.value.data;
        setColumns(board?.columns ?? []);
      }
    }).finally(() => setLoading(false));
  }, [id]);

  async function createTask(columnId: number, title: string) {
    if (!title.trim()) return;
    try {
      const res = await api.post(`/projects/${id}/tasks`, { title: title.trim(), columnId });
      const task: Task = res.data?.data ?? res.data;
      setColumns((cols) =>
        cols.map((c) => c.id === columnId ? { ...c, tasks: [...c.tasks, task] } : c),
      );
    } catch {
      toast.error('Failed to create task');
    }
    setAddingToColumn(null);
  }

  async function updateTask(taskId: string, patch: Partial<Task>) {
    try {
      const res = await api.patch(`/projects/${id}/tasks/${taskId}`, patch);
      const updated: Task = res.data?.data ?? res.data;
      setColumns((cols) =>
        cols.map((c) => ({
          ...c,
          tasks: c.tasks.map((t) => t.id === taskId ? updated : t),
        })),
      );
      setSelectedTask(updated);
    } catch {
      toast.error('Failed to save changes');
    }
  }

  async function deleteTask(taskId: string) {
    try {
      await api.delete(`/projects/${id}/tasks/${taskId}`);
      setColumns((cols) =>
        cols.map((c) => ({ ...c, tasks: c.tasks.filter((t) => t.id !== taskId) })),
      );
      setSelectedTask(null);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  }

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

  const allTasks      = columns.flatMap((c) => c.tasks);
  const totalTasks    = allTasks.length;
  const doneTasks     = allTasks.filter((t) => t.status === 'DONE').length;
  const inProgressTasks = allTasks.filter((t) => t.status === 'IN_PROGRESS').length;

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
              { label: 'In progress',    value: inProgressTasks,               icon: <Clock size={16} className="text-blue-500" /> },
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
                    <button
                      type="button"
                      aria-label="Add task"
                      onClick={() => setAddingToColumn(col.id)}
                      className="text-cloud-muted hover:text-cloud-ink transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {col.tasks.map((task) => (
                      <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                    ))}
                    {col.tasks.length === 0 && addingToColumn !== col.id && (
                      <div className="h-16 border-2 border-dashed border-cloud-deep rounded-xl flex items-center justify-center">
                        <p className="text-xs text-cloud-muted">Drop here</p>
                      </div>
                    )}
                    {addingToColumn === col.id && (
                      <AddTaskForm
                        columnId={col.id}
                        onSave={createTask}
                        onCancel={() => setAddingToColumn(null)}
                      />
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

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          members={members}
          onClose={() => setSelectedTask(null)}
          onSave={(patch) => updateTask(selectedTask.id, patch)}
          onDelete={() => deleteTask(selectedTask.id)}
        />
      )}
    </AppShell>
  );
}

function TaskCard({ task, onClick }: { task: Task; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-cloud border border-cloud-deep rounded-xl p-3 hover:border-tyrian/30 transition-colors cursor-pointer group"
    >
      <p className="text-sm text-cloud-ink leading-snug mb-2">{task.title}</p>
      <div className="flex items-center justify-between">
        <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded', PRIORITY_COLOR[task.priority])}>
          {task.priority}
        </span>
        {task.assigneeUsername && (
          <Avatar name={task.assigneeUsername} size="xs" />
        )}
      </div>
    </button>
  );
}

function AddTaskForm({
  columnId,
  onSave,
  onCancel,
}: {
  columnId: number;
  onSave: (columnId: number, title: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);

  async function submit() {
    if (!value.trim() || saving) return;
    setSaving(true);
    await onSave(columnId, value);
    setSaving(false);
  }

  return (
    <div className="bg-cloud border border-tyrian/30 rounded-xl p-3 space-y-2">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
          if (e.key === 'Escape') onCancel();
        }}
        placeholder="Task title…"
        rows={2}
        className="w-full bg-transparent text-sm text-cloud-ink placeholder:text-cloud-muted focus:outline-none resize-none leading-snug"
      />
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={submit}
          disabled={!value.trim() || saving}
          className="flex items-center gap-1 px-2.5 py-1 bg-tyrian text-cloud text-xs font-medium rounded-lg disabled:opacity-50 hover:bg-tyrian/90 transition-colors"
        >
          {saving ? <Loader2 size={11} className="animate-spin" /> : null}
          Add
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 text-cloud-muted hover:text-cloud-ink transition-colors"
          aria-label="Cancel"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

function TaskDetailPanel({
  task,
  members,
  onClose,
  onSave,
  onDelete,
}: {
  task: Task;
  members: ProjectMember[];
  onClose: () => void;
  onSave: (patch: Partial<Task>) => Promise<void> | void;
  onDelete: () => Promise<void> | void;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [assigneeId, setAssigneeId] = useState<string>(
    members.find((m) => m.username === task.assigneeUsername)?.userId ?? '',
  );
  const [dueDate, setDueDate] = useState(task.dueDate ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? '');
    setPriority(task.priority);
    setAssigneeId(members.find((m) => m.username === task.assigneeUsername)?.userId ?? '');
    setDueDate(task.dueDate ?? '');
    setConfirmDelete(false);
  }, [task.id, task.title, task.description, task.priority, task.assigneeUsername, task.dueDate, members]);

  async function handleSave() {
    setSaving(true);
    const patch: Record<string, unknown> = {};
    if (title.trim() && title !== task.title) patch.title = title.trim();
    if (description !== (task.description ?? '')) patch.description = description || null;
    if (priority !== task.priority) patch.priority = priority;
    const currentAssignee = members.find((m) => m.username === task.assigneeUsername)?.userId ?? '';
    if (assigneeId !== currentAssignee) patch.assigneeId = assigneeId || null;
    if (dueDate !== (task.dueDate ?? '')) patch.dueDate = dueDate || null;
    if (Object.keys(patch).length > 0) {
      await onSave(patch as Partial<Task>);
    }
    setSaving(false);
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-cloud-ink/30"
        onClick={onClose}
        aria-hidden
      />
      <aside className="fixed top-[calc(var(--banner-h,0px)+theme(spacing.navbar))] right-0 bottom-0 w-full sm:w-[420px] z-50 bg-cloud border-l border-cloud-deep shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-cloud-deep">
          <p className="text-xs font-semibold text-cloud-muted uppercase tracking-wide">Task</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-md text-cloud-muted hover:text-cloud-ink hover:bg-cloud-deep/40 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <div>
            <label className="text-[11px] font-semibold text-cloud-muted uppercase tracking-wide block mb-1.5">
              Title
            </label>
            <input
              type="text"
              aria-label="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-cloud-soft border border-cloud-deep rounded-lg px-3 py-2 text-sm text-cloud-ink focus:outline-none focus:border-tyrian transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-cloud-muted uppercase tracking-wide block mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Add details..."
              className="w-full bg-cloud-soft border border-cloud-deep rounded-lg px-3 py-2 text-sm text-cloud-ink placeholder:text-cloud-muted focus:outline-none focus:border-tyrian transition-colors resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-cloud-muted uppercase tracking-wide mb-1.5">
                <Flag size={11} /> Priority
              </label>
              <select
                aria-label="Task priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-cloud-soft border border-cloud-deep rounded-lg px-2.5 py-2 text-sm text-cloud-ink focus:outline-none focus:border-tyrian transition-colors"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-cloud-muted uppercase tracking-wide mb-1.5">
                <CalendarIcon size={11} /> Due date
              </label>
              <input
                type="date"
                aria-label="Due date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-cloud-soft border border-cloud-deep rounded-lg px-2.5 py-2 text-sm text-cloud-ink focus:outline-none focus:border-tyrian transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-cloud-muted uppercase tracking-wide mb-1.5">
              <UserIcon size={11} /> Assignee
            </label>
            <select
              aria-label="Assignee"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full bg-cloud-soft border border-cloud-deep rounded-lg px-2.5 py-2 text-sm text-cloud-ink focus:outline-none focus:border-tyrian transition-colors"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.displayName || m.username}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-cloud-muted pt-2 border-t border-cloud-deep">
            <p>Status: <span className="text-cloud-ink font-medium">{task.status}</span></p>
            <p className="mt-1">Created {timeAgo(task.createdAt)}</p>
            {task.updatedAt && task.updatedAt !== task.createdAt && (
              <p className="mt-1">Updated {timeAgo(task.updatedAt)}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-cloud-deep bg-cloud-soft">
          {confirmDelete ? (
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-cloud-muted">Delete this task?</span>
              <button
                type="button"
                onClick={onDelete}
                className="px-2.5 py-1 text-xs font-semibold text-cloud bg-red-500 hover:bg-red-600 rounded-md transition-colors"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-2.5 py-1 text-xs text-cloud-muted hover:text-cloud-ink transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                aria-label="Delete task"
                className="p-2 rounded-md text-cloud-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={14} />
              </button>
              <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
                Save changes
              </Button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
