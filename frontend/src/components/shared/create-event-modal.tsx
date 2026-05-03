'use client';

import { useState } from 'react';
import { X, Globe, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import api from '@/lib/api';
import type { CommunityEventType } from '@/types';
import { EVENT_TYPE_LABELS } from '@/types';

const TYPES = Object.entries(EVENT_TYPE_LABELS) as [CommunityEventType, string][];

function isoLocal(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateEventModal({ onClose, onCreated }: Props) {
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() + 7);
  defaultStart.setHours(18, 0, 0, 0);
  const defaultEnd = new Date(defaultStart);
  defaultEnd.setHours(20, 0, 0, 0);

  const [title, setTitle]         = useState('');
  const [description, setDesc]    = useState('');
  const [type, setType]           = useState<CommunityEventType>('MEETUP');
  const [startsAt, setStartsAt]   = useState(isoLocal(defaultStart));
  const [endsAt, setEndsAt]       = useState(isoLocal(defaultEnd));
  const [online, setOnline]       = useState(false);
  const [location, setLocation]   = useState('');
  const [onlineUrl, setOnlineUrl] = useState('');
  const [capacity, setCapacity]   = useState('');
  const [tags, setTags]           = useState('');
  const [publish, setPublish]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!title.trim()) { setError('Title is required.'); return; }
    const start = new Date(startsAt);
    const end   = new Date(endsAt);
    if (end < start) { setError('End must be after start.'); return; }

    setSaving(true);
    try {
      await api.post('/events', {
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        startsAt: start.toISOString(),
        endsAt:   end.toISOString(),
        online,
        location: (!online && location.trim()) ? location.trim() : undefined,
        onlineUrl: (online && onlineUrl.trim()) ? onlineUrl.trim() : undefined,
        capacity: capacity ? Number(capacity) : undefined,
        tags: tags.trim() ? tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
        publish,
      });
      onCreated();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Could not create event.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-surface-secondary rounded-xl border border-border-default shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 h-13 border-b border-border-default">
          <h2 className="text-sm font-semibold text-content-primary">Create event</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-content-tertiary hover:text-content-primary hover:bg-surface-tertiary"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My awesome hackathon"
          />

          <div>
            <label className="text-sm font-medium text-content-secondary mb-1.5 block">Type</label>
            <div className="flex flex-wrap gap-1.5">
              {TYPES.map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setType(val)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    type === val
                      ? 'bg-tyrian text-white border-tyrian'
                      : 'bg-surface-tertiary text-content-secondary border-border-default hover:border-border-hover'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="datetime-local"
              label="Starts"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
            <Input
              type="datetime-local"
              label="Ends"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
            />
          </div>

          {/* Online toggle */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setOnline(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                !online
                  ? 'border-tyrian bg-tyrian/10 text-tyrian'
                  : 'border-border-default text-content-secondary hover:border-border-hover'
              }`}
            >
              <MapPin size={14} /> In person
            </button>
            <button
              type="button"
              onClick={() => setOnline(true)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                online
                  ? 'border-tyrian bg-tyrian/10 text-tyrian'
                  : 'border-border-default text-content-secondary hover:border-border-hover'
              }`}
            >
              <Globe size={14} /> Online
            </button>
          </div>

          {online ? (
            <Input
              label="Meeting URL (shared with registered attendees)"
              value={onlineUrl}
              onChange={(e) => setOnlineUrl(e.target.value)}
              placeholder="https://meet.example.com/..."
            />
          ) : (
            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, venue, address…"
            />
          )}

          <Input
            type="number"
            label="Capacity (leave blank for unlimited)"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="e.g. 100"
          />

          <Input
            label="Tags (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="react, typescript, web"
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDesc(e.target.value)}
            rows={4}
            placeholder="Tell attendees what to expect…"
          />

          <label className="flex items-center gap-2 text-sm text-content-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={publish}
              onChange={(e) => setPublish(e.target.checked)}
              className="h-4 w-4"
            />
            Publish immediately (visible to everyone)
          </label>

          {error && <p className="text-xs text-danger">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border-default">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" loading={saving} onClick={submit}>
            {publish ? 'Create & publish' : 'Save as draft'}
          </Button>
        </div>
      </div>
    </div>
  );
}
