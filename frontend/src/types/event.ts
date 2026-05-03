export type CommunityEventType = 'MEETUP' | 'WEBINAR' | 'CONFERENCE' | 'HACKATHON' | 'WORKSHOP' | 'OTHER';
export type CommunityEventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
export type EventRegistrationStatus = 'REGISTERED' | 'WAITLISTED' | 'CANCELLED' | 'ATTENDED';

export interface CommunityEvent {
  id: string;
  slug: string;
  type: CommunityEventType;
  status: CommunityEventStatus;
  title: string;
  description?: string;
  coverUrl?: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  location?: string;
  venueName?: string;
  onlineUrl?: string;
  online: boolean;
  capacity?: number;
  registeredCount: number;
  tags: string[];
  organizerId: string;
  organizerUsername?: string;
  organizerDisplayName?: string;
  organizerAvatarUrl?: string;
  communityId?: string;
  communityName?: string;
  communitySlug?: string;
  myRegistrationStatus?: EventRegistrationStatus | null;
  createdAt: string;
  updatedAt: string;
}

export const EVENT_TYPE_LABELS: Record<CommunityEventType, string> = {
  MEETUP:     'Meetup',
  WEBINAR:    'Webinar',
  CONFERENCE: 'Conference',
  HACKATHON:  'Hackathon',
  WORKSHOP:   'Workshop',
  OTHER:      'Event',
};

export const EVENT_TYPE_COLORS: Record<CommunityEventType, string> = {
  MEETUP:     'bg-tyrian/10 text-tyrian border-tyrian/30',
  WEBINAR:    'bg-blue-500/10 text-blue-400 border-blue-500/30',
  CONFERENCE: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  HACKATHON:  'bg-green-500/10 text-green-400 border-green-500/30',
  WORKSHOP:   'bg-amber-500/10 text-amber-400 border-amber-500/30',
  OTHER:      'bg-surface-tertiary text-content-secondary border-border-default',
};
