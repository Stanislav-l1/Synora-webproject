'use client';

import { useState, useEffect } from 'react';
import {
  Github, GitlabIcon, GitFork, Star, Plus, RefreshCw, Trash2, X,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { RepoCard } from '@/components/shared/repo-card';
import { ContributionGraph } from '@/components/shared/contribution-graph';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import type { ApiResponse, GitRepository, ContributionData, GitProvider } from '@/types';

type Tab = 'showcase' | 'contributions' | 'import';

function ImportModal({ onClose, onImport }: { onClose: () => void; onImport: (repo: GitRepository) => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    provider: 'GITHUB' as GitProvider,
    externalId: '',
    name: '',
    fullName: '',
    description: '',
    url: '',
    homepageUrl: '',
    language: '',
    topics: '',
    starsCount: '',
    forksCount: '',
    watchersCount: '',
    openIssues: '',
    privateRepo: false,
    fork: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post<ApiResponse<GitRepository>>('/repos', {
        ...form,
        topics: form.topics ? form.topics.split(',').map((t) => t.trim()).filter(Boolean) : [],
        starsCount: Number(form.starsCount) || 0,
        forksCount: Number(form.forksCount) || 0,
        watchersCount: Number(form.watchersCount) || 0,
        openIssues: Number(form.openIssues) || 0,
        homepageUrl: form.homepageUrl || undefined,
        language: form.language || undefined,
        description: form.description || undefined,
      });
      onImport(res.data.data);
      onClose();
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = 'w-full px-3 py-2 bg-surface-input border border-border-default rounded-lg text-sm text-content-primary placeholder:text-content-tertiary focus:outline-none focus:border-border-accent';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface-secondary border border-border-default rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border-default">
          <h2 className="font-semibold text-content-primary flex items-center gap-2">
            <Plus size={16} className="text-accent" /> Import Repository
          </h2>
          <button onClick={onClose} className="text-content-tertiary hover:text-content-primary">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-content-secondary mb-1">Provider</label>
            <div className="flex gap-2">
              {(['GITHUB', 'GITLAB', 'BITBUCKET'] as GitProvider[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, provider: p }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    form.provider === p
                      ? 'bg-accent text-white'
                      : 'bg-surface-tertiary text-content-secondary border border-border-default'
                  }`}
                >
                  {p === 'GITHUB' ? '🐙 GitHub' : p === 'GITLAB' ? '🦊 GitLab' : '🪣 Bitbucket'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-content-secondary mb-1">External ID *</label>
              <input required value={form.externalId} onChange={(e) => setForm((f) => ({ ...f, externalId: e.target.value }))} placeholder="123456789" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-content-secondary mb-1">Name *</label>
              <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="my-repo" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-content-secondary mb-1">Full name</label>
            <input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} placeholder="username/my-repo" className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-medium text-content-secondary mb-1">URL *</label>
            <input required type="url" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://github.com/..." className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-medium text-content-secondary mb-1">Description</label>
            <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="What this repo does" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-content-secondary mb-1">Language</label>
              <input value={form.language} onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))} placeholder="TypeScript" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-content-secondary mb-1">Homepage URL</label>
              <input type="url" value={form.homepageUrl} onChange={(e) => setForm((f) => ({ ...f, homepageUrl: e.target.value }))} placeholder="https://..." className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-content-secondary mb-1">Topics (comma-separated)</label>
            <input value={form.topics} onChange={(e) => setForm((f) => ({ ...f, topics: e.target.value }))} placeholder="react, typescript, open-source" className={inputCls} />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Stars', key: 'starsCount' },
              { label: 'Forks', key: 'forksCount' },
              { label: 'Watchers', key: 'watchersCount' },
              { label: 'Issues', key: 'openIssues' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-content-secondary mb-1">{label}</label>
                <input
                  type="number"
                  min={0}
                  value={(form as Record<string, string | boolean>)[key] as string}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder="0"
                  className={inputCls}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-content-secondary cursor-pointer">
              <input type="checkbox" checked={form.privateRepo} onChange={(e) => setForm((f) => ({ ...f, privateRepo: e.target.checked }))} className="accent-accent" />
              Private
            </label>
            <label className="flex items-center gap-2 text-sm text-content-secondary cursor-pointer">
              <input type="checkbox" checked={form.fork} onChange={(e) => setForm((f) => ({ ...f, fork: e.target.checked }))} className="accent-accent" />
              Fork
            </label>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              Import
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RepositoriesPage() {
  const { user } = useAuthStore();
  const [repos, setRepos] = useState<GitRepository[]>([]);
  const [contributions, setContributions] = useState<ContributionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('showcase');
  const [showImport, setShowImport] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get<ApiResponse<GitRepository[]>>(`/users/${user.id}/repos`),
      api.get<ApiResponse<ContributionData[]>>(`/users/${user.id}/contributions`),
    ])
      .then(([reposRes, contribRes]) => {
        setRepos(reposRes.data.data);
        setContributions(contribRes.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  async function handleToggleFeatured(id: string) {
    try {
      const res = await api.post<ApiResponse<GitRepository>>(`/repos/${id}/feature`);
      setRepos((prev) => prev.map((r) => (r.id === id ? res.data.data : r)));
    } catch {
      // ignore
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this repository from your profile?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/repos/${id}`);
      setRepos((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  }

  const featured = repos.filter((r) => r.featured);
  const all = [...repos].sort((a, b) => b.starsCount - a.starsCount);

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'showcase', label: 'Showcase', count: repos.length },
    { key: 'contributions', label: 'Contributions' },
    { key: 'import', label: 'Manage' },
  ];

  if (!user) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto px-4 py-20 text-center text-content-tertiary">
          Sign in to manage your repositories.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-content-primary flex items-center gap-2">
              <Github size={24} className="text-content-secondary" />
              Repositories
            </h1>
            <p className="text-content-secondary text-sm mt-1">
              Your open-source portfolio & contribution graph
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={16} />}
            onClick={() => setShowImport(true)}
          >
            Import repo
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-surface-secondary border border-border-default rounded-xl p-1 w-fit">
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === key
                  ? 'bg-accent text-white'
                  : 'text-content-secondary hover:text-content-primary'
              }`}
            >
              {label}
              {count != null && (
                <span className={`ml-1.5 text-xs ${tab === key ? 'opacity-80' : 'text-content-tertiary'}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-surface-secondary rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Showcase tab */}
            {tab === 'showcase' && (
              <div className="space-y-6">
                {featured.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-3">
                      ⭐ Featured
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {featured.map((r) => (
                        <RepoCard key={r.id} repo={r} />
                      ))}
                    </div>
                  </div>
                )}

                {all.length === 0 ? (
                  <div className="text-center py-20 text-content-tertiary">
                    <Github size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium text-content-secondary">No repositories yet</p>
                    <p className="text-sm mt-1">Import from GitHub or GitLab to build your portfolio</p>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Plus size={14} />}
                      className="mt-4"
                      onClick={() => setShowImport(true)}
                    >
                      Import repo
                    </Button>
                  </div>
                ) : (
                  <div>
                    {featured.length > 0 && (
                      <p className="text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-3">
                        All ({all.length})
                      </p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {all.map((r) => (
                        <RepoCard key={r.id} repo={r} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Contributions tab */}
            {tab === 'contributions' && (
              <div className="space-y-4">
                <ContributionGraph contributions={contributions} />

                <div className="bg-surface-secondary border border-border-default rounded-xl p-4">
                  <p className="text-sm text-content-secondary mb-3">
                    Contribution data is synced from GitHub / GitLab via their APIs. To upload
                    your data, use the API endpoint <code className="text-accent text-xs">/api/v1/contributions</code> with
                    a date→count map (YYYY-MM-DD keys).
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      { label: 'Repos', value: repos.length },
                      { label: 'Stars total', value: repos.reduce((a, r) => a + r.starsCount, 0) },
                      { label: 'Forks total', value: repos.reduce((a, r) => a + r.forksCount, 0) },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-surface-tertiary rounded-lg p-3">
                        <p className="text-xl font-bold text-content-primary">{value.toLocaleString()}</p>
                        <p className="text-xs text-content-tertiary mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Manage tab */}
            {tab === 'import' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-content-secondary">{repos.length} imported repositories</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Plus size={14} />}
                    onClick={() => setShowImport(true)}
                  >
                    Import
                  </Button>
                </div>

                {repos.length === 0 ? (
                  <div className="text-center py-12 text-content-tertiary bg-surface-secondary rounded-xl border border-border-default">
                    No repositories imported yet.
                  </div>
                ) : (
                  repos.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 bg-surface-secondary border border-border-default rounded-xl p-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-accent hover:underline truncate"
                          >
                            {r.fullName || r.name}
                          </a>
                          <span className="text-xs text-content-tertiary shrink-0">
                            {r.provider}
                          </span>
                        </div>
                        {r.description && (
                          <p className="text-xs text-content-tertiary mt-0.5 truncate">{r.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-content-tertiary">
                          {r.language && <span>{r.language}</span>}
                          <span className="flex items-center gap-1"><Star size={10} />{r.starsCount}</span>
                          <span className="flex items-center gap-1"><GitFork size={10} />{r.forksCount}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleFeatured(r.id)}
                          title={r.featured ? 'Unfeature' : 'Feature on profile'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            r.featured
                              ? 'text-yellow-400 bg-yellow-400/10'
                              : 'text-content-tertiary hover:text-yellow-400 hover:bg-yellow-400/10'
                          }`}
                        >
                          <Star size={14} fill={r.featured ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={deletingId === r.id}
                          className="p-1.5 rounded-lg text-content-tertiary hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImport={(repo) => setRepos((prev) => [repo, ...prev])}
        />
      )}
    </AppShell>
  );
}
