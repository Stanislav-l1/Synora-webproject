'use client';

import { CreditCard } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';

export default function BillingPage() {
  return (
    <AppShell>
      <div className="max-w-feed mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-2 text-cloud-ink">
          <CreditCard size={20} />
          <h1 className="text-lg font-semibold">Billing</h1>
        </div>

        <div className="rounded-lg border border-cloud-deep bg-cloud-soft p-6">
          <p className="text-sm text-cloud-muted">Current plan</p>
          <p className="text-xl font-semibold text-cloud-ink mt-1">Free</p>
          <p className="text-sm text-cloud-ink/70 mt-3">
            Paid plans with private repositories, advanced analytics and team billing are on the
            roadmap.
          </p>
        </div>

        <div className="rounded-lg border border-cloud-deep bg-white p-6">
          <p className="text-sm font-medium text-cloud-ink">Payment methods</p>
          <p className="text-sm text-cloud-muted mt-1">No payment methods on file.</p>
        </div>

        <div className="rounded-lg border border-cloud-deep bg-white p-6">
          <p className="text-sm font-medium text-cloud-ink">Invoices</p>
          <p className="text-sm text-cloud-muted mt-1">No invoices yet.</p>
        </div>
      </div>
    </AppShell>
  );
}
