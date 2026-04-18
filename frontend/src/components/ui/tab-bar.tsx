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
    <div className={cn('flex border-b border-cloud-deep', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative px-4 py-3 text-sm transition-colors duration-150',
              isActive
                ? 'text-cloud-ink font-semibold'
                : 'text-cloud-muted font-medium hover:text-cloud-ink',
            )}
          >
            <span className="flex items-center gap-2">
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full',
                    isActive
                      ? 'bg-tyrian/10 text-tyrian'
                      : 'bg-cloud-deep text-cloud-muted',
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-tyrian rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
