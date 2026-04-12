import Link from 'next/link';
import { Users, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  tags?: string[];
  members: number;
  stars: number;
  progress: number;
  coverGradient?: string;
}

const gradients = [
  'from-accent/60 to-info/40',
  'from-success/50 to-accent/40',
  'from-warning/50 to-danger/40',
  'from-info/60 to-accent/40',
  'from-danger/50 to-warning/40',
];

export function ProjectCard({
  id,
  name,
  description,
  tags,
  members,
  stars,
  progress,
  coverGradient,
}: ProjectCardProps) {
  const gradient = coverGradient || gradients[name.length % gradients.length];

  return (
    <Link href={`/projects/${id}`} className="group block">
      <div className="bg-surface-secondary border border-border rounded-xl overflow-hidden hover:border-border-hover hover:shadow-sm transition-all">
        {/* Cover */}
        <div className={cn('h-24 bg-gradient-to-br', gradient)} />

        {/* Body */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-content-primary group-hover:text-accent-light transition-colors truncate">
            {name}
          </h3>
          <p className="text-xs text-content-secondary mt-1 line-clamp-2">
            {description}
          </p>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="default">{tag}</Badge>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between text-xs text-content-tertiary">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Users size={12} /> {members}
              </span>
              <span className="flex items-center gap-1">
                <Star size={12} /> {stars}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-content-tertiary">Progress</span>
              <span className="text-[10px] font-medium text-content-secondary">{progress}%</span>
            </div>
            <div className="h-1.5 bg-surface-tertiary rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
