'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Briefcase, MapPin, Globe, ArrowLeft, Eye, Users, ExternalLink,
  CheckCircle, Clock, Send, Trash2, Edit,
} from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import type { ApiResponse, JobPosting } from '@/types';
import { JOB_TYPE_LABELS, JOB_TYPE_COLORS } from '@/types';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);

  useEffect(() => {
    api.get<ApiResponse<JobPosting>>(`/career/${id}`)
      .then((res) => setJob(res.data.data))
      .catch(() => router.push('/career'))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleApply() {
    if (!job) return;
    setApplying(true);
    try {
      await api.post(`/career/${job.id}/apply`, { coverLetter: coverLetter || undefined });
      setJob((j) => j ? { ...j, applied: true, applicationsCount: j.applicationsCount + 1 } : j);
      setShowApplyForm(false);
    } catch {
      // ignore
    } finally {
      setApplying(false);
    }
  }

  async function handleWithdraw() {
    if (!job) return;
    setWithdrawing(true);
    try {
      await api.delete(`/career/${job.id}/apply`);
      setJob((j) => j ? { ...j, applied: false, applicationsCount: Math.max(0, j.applicationsCount - 1) } : j);
    } catch {
      // ignore
    } finally {
      setWithdrawing(false);
    }
  }

  async function handleDelete() {
    if (!job || !confirm('Delete this posting?')) return;
    try {
      await api.delete(`/career/${job.id}`);
      router.push('/career');
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="h-8 bg-surface-secondary rounded w-1/4 mb-6 animate-pulse" />
          <div className="h-64 bg-surface-secondary rounded-xl animate-pulse" />
        </div>
      </AppShell>
    );
  }

  if (!job) return null;

  const isOwner = user?.id === job.authorId;

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Back */}
        <Link
          href="/career"
          className="inline-flex items-center gap-1.5 text-sm text-content-secondary hover:text-content-primary mb-5 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Career
        </Link>

        {/* Main card */}
        <div className="bg-surface-secondary border border-border-default rounded-xl p-6 mb-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-3">
              <Avatar
                name={job.authorDisplayName || job.authorUsername}
                src={job.authorAvatarUrl || undefined}
                size="md"
              />
              <div>
                <h1 className="text-xl font-bold text-content-primary">{job.title}</h1>
                <Link
                  href={`/profile/${job.authorUsername}`}
                  className="text-sm text-accent hover:underline"
                >
                  {job.company || job.authorDisplayName || job.authorUsername}
                </Link>
              </div>
            </div>
            <Badge variant="default" className={JOB_TYPE_COLORS[job.type]}>
              {JOB_TYPE_LABELS[job.type]}
            </Badge>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-4 text-sm text-content-secondary mb-5">
            {job.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={14} /> {job.location}
              </span>
            )}
            {job.remote && (
              <span className="flex items-center gap-1.5 text-success">
                <Globe size={14} /> Remote
              </span>
            )}
            {job.salaryMin && (
              <span className="flex items-center gap-1.5">
                {job.currency} {job.salaryMin.toLocaleString()}
                {job.salaryMax ? `–${job.salaryMax.toLocaleString()}` : '+'}
              </span>
            )}
            {job.experienceYears != null && (
              <span>{job.experienceYears}+ years experience</span>
            )}
            <span className="flex items-center gap-1.5">
              <Users size={14} /> {job.applicationsCount} applicant{job.applicationsCount !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye size={14} /> {job.viewsCount} views
            </span>
          </div>

          {/* Description */}
          <div className="prose prose-invert max-w-none text-content-secondary text-sm leading-relaxed whitespace-pre-wrap mb-5">
            {job.description}
          </div>

          {/* Skills */}
          {job.skills.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-2">
                Required skills
              </p>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 text-sm rounded-full bg-surface-tertiary text-content-secondary border border-border-default"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border-default">
            {isOwner ? (
              <>
                <Link href={`/career/${job.id}/applications`}>
                  <Button variant="secondary" size="sm" icon={<Users size={14} />}>
                    Applications ({job.applicationsCount})
                  </Button>
                </Link>
                <Link href={`/career/${job.id}/edit`}>
                  <Button variant="ghost" size="sm" icon={<Edit size={14} />}>
                    Edit
                  </Button>
                </Link>
                <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={handleDelete}>
                  Delete
                </Button>
              </>
            ) : job.applicationUrl ? (
              <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="sm" icon={<ExternalLink size={14} />}>
                  Apply Externally
                </Button>
              </a>
            ) : user ? (
              job.applied ? (
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-sm text-success">
                    <CheckCircle size={16} /> Applied
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleWithdraw}
                    loading={withdrawing}
                  >
                    Withdraw
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Send size={14} />}
                  onClick={() => setShowApplyForm(!showApplyForm)}
                >
                  Apply
                </Button>
              )
            ) : (
              <Link href="/login">
                <Button variant="primary" size="sm">
                  Sign in to apply
                </Button>
              </Link>
            )}

            <span className="ml-auto text-xs text-content-tertiary">
              Posted {new Date(job.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Apply form */}
        {showApplyForm && !job.applied && (
          <div className="bg-surface-secondary border border-border-accent rounded-xl p-5">
            <h3 className="font-semibold text-content-primary mb-3 flex items-center gap-2">
              <Send size={16} className="text-accent" /> Apply to {job.title}
            </h3>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Cover letter (optional) — introduce yourself, describe your relevant experience..."
              rows={5}
              className="w-full px-3 py-2.5 bg-surface-input border border-border-default rounded-lg text-sm text-content-primary placeholder:text-content-tertiary focus:outline-none focus:border-border-accent resize-none mb-3"
            />
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={handleApply} loading={applying} icon={<Send size={14} />}>
                Submit Application
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowApplyForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
