'use client';

import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function TabBar({ tabs, activeTab, onChange, className }: TabBarProps) {
  return (
    <div className={cn('flex border-b border-border', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative px-4 py-3 text-sm font-medium transition-colors duration-150',
            'hover:text-content-primary',
            activeTab === tab.id
              ? 'text-content-primary'
              : 'text-content-secondary',
          )}
        >
          <span className="flex items-center gap-2">
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  activeTab === tab.id
                    ? 'bg-accent-muted text-accent-light'
                    : 'bg-surface-tertiary text-content-tertiary',
                )}
              >
                {tab.count}
              </span>
            )}
          </span>
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
