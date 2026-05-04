'use client';

import Link from 'next/link';
import { Check, Zap, Users, Building2, Sparkles } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { SubscriptionTier } from '@/types';

const TIER_ICONS: Record<SubscriptionTier, React.ElementType> = {
  FREE: Sparkles, PRO: Zap, TEAM: Users, BUSINESS: Building2,
};

const TIER_COLORS: Record<SubscriptionTier, string> = {
  FREE:     'border-retro-ink/15',
  PRO:      'border-tyrian/40 ring-1 ring-tyrian/20',
  TEAM:     'border-retro-ink/15',
  BUSINESS: 'border-retro-ink/15',
};

interface LandingPlan {
  tier: SubscriptionTier;
  name: string;
  price: number;
  desc: string;
  features: string[];
  highlighted?: boolean;
}

const LANDING_PLANS: LandingPlan[] = [
  {
    tier: 'FREE',
    name: 'Free',
    price: 0,
    desc: 'Everything you need to get started',
    features: ['Up to 3 public projects', 'Social feed & posts', 'Realtime chat', 'Community membership', 'Job board access'],
  },
  {
    tier: 'PRO',
    name: 'Pro',
    price: 9,
    desc: 'For serious developers and creators',
    highlighted: true,
    features: ['Unlimited projects', 'AI-powered hints', 'Advanced analytics', 'Custom profile badge', 'Priority support'],
  },
  {
    tier: 'TEAM',
    name: 'Team',
    price: 29,
    desc: 'Built for teams that ship together',
    features: ['Everything in Pro', 'Up to 25 members', 'Shared workspace', 'Team billing', 'Dedicated onboarding'],
  },
  {
    tier: 'BUSINESS',
    name: 'Business',
    price: 99,
    desc: 'Enterprise-grade for growing companies',
    features: ['Everything in Team', 'Unlimited members', 'Hiring tools', 'Company branding', 'Account manager'],
  },
];

export function LandingPricingSection() {
  const t = useT();

  return (
    <section id="pricing" className="bg-retro-bg-alt py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-banana-soft text-moss-deep text-xs font-medium tracking-wider uppercase mb-4">
            {t.landing.lpricingBadge}
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-retro-ink mb-4">
            {t.landing.lpricingHeadline}
          </h2>
          <p className="text-retro-text-muted text-lg max-w-xl mx-auto">
            {t.landing.lpricingSubtitle}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {LANDING_PLANS.map((plan, i) => {
            const Icon = TIER_ICONS[plan.tier];
            return (
              <ScrollReveal key={plan.tier} delay={i * 0.08}>
                <div
                  className={cn(
                    'relative flex flex-col h-full rounded-2xl border bg-retro-bg p-6 transition-shadow hover:shadow-lg',
                    TIER_COLORS[plan.tier],
                  )}
                >
                  {plan.highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full bg-tyrian text-cloud">
                      Most popular
                    </span>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <Icon size={17} className="text-retro-ink/60" />
                    <span className="font-semibold text-retro-ink text-sm">{plan.name}</span>
                  </div>

                  <div className="flex items-baseline gap-1 mb-2">
                    {plan.price === 0 ? (
                      <span className="text-3xl font-bold font-serif text-retro-ink">Free</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold font-serif text-retro-ink">${plan.price}</span>
                        <span className="text-xs text-retro-text-muted">/mo</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-retro-text-muted mb-5">{plan.desc}</p>

                  <ul className="flex-1 space-y-2 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-retro-ink/80">
                        <Check size={12} className="shrink-0 mt-0.5 text-tyrian" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/register"
                    className={cn(
                      'block text-center text-sm font-medium py-2.5 rounded-full transition-all',
                      plan.highlighted
                        ? 'bg-tyrian hover:bg-tyrian-soft text-cloud shadow-tyrian/20 shadow-md'
                        : 'border border-retro-ink/20 text-retro-ink hover:border-tyrian hover:text-tyrian',
                    )}
                  >
                    {plan.price === 0 ? t.landing.lpricingCTAFree : t.landing.lpricingCTAPaid}
                  </Link>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
