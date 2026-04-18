'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, LayoutGrid, List, Loader2, X } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { TabBar } from '@/components/ui/tab-bar';
import { ProjectCard } from '@/components/shared/project-card';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import type { ApiResponse, PageResponse } from '@/types';
import { useT } from '@/lib/i18n';

interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  starsCount: number;
  membersCount: number;
  tags: { id: number; name: string }[];
  status: string | null;
  createdAt: string;
}

export default function ProjectsPage() {
  const t = useT();
  const tabs = [
    { id: 'explore', label: t.projects.tabExplore },
    { id: 'my', label: t.projects.tabMy },
    { id: 'starred', label: t.projects.tabStarred },
  ];
  const [activeTab, setActiveTab] = useState('explore');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', repoUrl: '', websiteUrl: '' });
  const [formError, setFormError] = useState<string | null>(null);

  function loadProjects() {
    setLoading(true);
    api.get<ApiResponse<PageResponse<ProjectSummary>>>('/projects?page=0&size=20')
      .then((res) => setProjects(res.data.data.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadProjects();
  }, [activeTab]);

  async function handleCreate() {
    if (!form.name.trim()) {
      setFormError(t.projects.nameRequired);
      return;
    }
    setCreating(true);
    setFormError(null);
    try {
      await api.post('/projects', {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        repoUrl: form.repoUrl.trim() || undefined,
        websiteUrl: form.websiteUrl.trim() || undefined,
        isPublic: true,
      });
      setModalOpen(false);
      setForm({ name: '', description: '', repoUrl: '', websiteUrl: '' });
      loadProjects();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setFormError(err?.response?.data?.message || t.projects.createFailed);
    } finally {
      setCreating(false);
    }
  }

  const filtered = search.trim()
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase()),
      )
    : projects;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-cloud-ink">{t.projects.title}</h1>
            <p className="text-sm text-cloud-muted mt-1">
              {t.projects.subtitle}
            </p>
          </div>
          <Button type="button" icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>{t.projects.newProject}</Button>
        </div>

        {/* Filters bar */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          <div className="flex items-center gap-2 shrink-0">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cloud-muted" size={14} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.projects.searchPlaceholder}
                className="w-48 h-9 pl-8 pr-3 bg-white border border-cloud-deep rounded-sm text-xs text-cloud-ink placeholder:text-cloud-muted focus:outline-none focus:border-tyrian transition-colors"
              />
            </div>
            {/* View toggle */}
            <div className="flex border border-cloud-deep rounded-sm overflow-hidden bg-white">
              <button
                type="button"
                aria-label="Grid view"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'grid'
                    ? 'bg-cloud-deep text-cloud-ink'
                    : 'text-cloud-muted hover:text-cloud-ink',
                )}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                type="button"
                aria-label="List view"
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'list'
                    ? 'bg-cloud-deep text-cloud-ink'
                    : 'text-cloud-muted hover:text-cloud-ink',
                )}
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="animate-spin text-tyrian/60" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-cloud-muted text-sm">
            {search ? t.projects.noMatch : t.projects.noProjects}
          </div>
        ) : (
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-3',
            )}
          >
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                name={project.name}
                description={project.description || ''}
                tags={project.tags?.map((t) => t.name)}
                members={project.membersCount}
                stars={project.starsCount}
                progress={0}
              />
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-cloud-ink/50 backdrop-blur-sm p-4"
          onClick={() => !creating && setModalOpen(false)}
        >
          <div
            className="bg-cloud-soft border border-cloud-deep rounded-lg shadow-xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-cloud-deep">
              <h2 className="text-lg font-semibold text-cloud-ink">{t.projects.modalTitle}</h2>
              <button
                type="button"
                onClick={() => !creating && setModalOpen(false)}
                className="text-cloud-muted hover:text-cloud-ink transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <Input
                label={t.projects.fieldName}
                placeholder={t.projects.fieldNamePh}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoFocus
              />
              <Textarea
                label={t.projects.fieldDescription}
                placeholder={t.projects.fieldDescriptionPh}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
              <Input
                label={t.projects.fieldRepo}
                placeholder="https://github.com/..."
                value={form.repoUrl}
                onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
              />
              <Input
                label={t.projects.fieldWebsite}
                placeholder="https://..."
                value={form.websiteUrl}
                onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
              />
              {formError && <p className="text-xs text-tyrian">{formError}</p>}
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-cloud-deep">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setModalOpen(false)}
                disabled={creating}
              >
                {t.common.cancel}
              </Button>
              <Button type="button" onClick={handleCreate} loading={creating}>
                {t.projects.create}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
