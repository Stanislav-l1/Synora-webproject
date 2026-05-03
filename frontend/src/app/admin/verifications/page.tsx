'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, Clock, Loader2, BadgeCheck, Building2, GraduationCap, Rocket } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import type { ApiResponse, PageResponse, VerificationInfo, VerificationType } from '@/types';
import { VERIFICATION_LABELS } from '@/types';

const TYPE_ICONS: Record<VerificationType, React.ElementType> = {
  PROFESSIONAL: BadgeCheck,
  COMPANY:      Building2,
  MENTOR:       GraduationCap,
  STARTUP:      Rocket,
};

const TYPE_COLORS: Record<VerificationType, string> = {
  PROFESSIONAL: 'text-[#1d9bf0]',
  COMPANY:      'text-[#7c3aed]',
  MENTOR:       'text-[#059669]',
  STARTUP:      'text-[#f59e0b]',
};

export default function AdminVerificationsPage() {
  const [items, setItems]       = useState<VerificationInfo[]>([]);
  const [loading, setLoading]   = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse<PageResponse<VerificationInfo>>>('/admin/verifications?size=50');
      setItems(res.data.data?.content ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function review(id: string, status: 'APPROVED' | 'REJECTED') {
    setReviewing(id);
    try {
      await api.patch(`/admin/verifications/${id}/review`, {
        status,
        adminNotes: adminNotes[id] || undefined,
      });
      setItems((prev) => prev.filter((v) => v.id !== id));
    } finally {
      setReviewing(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-accent/60" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-content-primary mb-1">Verifications</h1>
      <p className="text-sm text-content-secondary mb-8">
        Pending requests — {items.length} awaiting review
      </p>

      {items.length === 0 ? (
        <div className="text-center py-20 text-content-tertiary text-sm">
          No pending verification requests
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((v) => {
            const Icon = TYPE_ICONS[v.type];
            const iconColor = TYPE_COLORS[v.type];
            const label = VERIFICATION_LABELS[v.type];
            const isReviewing = reviewing === v.id;

            return (
              <div
                key={v.id}
                className="rounded-xl border border-border-default bg-surface-secondary p-5"
              >
                <div className="flex items-start gap-4">
                  <Avatar
                    name={v.displayName || v.username || '?'}
                    src={v.avatarUrl || undefined}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-content-primary">
                        {v.displayName || v.username}
                      </span>
                      <span className="text-xs text-content-tertiary">@{v.username}</span>
                      <span className="text-xs text-content-tertiary">·</span>
                      <span className="text-xs text-content-tertiary">{timeAgo(v.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1">
                      <Icon size={14} className={iconColor} />
                      <span className="text-xs font-medium text-content-secondary">{label}</span>
                    </div>

                    {v.notes && (
                      <p className="text-xs text-content-secondary mt-2 whitespace-pre-wrap bg-surface-tertiary rounded-lg p-3">
                        {v.notes}
                      </p>
                    )}

                    <div className="mt-3">
                      <input
                        type="text"
                        placeholder="Admin notes (optional, shown to user)"
                        value={adminNotes[v.id] ?? ''}
                        onChange={(e) =>
                          setAdminNotes((prev) => ({ ...prev, [v.id]: e.target.value }))
                        }
                        className="w-full rounded-lg border border-border-default bg-surface-input px-3 py-1.5 text-xs text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-1 focus:ring-accent/40"
                      />
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="primary"
                        loading={isReviewing}
                        onClick={() => review(v.id, 'APPROVED')}
                        className="gap-1.5"
                      >
                        <CheckCircle2 size={14} />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        loading={isReviewing}
                        onClick={() => review(v.id, 'REJECTED')}
                        className="gap-1.5"
                      >
                        <XCircle size={14} />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
