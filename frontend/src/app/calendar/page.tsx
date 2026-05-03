'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Video,
  MapPin,
  Clock,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import api from '@/lib/api';
import type { ApiResponse } from '@/types';
import type { CalendarEvent, CalendarEventType } from '@/types/calendar';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TYPE_OPTIONS: { value: CalendarEventType; label: string; color: string }[] = [
  { value: 'MEETING',    label: 'Meeting',    color: 'bg-tyrian text-cloud' },
  { value: 'CALL',       label: 'Call',       color: 'bg-blue-600 text-white' },
  { value: 'DEADLINE',   label: 'Deadline',   color: 'bg-red-600 text-white' },
  { value: 'TASK',       label: 'Task',       color: 'bg-amber-500 text-white' },
  { value: 'TEAM_EVENT', label: 'Team event', color: 'bg-green-600 text-white' },
  { value: 'REMINDER',   label: 'Reminder',   color: 'bg-slate-500 text-white' },
];

function typeStyle(type: CalendarEventType): string {
  return TYPE_OPTIONS.find((o) => o.value === type)?.color ?? 'bg-tyrian text-cloud';
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isoLocal(d: Date) {
  // "YYYY-MM-DDTHH:mm" for <input type="datetime-local">
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function buildGrid(cursor: Date): Date[] {
  const first = startOfMonth(cursor);
  const last = endOfMonth(cursor);
  // Monday-first: weekday 0 = Sun, shift to Mon=0
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - offset);
  const cells: Date[] = [];
  const total = Math.ceil((offset + last.getDate()) / 7) * 7;
  for (let i = 0; i < total; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push(d);
  }
  return cells;
}

export default function CalendarPage() {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState<Date>(startOfMonth(today));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitialDate, setModalInitialDate] = useState<Date | null>(null);
  const [detail, setDetail] = useState<CalendarEvent | null>(null);

  const grid = useMemo(() => buildGrid(cursor), [cursor]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const from = grid[0];
      const to = new Date(grid[grid.length - 1]);
      to.setDate(to.getDate() + 1);
      const res = await api.get<ApiResponse<CalendarEvent[]>>('/calendar/events', {
        params: { from: from.toISOString(), to: to.toISOString() },
      });
      setEvents(res.data.data ?? []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [grid]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const start = new Date(e.startsAt);
      const end = new Date(e.endsAt);
      const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      while (cur <= last) {
        const key = cur.toISOString().slice(0, 10);
        const arr = map.get(key) ?? [];
        arr.push(e);
        map.set(key, arr);
        cur.setDate(cur.getDate() + 1);
      }
    }
    return map;
  }, [events]);

  function openCreate(date: Date | null) {
    setModalInitialDate(date);
    setModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this event?')) return;
    try {
      await api.delete(`/calendar/events/${id}`);
      setDetail(null);
      loadEvents();
    } catch {
      /* noop */
    }
  }

  const monthLabel = cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-cloud-ink">
            <CalendarIcon size={20} />
            <h1 className="text-lg font-semibold">Calendar</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCursor(startOfMonth(new Date()))}
              className="h-9 px-3 text-sm text-cloud-ink border border-cloud-deep rounded-sm hover:bg-cloud-soft"
            >
              Today
            </button>
            <div className="flex items-center">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                className="h-9 w-9 flex items-center justify-center text-cloud-ink border border-cloud-deep rounded-l-sm hover:bg-cloud-soft"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                className="h-9 w-9 flex items-center justify-center text-cloud-ink border border-l-0 border-cloud-deep rounded-r-sm hover:bg-cloud-soft"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="text-sm font-medium text-cloud-ink min-w-[140px] text-center capitalize">
              {monthLabel}
            </div>
            <Button type="button" size="sm" onClick={() => openCreate(null)}>
              <Plus size={14} className="mr-1" />
              New event
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-cloud-deep bg-white overflow-hidden">
          <div className="grid grid-cols-7 bg-cloud-soft border-b border-cloud-deep">
            {WEEK_DAYS.map((d) => (
              <div key={d} className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-cloud-muted">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {grid.map((d, i) => {
              const inMonth = d.getMonth() === cursor.getMonth();
              const isToday = sameDay(d, today);
              const key = d.toISOString().slice(0, 10);
              const dayEvents = eventsByDay.get(key) ?? [];
              return (
                <div
                  key={i}
                  className={`min-h-[110px] border-b border-r border-cloud-deep p-1.5 last:border-r-0 ${
                    i >= grid.length - 7 ? 'border-b-0' : ''
                  } ${inMonth ? 'bg-white' : 'bg-cloud-soft/50 text-cloud-muted'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <button
                      type="button"
                      onClick={() => openCreate(d)}
                      className={`text-xs font-medium ${
                        isToday
                          ? 'bg-tyrian text-cloud rounded-full w-6 h-6 flex items-center justify-center'
                          : 'text-cloud-ink/80 hover:text-tyrian'
                      }`}
                    >
                      {d.getDate()}
                    </button>
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((e) => (
                      <button
                        key={`${e.id}-${key}`}
                        type="button"
                        onClick={() => setDetail(e)}
                        className={`w-full text-left truncate px-1.5 py-0.5 rounded text-[11px] ${typeStyle(e.type)}`}
                        title={e.title}
                      >
                        {!e.allDay && (
                          <span className="opacity-80 mr-1">
                            {new Date(e.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        {e.title}
                      </button>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-cloud-muted">+{dayEvents.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {loading && <div className="py-2 text-center text-xs text-cloud-muted">Loading…</div>}
        </div>
      </div>

      {modalOpen && (
        <CreateEventModal
          initialDate={modalInitialDate}
          onClose={() => setModalOpen(false)}
          onCreated={() => {
            setModalOpen(false);
            loadEvents();
          }}
        />
      )}

      {detail && (
        <EventDetailModal
          event={detail}
          onClose={() => setDetail(null)}
          onDelete={handleDelete}
        />
      )}
    </AppShell>
  );
}

function CreateEventModal({
  initialDate,
  onClose,
  onCreated,
}: {
  initialDate: Date | null;
  onClose: () => void;
  onCreated: () => void;
}) {
  const base = initialDate ?? new Date();
  const defaultStart = new Date(base);
  if (!initialDate) defaultStart.setMinutes(0, 0, 0);
  else defaultStart.setHours(9, 0, 0, 0);
  const defaultEnd = new Date(defaultStart);
  defaultEnd.setHours(defaultStart.getHours() + 1);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<CalendarEventType>('MEETING');
  const [startsAt, setStartsAt] = useState(isoLocal(defaultStart));
  const [endsAt, setEndsAt] = useState(isoLocal(defaultEnd));
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);
    if (endDate < startDate) {
      setError('End time must be after start time.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/calendar/events', {
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        startsAt: startDate.toISOString(),
        endsAt: endDate.toISOString(),
        allDay,
        location: location.trim() || undefined,
        meetingUrl: meetingUrl.trim() || undefined,
      });
      onCreated();
    } catch {
      setError('Could not create event.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white rounded-lg shadow-xl border border-cloud-deep overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 h-12 border-b border-cloud-deep">
          <h2 className="text-sm font-semibold text-cloud-ink">New event</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 text-cloud-muted hover:text-cloud-ink">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sprint planning"
          />

          <div>
            <label className="text-sm font-medium text-cloud-ink/80 mb-1.5 block">Type</label>
            <div className="flex flex-wrap gap-1.5">
              {TYPE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setType(o.value)}
                  className={`px-2.5 py-1 rounded text-xs ${
                    type === o.value
                      ? o.color
                      : 'bg-cloud-soft text-cloud-ink border border-cloud-deep hover:bg-cloud-deep/40'
                  }`}
                >
                  {o.label}
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

          <label className="flex items-center gap-2 text-sm text-cloud-ink">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="h-4 w-4"
            />
            All-day event
          </label>

          <Input
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Office / room / city"
          />
          <Input
            label="Meeting URL"
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            placeholder="https://meet.example.com/..."
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 h-14 border-t border-cloud-deep">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={submit} loading={saving}>
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}

function EventDetailModal({
  event,
  onClose,
  onDelete,
}: {
  event: CalendarEvent;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const start = new Date(event.startsAt);
  const end = new Date(event.endsAt);
  const dateLine = event.allDay
    ? start.toLocaleDateString()
    : `${start.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} — ${end.toLocaleString([], { timeStyle: 'short' })}`;

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white rounded-lg shadow-xl border border-cloud-deep overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 h-12 border-b border-cloud-deep">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wide ${typeStyle(event.type)}`}>
              {event.type.replace('_', ' ')}
            </span>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 text-cloud-muted hover:text-cloud-ink">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <h3 className="text-base font-semibold text-cloud-ink">{event.title}</h3>
          <div className="flex items-center gap-2 text-sm text-cloud-ink/80">
            <Clock size={14} /> {dateLine}
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-cloud-ink/80">
              <MapPin size={14} /> {event.location}
            </div>
          )}
          {event.meetingUrl && (
            <a
              href={event.meetingUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-tyrian hover:underline"
            >
              <Video size={14} /> Join meeting
            </a>
          )}
          {event.description && (
            <p className="text-sm text-cloud-ink whitespace-pre-wrap">{event.description}</p>
          )}
          {event.projectName && (
            <p className="text-xs text-cloud-muted">Project: {event.projectName}</p>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 h-14 border-t border-cloud-deep">
          <Button type="button" variant="danger" size="sm" onClick={() => onDelete(event.id)}>
            Delete
          </Button>
          <Button type="button" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
