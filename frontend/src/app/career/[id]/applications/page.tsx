'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import type { ApiResponse, PageResponse, JobApplication, ApplicationStatus } from '@/types';

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; icon: React.ReactNode; cls: string }> = {
  PENDING:  { label: 'Pending',  icon: <Clock size={12} />,        cls: 'bg-warning/20 text-warning' },
  REVIEWED: { label: 'Reviewed', icon: <Eye size={12} />,          cls: 'bg-info/20 text-info' },
  ACCEPTED: { label: 'Accepted', icon: <CheckCircle size={12} />,  cls: 'bg-success/20 text-success' },
  REJECTED: { label: 'Rejected', icon: <XCircle size={12} />,      cls: 'bg-danger/20 text-danger' },
};

export default function JobApplicationsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    api.get<ApiResponse<PageResponse<JobApplication>>>(`/career/${id}/applications?page=0&size=50`)
      .then((res) => setApplications(res.data.data.content))
      .catch(() => router.push(`/career/${id}`))
      .finally(() => setLoading(false));
  }, [id, user, router]);

  async function updateStatus(appId: string, status: ApplicationStatus) {
    try {
      await api.patch(`/career/applications/${appId}/status`, { status });
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status } : a)),
      );
    } catch {
      // ignore
    }
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link
          href={`/career/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-content-secondary hover:text-content-primary mb-5 transition-colors"
        >
          <ArrowLeft size={16} /> Back to posting
        </Link>

        <h1 className="text-xl font-bold text-content-primary flex items-center gap-2 mb-6">
          <Users size={20} className="text-accent" />
          Applications ({applications.length})
        </h1>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-surface-secondary rounded-xl animate-pulse" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16 text-content-tertiary">
            <Users size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-content-secondary">No applications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              const s = STATUS_CONFIG[app.status];
              return (
                <div
                  key={app.id}
                  className="bg-surface-secondary border border-border-default rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Avatar
                        name={app.applicantDisplayName || app.applicantUsername}
                        src={app.applicantAvatarUrl || undefined}
                        size="sm"
                      />
                      <div>
                        <Link
                          href={`/profile/${app.applicantUsername}`}
                          className="font-medium text-sm text-content-primary hover:text-accent transition-colors"
                        >
                          {app.applicantDisplayName || app.applicantUsername}
                        </Link>
                        <p className="text-xs text-content-tertiary">@{app.applicantUsername}</p>
                        {app.coverLetter && (
                          <p className="text-xs text-content-secondary mt-2 line-clamp-3">
                            {app.coverLetter}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${s.cls}`}>
                        {s.icon} {s.label}
                      </span>
                      <span className="text-xs text-content-tertiary">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Status actions */}
                  {app.status === 'PENDING' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border-default">
                      <button
                        onClick={() => updateStatus(app.id, 'ACCEPTED')}
                        className="px-3 py-1 text-xs rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors border border-success/20 flex items-center gap-1"
                      >
                        <CheckCircle size={11} /> Accept
                      </button>
                      <button
                        onClick={() => updateStatus(app.id, 'REVIEWED')}
                        className="px-3 py-1 text-xs rounded-lg bg-info/10 text-info hover:bg-info/20 transition-colors border border-info/20 flex items-center gap-1"
                      >
                        <Eye size={11} /> Mark reviewed
                      </button>
                      <button
                        onClick={() => updateStatus(app.id, 'REJECTED')}
                        className="px-3 py-1 text-xs rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors border border-danger/20 flex items-center gap-1"
                      >
                        <XCircle size={11} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
