'use client';

import { useState } from 'react';
import { MapPin, LinkIcon, Calendar, Star } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabBar } from '@/components/ui/tab-bar';
import { PostCard } from '@/components/shared/post-card';
import { ProjectCard } from '@/components/shared/project-card';

const tabs = [
  { id: 'posts', label: 'Posts', count: 128 },
  { id: 'projects', label: 'Projects', count: 7 },
  { id: 'courses', label: 'Courses', count: 3 },
  { id: 'activity', label: 'Activity' },
];

const mockPosts = [
  {
    author: { name: 'John Doe', handle: '@johndoe' },
    content: 'Working on a new developer tool that combines code review with AI-powered suggestions. Early results are promising!',
    tags: ['devtools', 'ai'],
    likes: 45,
    comments: 12,
    timeAgo: '1d ago',
  },
  {
    author: { name: 'John Doe', handle: '@johndoe' },
    content: 'The best architectures emerge from self-organizing teams. But self-organization needs guardrails, not chaos.',
    likes: 89,
    comments: 34,
    timeAgo: '3d ago',
    liked: true,
  },
];

const mockProjects = [
  {
    id: '1',
    name: 'CodeLens AI',
    description: 'AI-powered code review assistant with real-time suggestions and automated PR reviews',
    tags: ['TypeScript', 'AI', 'DevTools'],
    members: 5,
    stars: 124,
    progress: 72,
  },
  {
    id: '2',
    name: 'Synora Platform',
    description: 'Open-source developer community platform with social features and project management',
    tags: ['Java', 'Next.js', 'PostgreSQL'],
    members: 12,
    stars: 89,
    progress: 45,
  },
  {
    id: '3',
    name: 'DevOps Dashboard',
    description: 'Real-time infrastructure monitoring with alerting and incident management',
    tags: ['Go', 'Kubernetes', 'Grafana'],
    members: 3,
    stars: 67,
    progress: 90,
  },
];

const skills = ['TypeScript', 'React', 'Java', 'Spring Boot', 'PostgreSQL', 'Docker', 'AWS'];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('posts');

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        {/* Banner */}
        <div className="h-48 bg-gradient-to-br from-accent/40 via-accent/20 to-info/30 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-surface-primary/60 to-transparent" />
        </div>

        {/* Profile header */}
        <div className="px-6 relative">
          {/* Avatar */}
          <div className="-mt-12 mb-4 flex items-end justify-between">
            <div className="ring-4 ring-surface-primary rounded-full">
              <Avatar name="John Doe" size="xl" />
            </div>
            <div className="flex gap-2 mb-2">
              <Button variant="secondary" size="sm">Edit Profile</Button>
              <Button variant="primary" size="sm">Share</Button>
            </div>
          </div>

          {/* Info */}
          <div>
            <h1 className="text-2xl font-bold text-content-primary">John Doe</h1>
            <p className="text-sm text-content-secondary">@johndoe</p>
            <p className="text-sm text-content-primary mt-2 max-w-lg">
              Full-stack developer passionate about building tools that make developers more productive.
              Open source contributor. Coffee enthusiast.
            </p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-content-tertiary">
              <span className="flex items-center gap-1">
                <MapPin size={12} /> San Francisco, CA
              </span>
              <span className="flex items-center gap-1">
                <LinkIcon size={12} /> johndoe.dev
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} /> Joined March 2024
              </span>
              <span className="flex items-center gap-1 text-warning">
                <Star size={12} /> 2,400 reputation
              </span>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-4 text-sm">
              <span>
                <strong className="text-content-primary">128</strong>{' '}
                <span className="text-content-tertiary">posts</span>
              </span>
              <span>
                <strong className="text-content-primary">1,247</strong>{' '}
                <span className="text-content-tertiary">followers</span>
              </span>
              <span>
                <strong className="text-content-primary">89</strong>{' '}
                <span className="text-content-tertiary">following</span>
              </span>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5 mt-4">
              {skills.map((skill) => (
                <Badge key={skill} variant="accent">{skill}</Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 mt-6">
          <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* Tab content */}
        <div className="px-6 py-6">
          {activeTab === 'posts' && (
            <div className="space-y-4 max-w-feed">
              {mockPosts.map((post, i) => (
                <PostCard key={i} {...post} />
              ))}
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockProjects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="flex items-center justify-center py-16 text-content-tertiary text-sm">
              No courses yet
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="flex items-center justify-center py-16 text-content-tertiary text-sm">
              Activity feed coming soon
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
