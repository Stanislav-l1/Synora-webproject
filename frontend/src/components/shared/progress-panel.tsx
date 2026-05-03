'use client';

import { useEffect, useState } from 'react';
import {
  Award,
  Edit3,
  Feather,
  Folder,
  Loader2,
  Lock,
  Sparkles,
  Star,
  UserCheck,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';
import api from '@/lib/api';
import type { Achievement, ApiResponse, ProgressResponse } from '@/types';

const ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  edit: Edit3,
  'edit-3': Edit3,
  feather: Feather,
  'user-plus': UserPlus,
  users: Users,
  'user-check': UserCheck,
  folder: Folder,
  star: Star,
  award: Award,
};

interface Props {
  userId: string;
}

export function ProgressPanel({ userId }: Props) {
  const [data, setData] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    api
      .get<ApiResponse<ProgressResponse>>(`/users/${userId}/progress`)
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
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 size={20} className="animate-spin text-tyrian/60" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-4">
      <CareerProgress data={data} />
      <AchievementsGrid items={data.achievements} unlocked={data.unlockedCount} total={data.totalCount} />
    </div>
  );
}

function CareerProgress({ data }: { data: ProgressResponse }) {
  return (
    <div className="rounded-xl border border-cloud-deep bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-cloud-muted">Career level</p>
          <p className="text-lg font-semibold text-cloud-ink">
            {data.currentLevel.title}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-cloud-muted">Reputation</p>
          <p className="text-lg font-semibold text-banana-deep">
            {data.reputation.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <div className="h-2 w-full bg-cloud-soft rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-tyrian to-tyrian-glow transition-all"
            style={{ width: `${data.progressPercent}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs text-cloud-muted">
          <span>{data.currentLevel.minReputation.toLocaleString()}</span>
          {data.nextLevel ? (
            <span>
              {data.reputationToNext.toLocaleString()} to{' '}
              <span className="text-cloud-ink font-medium">{data.nextLevel.title}</span>
            </span>
          ) : (
            <span>Max level reached</span>
          )}
          <span>
            {data.nextLevel
              ? data.nextLevel.minReputation.toLocaleString()
              : data.currentLevel.minReputation.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function AchievementsGrid({
  items,
  unlocked,
  total,
}: {
  items: Achievement[];
  unlocked: number;
  total: number;
}) {
  return (
    <div className="rounded-xl border border-cloud-deep bg-white">
      <header className="flex items-center justify-between px-4 h-11 border-b border-cloud-deep">
        <div className="flex items-center gap-2">
          <Award size={16} className="text-tyrian" />
          <h3 className="text-sm font-semibold text-cloud-ink">Achievements</h3>
        </div>
        <span className="text-xs text-cloud-muted">
          {unlocked}/{total} unlocked
        </span>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-4">
        {items.map((a) => (
          <Card key={a.code} item={a} />
        ))}
      </div>
    </div>
  );
}

function Card({ item }: { item: Achievement }) {
  const Icon = ICONS[item.icon] ?? Award;
  return (
    <div
      className={`rounded-lg border p-3 text-center transition-colors ${
        item.unlocked
          ? 'border-tyrian/30 bg-tyrian/5'
          : 'border-cloud-deep bg-cloud-soft opacity-70'
      }`}
      title={item.description}
    >
      <div
        className={`mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-full ${
          item.unlocked ? 'bg-tyrian text-cloud' : 'bg-cloud-deep text-cloud-muted'
        }`}
      >
        {item.unlocked ? <Icon size={14} /> : <Lock size={12} />}
      </div>
      <p
        className={`text-xs font-medium leading-tight ${
          item.unlocked ? 'text-cloud-ink' : 'text-cloud-muted'
        }`}
      >
        {item.title}
      </p>
      <p className="mt-0.5 text-[10px] text-cloud-muted leading-tight line-clamp-2">
        {item.description}
      </p>
    </div>
  );
}
