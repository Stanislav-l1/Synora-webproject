'use client';

import { useState } from 'react';
import { Plus, Search, LayoutGrid, List } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { TabBar } from '@/components/ui/tab-bar';
import { ProjectCard } from '@/components/shared/project-card';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'my', label: 'My Projects', count: 7 },
  { id: 'starred', label: 'Starred', count: 12 },
  { id: 'explore', label: 'Explore' },
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
  {
    id: '4',
    name: 'Auth Microservice',
    description: 'Standalone authentication service with OAuth2, SAML, and passkey support',
    tags: ['Rust', 'gRPC', 'Security'],
    members: 2,
    stars: 45,
    progress: 60,
  },
  {
    id: '5',
    name: 'Design System',
    description: 'Shared component library and design tokens for all Synora frontend apps',
    tags: ['React', 'Storybook', 'Figma'],
    members: 4,
    stars: 38,
    progress: 35,
  },
  {
    id: '6',
    name: 'ML Pipeline',
    description: 'End-to-end machine learning pipeline for training and deploying recommendation models',
    tags: ['Python', 'PyTorch', 'MLOps'],
    members: 6,
    stars: 156,
    progress: 55,
  },
];

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState('my');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-content-primary">Projects</h1>
            <p className="text-sm text-content-secondary mt-1">
              Manage and discover collaborative projects
            </p>
          </div>
          <Button icon={<Plus size={16} />}>New Project</Button>
        </div>

        {/* Filters bar */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          <div className="flex items-center gap-2 shrink-0">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" size={14} />
              <input
                type="text"
                placeholder="Search projects..."
                className="w-48 h-9 pl-8 pr-3 bg-surface-input border border-border rounded-sm text-xs text-content-primary placeholder:text-content-tertiary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            {/* View toggle */}
            <div className="flex border border-border rounded-sm overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'grid'
                    ? 'bg-surface-tertiary text-content-primary'
                    : 'text-content-tertiary hover:text-content-secondary',
                )}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'list'
                    ? 'bg-surface-tertiary text-content-primary'
                    : 'text-content-tertiary hover:text-content-secondary',
                )}
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Project grid */}
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3',
          )}
        >
          {mockProjects.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
