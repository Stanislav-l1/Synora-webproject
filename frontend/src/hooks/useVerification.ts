'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import type { ApiResponse, VerificationInfo } from '@/types';

export function useVerification() {
  const [verification, setVerification] = useState<VerificationInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse<VerificationInfo | null>>('/verifications/me');
      setVerification(res.data.data ?? null);
    } catch {
      setVerification(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const submit = useCallback(async (type: string, notes?: string) => {
    const res = await api.post<ApiResponse<VerificationInfo>>('/verifications', { type, notes });
    setVerification(res.data.data);
    return res.data.data;
  }, []);

  const cancel = useCallback(async () => {
    const res = await api.post<ApiResponse<VerificationInfo>>('/verifications/cancel');
    setVerification(res.data.data);
    return res.data.data;
  }, []);

  return { verification, loading, submit, cancel, refresh: fetch };
}
