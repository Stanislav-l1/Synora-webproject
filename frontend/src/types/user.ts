export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  websiteUrl: string | null;
  githubUrl: string | null;
  headline: string | null;
  pronouns: string | null;
  availableFor: string | null;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  onboardingCompleted?: boolean;
  specialization?: string | null;
  careerGoal?: string | null;
  interests?: string[] | null;
  reputationScore: number;
  active: boolean;
  banned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: number;
  name: string;
  level: number | null;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  location: string | null;
  headline: string | null;
  pronouns: string | null;
  availableFor: string | null;
  reputationScore: number;
  role: string;
  specialization?: string | null;
  careerGoal?: string | null;
  interests?: string[] | null;
  onboardingCompleted?: boolean;
  createdAt: string;
  skills: Skill[] | null;
}

export interface FollowResponse {
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  followedAt: string;
}

export interface FollowStats {
  followers: number;
  following: number;
}

export interface UpdateProfileRequest {
  displayName?: string | null;
  bio?: string | null;
  location?: string | null;
  websiteUrl?: string | null;
  githubUrl?: string | null;
  headline?: string | null;
  pronouns?: string | null;
  availableFor?: string | null;
}
