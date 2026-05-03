export interface CareerLevel {
  code: string;
  title: string;
  minReputation: number;
}

export interface Achievement {
  code: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  awardedAt: string | null;
}

export interface ProgressResponse {
  reputation: number;
  currentLevel: CareerLevel;
  nextLevel: CareerLevel | null;
  progressPercent: number;
  reputationToNext: number;
  unlockedCount: number;
  totalCount: number;
  achievements: Achievement[];
}
