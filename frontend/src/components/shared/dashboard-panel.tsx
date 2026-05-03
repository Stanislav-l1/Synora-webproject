'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarClock,
  CheckCircle2,
  FolderKanban,
  Inbox,
  Loader2,
  MessageSquare,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import api from '@/lib/api';
import type { ActivitySummary, ApiResponse, UpcomingTask, CurrentProject } from '@/types';

interface DashboardPanelProps {
  userId: string;
}

export function DashboardPanel({ userId }: DashboardPanelProps) {
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    api
      .get<ApiResponse<ActivitySummary>>(`/users/${userId}/activity-summary`)
      .then((res) => {
        if (!cancelled) setSummary(res.data.data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load dashboard');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 size={24} className="animate-spin text-tyrian/60" />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="text-center py-12 text-cloud-muted text-sm">
        {error ?? 'No data'}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<TrendingUp size={16} />}
          label="Posts this week"
          value={summary.postsThisWeek}
        />
        <StatCard
          icon={<Sparkles size={16} />}
          label="Reputation 7d"
          value={formatDelta(summary.reputationDeltaThisWeek)}
          tone={summary.reputationDeltaThisWeek >= 0 ? 'pos' : 'neg'}
        />
        <StatCard
          icon={<CheckCircle2 size={16} />}
          label="Open tasks"
          value={summary.openTasks}
        />
        <StatCard
          icon={<MessageSquare size={16} />}
          label="Unread messages"
          value={summary.unreadMessages}
        />
      </div>

      {/* Two-column: deadlines + current projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section
          icon={<CalendarClock size={16} className="text-tyrian" />}
          title="Upcoming deadlines"
          subtitle="Next 7 days"
        >
          {summary.upcomingTasks.length === 0 ? (
            <Empty text="No upcoming tasks." />
          ) : (
            <ul className="divide-y divide-cloud-deep">
              {summary.upcomingTasks.map((t) => (
                <UpcomingTaskRow key={t.id} task={t} />
              ))}
            </ul>
          )}
        </Section>

        <Section
          icon={<FolderKanban size={16} className="text-tyrian" />}
          title="Current projects"
          subtitle={`${summary.currentProjects} total`}
        >
          {summary.currentProjectsList.length === 0 ? (
            <Empty text="You're not in any project yet." />
          ) : (
            <ul className="divide-y divide-cloud-deep">
              {summary.currentProjectsList.map((p) => (
                <CurrentProjectRow key={p.id} project={p} />
              ))}
            </ul>
          )}
        </Section>
      </div>

      {/* Insights (rule-based) */}
      <Section
        icon={<Inbox size={16} className="text-tyrian" />}
        title="Insights"
        subtitle="What might need your attention"
      >
        <Insights summary={summary} />
      </Section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  tone?: 'pos' | 'neg';
}) {
  const valueClass =
    tone === 'pos'
      ? 'text-moss-velvet'
      : tone === 'neg'
      ? 'text-red-600'
      : 'text-cloud-ink';
  return (
    <div className="rounded-xl border border-cloud-deep bg-white p-3">
      <div className="flex items-center gap-1.5 text-xs text-cloud-muted">
        {icon} {label}
      </div>
      <p className={`mt-1.5 text-xl font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-cloud-deep bg-white">
      <header className="flex items-center justify-between px-4 h-11 border-b border-cloud-deep">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold text-cloud-ink">{title}</h3>
        </div>
        {subtitle && <span className="text-xs text-cloud-muted">{subtitle}</span>}
      </header>
      <div>{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="px-4 py-8 text-center text-xs text-cloud-muted">{text}</p>;
}

function UpcomingTaskRow({ task }: { task: UpcomingTask }) {
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = due
    ? Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  let dueTone = 'text-cloud-muted';
  let dueLabel = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—';
  if (days !== null) {
    if (days < 0) {
      dueTone = 'text-red-600';
      dueLabel = `${Math.abs(days)}d overdue`;
    } else if (days === 0) {
      dueTone = 'text-banana-deep';
      dueLabel = 'Today';
    } else if (days === 1) {
      dueTone = 'text-banana-deep';
      dueLabel = 'Tomorrow';
    } else if (days <= 7) {
      dueTone = 'text-cloud-ink';
      dueLabel = `In ${days}d`;
    }
  }

  return (
    <li className="flex items-center justify-between px-4 py-2.5">
      <div className="min-w-0 flex-1">
        <Link
          href={task.projectId ? `/projects/${task.projectId}/board` : '#'}
          className="block text-sm text-cloud-ink hover:text-tyrian truncate"
        >
          {task.title}
        </Link>
        {task.projectName && (
          <p className="text-xs text-cloud-muted truncate">{task.projectName}</p>
        )}
      </div>
      <div className="ml-3 flex items-center gap-2 shrink-0">
        <PriorityBadge priority={task.priority} />
        <span className={`text-xs font-medium ${dueTone}`}>{dueLabel}</span>
      </div>
    </li>
  );
}

function PriorityBadge({ priority }: { priority: UpcomingTask['priority'] }) {
  const map = {
    CRITICAL: 'bg-red-100 text-red-700 border-red-200',
    HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
    MEDIUM: 'bg-cloud-soft text-cloud-ink border-cloud-deep',
    LOW: 'bg-cloud-soft text-cloud-muted border-cloud-deep',
  } as const;
  return (
    <span
      className={`text-[10px] uppercase tracking-wide font-medium border rounded px-1.5 py-0.5 ${map[priority]}`}
    >
      {priority}
    </span>
  );
}

function CurrentProjectRow({ project }: { project: CurrentProject }) {
  return (
    <li className="px-4 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/projects/${project.id}`}
          className="text-sm font-medium text-cloud-ink hover:text-tyrian truncate"
        >
          {project.name}
        </Link>
        <span className="text-[10px] uppercase tracking-wide text-cloud-muted border border-cloud-deep rounded px-1.5 py-0.5">
          {project.role}
        </span>
      </div>
      <div className="mt-0.5 flex items-center gap-3 text-xs text-cloud-muted">
        <span>{project.membersCount} members</span>
        <span>·</span>
        <span>{project.starsCount} stars</span>
      </div>
    </li>
  );
}

function Insights({ summary }: { summary: ActivitySummary }) {
  const items: { tone: 'good' | 'warn' | 'info'; text: string }[] = [];

  if (summary.postsThisWeek === 0) {
    items.push({ tone: 'warn', text: "You haven't posted this week. Share what you're working on." });
  } else if (summary.postsThisWeek >= 3) {
    items.push({ tone: 'good', text: `Great pace — ${summary.postsThisWeek} posts this week.` });
  }

  if (summary.reputationDeltaThisWeek > 0) {
    items.push({
      tone: 'good',
      text: `+${summary.reputationDeltaThisWeek} reputation in the last 7 days.`,
    });
  }

  const overdue = summary.upcomingTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date(new Date().toDateString()),
  ).length;
  if (overdue > 0) {
    items.push({ tone: 'warn', text: `${overdue} task(s) overdue — consider rescheduling.` });
  } else if (summary.upcomingDeadlines > 0) {
    items.push({
      tone: 'info',
      text: `${summary.upcomingDeadlines} deadline(s) within the next 7 days.`,
    });
  }

  if (summary.unreadMessages >= 5) {
    items.push({
      tone: 'info',
      text: `${summary.unreadMessages} unread messages. Catch up when you can.`,
    });
  }

  if (summary.openTasks === 0 && summary.currentProjects > 0) {
    items.push({ tone: 'good', text: 'All assigned tasks are clear. Nice.' });
  }

  if (items.length === 0) {
    return <Empty text="Nothing urgent right now." />;
  }

  const toneClass = {
    good: 'border-l-moss-velvet text-cloud-ink',
    warn: 'border-l-banana-deep text-cloud-ink',
    info: 'border-l-tyrian text-cloud-ink',
  } as const;

  return (
    <ul className="px-4 py-3 space-y-2">
      {items.map((it, i) => (
        <li
          key={i}
          className={`text-sm border-l-2 pl-3 py-0.5 ${toneClass[it.tone]}`}
        >
          {it.text}
        </li>
      ))}
    </ul>
  );
}

function formatDelta(n: number): string {
  if (n > 0) return `+${n}`;
  if (n < 0) return `${n}`;
  return '0';
}
