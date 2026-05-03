export interface AdminUser {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  active: boolean;
  banned: boolean;
  banReason: string | null;
  bannedAt: string | null;
  bannedById: string | null;
  reputationScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  bannedUsers: number;
  newUsersLast7Days: number;
  totalPosts: number;
  totalProjects: number;
  totalCommunities: number;
  totalReports: number;
  pendingReports: number;
}

export interface AdminReport {
  id: number;
  reporterId: string;
  reporterUsername: string;
  entityId: string;
  entityType: string;
  reason: string;
  description: string | null;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  reviewerId: string | null;
  reviewerUsername: string | null;
  reviewedAt: string | null;
  createdAt: string;
}
