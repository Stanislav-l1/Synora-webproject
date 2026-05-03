'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import type { ApiResponse, Community, CommunityPrivacy } from '@/types';

const PRIVACY_OPTIONS: { value: CommunityPrivacy; label: string; desc: string }[] = [
  { value: 'PUBLIC',      label: 'Public',       desc: 'Anyone can find and join' },
  { value: 'INVITE_ONLY', label: 'Invite only',  desc: 'Anyone can find, but must be invited' },
  { value: 'PRIVATE',     label: 'Private',      desc: 'Hidden from discovery, invite only' },
];

export default function CreateCommunityPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy]         = useState<CommunityPrivacy>('PUBLIC');
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState<string | null>(null);

  if (!user) {
    router.push('/login');
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 3) {
      setError('Name must be at least 3 characters.');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post<ApiResponse<Community>>('/communities', {
        name: name.trim(),
        description: description.trim() || undefined,
        privacy,
      });
      router.push(`/communities/${res.data.data.slug}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Could not create community. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-xl mx-auto px-4 py-6">
        <Link
          href="/communities"
          className="inline-flex items-center gap-1.5 text-sm text-content-secondary hover:text-content-primary mb-5 transition-colors"
        >
          <ArrowLeft size={16} /> Back to communities
        </Link>

        <h1 className="text-xl font-bold text-content-primary flex items-center gap-2 mb-6">
          <Users size={20} className="text-accent" /> Create a community
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. React Developers"
            required
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this community about?"
            rows={3}
          />

          <div>
            <label className="text-sm font-medium text-content-primary mb-2 block">
              Privacy
            </label>
            <div className="space-y-2">
              {PRIVACY_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    privacy === opt.value
                      ? 'border-border-accent bg-accent/5'
                      : 'border-border-default hover:border-border-hover'
                  }`}
                >
                  <input
                    type="radio"
                    name="privacy"
                    value={opt.value}
                    checked={privacy === opt.value}
                    onChange={() => setPrivacy(opt.value)}
                    className="mt-0.5 accent-accent"
                  />
                  <div>
                    <p className="text-sm font-medium text-content-primary">{opt.label}</p>
                    <p className="text-xs text-content-tertiary">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-danger border border-danger/20 bg-danger/5 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving} className="flex-1">
              Create community
            </Button>
            <Link href="/communities">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
