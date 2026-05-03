'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import type { SubscriptionTier } from '@/types';
import { PLANS } from '@/types';

interface UpgradeGateProps {
  requiredTier: SubscriptionTier;
  featureName: string;
  children: React.ReactNode;
}

export function UpgradeGate({ requiredTier, featureName, children }: UpgradeGateProps) {
  const { hasAccess, loading } = useSubscription();

  if (loading) return null;
  if (hasAccess(requiredTier)) return <>{children}</>;

  const plan = PLANS.find((p) => p.tier === requiredTier);

  return (
    <div className="relative rounded-xl border border-cloud-deep bg-cloud-soft overflow-hidden">
      {/* Blurred preview */}
      <div className="pointer-events-none select-none blur-sm opacity-40 p-4">{children}</div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface-primary/80 backdrop-blur-sm p-6 text-center">
        <div className="w-10 h-10 rounded-full bg-tyrian/20 flex items-center justify-center">
          <Lock size={18} className="text-tyrian" />
        </div>
        <div>
          <p className="text-sm font-semibold text-cloud-ink">{featureName} requires {plan?.name ?? requiredTier}</p>
          <p className="text-xs text-cloud-muted mt-1">
            Upgrade to unlock this feature and much more.
          </p>
        </div>
        <Link href="/pricing">
          <Button size="sm">Upgrade to {plan?.name ?? requiredTier}</Button>
        </Link>
      </div>
    </div>
  );
}
