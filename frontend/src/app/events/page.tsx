'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  CalendarDays, MapPin, Users, Video, Globe, Plus,
  Loader2, SlidersHorizontal, ChevronDown,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import api from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import type { ApiResponse, PageResponse, CommunityEvent, CommunityEventType } from '@/types';
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from '@/types';
import { CreateEventModal } from '@/components/shared/create-event-modal';

const TYPES: { value: CommunityEventType | ''; label: string }[] = [
  { value: '',           label: 'All types'  },
  { value: 'MEETUP',     label: 'Meetup'     },
  { value: 'WEBINAR',    label: 'Webinar'    },
  { value: 'CONFERENCE', label: 'Conference' },
  { value: 'HACKATHON',  label: 'Hackathon'  },
  { value: 'WORKSHOP',   label: 'Workshop'   },
  { value: 'OTHER',      label: 'Other'      },
];

function EventCard({ event }: { event: CommunityEvent }) {
  const start = new Date(event.startsAt);
  const typeColor = EVENT_TYPE_COLORS[event.type];
  const typeLabel = EVENT_TYPE_LABELS[event.type];
  const spotsLeft = event.capacity ? event.capacity - event.registeredCount : null;
  const registered = event.myRegistrationStatus === 'REGISTERED' || event.myRegistrationStatus === 'WAITLISTED';

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col rounded-xl border border-border-default bg-surface-secondary hover:border-border-hover transition-colors overflow-hidden"
    >
      {event.coverUrl ? (
        <div className="h-36 bg-surface-tertiary overflow-hidden">
          <img src={event.coverUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      ) : (
        <div className="h-36 bg-gradient-to-br from-tyrian/20 via-tyrian/10 to-surface-tertiary flex items-center justify-center">
          <CalendarDays size={32} className="text-tyrian/40" />
        </div>
      )}

      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeColor}`}>
            {typeLabel}
          </span>
          {registered && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/30">
              {event.myRegistrationStatus === 'WAITLISTED' ? 'Waitlisted' : 'Registered'}
            </span>
          )}
        </div>

        <h3 className="text-sm font-semibold text-content-primary line-clamp-2 leading-snug">
          {event.title}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-content-secondary">
          <CalendarDays size={12} className="shrink-0" />
          <span>
            {start.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            {' · '}
            {start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {event.online ? (
          <div className="flex items-center gap-1.5 text-xs text-content-secondary">
            <Video size={12} className="shrink-0" />
            <span>Online</span>
          </div>
        ) : event.location ? (
          <div className="flex items-center gap-1.5 text-xs text-content-secondary">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{event.venueName || event.location}</span>
          </div>
        ) : null}

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border-default">
          <div className="flex items-center gap-1.5 text-xs text-content-secondary">
            <Avatar
              name={event.organizerDisplayName || event.organizerUsername || '?'}
              src={event.organizerAvatarUrl}
              size="xs"
            />
            <span className="truncate max-w-[100px]">
              {event.organizerDisplayName || event.organizerUsername}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-content-tertiary">
            <Users size={11} />
            <span>
              {event.registeredCount}
              {spotsLeft !== null && spotsLeft > 0 ? ` / ${event.capacity}` : ''}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function EventsPage() {
  const [events, setEvents]       = useState<CommunityEvent[]>([]);
  const [loading, setLoading]     = useState(true);
  const [type, setType]           = useState<CommunityEventType | ''>('');
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage]           = useState(0);
  const [hasMore, setHasMore]     = useState(false);

  const load = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const p = reset ? 0 : page;
      const res = await api.get<ApiResponse<PageResponse<CommunityEvent>>>('/events', {
        params: { type: type || undefined, page: p, size: 18 },
      });
      const data = res.data.data;
      if (reset) {
        setEvents(data?.content ?? []);
        setPage(0);
      } else {
        setEvents((prev) => [...prev, ...(data?.content ?? [])]);
      }
      setHasMore(data ? !data.last : false);
    } finally {
      setLoading(false);
    }
  }, [type, page]);

  useEffect(() => { load(true); }, [type]);

  function loadMore() {
    setPage((p) => p + 1);
  }

  useEffect(() => {
    if (page > 0) load(false);
  }, [page]);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-content-primary flex items-center gap-2">
              <Globe size={22} className="text-tyrian" />
              Events
            </h1>
            <p className="text-sm text-content-secondary mt-0.5">
              Discover meetups, webinars, hackathons and more
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={15} className="mr-1.5" />
            Create event
          </Button>
        </div>

        {/* Filter row */}
        <div className="flex gap-1.5 flex-wrap mb-6">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value as CommunityEventType | '')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                type === t.value
                  ? 'bg-tyrian text-white border-tyrian'
                  : 'bg-surface-secondary text-content-secondary border-border-default hover:border-border-hover hover:text-content-primary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading && events.length === 0 ? (
          <div className="flex justify-center py-24">
            <Loader2 size={28} className="animate-spin text-tyrian/60" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-24 text-content-tertiary text-sm">
            No events found
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button variant="secondary" onClick={loadMore} loading={loading}>
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {createOpen && (
        <CreateEventModal
          onClose={() => setCreateOpen(false)}
          onCreated={() => { setCreateOpen(false); load(true); }}
        />
      )}
    </AppShell>
  );
}
