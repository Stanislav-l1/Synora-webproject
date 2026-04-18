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
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  reputationScore: number;
  active: boolean;
  banned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  reputationScore: number;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
  createdAt: string;
}

export interface FollowResponse {
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  followedAt: string;
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
}

export interface UpdateProfileRequest {
  displayName?: string | null;
  bio?: string | null;
  location?: string | null;
  websiteUrl?: string | null;
  githubUrl?: string | null;
}
