'use client';

import { useState, useEffect, useCallback } from 'react';
import { Flag, CheckCircle, XCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import type { ApiResponse, PageResponse, AdminReport } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const STATUS_OPTS = [
  { value: '',          label: 'All' },
  { value: 'PENDING',   label: 'Pending' },
  { value: 'RESOLVED',  label: 'Resolved' },
  { value: 'DISMISSED', label: 'Dismissed' },
];

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-warning/10 text-warning border-warning/20',
  RESOLVED:  'bg-success/10 text-success border-success/20',
  DISMISSED: 'bg-surface-tertiary text-content-tertiary border-border-default',
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [page,    setPage]    = useState(0);
  const [status,  setStatus]  = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [acting,  setActing]  = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (status) {
        res = await api.get<ApiResponse<PageResponse<AdminReport>>>(
          `/admin/reports/by-status?status=${status}&page=${page}&size=20`
        );
      } else {
        res = await api.get<ApiResponse<PageResponse<AdminReport>>>(
          `/admin/reports?page=${page}&size=20`
        );
      }
      const data = res.data.data;
      setReports(data.content);
      setTotal(data.totalElements);
      setPages(data.totalPages);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  async function review(id: number, newStatus: 'RESOLVED' | 'DISMISSED') {
    setActing(id);
    try {
      await api.patch(`/admin/reports/${id}/review?status=${newStatus}`);
      setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: newStatus } : r));
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-content-primary">Reports</h1>
          <p className="text-sm text-content-secondary mt-0.5">
            {total.toLocaleString()} total
          </p>
        </div>

        <div className="flex rounded-lg border border-border-default overflow-hidden">
          {STATUS_OPTS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setStatus(opt.value); setPage(0); }}
              className={`px-4 py-1.5 text-sm transition-colors ${
                status === opt.value
                  ? 'bg-accent text-white'
                  : 'text-content-secondary hover:text-content-primary hover:bg-surface-tertiary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-accent/60" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 text-content-tertiary">
          <Flag size={32} className="mx-auto mb-3 opacity-30" />
          <p>No reports found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div
              key={r.id}
              className="bg-surface-secondary border border-border-default rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[r.status] ?? ''}`}>
                      {r.status}
                    </span>
                    <span className="text-xs bg-surface-tertiary text-content-secondary border border-border-default rounded-full px-2 py-0.5">
                      {r.entityType}
                    </span>
                    <span className="text-xs text-content-tertiary">
                      #{r.id} — reported by <strong className="text-content-secondary">@{r.reporterUsername}</strong>
                    </span>
                  </div>

                  <p className="text-sm font-medium text-content-primary">{r.reason}</p>
                  {r.description && (
                    <p className="text-xs text-content-secondary mt-1 line-clamp-2">{r.description}</p>
                  )}
                  <p className="text-xs text-content-tertiary mt-2">
                    {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                    {r.reviewerUsername && (
                      <> · reviewed by <strong className="text-content-secondary">@{r.reviewerUsername}</strong></>
                    )}
                  </p>
                </div>

                {r.status === 'PENDING' && (
                  <div className="flex items-center gap-2 shrink-0">
                    {acting === r.id ? (
                      <Loader2 size={16} className="animate-spin text-accent/60" />
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => review(r.id, 'RESOLVED')}
                          className="flex items-center gap-1 text-xs text-success hover:text-success/80 transition-colors"
                        >
                          <CheckCircle size={14} /> Resolve
                        </button>
                        <button
                          type="button"
                          onClick={() => review(r.id, 'DISMISSED')}
                          className="flex items-center gap-1 text-xs text-content-tertiary hover:text-content-secondary transition-colors"
                        >
                          <XCircle size={14} /> Dismiss
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between mt-6 text-sm text-content-secondary">
          <span>Page {page + 1} of {pages}</span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>
              <ChevronLeft size={14} />
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= pages - 1}>
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
