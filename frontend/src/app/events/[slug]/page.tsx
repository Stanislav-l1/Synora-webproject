'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarDays, MapPin, Users, Video, Globe,
  ArrowLeft, Loader2, CheckCircle2, AlertCircle, ExternalLink, CalendarPlus,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse, CommunityEvent } from '@/types';
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from '@/types';

export default function EventDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [event, setEvent]         = useState<CommunityEvent | null>(null);
  const [loading, setLoading]     = useState(true);
  const [registering, setRegistering] = useState(false);
  const [addingCal, setAddingCal]   = useState(false);
  const [calAdded, setCalAdded]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    if (!params.slug) return;
    api.get<ApiResponse<CommunityEvent>>(`/events/${params.slug}`)
      .then((r) => setEvent(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.slug]);

  async function handleRegister() {
    if (!event) return;
    setError(null);
    setRegistering(true);
    try {
      const res = await api.post<ApiResponse<CommunityEvent>>(`/events/${event.slug}/register`);
      setEvent(res.data.data);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Could not register. Please try again.');
    } finally {
      setRegistering(false);
    }
  }

  async function handleAddToCalendar() {
    if (!event) return;
    setAddingCal(true);
    try {
      await api.post('/calendar/events', {
        title: event.title,
        description: event.description,
        type: 'TEAM_EVENT',
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        allDay: false,
        location: event.online ? undefined : event.location,
        meetingUrl: event.online ? event.onlineUrl : undefined,
      });
      setCalAdded(true);
    } finally {
      setAddingCal(false);
    }
  }

  async function handleCancel() {
    if (!event) return;
    setError(null);
    setRegistering(true);
    try {
      const res = await api.delete<ApiResponse<CommunityEvent>>(`/events/${event.slug}/register`);
      setEvent(res.data.data);
    } finally {
      setRegistering(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center py-32">
          <Loader2 size={28} className="animate-spin text-tyrian/60" />
        </div>
      </AppShell>
    );
  }

  if (!event) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-content-secondary text-sm">Event not found.</p>
          <Button variant="ghost" className="mt-4" onClick={() => router.push('/events')}>
            Back to Events
          </Button>
        </div>
      </AppShell>
    );
  }

  const start = new Date(event.startsAt);
  const end   = new Date(event.endsAt);
  const now   = new Date();
  const isPast = end < now;
  const spotsLeft = event.capacity != null ? event.capacity - event.registeredCount : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  const myStatus = event.myRegistrationStatus;
  const isRegistered = myStatus === 'REGISTERED';
  const isWaitlisted = myStatus === 'WAITLISTED';
  const isCancelled  = myStatus === 'CANCELLED' || !myStatus;

  const typeColor = EVENT_TYPE_COLORS[event.type];
  const typeLabel = EVENT_TYPE_LABELS[event.type];

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-sm text-content-secondary hover:text-content-primary mb-6"
        >
          <ArrowLeft size={14} /> Back to Events
        </Link>

        {/* Cover */}
        {event.coverUrl ? (
          <div className="rounded-xl overflow-hidden h-56 mb-6">
            <img src={event.coverUrl} alt={event.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="rounded-xl h-48 mb-6 bg-gradient-to-br from-tyrian/20 via-tyrian/10 to-surface-tertiary flex items-center justify-center">
            <Globe size={48} className="text-tyrian/30" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${typeColor}`}>
                  {typeLabel}
                </span>
                {isPast && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-tertiary text-content-tertiary border border-border-default">
                    Past event
                  </span>
                )}
                {event.status === 'CANCELLED' && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-danger/10 text-danger border border-danger/30">
                    Cancelled
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-content-primary">{event.title}</h1>
            </div>

            {event.description && (
              <div className="prose prose-sm prose-invert max-w-none">
                <p className="text-content-secondary whitespace-pre-wrap text-sm leading-relaxed">
                  {event.description}
                </p>
              </div>
            )}

            {event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs rounded-full bg-surface-tertiary text-content-secondary border border-border-default"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Organizer */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-secondary border border-border-default">
              <Avatar
                name={event.organizerDisplayName || event.organizerUsername || '?'}
                src={event.organizerAvatarUrl}
                size="md"
              />
              <div>
                <p className="text-xs text-content-tertiary">Organized by</p>
                <Link
                  href={`/u/${event.organizerUsername}`}
                  className="text-sm font-semibold text-content-primary hover:text-tyrian transition-colors"
                >
                  {event.organizerDisplayName || event.organizerUsername}
                </Link>
                {event.communityName && (
                  <p className="text-xs text-content-secondary">
                    <Link href={`/communities/${event.communitySlug}`} className="hover:text-tyrian transition-colors">
                      {event.communityName}
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border-default bg-surface-secondary p-5 space-y-4">
              {/* Date & time */}
              <div className="flex gap-3">
                <CalendarDays size={16} className="text-tyrian shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-content-primary">
                    {start.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-content-secondary">
                    {start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    {' — '}
                    {end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    {event.timezone !== 'UTC' ? ` ${event.timezone}` : ''}
                  </p>
                </div>
              </div>

              {/* Location */}
              {event.online ? (
                <div className="flex gap-3">
                  <Video size={16} className="text-tyrian shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-content-primary">Online</p>
                    {event.onlineUrl && (isRegistered || isWaitlisted) && (
                      <a
                        href={event.onlineUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-tyrian hover:underline flex items-center gap-1"
                      >
                        Join link <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              ) : event.location ? (
                <div className="flex gap-3">
                  <MapPin size={16} className="text-tyrian shrink-0 mt-0.5" />
                  <div>
                    {event.venueName && (
                      <p className="text-sm font-medium text-content-primary">{event.venueName}</p>
                    )}
                    <p className="text-xs text-content-secondary">{event.location}</p>
                  </div>
                </div>
              ) : null}

              {/* Attendees */}
              <div className="flex gap-3">
                <Users size={16} className="text-tyrian shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-content-primary">
                    {event.registeredCount} registered
                  </p>
                  {event.capacity != null && (
                    <p className="text-xs text-content-secondary">
                      {spotsLeft! > 0 ? `${spotsLeft} spots left` : 'Full — waitlist open'}
                    </p>
                  )}
                </div>
              </div>

              {/* Registration CTA */}
              {event.status === 'PUBLISHED' && !isPast && (
                <div className="pt-2 border-t border-border-default space-y-2">
                  {error && (
                    <p className="text-xs text-danger flex items-center gap-1">
                      <AlertCircle size={12} /> {error}
                    </p>
                  )}

                  {(isRegistered || isWaitlisted) ? (
                    <>
                      <div className={cn(
                        'flex items-center gap-2 text-sm font-medium',
                        isRegistered ? 'text-success' : 'text-amber-400',
                      )}>
                        <CheckCircle2 size={15} />
                        {isRegistered ? "You're registered" : 'On waitlist'}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-danger hover:text-danger"
                        loading={registering}
                        onClick={handleCancel}
                      >
                        Cancel registration
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="w-full"
                      size="md"
                      loading={registering}
                      onClick={handleRegister}
                    >
                      {isFull ? 'Join waitlist' : 'Register — Free'}
                    </Button>
                  )}
                </div>
              )}

              {isPast && (
                <p className="text-xs text-content-tertiary text-center pt-2 border-t border-border-default">
                  This event has ended
                </p>
              )}

              {/* Add to personal calendar */}
              <div className="pt-2 border-t border-border-default">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-2 text-content-secondary"
                  loading={addingCal}
                  disabled={calAdded}
                  onClick={handleAddToCalendar}
                >
                  <CalendarPlus size={14} />
                  {calAdded ? 'Added to calendar' : 'Add to my calendar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
