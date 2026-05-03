export type CalendarEventType =
  | 'MEETING'
  | 'CALL'
  | 'DEADLINE'
  | 'TASK'
  | 'TEAM_EVENT'
  | 'REMINDER';

export type AttendeeStatus = 'INVITED' | 'ACCEPTED' | 'DECLINED' | 'TENTATIVE';

export interface CalendarAttendee {
  userId: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  status: AttendeeStatus;
}

export interface CalendarEvent {
  id: string;
  type: CalendarEventType;
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  location?: string;
  meetingUrl?: string;
  color?: string;
  ownerId: string;
  ownerUsername?: string;
  ownerDisplayName?: string;
  projectId?: string;
  projectName?: string;
  attendees?: CalendarAttendee[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCalendarEventRequest {
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  allDay?: boolean;
  location?: string;
  meetingUrl?: string;
  color?: string;
  type?: CalendarEventType;
  projectId?: string;
  attendeeIds?: string[];
}
