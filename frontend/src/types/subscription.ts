export type SubscriptionTier = 'FREE' | 'PRO' | 'TEAM' | 'BUSINESS';
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'TRIAL';

export interface SubscriptionInfo {
  id?: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  startedAt?: string;
  expiresAt?: string;
  cancelledAt?: string;
}

export interface PlanFeature {
  label: string;
  included: boolean;
}

export interface Plan {
  tier: SubscriptionTier;
  name: string;
  price: number; // USD/month, 0 = free
  description: string;
  features: string[];
  highlighted?: boolean;
}

export const PLANS: Plan[] = [
  {
    tier: 'FREE',
    name: 'Free',
    price: 0,
    description: 'Everything you need to get started',
    features: [
      'Up to 3 public projects',
      'Community feed & posts',
      'Real-time chat & messaging',
      'Basic reputation system',
      'Job board access',
      'Community membership',
    ],
  },
  {
    tier: 'PRO',
    name: 'Pro',
    price: 9,
    description: 'For serious developers and creators',
    highlighted: true,
    features: [
      'Unlimited projects (public & private)',
      'AI-powered code review hints',
      'Advanced analytics dashboard',
      'Priority support',
      'Custom profile badge',
      'Early access to new features',
    ],
  },
  {
    tier: 'TEAM',
    name: 'Team',
    price: 29,
    description: 'Built for teams that ship together',
    features: [
      'Everything in Pro',
      'Up to 25 team members',
      'Shared team workspace',
      'Project boosting & visibility',
      'Team billing & invoicing',
      'Dedicated onboarding',
    ],
  },
  {
    tier: 'BUSINESS',
    name: 'Business',
    price: 99,
    description: 'Enterprise-grade for growing companies',
    features: [
      'Everything in Team',
      'Unlimited team members',
      'Hiring tools & talent search',
      'Company branding & pages',
      'Priority visibility in search',
      'Dedicated account manager',
    ],
  },
];

export const TIER_ORDER: Record<SubscriptionTier, number> = {
  FREE: 0,
  PRO: 1,
  TEAM: 2,
  BUSINESS: 3,
};
