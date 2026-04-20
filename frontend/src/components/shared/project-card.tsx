'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Star, MessageSquare, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';
import { useChatStore } from '@/store/useChatStore';

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
  'from-tyrian to-tyrian-glow',
  'from-moss via-moss-velvet to-banana-deep',
  'from-banana via-banana-deep to-moss',
  'from-tyrian-glow via-tyrian to-moss-deep',
  'from-moss-deep via-tyrian to-banana',
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
  const t = useT();
  const router = useRouter();
  const { openProjectChat } = useChatStore();
  const [openingChat, setOpeningChat] = useState(false);
  const gradient = coverGradient || gradients[name.length % gradients.length];

  async function handleOpenChat(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (openingChat) return;
    setOpeningChat(true);
    try {
      await openProjectChat(id);
      router.push('/messages');
    } catch {
      setOpeningChat(false);
    }
  }

  return (
    <Link href={`/projects/${id}`} className="group block relative">
      <span
        role="button"
        tabIndex={0}
        onClick={handleOpenChat}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleOpenChat(e as unknown as React.MouseEvent);
        }}
        aria-label={t.messages.openProjectChat}
        title={t.messages.openProjectChat}
        className="absolute top-2 right-2 z-10 h-8 w-8 flex items-center justify-center bg-cloud-soft/90 border border-cloud-deep text-cloud-ink hover:text-tyrian hover:border-tyrian rounded-sm backdrop-blur-sm transition-colors cursor-pointer"
      >
        {openingChat ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
      </span>
      <div className="bg-cloud-soft border border-cloud-deep rounded-xl overflow-hidden hover:border-moss-soft hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
        {/* Cover */}
        <div className={cn('h-24 bg-gradient-to-br', gradient)} />

        {/* Body */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-cloud-ink group-hover:text-tyrian transition-colors truncate">
            {name}
          </h3>
          <p className="text-xs text-cloud-muted mt-1 line-clamp-2">
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
          <div className="mt-3 flex items-center justify-between text-xs text-cloud-muted">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Users size={12} /> {members}
              </span>
              <span className="flex items-center gap-1">
                <Star size={12} className="text-banana-deep" /> {stars}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-cloud-muted">{t.projects.progress}</span>
              <span className="text-[10px] font-medium text-cloud-ink/80">{progress}%</span>
            </div>
            <div className="h-1.5 bg-cloud-deep rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-tyrian to-tyrian-glow"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
