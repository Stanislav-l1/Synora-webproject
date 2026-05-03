'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import type { ApiResponse, JobPosting, JobType, JobStatus } from '@/types';
import { JOB_TYPE_LABELS } from '@/types';

const JOB_TYPES: JobType[] = ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'FREELANCE', 'CO_FOUNDER', 'TEAM_MEMBER'];

export default function PostJobPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    remote: false,
    type: 'FULL_TIME' as JobType,
    status: 'OPEN' as JobStatus,
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    experienceYears: '',
    applicationUrl: '',
    skills: [] as string[],
  });

  if (!user) {
    router.push('/login');
    return null;
  }

  function addSkill() {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s) && form.skills.length < 15) {
      setForm((f) => ({ ...f, skills: [...f.skills, s] }));
      setSkillInput('');
    }
  }

  function removeSkill(skill: string) {
    setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined,
        company: form.company || undefined,
        location: form.location || undefined,
        applicationUrl: form.applicationUrl || undefined,
      };
      const res = await api.post<ApiResponse<JobPosting>>('/career', payload);
      router.push(`/career/${res.data.data.id}`);
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  }

  const field = (label: string, children: React.ReactNode, hint?: string) => (
    <div>
      <label className="block text-sm font-medium text-content-secondary mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-content-tertiary mt-1">{hint}</p>}
    </div>
  );

  const inputCls = "w-full px-3 py-2.5 bg-surface-input border border-border-default rounded-lg text-sm text-content-primary placeholder:text-content-tertiary focus:outline-none focus:border-border-accent";

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/career" className="text-sm text-content-secondary hover:text-content-primary">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-content-primary mt-2 flex items-center gap-2">
            <Briefcase size={22} className="text-accent" /> Post an Opportunity
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface-secondary border border-border-default rounded-xl p-6 space-y-5">
          {field('Title *',
            <input
              required
              maxLength={200}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Senior React Developer, Co-founder (CTO), Team member for open-source…"
              className={inputCls}
            />
          )}

          {field('Type *',
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    form.type === t
                      ? 'bg-accent text-white'
                      : 'bg-surface-tertiary text-content-secondary hover:text-content-primary border border-border-default'
                  }`}
                >
                  {JOB_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          )}

          {field('Description *',
            <textarea
              required
              rows={6}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe the role, responsibilities, what you're looking for…"
              className={`${inputCls} resize-none`}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            {field('Company / Team',
              <input
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                placeholder="Acme Inc. or your name"
                className={inputCls}
              />
            )}
            {field('Location',
              <input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Berlin, Germany"
                className={inputCls}
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="remote"
              checked={form.remote}
              onChange={(e) => setForm((f) => ({ ...f, remote: e.target.checked }))}
              className="w-4 h-4 accent-accent"
            />
            <label htmlFor="remote" className="text-sm text-content-secondary">
              Remote / work from anywhere
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {field('Salary min',
              <input
                type="number"
                min={0}
                value={form.salaryMin}
                onChange={(e) => setForm((f) => ({ ...f, salaryMin: e.target.value }))}
                placeholder="50000"
                className={inputCls}
              />
            )}
            {field('Salary max',
              <input
                type="number"
                min={0}
                value={form.salaryMax}
                onChange={(e) => setForm((f) => ({ ...f, salaryMax: e.target.value }))}
                placeholder="90000"
                className={inputCls}
              />
            )}
            {field('Currency',
              <input
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                placeholder="USD"
                maxLength={10}
                className={inputCls}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field('Min. experience (years)',
              <input
                type="number"
                min={0}
                max={30}
                value={form.experienceYears}
                onChange={(e) => setForm((f) => ({ ...f, experienceYears: e.target.value }))}
                placeholder="0"
                className={inputCls}
              />
            )}
            {field('External application URL',
              <input
                type="url"
                value={form.applicationUrl}
                onChange={(e) => setForm((f) => ({ ...f, applicationUrl: e.target.value }))}
                placeholder="https://..."
                className={inputCls}
              />,
              'Leave blank to receive applications on Synora'
            )}
          </div>

          {field('Skills / stack',
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  placeholder="e.g. React, TypeScript, Docker…"
                  className={`${inputCls} flex-1`}
                />
                <Button type="button" variant="secondary" size="sm" onClick={addSkill} icon={<Plus size={14} />}>
                  Add
                </Button>
              </div>
              {form.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.skills.map((s) => (
                    <span
                      key={s}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-surface-tertiary text-content-secondary border border-border-default"
                    >
                      {s}
                      <button type="button" onClick={() => removeSkill(s)} className="hover:text-danger">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" loading={submitting}>
              Publish Posting
            </Button>
            <Button
              type="submit"
              variant="secondary"
              loading={submitting}
              onClick={() => setForm((f) => ({ ...f, status: 'DRAFT' }))}
            >
              Save Draft
            </Button>
            <Link href="/career">
              <Button type="button" variant="ghost">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
