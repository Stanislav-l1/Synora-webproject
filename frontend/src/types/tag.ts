export interface TagSummary {
  id: number;
  name: string;
  color: string | null;
  usageCount: number;
}

export interface TagPostSummary {
  id: string;
  title: string;
  preview: string | null;
  authorUsername: string | null;
  authorDisplayName: string | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface TagProjectSummary {
  id: string;
  name: string;
  description: string | null;
  starsCount: number;
  membersCount: number;
}

export interface TagSpecialist {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  headline: string | null;
  reputationScore: number;
  matchedVia: 'skill' | 'interest';
}

export interface TagDetails {
  tag: TagSummary;
  totalPosts: number;
  totalProjects: number;
  postsLast24h: number;
  postsLast7d: number;
  growthPercent: number;
  posts: TagPostSummary[];
  discussions: TagPostSummary[];
  projects: TagProjectSummary[];
  specialists: TagSpecialist[];
}

export interface TrendingTag {
  tag: string;
  posts: number;
}
