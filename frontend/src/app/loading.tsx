import { Skeleton, SkeletonText } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-4 animate-pulse">
      {/* Compose box skeleton */}
      <div className="bg-cloud border border-cloud-deep rounded-2xl p-4">
        <div className="flex gap-3">
          <Skeleton className="w-9 h-9 rounded-full shrink-0" />
          <Skeleton className="flex-1 h-10 rounded-xl" />
        </div>
      </div>

      {/* Post skeletons */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-cloud border border-cloud-deep rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-full shrink-0" />
            <div className="flex-1">
              <SkeletonText lines={2} />
            </div>
          </div>
          <SkeletonText lines={3} />
          <div className="flex gap-4 pt-1">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}
