export type GitProvider = 'GITHUB' | 'GITLAB' | 'BITBUCKET';

export interface GitRepository {
  id: string;
  userId: string;
  provider: GitProvider;
  externalId: string;
  name: string;
  fullName: string | null;
  description: string | null;
  url: string;
  homepageUrl: string | null;
  language: string | null;
  topics: string[];
  starsCount: number;
  forksCount: number;
  watchersCount: number;
  openIssues: number;
  privateRepo: boolean;
  fork: boolean;
  featured: boolean;
  lastPushedAt: string | null;
  syncedAt: string;
  createdAt: string;
}

export interface ContributionData {
  id: string;
  userId: string;
  provider: GitProvider;
  year: number;
  data: Record<string, number>;
  syncedAt: string;
}

export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  Kotlin: '#A97BFF',
  Rust: '#dea584',
  Go: '#00ADD8',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Vue: '#41b883',
  default: '#8b8b8e',
};
