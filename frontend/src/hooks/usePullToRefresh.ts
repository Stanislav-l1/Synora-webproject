'use client';

import { useEffect, useRef, useState } from 'react';

interface Options {
  onRefresh: () => Promise<void>;
  threshold?: number; // px to pull before triggering
}

export function usePullToRefresh({ onRefresh, threshold = 72 }: Options) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const startY = useRef<number | null>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const el = document.documentElement;

    function onTouchStart(e: TouchEvent) {
      if (window.scrollY > 0) return;
      startY.current = e.touches[0].clientY;
      isDragging.current = true;
    }

    function onTouchMove(e: TouchEvent) {
      if (!isDragging.current || startY.current === null) return;
      if (window.scrollY > 0) {
        isDragging.current = false;
        return;
      }
      const delta = e.touches[0].clientY - startY.current;
      if (delta < 0) return;
      // Rubber-band effect: diminishing resistance
      const dist = Math.min(delta * 0.5, threshold * 1.5);
      setPullDistance(dist);
      setPulling(dist > 10);
      if (dist > 10) e.preventDefault();
    }

    function onTouchEnd() {
      if (!isDragging.current) return;
      isDragging.current = false;

      if (pullDistance >= threshold) {
        setRefreshing(true);
        setPullDistance(0);
        setPulling(false);
        onRefresh().finally(() => setRefreshing(false));
      } else {
        setPullDistance(0);
        setPulling(false);
      }
      startY.current = null;
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [onRefresh, threshold, pullDistance]);

  return { pulling, refreshing, pullDistance };
}
