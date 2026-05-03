'use client';

import { useState } from 'react';
import { BadgeCheck, Building2, GraduationCap, Rocket, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { useVerification } from '@/hooks/useVerification';
import { VERIFICATION_LABELS, VERIFICATION_DESCRIPTIONS } from '@/types';
import type { VerificationType } from '@/types';
import { cn } from '@/lib/utils';

const TYPE_ICONS: Record<VerificationType, React.ElementType> = {
  PROFESSIONAL: BadgeCheck,
  COMPANY:      Building2,
  MENTOR:       GraduationCap,
  STARTUP:      Rocket,
};

const TYPE_COLORS: Record<VerificationType, string> = {
  PROFESSIONAL: 'border-[#1d9bf0]/40 bg-[#1d9bf0]/5 hover:border-[#1d9bf0]/70',
  COMPANY:      'border-[#7c3aed]/40 bg-[#7c3aed]/5 hover:border-[#7c3aed]/70',
  MENTOR:       'border-[#059669]/40 bg-[#059669]/5 hover:border-[#059669]/70',
  STARTUP:      'border-[#f59e0b]/40 bg-[#f59e0b]/5 hover:border-[#f59e0b]/70',
};

const ICON_COLORS: Record<VerificationType, string> = {
  PROFESSIONAL: 'text-[#1d9bf0]',
  COMPANY:      'text-[#7c3aed]',
  MENTOR:       'text-[#059669]',
  STARTUP:      'text-[#f59e0b]',
};

const TYPES: VerificationType[] = ['PROFESSIONAL', 'COMPANY', 'MENTOR', 'STARTUP'];

export default function VerificationPage() {
  const { verification, loading, submit, cancel } = useVerification();
  const [selected, setSelected]   = useState<VerificationType | null>(null);
  const [notes, setNotes]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  async function handleSubmit() {
    if (!selected) return;
    setError(null);
    setSubmitting(true);
    try {
      await submit(selected, notes.trim() || undefined);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      await cancel();
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 rounded-full border-2 border-tyrian border-t-transparent animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-cloud-ink">Get Verified</h1>
          <p className="mt-1.5 text-sm text-cloud-muted">
            Verification badges help the community trust your identity and expertise.
            Each request is reviewed manually by our team.
          </p>
        </div>

        {/* Current status */}
        {verification && (
          <div className={cn(
            'rounded-xl border p-4 mb-8 flex items-start gap-3',
            verification.status === 'APPROVED' && 'border-success/40 bg-success/5',
            verification.status === 'PENDING'  && 'border-banana/40 bg-banana/5',
            verification.status === 'REJECTED' && 'border-danger/40 bg-danger/5',
          )}>
            {verification.status === 'APPROVED' && <CheckCircle2 size={20} className="text-success shrink-0 mt-0.5" />}
            {verification.status === 'PENDING'  && <Clock        size={20} className="text-banana shrink-0 mt-0.5" />}
            {verification.status === 'REJECTED' && <XCircle      size={20} className="text-danger shrink-0 mt-0.5" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-cloud-ink">
                {verification.status === 'APPROVED' && `Verified as ${VERIFICATION_LABELS[verification.type]}`}
                {verification.status === 'PENDING'  && 'Verification request pending'}
                {verification.status === 'REJECTED' && 'Verification request not approved'}
              </p>
              {verification.adminNotes && (
                <p className="text-xs text-cloud-muted mt-0.5">{verification.adminNotes}</p>
              )}
              {verification.status === 'PENDING' && (
                <Button
                  variant="ghost"
                  size="sm"
                  loading={cancelling}
                  onClick={handleCancel}
                  className="mt-2 text-danger hover:text-danger"
                >
                  Cancel request
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Show form only if no active/pending verification */}
        {(!verification || verification.status === 'REJECTED') && (
          <>
            <h2 className="text-sm font-semibold text-cloud-ink mb-3">Select verification type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {TYPES.map((type) => {
                const Icon = TYPE_ICONS[type];
                const isSelected = selected === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelected(type)}
                    className={cn(
                      'text-left rounded-xl border p-4 transition-all',
                      TYPE_COLORS[type],
                      isSelected && 'ring-2 ring-offset-1 ring-offset-surface-primary',
                      isSelected && type === 'PROFESSIONAL' && 'ring-[#1d9bf0]',
                      isSelected && type === 'COMPANY'      && 'ring-[#7c3aed]',
                      isSelected && type === 'MENTOR'       && 'ring-[#059669]',
                      isSelected && type === 'STARTUP'      && 'ring-[#f59e0b]',
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={16} className={ICON_COLORS[type]} />
                      <span className="text-sm font-semibold text-cloud-ink">{VERIFICATION_LABELS[type]}</span>
                    </div>
                    <p className="text-xs text-cloud-muted">{VERIFICATION_DESCRIPTIONS[type]}</p>
                  </button>
                );
              })}
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium text-cloud-ink mb-1.5 block">
                Additional notes <span className="text-cloud-muted font-normal">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="Share links to your portfolio, LinkedIn, company website, or anything that helps verify your identity…"
                className="w-full rounded-lg border border-cloud-deep bg-surface-secondary px-3 py-2 text-sm text-cloud-ink placeholder:text-cloud-muted resize-none focus:outline-none focus:ring-1 focus:ring-tyrian/50"
              />
              <p className="text-right text-xs text-cloud-muted mt-1">{notes.length}/1000</p>
            </div>

            {error && (
              <p className="text-sm text-danger mb-4">{error}</p>
            )}

            <Button
              size="md"
              variant="primary"
              disabled={!selected}
              loading={submitting}
              onClick={handleSubmit}
              className="w-full sm:w-auto"
            >
              Submit verification request
            </Button>
          </>
        )}
      </div>
    </AppShell>
  );
}
