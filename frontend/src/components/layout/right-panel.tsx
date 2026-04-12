'use client';

import Link from 'next/link';
import { TrendingUp, UserPlus } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui';

const trendingTopics = [
  { tag: 'rust', posts: 342 },
  { tag: 'webassembly', posts: 218 },
  { tag: 'ai-agents', posts: 189 },
  { tag: 'nextjs', posts: 156 },
  { tag: 'kubernetes', posts: 134 },
];

const suggestedUsers = [
  { name: 'Alice Chen', handle: '@alicechen', bio: 'Full-stack developer' },
  { name: 'Bob Smith', handle: '@bobsmith', bio: 'DevOps engineer' },
  { name: 'Carol Wang', handle: '@carolwang', bio: 'ML researcher' },
];

export function RightPanel() {
  return (
    <aside className="hidden xl:block w-right-panel shrink-0 sticky top-navbar h-[calc(100vh-theme(spacing.navbar))] overflow-y-auto scrollbar-hidden p-4 space-y-4">
      {/* Trending */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-accent" />
          <h3 className="text-sm font-semibold text-content-primary">Trending</h3>
        </div>
        <div className="space-y-2.5">
          {trendingTopics.map((topic) => (
            <Link
              key={topic.tag}
              href={`/tags/${topic.tag}`}
              className="flex items-center justify-between group"
            >
              <span className="text-sm text-content-secondary group-hover:text-accent-light transition-colors">
                #{topic.tag}
              </span>
              <span className="text-xs text-content-tertiary">{topic.posts} posts</span>
            </Link>
          ))}
        </div>
      </Card>

      {/* Suggested users */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <UserPlus size={16} className="text-accent" />
          <h3 className="text-sm font-semibold text-content-primary">Who to follow</h3>
        </div>
        <div className="space-y-3">
          {suggestedUsers.map((user) => (
            <div key={user.handle} className="flex items-center gap-3">
              <Avatar name={user.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-content-primary truncate">{user.name}</p>
                <p className="text-xs text-content-tertiary truncate">{user.bio}</p>
              </div>
              <Button variant="secondary" size="sm">
                Follow
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Stats */}
      <Card>
        <h3 className="text-sm font-semibold text-content-primary mb-3">Your stats</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Posts', value: '42' },
            { label: 'Reputation', value: '1,280' },
            { label: 'Followers', value: '256' },
            { label: 'Projects', value: '7' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-lg font-semibold text-content-primary">{stat.value}</p>
              <p className="text-xs text-content-tertiary">{stat.label}</p>
            </div>
          ))}
        </div>
      </Card>
    </aside>
  );
}
