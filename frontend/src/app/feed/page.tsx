'use client';

import { ImagePlus, Send } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { RightPanel } from '@/components/layout/right-panel';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/shared/post-card';

const mockPosts = [
  {
    author: { name: 'Alice Chen', handle: '@alicechen' },
    content:
      'Just shipped our new micro-frontend architecture! Moved from a monolith to module federation in 3 weeks. Performance improved by 40% on initial load.\n\nHere are the key takeaways for anyone considering the same move...',
    tags: ['architecture', 'react', 'performance'],
    likes: 89,
    comments: 23,
    timeAgo: '2h ago',
    liked: true,
  },
  {
    author: { name: 'Bob Smith', handle: '@bobsmith' },
    content:
      'Hot take: most "clean code" advice actually makes code harder to read. Premature abstraction is the root of all evil.\n\nFight me in the comments.',
    tags: ['opinion', 'clean-code'],
    likes: 234,
    comments: 67,
    timeAgo: '4h ago',
  },
  {
    author: { name: 'Carol Wang', handle: '@carolwang' },
    content:
      'Published a new open-source tool for visualizing neural network attention patterns. Works with any transformer model out of the box.\n\nCheck it out on our project page!',
    tags: ['ai', 'open-source', 'python'],
    likes: 156,
    comments: 42,
    timeAgo: '6h ago',
    bookmarked: true,
  },
  {
    author: { name: 'David Kim', handle: '@davidkim' },
    content:
      'TIL: PostgreSQL has had JSON path queries since version 12. You can do things like:\n\nSELECT * FROM orders WHERE data @? \'$.items[*] ? (@.price > 100)\';\n\nNo more writing complex subqueries for JSON filtering!',
    tags: ['postgresql', 'database', 'til'],
    likes: 312,
    comments: 18,
    timeAgo: '8h ago',
    liked: true,
  },
];

export default function FeedPage() {
  return (
    <AppShell>
      <div className="flex">
        {/* Feed content */}
        <div className="flex-1 max-w-feed mx-auto px-4 py-6 space-y-4">
          {/* Compose box */}
          <div className="bg-surface-secondary border border-border rounded-md p-4">
            <div className="flex gap-3">
              <Avatar name="John Doe" size="md" />
              <div className="flex-1">
                <textarea
                  placeholder="What's on your mind?"
                  className="w-full bg-transparent text-sm text-content-primary placeholder:text-content-tertiary resize-none focus:outline-none min-h-[60px]"
                  rows={2}
                />
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                  <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-sm text-xs text-content-secondary hover:text-content-primary hover:bg-surface-tertiary transition-colors">
                    <ImagePlus size={16} />
                    Media
                  </button>
                  <Button size="sm" icon={<Send size={14} />}>
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts */}
          {mockPosts.map((post, i) => (
            <PostCard key={i} {...post} />
          ))}
        </div>

        {/* Right panel */}
        <RightPanel />
      </div>
    </AppShell>
  );
}
