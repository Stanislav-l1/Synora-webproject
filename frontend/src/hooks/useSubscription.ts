'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import type { ApiResponse, SubscriptionInfo, SubscriptionTier } from '@/types';
import { TIER_ORDER as tierOrder } from '@/types';

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse<SubscriptionInfo>>('/subscriptions/me');
      setSubscription(res.data.data);
    } catch {
      setSubscription({ tier: 'FREE', status: 'ACTIVE' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const upgrade = useCallback(async (tier: SubscriptionTier) => {
    const res = await api.post<ApiResponse<SubscriptionInfo>>('/subscriptions/upgrade', { tier });
    setSubscription(res.data.data);
    return res.data.data;
  }, []);

  const cancel = useCallback(async () => {
    const res = await api.post<ApiResponse<SubscriptionInfo>>('/subscriptions/cancel');
    setSubscription(res.data.data);
    return res.data.data;
  }, []);

  const hasAccess = useCallback(
    (requiredTier: SubscriptionTier): boolean => {
      const current = subscription?.tier ?? 'FREE';
      return tierOrder[current] >= tierOrder[requiredTier];
    },
    [subscription],
  );

  return { subscription, loading, upgrade, cancel, hasAccess, refresh: fetchSubscription };
}
