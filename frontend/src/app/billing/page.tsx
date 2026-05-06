'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CreditCard, Zap, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { PLANS } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:    'bg-success/20 text-success',
  TRIAL:     'bg-info/20 text-info',
  CANCELLED: 'bg-warning/20 text-warning',
  EXPIRED:   'bg-danger/20 text-danger',
};

export default function BillingPage() {
  const { subscription, loading, cancel } = useSubscription();
  const [cancelling, setCancelling] = useState(false);
  const [cancelDone, setCancelDone] = useState(false);

  const plan = PLANS.find((p) => p.tier === (subscription?.tier ?? 'FREE')) ?? PLANS[0];

  async function handleCancel() {
    if (!confirm('Cancel your subscription? You will be downgraded to Free at the end of the billing period.')) return;
    setCancelling(true);
    try {
      await cancel();
      setCancelDone(true);
    } finally {
      setCancelling(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-feed mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-2 text-cloud-ink">
          <CreditCard size={20} />
          <h1 className="text-lg font-semibold">Billing & Subscription</h1>
        </div>

        {/* Current plan */}
        <div className="rounded-xl border border-cloud-deep bg-cloud-soft p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-cloud-muted uppercase tracking-widest font-medium mb-1">Current plan</p>
              <p className="text-2xl font-bold text-cloud-ink">{plan.name}</p>
              {plan.price > 0 && (
                <p className="text-sm text-cloud-muted">${plan.price}/month</p>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              {subscription && (
                <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', STATUS_STYLES[subscription.status] ?? 'bg-surface-tertiary text-content-secondary')}>
                  {subscription.status}
                </span>
              )}
              {!loading && plan.tier !== 'BUSINESS' && (
                <Link href="/pricing">
                  <Button size="sm" icon={<Zap size={13} />}>
                    Upgrade
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {subscription?.expiresAt && (
            <div className="flex items-center gap-2 text-xs text-cloud-muted">
              <Calendar size={13} />
              <span>Renews on {format(new Date(subscription.expiresAt), 'MMMM d, yyyy')}</span>
            </div>
          )}

          {cancelDone && (
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle2 size={14} />
              Subscription cancelled. You&apos;ll have access until the billing period ends.
            </div>
          )}

          {plan.tier !== 'FREE' && subscription?.status === 'ACTIVE' && !cancelDone && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelling}
              className="text-xs text-danger hover:underline disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel subscription'}
            </button>
          )}
        </div>

        {/* Features */}
        <div className="rounded-xl border border-cloud-deep bg-cloud-soft p-5">
          <p className="text-sm font-medium text-cloud-ink mb-3">Included in your plan</p>
          <ul className="space-y-2">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-cloud-ink/80">
                <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-success" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Payment methods */}
        <div className="rounded-xl border border-cloud-deep bg-cloud-soft p-5">
          <p className="text-sm font-medium text-cloud-ink mb-1">Payment methods</p>
          <div className="flex items-center gap-2 text-xs text-cloud-muted mt-2">
            <AlertCircle size={13} />
            No payment methods on file. (Payments coming soon.)
          </div>
        </div>

        {/* Invoices */}
        <div className="rounded-xl border border-cloud-deep bg-cloud-soft p-5">
          <p className="text-sm font-medium text-cloud-ink mb-1">Invoices</p>
          <p className="text-xs text-cloud-muted mt-2">No invoices yet.</p>
        </div>
      </div>
    </AppShell>
  );
}
