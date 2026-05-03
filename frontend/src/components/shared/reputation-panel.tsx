'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  BadgeCheck,
  Loader2,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  X,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import type {
  ApiResponse,
  EndorsementSummary,
  PeerReviewContext,
  PeerReviewDto,
  ReputationBreakdown,
} from '@/types';

interface Props {
  userId: string;
  isOwn: boolean;
}

export function ReputationPanel({ userId, isOwn }: Props) {
  const { user } = useAuthStore();
  const isAuthed = !!user;
  const [breakdown, setBreakdown] = useState<ReputationBreakdown | null>(null);
  const [endorsements, setEndorsements] = useState<EndorsementSummary[]>([]);
  const [reviews, setReviews] = useState<PeerReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewOpen, setReviewOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      api.get<ApiResponse<ReputationBreakdown>>(`/users/${userId}/reputation/breakdown`),
      api.get<ApiResponse<EndorsementSummary[]>>(`/users/${userId}/endorsements`),
      api.get<ApiResponse<{ content: PeerReviewDto[] }>>(`/users/${userId}/peer-reviews?size=10`),
    ])
      .then(([brk, end, rev]) => {
        if (cancelled) return;
        setBreakdown(brk.data.data);
        setEndorsements(end.data.data || []);
        setReviews(rev.data.data?.content || []);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [userId]);

  async function toggleEndorse(skillId: number, currently: boolean) {
    try {
      if (currently) {
        await api.delete(`/users/skills/${skillId}/endorse`);
      } else {
        await api.post(`/users/skills/${skillId}/endorse`);
      }
      const res = await api.get<ApiResponse<EndorsementSummary[]>>(
        `/users/${userId}/endorsements`,
      );
      setEndorsements(res.data.data || []);
    } catch {
      /* noop */
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 size={20} className="animate-spin text-tyrian/60" />
      </div>
    );
  }
  if (!breakdown) return null;

  const trust = breakdown.trustLevel;
  const next = breakdown.nextLevel;

  return (
    <div className="space-y-4">
      {/* Trust card */}
      <div className="rounded-xl border border-cloud-deep bg-gradient-to-br from-tyrian/5 to-banana/5 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-tyrian text-cloud">
            <ShieldCheck size={18} />
          </span>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-cloud-muted">Trust level</p>
            <p className="text-lg font-semibold text-cloud-ink">{trust.title}</p>
            <p className="text-xs text-cloud-muted">{trust.description}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-cloud-muted">Reputation</p>
            <p className="text-lg font-semibold text-banana-deep">
              {breakdown.totalReputation.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-3">
          <div className="h-2 w-full bg-cloud-soft rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-tyrian to-tyrian-glow transition-all"
              style={{ width: `${breakdown.trustProgressPercent}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-cloud-muted text-right">
            {next ? `Next: ${next.title}` : 'Top tier reached'}
          </p>
        </div>
      </div>

      {/* Score grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <ScoreCard
          icon={<Activity size={14} className="text-tyrian" />}
          label="Activity"
          value={breakdown.activityScore}
          hint="Last 30d posts + rep events"
        />
        <ScoreCard
          icon={<Sparkles size={14} className="text-tyrian" />}
          label="Contribution"
          value={breakdown.contributionScore}
          hint="Projects owned, joined, tasks done"
        />
        <ScoreCard
          icon={<Star size={14} className="text-tyrian" />}
          label="Quality"
          value={breakdown.qualityScore}
          hint="Endorsements + peer reviews"
        />
        <ScoreCard
          icon={<ThumbsUp size={14} className="text-tyrian" />}
          label="Endorsements"
          value={breakdown.endorsementsCount}
        />
        <ScoreCard
          icon={<BadgeCheck size={14} className="text-tyrian" />}
          label="Peer reviews"
          value={breakdown.peerReviewsCount}
          hint={
            breakdown.peerReviewsCount > 0
              ? `Avg ${breakdown.peerReviewAvg.toFixed(1)} / 5`
              : 'No reviews yet'
          }
        />
      </div>

      {/* Endorsements */}
      <div className="rounded-xl border border-cloud-deep bg-white">
        <header className="flex items-center justify-between px-4 h-11 border-b border-cloud-deep">
          <div className="flex items-center gap-2">
            <ThumbsUp size={16} className="text-tyrian" />
            <h3 className="text-sm font-semibold text-cloud-ink">Skill endorsements</h3>
          </div>
        </header>
        {endorsements.length === 0 ? (
          <p className="px-4 py-8 text-center text-xs text-cloud-muted">
            No skills yet.
          </p>
        ) : (
          <ul className="divide-y divide-cloud-deep">
            {endorsements.map((e) => (
              <li
                key={e.skillId}
                className="px-4 py-2.5 flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-cloud-ink truncate">
                    {e.skillName}
                  </p>
                  <p className="text-xs text-cloud-muted">
                    {e.count} endorsement{e.count === 1 ? '' : 's'}
                    {e.recentEndorsers.length > 0 && (
                      <>
                        {' · '}
                        {e.recentEndorsers
                          .slice(0, 3)
                          .map((u) => u.displayName || `@${u.username}`)
                          .join(', ')}
                      </>
                    )}
                  </p>
                </div>
                {!isOwn && isAuthed && (
                  <Button
                    size="sm"
                    variant={e.endorsedByMe ? 'secondary' : 'primary'}
                    onClick={() => toggleEndorse(e.skillId, e.endorsedByMe)}
                  >
                    {e.endorsedByMe ? 'Endorsed' : 'Endorse'}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Peer reviews */}
      <div className="rounded-xl border border-cloud-deep bg-white">
        <header className="flex items-center justify-between px-4 h-11 border-b border-cloud-deep">
          <div className="flex items-center gap-2">
            <BadgeCheck size={16} className="text-tyrian" />
            <h3 className="text-sm font-semibold text-cloud-ink">Peer reviews</h3>
          </div>
          {!isOwn && isAuthed && (
            <Button size="sm" variant="ghost" onClick={() => setReviewOpen(true)}>
              Leave review
            </Button>
          )}
        </header>
        {reviews.length === 0 ? (
          <p className="px-4 py-8 text-center text-xs text-cloud-muted">
            No peer reviews yet.
          </p>
        ) : (
          <ul className="divide-y divide-cloud-deep">
            {reviews.map((r) => (
              <li key={r.id} className="px-4 py-3 flex items-start gap-3">
                <Avatar
                  name={r.reviewerDisplayName || r.reviewerUsername || '?'}
                  src={r.reviewerAvatarUrl || undefined}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-cloud-ink truncate">
                      {r.reviewerDisplayName || `@${r.reviewerUsername}`}
                    </span>
                    <Stars score={r.score} />
                  </div>
                  <p className="text-[10px] uppercase tracking-wide text-cloud-muted mt-0.5">
                    {r.context}
                  </p>
                  {r.comment && (
                    <p className="mt-1 text-sm text-cloud-ink/80 whitespace-pre-wrap">
                      {r.comment}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {reviewOpen && (
        <PeerReviewModal
          revieweeId={userId}
          onClose={() => setReviewOpen(false)}
          onSaved={(rev) => {
            setReviews((prev) => {
              const without = prev.filter((p) => p.id !== rev.id);
              return [rev, ...without];
            });
            setReviewOpen(false);
          }}
        />
      )}
    </div>
  );
}

function ScoreCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-cloud-deep bg-white p-3">
      <div className="flex items-center gap-1.5 text-xs text-cloud-muted">
        {icon} {label}
      </div>
      <p className="mt-1.5 text-xl font-semibold text-cloud-ink">{value}</p>
      {hint && <p className="text-[10px] text-cloud-muted mt-0.5">{hint}</p>}
    </div>
  );
}

function Stars({ score }: { score: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={12}
          className={n <= score ? 'fill-banana-deep text-banana-deep' : 'text-cloud-deep'}
        />
      ))}
    </span>
  );
}

function PeerReviewModal({
  revieweeId,
  onClose,
  onSaved,
}: {
  revieweeId: string;
  onClose: () => void;
  onSaved: (r: PeerReviewDto) => void;
}) {
  const [score, setScore] = useState(5);
  const [context, setContext] = useState<PeerReviewContext>('GENERAL');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setSaving(true);
    try {
      const res = await api.post<ApiResponse<PeerReviewDto>>(
        `/users/${revieweeId}/peer-reviews`,
        { score, context, comment: comment.trim() || undefined },
      );
      onSaved(res.data.data);
    } catch {
      setError('Could not submit. You may have already reviewed this user.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] bg-moss-deep/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-cloud-deep rounded-xl shadow-2xl overflow-hidden">
        <header className="flex items-center justify-between px-5 h-12 border-b border-cloud-deep bg-cloud-soft">
          <h3 className="text-sm font-semibold text-cloud-ink">Leave a peer review</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-cloud-muted hover:text-cloud-ink"
          >
            <X size={16} />
          </button>
        </header>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs text-cloud-muted mb-1">Score</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setScore(n)}
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                >
                  <Star
                    size={24}
                    className={
                      n <= score
                        ? 'fill-banana-deep text-banana-deep'
                        : 'text-cloud-deep hover:text-banana-deep'
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-cloud-muted mb-1">Context</p>
            <div className="grid grid-cols-2 gap-2">
              {(['PROJECT', 'COURSE', 'MENTORSHIP', 'GENERAL'] as PeerReviewContext[]).map(
                (c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setContext(c)}
                    className={`h-9 px-3 rounded-md border text-xs uppercase tracking-wide transition-colors ${
                      context === c
                        ? 'border-tyrian bg-tyrian/10 text-tyrian font-medium'
                        : 'border-cloud-deep bg-white text-cloud-ink hover:bg-cloud-soft'
                    }`}
                  >
                    {c}
                  </button>
                ),
              )}
            </div>
          </div>

          <div>
            <p className="text-xs text-cloud-muted mb-1">Comment (optional)</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={2000}
              rows={4}
              className="w-full rounded-md border border-cloud-deep bg-white px-3 py-2 text-sm text-cloud-ink focus:outline-none focus:border-tyrian resize-y"
              placeholder="What was it like collaborating with this person?"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <footer className="flex items-center justify-end gap-2 px-5 h-12 border-t border-cloud-deep bg-cloud-soft">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit} loading={saving}>
            Submit review
          </Button>
        </footer>
      </div>
    </div>
  );
}
