'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase, FileText, Bookmark, Clock, CheckCircle, XCircle,
  Eye, ChevronRight, Loader2, Plus, Users,
} from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse, PageResponse, JobPosting, JobApplication, ApplicationStatus } from '@/types';
import { JOB_TYPE_LABELS, JOB_TYPE_COLORS } from '@/types';

type Tab = 'applications' | 'postings' | 'saved';

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; icon: React.ElementType; cls: string }> = {
  PENDING:  { label: 'Pending',  icon: Clock,         cls: 'text-warning' },
  REVIEWED: { label: 'Reviewed', icon: Eye,           cls: 'text-info' },
  ACCEPTED: { label: 'Accepted', icon: CheckCircle,   cls: 'text-success' },
  REJECTED: { label: 'Rejected', icon: XCircle,       cls: 'text-danger' },
};

function ApplicationRow({ app }: { app: JobApplication }) {
  const cfg = STATUS_CONFIG[app.status];
  const Icon = cfg.icon;
  return (
    <Link href={`/career/${app.jobId}`}>
      <div className="flex items-center justify-between px-5 py-4 hover:bg-surface-tertiary transition-colors border-b border-border-default last:border-0">
        <div className="min-w-0">
          <p className="font-medium text-content-primary text-sm truncate">{app.jobTitle}</p>
          <p className="text-xs text-content-tertiary mt-0.5">
            Applied {new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          {app.coverLetter && (
            <p className="text-xs text-content-tertiary mt-1 line-clamp-1 italic">&ldquo;{app.coverLetter}&rdquo;</p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <span className={cn('flex items-center gap-1 text-xs font-medium', cfg.cls)}>
            <Icon size={13} /> {cfg.label}
          </span>
          <ChevronRight size={14} className="text-content-tertiary" />
        </div>
      </div>
    </Link>
  );
}

function PostingRow({ job, onDelete }: { job: JobPosting; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this posting?')) return;
    setDeleting(true);
    try {
      await api.delete(`/career/${job.id}`);
      onDelete(job.id);
    } catch {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center justify-between px-5 py-4 hover:bg-surface-tertiary transition-colors border-b border-border-default last:border-0">
      <Link href={`/career/${job.id}`} className="min-w-0 flex-1">
        <div className="flex items-start gap-3">
          <div className="min-w-0">
            <p className="font-medium text-content-primary text-sm truncate">{job.title}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <Badge variant="default" className={cn('text-xs', JOB_TYPE_COLORS[job.type])}>
                {JOB_TYPE_LABELS[job.type]}
              </Badge>
              <span className={cn('text-xs font-medium', job.status === 'OPEN' ? 'text-success' : 'text-content-tertiary')}>
                {job.status}
              </span>
            </div>
          </div>
        </div>
      </Link>
      <div className="flex items-center gap-4 shrink-0 ml-4">
        <span className="flex items-center gap-1 text-xs text-content-tertiary">
          <Users size={12} /> {job.applicationsCount}
        </span>
        <span className="flex items-center gap-1 text-xs text-content-tertiary">
          <Eye size={12} /> {job.viewsCount}
        </span>
        <Link href={`/career/${job.id}/applications`}>
          <Button variant="ghost" size="sm">Applicants</Button>
        </Link>
        <Link href={`/career/${job.id}/edit`}>
          <Button variant="ghost" size="sm">Edit</Button>
        </Link>
        <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}

function SavedJobRow({ job, onUnsave }: { job: JobPosting; onUnsave: (id: string) => void }) {
  const [unsaving, setUnsaving] = useState(false);

  async function handleUnsave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setUnsaving(true);
    try {
      await api.delete(`/career/${job.id}/save`);
      onUnsave(job.id);
    } catch {
      setUnsaving(false);
    }
  }

  return (
    <div className="flex items-center justify-between px-5 py-4 hover:bg-surface-tertiary transition-colors border-b border-border-default last:border-0">
      <Link href={`/career/${job.id}`} className="min-w-0 flex-1">
        <p className="font-medium text-content-primary text-sm truncate">{job.title}</p>
        <p className="text-xs text-content-tertiary mt-0.5">
          {job.company || job.authorDisplayName || job.authorUsername}
          {job.remote && <span className="ml-2 text-success">· Remote</span>}
        </p>
      </Link>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        <Badge variant="default" className={cn('text-xs', JOB_TYPE_COLORS[job.type])}>
          {JOB_TYPE_LABELS[job.type]}
        </Badge>
        <Button variant="ghost" size="sm" loading={unsaving} onClick={handleUnsave}>
          Unsave
        </Button>
      </div>
    </div>
  );
}

export default function MyCareerPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('applications');
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [postings, setPostings]         = useState<JobPosting[]>([]);
  const [saved, setSaved]               = useState<JobPosting[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    Promise.all([
      api.get<ApiResponse<PageResponse<JobApplication>>>('/career/my/applications?size=50'),
      api.get<ApiResponse<PageResponse<JobPosting>>>('/career/my/postings?size=50'),
      api.get<ApiResponse<PageResponse<JobPosting>>>('/career/my/saved?size=50'),
    ]).then(([a, p, s]) => {
      setApplications(a.data.data.content);
      setPostings(p.data.data.content);
      setSaved(s.data.data.content);
    }).finally(() => setLoading(false));
  }, [user, router]);

  const tabs = [
    { id: 'applications' as Tab, label: 'My Applications', count: applications.length, icon: FileText },
    { id: 'postings'     as Tab, label: 'My Postings',     count: postings.length,     icon: Briefcase },
    { id: 'saved'        as Tab, label: 'Saved Jobs',       count: saved.length,        icon: Bookmark },
  ];

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-content-primary flex items-center gap-2">
              <Briefcase size={20} className="text-accent" /> My Career
            </h1>
            <p className="text-sm text-content-secondary mt-0.5">Track your applications and postings</p>
          </div>
          <Link href="/career/post">
            <Button variant="primary" size="sm" icon={<Plus size={15} />}>Post a Job</Button>
          </Link>
        </div>

        {/* Stats summary */}
        {!loading && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-xl border border-border-default bg-surface-secondary p-4 text-center">
              <p className="text-2xl font-bold text-content-primary">{applications.length}</p>
              <p className="text-xs text-content-tertiary mt-0.5">Applications sent</p>
            </div>
            <div className="rounded-xl border border-border-default bg-surface-secondary p-4 text-center">
              <p className="text-2xl font-bold text-content-primary">
                {applications.filter(a => a.status === 'ACCEPTED').length}
              </p>
              <p className="text-xs text-content-tertiary mt-0.5">Accepted</p>
            </div>
            <div className="rounded-xl border border-border-default bg-surface-secondary p-4 text-center">
              <p className="text-2xl font-bold text-content-primary">{postings.length}</p>
              <p className="text-xs text-content-tertiary mt-0.5">Jobs posted</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-border-default">
          {tabs.map(({ id, label, count, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                tab === id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-content-secondary hover:text-content-primary',
              )}
            >
              <Icon size={14} />
              {label}
              {count > 0 && (
                <span className={cn(
                  'ml-1 px-1.5 py-0.5 text-xs rounded-full',
                  tab === id ? 'bg-accent/20 text-accent' : 'bg-surface-tertiary text-content-tertiary',
                )}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent/60" />
          </div>
        ) : (
          <div className="rounded-xl border border-border-default bg-surface-secondary overflow-hidden">
            {tab === 'applications' && (
              applications.length === 0
                ? <EmptyState icon={FileText} text="No applications yet" sub="Browse jobs and apply" href="/career" cta="Browse Jobs" />
                : applications.map(a => <ApplicationRow key={a.id} app={a} />)
            )}
            {tab === 'postings' && (
              postings.length === 0
                ? <EmptyState icon={Briefcase} text="No postings yet" sub="Post a job or opportunity" href="/career/post" cta="Post a Job" />
                : postings.map(j => <PostingRow key={j.id} job={j} onDelete={id => setPostings(p => p.filter(x => x.id !== id))} />)
            )}
            {tab === 'saved' && (
              saved.length === 0
                ? <EmptyState icon={Bookmark} text="No saved jobs" sub="Bookmark interesting postings to review later" href="/career" cta="Browse Jobs" />
                : saved.map(j => <SavedJobRow key={j.id} job={j} onUnsave={id => setSaved(s => s.filter(x => x.id !== id))} />)
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function EmptyState({ icon: Icon, text, sub, href, cta }: {
  icon: React.ElementType; text: string; sub: string; href: string; cta: string;
}) {
  return (
    <div className="py-16 text-center">
      <Icon size={36} className="mx-auto mb-3 text-content-tertiary opacity-40" />
      <p className="text-sm font-medium text-content-secondary">{text}</p>
      <p className="text-xs text-content-tertiary mt-1 mb-4">{sub}</p>
      <Link href={href}>
        <Button variant="secondary" size="sm">{cta}</Button>
      </Link>
    </div>
  );
}
