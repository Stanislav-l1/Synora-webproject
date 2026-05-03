'use client';

import { useState, useEffect } from 'react';
import { Briefcase, MapPin, Globe, Users, Zap, Search, Filter, Plus } from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import type { ApiResponse, PageResponse, JobPosting, JobType } from '@/types';
import { JOB_TYPE_LABELS, JOB_TYPE_COLORS } from '@/types';

const JOB_TYPE_FILTERS: { label: string; value: JobType | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Full-time', value: 'FULL_TIME' },
  { label: 'Part-time', value: 'PART_TIME' },
  { label: 'Internship', value: 'INTERNSHIP' },
  { label: 'Freelance', value: 'FREELANCE' },
  { label: 'Co-founder', value: 'CO_FOUNDER' },
  { label: 'Team Member', value: 'TEAM_MEMBER' },
];

function JobCard({ job }: { job: JobPosting }) {
  return (
    <Link href={`/career/${job.id}`}>
      <div className="group bg-surface-secondary border border-border-default hover:border-border-accent rounded-xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-accent/5 cursor-pointer">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            <Avatar
              name={job.authorDisplayName || job.authorUsername}
              src={job.authorAvatarUrl || undefined}
              size="sm"
            />
            <div className="min-w-0">
              <h3 className="font-semibold text-content-primary group-hover:text-accent transition-colors line-clamp-1">
                {job.title}
              </h3>
              <p className="text-sm text-content-secondary mt-0.5">
                {job.company || job.authorDisplayName || job.authorUsername}
              </p>
            </div>
          </div>
          <Badge variant="default" className={JOB_TYPE_COLORS[job.type]}>
            {JOB_TYPE_LABELS[job.type]}
          </Badge>
        </div>

        <p className="text-sm text-content-secondary line-clamp-2 mb-4">
          {job.description}
        </p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-content-tertiary">
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {job.location}
            </span>
          )}
          {job.remote && (
            <span className="flex items-center gap-1 text-success">
              <Globe size={12} /> Remote
            </span>
          )}
          {job.salaryMin && (
            <span className="flex items-center gap-1 text-content-secondary">
              {job.currency} {job.salaryMin.toLocaleString()}
              {job.salaryMax ? `–${job.salaryMax.toLocaleString()}` : '+'}
            </span>
          )}
          {job.experienceYears != null && (
            <span>{job.experienceYears}+ yrs exp</span>
          )}
        </div>

        {job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {job.skills.slice(0, 5).map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 text-xs rounded-full bg-surface-tertiary text-content-secondary border border-border-default"
              >
                {s}
              </span>
            ))}
            {job.skills.length > 5 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-surface-tertiary text-content-tertiary">
                +{job.skills.length - 5}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-default">
          <span className="text-xs text-content-tertiary">
            {job.applicationsCount} applicant{job.applicationsCount !== 1 ? 's' : ''}
          </span>
          <span className="text-xs text-content-tertiary">
            {new Date(job.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function CareerPage() {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<JobType | ''>('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: '0', size: '30' });
    if (typeFilter) params.set('type', typeFilter);
    if (remoteOnly) params.set('remote', 'true');

    api.get<ApiResponse<PageResponse<JobPosting>>>(`/career?${params}`)
      .then((res) => setJobs(res.data.data.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [typeFilter, remoteOnly]);

  const filtered = search
    ? jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(search.toLowerCase()) ||
          j.description.toLowerCase().includes(search.toLowerCase()) ||
          (j.company || '').toLowerCase().includes(search.toLowerCase()) ||
          j.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())),
      )
    : jobs;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-content-primary flex items-center gap-2">
              <Briefcase size={24} className="text-accent" />
              Career
            </h1>
            <p className="text-content-secondary text-sm mt-1">
              Jobs, internships, freelance gigs, team & co-founder search
            </p>
          </div>
          {user && (
            <Link href="/career/post">
              <Button variant="primary" size="sm" icon={<Plus size={16} />}>
                Post
              </Button>
            </Link>
          )}
        </div>

        {/* Search + filters */}
        <div className="bg-surface-secondary border border-border-default rounded-xl p-4 mb-6 space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs, skills, companies..."
              className="w-full pl-9 pr-4 py-2 bg-surface-input border border-border-default rounded-lg text-sm text-content-primary placeholder:text-content-tertiary focus:outline-none focus:border-border-accent"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Filter size={14} className="text-content-tertiary" />
            {JOB_TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value as JobType | '')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  typeFilter === f.value
                    ? 'bg-accent text-white'
                    : 'bg-surface-tertiary text-content-secondary hover:text-content-primary hover:bg-surface-input'
                }`}
              >
                {f.label}
              </button>
            ))}
            <button
              onClick={() => setRemoteOnly(!remoteOnly)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                remoteOnly
                  ? 'bg-success/20 text-success border border-success/30'
                  : 'bg-surface-tertiary text-content-secondary hover:text-content-primary'
              }`}
            >
              <Globe size={10} /> Remote
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 text-xs text-content-tertiary mb-4">
          <span className="flex items-center gap-1">
            <Briefcase size={12} />
            {filtered.length} posting{filtered.length !== 1 ? 's' : ''}
          </span>
          {remoteOnly && <span className="text-success">Remote only</span>}
        </div>

        {/* Job list */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-40 bg-surface-secondary rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-content-tertiary">
            <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium text-content-secondary">No postings found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
            {user && (
              <Link href="/career/post" className="mt-4 inline-block">
                <Button variant="primary" size="sm" icon={<Plus size={16} />}>
                  Post the first one
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
