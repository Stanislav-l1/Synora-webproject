'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { ContributionData } from '@/types';

interface ContributionGraphProps {
  contributions: ContributionData[];
  className?: string;
}

function getLevel(count: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (max === 0) return 0;
  const pct = count / max;
  if (pct <= 0.15) return 1;
  if (pct <= 0.4) return 2;
  if (pct <= 0.7) return 3;
  return 4;
}

const LEVEL_CLASSES: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'bg-surface-tertiary',
  1: 'bg-accent/20',
  2: 'bg-accent/40',
  3: 'bg-accent/70',
  4: 'bg-accent',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

export function ContributionGraph({ contributions, className }: ContributionGraphProps) {
  const { weeks, maxCount, totalCount, year } = useMemo(() => {
    // Merge all years, use current year if available
    const currentYear = new Date().getFullYear();
    const merged: Record<string, number> = {};
    let year = currentYear;

    for (const cd of contributions) {
      if (cd.year === currentYear) year = currentYear;
      Object.assign(merged, cd.data);
    }

    if (contributions.length > 0 && !contributions.find((c) => c.year === currentYear)) {
      year = contributions[contributions.length - 1].year;
    }

    // Build 52-week grid for the selected year
    const startDate = new Date(`${year}-01-01`);
    // Align to Sunday
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const weeks: { date: string; count: number }[][] = [];
    let max = 0;
    let total = 0;

    for (let w = 0; w < 53; w++) {
      const week: { date: string; count: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + w * 7 + d);
        const key = date.toISOString().slice(0, 10);
        const count = merged[key] ?? 0;
        if (count > max) max = count;
        if (date.getFullYear() === year) total += count;
        week.push({ date: key, count });
      }
      weeks.push(week);
    }

    return { weeks, maxCount: max, totalCount: total, year };
  }, [contributions]);

  // Month label positions
  const monthLabels = useMemo(() => {
    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, col) => {
      const month = new Date(week[0].date).getMonth();
      if (month !== lastMonth) {
        labels.push({ label: MONTHS[month], col });
        lastMonth = month;
      }
    });
    return labels;
  }, [weeks]);

  if (contributions.length === 0) {
    return (
      <div className={cn('rounded-xl bg-surface-secondary border border-border-default p-6 text-center', className)}>
        <p className="text-sm text-content-tertiary">No contribution data yet.</p>
        <p className="text-xs text-content-tertiary mt-1">Connect GitHub or GitLab to display your activity.</p>
      </div>
    );
  }

  return (
    <div className={cn('bg-surface-secondary border border-border-default rounded-xl p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-content-primary">
          {totalCount.toLocaleString()} contributions in {year}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-content-tertiary">
          <span>Less</span>
          {([0, 1, 2, 3, 4] as const).map((l) => (
            <span key={l} className={cn('w-3 h-3 rounded-sm', LEVEL_CLASSES[l])} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-1 ml-8">
            {monthLabels.map(({ label, col }) => (
              <div
                key={`${label}-${col}`}
                className="text-[10px] text-content-tertiary"
                style={{ position: 'absolute', marginLeft: `${col * 14 + 32}px` }}
              >
                {label}
              </div>
            ))}
            <div className="h-3" />
          </div>

          <div className="flex gap-0.5 mt-4">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1.5">
              {DAYS.map((d, i) => (
                <div key={i} className="h-3 w-6 text-[10px] text-content-tertiary flex items-center">
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map(({ date, count }) => {
                  const level = getLevel(count, maxCount);
                  return (
                    <div
                      key={date}
                      title={`${date}: ${count} contribution${count !== 1 ? 's' : ''}`}
                      className={cn('w-3 h-3 rounded-sm transition-opacity hover:opacity-80', LEVEL_CLASSES[level])}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
