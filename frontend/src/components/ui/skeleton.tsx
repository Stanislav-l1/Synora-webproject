import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  tone?: 'light' | 'dark';
}

export function Skeleton({ className, tone = 'light' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md',
        tone === 'dark' ? 'bg-moss-velvet' : 'bg-cloud-deep',
        className,
      )}
    />
  );
}

export function SkeletonText({
  lines = 3,
  tone = 'light',
  className,
}: {
  lines?: number;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          tone={tone}
          className={cn('h-3', i === lines - 1 ? 'w-3/5' : 'w-full')}
        />
      ))}
    </div>
  );
}
