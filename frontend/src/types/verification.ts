export type VerificationType   = 'PROFESSIONAL' | 'COMPANY' | 'MENTOR' | 'STARTUP';
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface VerificationInfo {
  id:          string;
  type:        VerificationType;
  status:      VerificationStatus;
  notes?:      string;
  adminNotes?: string;
  reviewedAt?: string;
  createdAt:   string;
  username?:   string;
  displayName?: string;
  avatarUrl?:  string;
}

export const VERIFICATION_LABELS: Record<VerificationType, string> = {
  PROFESSIONAL: 'Verified Professional',
  COMPANY:      'Verified Company',
  MENTOR:       'Verified Mentor',
  STARTUP:      'Verified Startup',
};

export const VERIFICATION_DESCRIPTIONS: Record<VerificationType, string> = {
  PROFESSIONAL: 'Recognized software engineer or IT professional',
  COMPANY:      'Verified tech company or organization',
  MENTOR:       'Experienced mentor accepted to the Synora mentoring program',
  STARTUP:      'Verified tech startup or early-stage company',
};
