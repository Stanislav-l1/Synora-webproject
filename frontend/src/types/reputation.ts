export interface TrustLevel {
  code: string;
  title: string;
  minScore: number;
  description: string;
}

export interface ReputationBreakdown {
  totalReputation: number;
  activityScore: number;
  contributionScore: number;
  qualityScore: number;
  endorsementsCount: number;
  peerReviewsCount: number;
  peerReviewAvg: number;
  trustLevel: TrustLevel;
  nextLevel: TrustLevel | null;
  trustProgressPercent: number;
}

export interface EndorserMini {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface EndorsementSummary {
  skillId: number;
  skillName: string;
  count: number;
  endorsedByMe: boolean;
  recentEndorsers: EndorserMini[];
}

export type PeerReviewContext = 'PROJECT' | 'COURSE' | 'MENTORSHIP' | 'GENERAL';

export interface PeerReviewDto {
  id: string;
  reviewerId: string;
  reviewerUsername: string | null;
  reviewerDisplayName: string | null;
  reviewerAvatarUrl: string | null;
  score: number;
  context: PeerReviewContext;
  comment: string | null;
  createdAt: string;
}
