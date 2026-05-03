'use client';

import { Star, GitFork, Eye, ExternalLink, Globe, Lock, Star as StarFilled } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { GitRepository } from '@/types';
import { LANGUAGE_COLORS } from '@/types';

interface RepoCardProps {
  repo: GitRepository;
  onToggleFeatured?: (id: string) => void;
  showFeatureToggle?: boolean;
  className?: string;
}

function LanguageDot({ lang }: { lang: string }) {
  const color = LANGUAGE_COLORS[lang] ?? LANGUAGE_COLORS.default;
  return (
    <span className="flex items-center gap-1.5 text-xs text-content-secondary">
      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      {lang}
    </span>
  );
}

export function RepoCard({ repo, onToggleFeatured, showFeatureToggle, className }: RepoCardProps) {
  const timeSince = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return 'today';
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  };

  return (
    <div
      className={cn(
        'group relative bg-surface-secondary border border-border-default rounded-xl p-4',
        'hover:border-border-accent transition-all duration-200',
        repo.featured && 'ring-1 ring-accent/30',
        className,
      )}
    >
      {/* Featured star toggle */}
      {showFeatureToggle && onToggleFeatured && (
        <button
          onClick={() => onToggleFeatured(repo.id)}
          title={repo.featured ? 'Remove from featured' : 'Add to featured'}
          className={cn(
            'absolute top-3 right-3 p-1 rounded transition-colors',
            repo.featured
              ? 'text-yellow-400 hover:text-yellow-300'
              : 'text-content-tertiary hover:text-yellow-400',
          )}
        >
          <StarFilled size={14} fill={repo.featured ? 'currentColor' : 'none'} />
        </button>
      )}

      {/* Header */}
      <div className="flex items-start gap-2 mb-2 pr-6">
        <div className="flex items-center gap-1.5 min-w-0">
          {repo.privateRepo ? (
            <Lock size={13} className="text-content-tertiary shrink-0" />
          ) : (
            <Globe size={13} className="text-content-tertiary shrink-0" />
          )}
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sm text-accent hover:underline truncate"
          >
            {repo.name}
          </a>
          {repo.fork && (
            <span className="px-1.5 py-0.5 text-[10px] rounded border border-border-default text-content-tertiary">
              fork
            </span>
          )}
        </div>
        {repo.homepageUrl && (
          <a
            href={repo.homepageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-content-tertiary hover:text-content-secondary transition-colors"
          >
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      {/* Description */}
      {repo.description && (
        <p className="text-xs text-content-secondary line-clamp-2 mb-3">
          {repo.description}
        </p>
      )}

      {/* Topics */}
      {repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {repo.topics.slice(0, 4).map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 text-[10px] rounded-full bg-accent/10 text-accent border border-accent/20"
            >
              {t}
            </span>
          ))}
          {repo.topics.length > 4 && (
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-surface-tertiary text-content-tertiary">
              +{repo.topics.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs text-content-tertiary">
        {repo.language && <LanguageDot lang={repo.language} />}
        {repo.starsCount > 0 && (
          <span className="flex items-center gap-1">
            <Star size={11} /> {repo.starsCount.toLocaleString()}
          </span>
        )}
        {repo.forksCount > 0 && (
          <span className="flex items-center gap-1">
            <GitFork size={11} /> {repo.forksCount.toLocaleString()}
          </span>
        )}
        {repo.lastPushedAt && (
          <span className="ml-auto">Updated {timeSince(repo.lastPushedAt)}</span>
        )}
      </div>
    </div>
  );
}
