'use client';

import { useEffect, useState } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import type { ApiResponse, Skill, UserProfile, UpdateProfileRequest } from '@/types';

interface EditProfileModalProps {
  open: boolean;
  profile: UserProfile | null;
  onClose: () => void;
  onSaved: (profile: UserProfile) => void;
}

export function EditProfileModal({ open, profile, onClose, onSaved }: EditProfileModalProps) {
  const [form, setForm] = useState<UpdateProfileRequest>({});
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setForm({
      displayName: profile.displayName ?? '',
      bio: profile.bio ?? '',
      location: profile.location ?? '',
      websiteUrl: profile.websiteUrl ?? '',
      githubUrl: profile.githubUrl ?? '',
      headline: profile.headline ?? '',
      pronouns: profile.pronouns ?? '',
      availableFor: profile.availableFor ?? '',
    });
    setSkills(profile.skills ?? []);
  }, [profile]);

  if (!open || !profile) return null;

  const update = <K extends keyof UpdateProfileRequest>(k: K, v: UpdateProfileRequest[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const addSkill = async () => {
    const name = newSkill.trim();
    if (!name) return;
    try {
      const res = await api.post<ApiResponse<Skill>>('/users/me/skills', { name });
      setSkills((s) => [...s.filter((x) => x.name !== res.data.data.name), res.data.data]);
      setNewSkill('');
    } catch {
      setError('Failed to add skill');
    }
  };

  const removeSkill = async (id: number) => {
    try {
      await api.delete(`/users/me/skills/${id}`);
      setSkills((s) => s.filter((x) => x.id !== id));
    } catch {
      setError('Failed to remove skill');
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await api.patch<ApiResponse<UserProfile>>('/users/me', form);
      onSaved({ ...res.data.data, skills });
      onClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white border border-cloud-deep rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-cloud-deep sticky top-0 bg-white z-10">
          <h3 className="text-base font-semibold text-cloud-ink">Edit Profile</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-cloud-muted hover:text-cloud-ink hover:bg-cloud-soft"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <Field label="Display name">
            <input
              type="text"
              value={form.displayName ?? ''}
              onChange={(e) => update('displayName', e.target.value)}
              className={input}
            />
          </Field>

          <Field label="Headline">
            <input
              type="text"
              value={form.headline ?? ''}
              onChange={(e) => update('headline', e.target.value)}
              placeholder="Senior Java Engineer"
              maxLength={120}
              className={input}
            />
          </Field>

          <Field label="Bio">
            <textarea
              value={form.bio ?? ''}
              onChange={(e) => update('bio', e.target.value)}
              rows={3}
              maxLength={500}
              className={`${input} resize-none`}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Pronouns">
              <input
                type="text"
                value={form.pronouns ?? ''}
                onChange={(e) => update('pronouns', e.target.value)}
                placeholder="she/her"
                maxLength={30}
                className={input}
              />
            </Field>
            <Field label="Available for">
              <input
                type="text"
                value={form.availableFor ?? ''}
                onChange={(e) => update('availableFor', e.target.value)}
                placeholder="Hiring, Freelance, Collab"
                maxLength={120}
                className={input}
              />
            </Field>
          </div>

          <Field label="Location">
            <input
              type="text"
              value={form.location ?? ''}
              onChange={(e) => update('location', e.target.value)}
              className={input}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Website">
              <input
                type="url"
                value={form.websiteUrl ?? ''}
                onChange={(e) => update('websiteUrl', e.target.value)}
                placeholder="https://…"
                className={input}
              />
            </Field>
            <Field label="GitHub">
              <input
                type="url"
                value={form.githubUrl ?? ''}
                onChange={(e) => update('githubUrl', e.target.value)}
                placeholder="https://github.com/…"
                className={input}
              />
            </Field>
          </div>

          <div>
            <span className="text-xs text-cloud-muted">Skills</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-cloud-soft border border-cloud-deep text-cloud-ink"
                >
                  {s.name}
                  <button
                    type="button"
                    onClick={() => removeSkill(s.id)}
                    className="text-cloud-muted hover:text-red-600"
                  >
                    <Trash2 size={10} />
                  </button>
                </span>
              ))}
              {skills.length === 0 && (
                <span className="text-xs text-cloud-muted">No skills yet</span>
              )}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Add a skill"
                maxLength={100}
                className={`${input} flex-1`}
              />
              <Button type="button" variant="secondary" size="sm" onClick={addSkill}>
                <Plus size={14} />
              </Button>
            </div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <div className="px-5 py-4 border-t border-cloud-deep flex justify-end gap-2 sticky bottom-0 bg-white">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={save} disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}

const input =
  'w-full bg-white border border-cloud-deep rounded-md px-3 py-2 text-sm text-cloud-ink placeholder:text-cloud-muted focus:outline-none focus:border-tyrian';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-cloud-muted">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
