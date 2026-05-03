'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const DISMISSED_KEY = 'synora.push.dismissed';

export function PushPermissionPrompt() {
  const { state, loading, subscribe } = usePushNotifications();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (state !== 'default') return;
    if (sessionStorage.getItem(DISMISSED_KEY)) return;
    // Show after 3 s so it doesn't interrupt initial page load
    const t = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(t);
  }, [state]);

  function dismiss() {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  }

  async function handleEnable() {
    const ok = await subscribe();
    if (ok) setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+64px)] lg:bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
      <div className="flex items-start gap-3 bg-surface-secondary border border-border-default rounded-xl shadow-xl p-4">
        <div className="shrink-0 w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center">
          <Bell size={16} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-content-primary">Enable notifications</p>
          <p className="text-xs text-content-secondary mt-0.5">
            Get notified about likes, comments, and mentions.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleEnable}
              disabled={loading}
              className="px-3 py-1.5 bg-accent text-white text-xs font-medium rounded-lg hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Enabling…' : 'Enable'}
            </button>
            <button
              onClick={dismiss}
              className="px-3 py-1.5 text-xs text-content-secondary hover:text-content-primary transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={dismiss}
          aria-label="Close"
          className="shrink-0 p-1 rounded text-content-tertiary hover:text-content-secondary transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
