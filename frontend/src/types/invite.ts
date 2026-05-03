export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

export interface Invitation {
  id: string;
  email: string;
  token: string;
  status: InvitationStatus;
  message?: string | null;
  shareUrl: string;
  expiresAt: string;
  acceptedAt?: string | null;
  createdAt: string;
}

export interface Contact {
  id: number;
  email: string;
  name?: string | null;
  source: string;
  matchedUserId?: string | null;
  matchedUsername?: string | null;
  matchedDisplayName?: string | null;
  matchedAvatarUrl?: string | null;
  createdAt: string;
}

export interface ImportContactEntry {
  email: string;
  name?: string;
}
