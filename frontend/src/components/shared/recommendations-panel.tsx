'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Compass, FileText, FolderKanban, Loader2, Star, UserPlus, Users } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import type {
  ApiResponse,
  RecPerson,
  RecPost,
  RecProject,
  RecommendationsResponse,
} from '@/types';

export function RecommendationsPanel() {
  const [data, setData] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get<ApiResponse<RecommendationsResponse>>('/users/me/recommendations')
      .then((res) => {
        if (!cancelled) setData(res.data.data);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 size={20} className="animate-spin text-tyrian/60" />
      </div>
    );
  }

  if (!data) return null;

  const empty =
    data.projects.length === 0 && data.posts.length === 0 && data.people.length === 0;

  if (empty) {
    return (
      <Section
        icon={<Compass size={16} className="text-tyrian" />}
        title="Recommended for you"
        subtitle={data.basedOn.length > 0 ? `Based on ${data.basedOn.length} interests` : undefined}
      >
        <div className="px-4 py-8 text-center text-xs text-cloud-muted">
          Add interests and skills to your profile to see recommendations.
        </div>
      </Section>
    );
  }

  async function follow(id: string) {
    setFollowed((prev) => new Set(prev).add(id));
    try {
      await api.post(`/users/${id}/follow`);
    } catch {
      setFollowed((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <Section
      icon={<Compass size={16} className="text-tyrian" />}
      title="Recommended for you"
      subtitle={
        data.basedOn.length > 0
          ? `Based on ${data.basedOn.slice(0, 3).join(', ')}${
              data.basedOn.length > 3 ? '…' : ''
            }`
          : undefined
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-cloud-deep">
        <Column
          icon={<FolderKanban size={14} className="text-tyrian" />}
          title="Projects"
          empty="No matching projects."
          items={data.projects}
          render={(p) => <ProjectItem key={p.id} project={p} />}
        />
        <Column
          icon={<FileText size={14} className="text-tyrian" />}
          title="Posts"
          empty="No matching posts."
          items={data.posts}
          render={(p) => <PostItem key={p.id} post={p} />}
        />
        <Column
          icon={<Users size={14} className="text-tyrian" />}
          title="People"
          empty="No matching people."
          items={data.people}
          render={(p) => (
            <PersonItem
              key={p.id}
              person={p}
              followed={followed.has(p.id)}
              onFollow={() => follow(p.id)}
            />
          )}
        />
      </div>
    </Section>
  );
}

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-cloud-deep bg-white">
      <header className="flex items-center justify-between px-4 h-11 border-b border-cloud-deep">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold text-cloud-ink">{title}</h3>
        </div>
        {subtitle && <span className="text-xs text-cloud-muted truncate max-w-[60%]">{subtitle}</span>}
      </header>
      <div>{children}</div>
    </div>
  );
}

function Column<T>({
  icon,
  title,
  items,
  render,
  empty,
}: {
  icon: React.ReactNode;
  title: string;
  items: T[];
  render: (item: T) => React.ReactNode;
  empty: string;
}) {
  return (
    <div className="min-w-0">
      <div className="px-3 py-2 flex items-center gap-1.5 border-b border-cloud-deep bg-cloud-soft">
        {icon}
        <span className="text-xs font-medium text-cloud-ink uppercase tracking-wide">
          {title}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="px-3 py-6 text-center text-xs text-cloud-muted">{empty}</p>
      ) : (
        <ul className="divide-y divide-cloud-deep">{items.map(render)}</ul>
      )}
    </div>
  );
}

function ProjectItem({ project }: { project: RecProject }) {
  return (
    <li className="px-3 py-2.5">
      <Link
        href={`/projects/${project.id}`}
        className="text-sm font-medium text-cloud-ink hover:text-tyrian truncate block"
      >
        {project.name}
      </Link>
      {project.description && (
        <p className="mt-0.5 text-xs text-cloud-muted line-clamp-2">{project.description}</p>
      )}
      <div className="mt-1 flex items-center gap-3 text-[10px] text-cloud-muted">
        <span className="flex items-center gap-1">
          <Star size={10} /> {project.starsCount}
        </span>
        <span>{project.membersCount} members</span>
      </div>
    </li>
  );
}

function PostItem({ post }: { post: RecPost }) {
  return (
    <li className="px-3 py-2.5">
      <Link
        href={`/posts/${post.id}`}
        className="text-sm font-medium text-cloud-ink hover:text-tyrian line-clamp-2 block"
      >
        {post.title}
      </Link>
      {post.preview && (
        <p className="mt-0.5 text-xs text-cloud-muted line-clamp-2">{post.preview}</p>
      )}
      {post.authorUsername && (
        <p className="mt-1 text-[10px] text-cloud-muted">
          by {post.authorDisplayName || `@${post.authorUsername}`}
        </p>
      )}
    </li>
  );
}

function PersonItem({
  person,
  followed,
  onFollow,
}: {
  person: RecPerson;
  followed: boolean;
  onFollow: () => void;
}) {
  return (
    <li className="px-3 py-2.5 flex items-center gap-3">
      <Avatar
        name={person.displayName || person.username}
        src={person.avatarUrl || undefined}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <Link
          href={`/u/${person.username}`}
          className="text-sm font-medium text-cloud-ink hover:text-tyrian truncate block"
        >
          {person.displayName || person.username}
        </Link>
        {person.sharedTags.length > 0 ? (
          <p className="text-[10px] text-cloud-muted truncate">
            Shared: {person.sharedTags.slice(0, 3).join(', ')}
          </p>
        ) : person.headline ? (
          <p className="text-[10px] text-cloud-muted truncate">{person.headline}</p>
        ) : null}
      </div>
      <Button
        size="sm"
        variant={followed ? 'secondary' : 'primary'}
        disabled={followed}
        onClick={onFollow}
      >
        {followed ? 'Following' : (
          <span className="flex items-center gap-1"><UserPlus size={12} /> Follow</span>
        )}
      </Button>
    </li>
  );
}
