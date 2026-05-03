'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Zap, Users, Building2, Sparkles } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuthStore } from '@/store/useAuthStore';
import { PLANS, TIER_ORDER } from '@/types';
import type { SubscriptionTier } from '@/types';
import { cn } from '@/lib/utils';

const TIER_ICONS: Record<SubscriptionTier, React.ElementType> = {
  FREE: Sparkles,
  PRO: Zap,
  TEAM: Users,
  BUSINESS: Building2,
};

const TIER_COLORS: Record<SubscriptionTier, string> = {
  FREE:     'from-moss-velvet/40 to-moss-velvet/10 border-moss-velvet',
  PRO:      'from-tyrian/20 to-tyrian/5 border-tyrian/50',
  TEAM:     'from-banana/20 to-banana/5 border-banana/50',
  BUSINESS: 'from-success/10 to-success/5 border-success/40',
};

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { subscription, upgrade, loading } = useSubscription();
  const [upgrading, setUpgrading] = useState<SubscriptionTier | null>(null);

  const currentTier = (subscription?.tier ?? user?.subscriptionTier ?? 'FREE') as SubscriptionTier;

  async function handleUpgrade(tier: SubscriptionTier) {
    if (tier === currentTier) return;
    setUpgrading(tier);
    try {
      await upgrade(tier);
      router.push('/billing');
    } catch {
      // ignore
    } finally {
      setUpgrading(null);
    }
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-cloud-ink">Choose your plan</h1>
          <p className="mt-3 text-cloud-muted text-sm max-w-lg mx-auto">
            Start free and grow with Synora. Upgrade anytime — no commitments.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {PLANS.map((plan) => {
            const Icon = TIER_ICONS[plan.tier];
            const isCurrent = plan.tier === currentTier;
            const isDowngrade = TIER_ORDER[plan.tier] < TIER_ORDER[currentTier];
            const isUpgrading = upgrading === plan.tier;

            return (
              <div
                key={plan.tier}
                className={cn(
                  'relative flex flex-col rounded-xl border bg-gradient-to-b p-5 transition-shadow',
                  TIER_COLORS[plan.tier],
                  plan.highlighted && 'ring-2 ring-tyrian/60 shadow-lg shadow-tyrian/10',
                )}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full bg-tyrian text-white">
                    Most popular
                  </span>
                )}

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={18} className="text-cloud-ink/70" />
                    <span className="text-sm font-semibold text-cloud-ink">{plan.name}</span>
                    {isCurrent && (
                      <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-success/20 text-success font-medium">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    {plan.price === 0 ? (
                      <span className="text-2xl font-bold text-cloud-ink">Free</span>
                    ) : (
                      <>
                        <span className="text-2xl font-bold text-cloud-ink">${plan.price}</span>
                        <span className="text-xs text-cloud-muted">/month</span>
                      </>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-cloud-muted">{plan.description}</p>
                </div>

                <ul className="flex-1 space-y-2 mb-5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-cloud-ink/80">
                      <Check size={13} className="shrink-0 mt-0.5 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  size="sm"
                  variant={plan.highlighted ? 'primary' : 'secondary'}
                  loading={isUpgrading}
                  disabled={isCurrent || isDowngrade || loading}
                  onClick={() => handleUpgrade(plan.tier)}
                  className="w-full"
                >
                  {isCurrent ? 'Current plan' : isDowngrade ? 'Downgrade' : `Upgrade to ${plan.name}`}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-cloud-muted mt-8">
          All plans include a 14-day free trial. Cancel anytime.
          Payments processed securely. Prices shown in USD.
        </p>
      </div>
    </AppShell>
  );
}
