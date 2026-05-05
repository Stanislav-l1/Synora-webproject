'use client';

import { useState } from 'react';
import { Trophy, TrendingUp, TrendingDown, Minus, Zap, Info } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { cn } from '@/lib/utils';

type Period = 'weekly' | 'monthly' | 'alltime';

interface LeaderUser {
  rank: number;
  name: string;
  username: string;
  points: number;
  trend: number;
  badges: string[];
  role: string;
  isMe?: boolean;
}

const WEEKLY: LeaderUser[] = [
  { rank: 1,  name: 'Sarah Lin',      username: 'slin',      points: 1840, trend:  12, badges: ['🏆', '⚡'], role: 'Frontend @ Vercel' },
  { rank: 2,  name: 'Marcus Webb',    username: 'mwebb',     points: 1620, trend:   3, badges: ['🌟'],       role: 'OSS Maintainer' },
  { rank: 3,  name: 'Alex Müller',    username: 'alexm_de',  points: 1480, trend:  -1, badges: ['🚀'],       role: 'Full-stack Dev' },
  { rank: 4,  name: 'Priya Nair',     username: 'priya_n',   points: 1340, trend:   7, badges: ['☁️'],       role: 'DevOps @ AWS' },
  { rank: 5,  name: 'Omar Hassan',    username: 'ohardev',   points: 1210, trend:  -2, badges: ['💡'],       role: 'Indie Hacker' },
  { rank: 6,  name: 'Yuki Tanaka',    username: 'yukidev',   points: 1180, trend:  15, badges: ['🤖'],       role: 'ML Engineer' },
  { rank: 7,  name: 'Nina Kovacs',    username: 'nkovacs',   points: 1050, trend:   0, badges: [],           role: 'Backend Dev' },
  { rank: 8,  name: 'Tom Bradley',    username: 'tombradley',points:  980, trend:  -4, badges: [],           role: 'React Dev' },
  { rank: 9,  name: 'Sofia Rossi',    username: 'sofiar',    points:  910, trend:   2, badges: [],           role: 'Designer + Dev' },
  { rank: 10, name: 'David Kim',      username: 'davidkim',  points:  850, trend:   6, badges: [],           role: 'DevOps Eng' },
  { rank: 23, name: 'You',            username: 'you',       points:  430, trend:   8, badges: [],           role: 'Developer', isMe: true },
];

const MONTHLY: LeaderUser[] = [
  { rank: 1,  name: 'Priya Nair',     username: 'priya_n',   points: 7240, trend:  2,  badges: ['🏆', '☁️'], role: 'DevOps @ AWS' },
  { rank: 2,  name: 'Sarah Lin',      username: 'slin',      points: 6850, trend: -1,  badges: ['⚡', '🌟'], role: 'Frontend @ Vercel' },
  { rank: 3,  name: 'Yuki Tanaka',    username: 'yukidev',   points: 6120, trend:  5,  badges: ['🤖', '🚀'], role: 'ML Engineer' },
  { rank: 4,  name: 'Alex Müller',    username: 'alexm_de',  points: 5980, trend:  0,  badges: ['🚀'],       role: 'Full-stack Dev' },
  { rank: 5,  name: 'Marcus Webb',    username: 'mwebb',     points: 5670, trend: -2,  badges: ['🌟'],       role: 'OSS Maintainer' },
  { rank: 6,  name: 'Omar Hassan',    username: 'ohardev',   points: 5210, trend:  3,  badges: ['💡'],       role: 'Indie Hacker' },
  { rank: 7,  name: 'Sofia Rossi',    username: 'sofiar',    points: 4900, trend:  8,  badges: [],           role: 'Designer + Dev' },
  { rank: 8,  name: 'David Kim',      username: 'davidkim',  points: 4620, trend:  1,  badges: [],           role: 'DevOps Eng' },
  { rank: 9,  name: 'Nina Kovacs',    username: 'nkovacs',   points: 4380, trend: -3,  badges: [],           role: 'Backend Dev' },
  { rank: 10, name: 'Tom Bradley',    username: 'tombradley',points: 4100, trend:  0,  badges: [],           role: 'React Dev' },
  { rank: 41, name: 'You',            username: 'you',       points: 1820, trend: 11,  badges: [],           role: 'Developer', isMe: true },
];

const ALLTIME: LeaderUser[] = [
  { rank: 1,  name: 'Marcus Webb',    username: 'mwebb',     points: 84200, trend: 0, badges: ['🏆', '🌟', '👑'], role: 'OSS Maintainer' },
  { rank: 2,  name: 'Priya Nair',     username: 'priya_n',   points: 71500, trend: 0, badges: ['⭐', '☁️'],       role: 'DevOps @ AWS' },
  { rank: 3,  name: 'Sarah Lin',      username: 'slin',      points: 68900, trend: 0, badges: ['⚡', '🌟'],       role: 'Frontend @ Vercel' },
  { rank: 4,  name: 'Yuki Tanaka',    username: 'yukidev',   points: 62100, trend: 0, badges: ['🤖', '🚀'],       role: 'ML Engineer' },
  { rank: 5,  name: 'Alex Müller',    username: 'alexm_de',  points: 58400, trend: 0, badges: ['🚀'],             role: 'Full-stack Dev' },
  { rank: 6,  name: 'Omar Hassan',    username: 'ohardev',   points: 51200, trend: 0, badges: ['💡'],             role: 'Indie Hacker' },
  { rank: 7,  name: 'Sofia Rossi',    username: 'sofiar',    points: 47800, trend: 0, badges: [],                 role: 'Designer + Dev' },
  { rank: 8,  name: 'David Kim',      username: 'davidkim',  points: 43100, trend: 0, badges: [],                 role: 'DevOps Eng' },
  { rank: 9,  name: 'Nina Kovacs',    username: 'nkovacs',   points: 39600, trend: 0, badges: [],                 role: 'Backend Dev' },
  { rank: 10, name: 'Tom Bradley',    username: 'tombradley',points: 36200, trend: 0, badges: [],                 role: 'React Dev' },
  { rank: 187,name: 'You',            username: 'you',       points: 4250,  trend: 0, badges: [],                 role: 'Developer', isMe: true },
];

const DATA: Record<Period, LeaderUser[]> = { weekly: WEEKLY, monthly: MONTHLY, alltime: ALLTIME };

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
const TOTAL: Record<Period, number> = { weekly: 1240, monthly: 3800, alltime: 12400 };

function TrendIcon({ value }: { value: number }) {
  if (value > 0) return <TrendingUp size={12} className="text-green-500" />;
  if (value < 0) return <TrendingDown size={12} className="text-red-400" />;
  return <Minus size={12} className="text-cloud-muted" />;
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('weekly');
  const [showPoints, setShowPoints] = useState(false);
  const data = DATA[period];
  const topRows = data.filter((u) => !u.isMe);
  const myRow = data.find((u) => u.isMe);
  const total = TOTAL[period];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Trophy size={18} className="text-yellow-500" />
          <h1 className="text-xl font-bold text-cloud-ink">Leaderboard</h1>
        </div>
        <p className="text-sm text-cloud-muted">Top contributors in the Synora community</p>
      </div>

      {/* Top 3 podium */}
      <div className="flex items-end justify-center gap-3 mb-6">
        {[data[1], data[0], data[2]].map((user, podiumIdx) => {
          const rank = podiumIdx === 1 ? 1 : podiumIdx === 0 ? 2 : 3;
          const heights = ['h-24', 'h-32', 'h-20'];
          const colors = ['bg-zinc-100', 'bg-yellow-50', 'bg-amber-50'];
          return (
            <div key={user.username} className="flex flex-col items-center gap-1.5 flex-1">
              <span className="text-2xl">{MEDAL[rank]}</span>
              <Avatar name={user.name} size={rank === 1 ? 'lg' : 'md'} />
              <p className="text-xs font-semibold text-cloud-ink truncate max-w-[80px] text-center">{user.name}</p>
              <p className="text-[10px] text-cloud-muted">{user.points.toLocaleString()} pts</p>
              <div className={cn('w-full rounded-t-lg', heights[podiumIdx], colors[podiumIdx])} />
            </div>
          );
        })}
      </div>

      {/* Period tabs */}
      <div className="flex gap-1 mb-4 bg-cloud-deep/40 p-1 rounded-xl">
        {([
          { id: 'weekly' as Period, label: 'This week' },
          { id: 'monthly' as Period, label: 'This month' },
          { id: 'alltime' as Period, label: 'All time' },
        ]).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setPeriod(tab.id)}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
              period === tab.id ? 'bg-cloud shadow-sm text-cloud-ink' : 'text-cloud-muted hover:text-cloud-ink',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* My rank card */}
      {myRow && (
        <div className="mb-4 bg-tyrian/10 border border-tyrian/30 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-tyrian/20 flex items-center justify-center text-sm font-bold text-tyrian shrink-0">
            #{myRow.rank}
          </div>
          <Avatar name="You" size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-cloud-ink">Your rank</p>
            <p className="text-xs text-cloud-muted">
              Top {Math.ceil((myRow.rank / total) * 100)}% · {myRow.points.toLocaleString()} pts
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <TrendIcon value={myRow.trend} />
            {myRow.trend !== 0 && (
              <span className={myRow.trend > 0 ? 'text-green-600' : 'text-red-400'}>
                {myRow.trend > 0 ? '+' : ''}{myRow.trend}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Full list */}
      <div className="bg-cloud border border-cloud-deep rounded-xl overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[40px_1fr_80px_40px] gap-2 px-4 py-2.5 border-b border-cloud-deep bg-cloud-deep/30">
          <span className="text-[10px] font-semibold text-cloud-muted uppercase tracking-wide text-center">#</span>
          <span className="text-[10px] font-semibold text-cloud-muted uppercase tracking-wide">User</span>
          <span className="text-[10px] font-semibold text-cloud-muted uppercase tracking-wide text-right">Points</span>
          <span className="text-[10px] font-semibold text-cloud-muted uppercase tracking-wide text-center">±</span>
        </div>

        {topRows.map((user, i) => (
          <div
            key={user.username}
            className={cn(
              'grid grid-cols-[40px_1fr_80px_40px] gap-2 px-4 py-3 items-center transition-colors',
              i < topRows.length - 1 && 'border-b border-cloud-deep',
              user.rank <= 3 ? 'bg-yellow-50/60' : 'hover:bg-cloud-deep/20',
            )}
          >
            <div className="text-center">
              {MEDAL[user.rank] ? (
                <span className="text-lg">{MEDAL[user.rank]}</span>
              ) : (
                <span className="text-sm font-semibold text-cloud-muted">{user.rank}</span>
              )}
            </div>
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar name={user.name} size="sm" />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-medium text-cloud-ink truncate">{user.name}</p>
                  {user.badges.map((b) => <span key={b} className="text-xs">{b}</span>)}
                </div>
                <p className="text-[11px] text-cloud-muted truncate">{user.role}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-cloud-ink">{user.points.toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-center gap-0.5">
              <TrendIcon value={user.trend} />
              {user.trend !== 0 && (
                <span className={cn('text-[10px] font-medium', user.trend > 0 ? 'text-green-600' : 'text-red-400')}>
                  {user.trend > 0 ? '+' : ''}{user.trend}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Points info */}
      <button
        type="button"
        onClick={() => setShowPoints((v) => !v)}
        className="mt-4 flex items-center gap-1.5 text-xs text-cloud-muted hover:text-cloud-ink transition-colors"
      >
        <Info size={13} />
        How are points calculated?
      </button>
      {showPoints && (
        <div className="mt-2 bg-cloud border border-cloud-deep rounded-xl p-4 grid grid-cols-2 gap-2">
          {[
            { label: 'Post published', pts: '+10' },
            { label: 'Comment posted', pts: '+3' },
            { label: 'Like received',  pts: '+1' },
            { label: 'Project created',pts: '+50' },
            { label: 'New follower',   pts: '+5' },
            { label: 'Course completed',pts:'+30' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-xs text-cloud-muted">{item.label}</span>
              <span className="text-xs font-semibold text-tyrian">{item.pts} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
