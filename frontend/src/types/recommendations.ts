export interface RecProject {
  id: string;
  name: string;
  description: string | null;
  starsCount: number;
  membersCount: number;
  tags: string[];
}

export interface RecPost {
  id: string;
  title: string;
  preview: string | null;
  authorUsername: string | null;
  authorDisplayName: string | null;
  tags: string[];
}

export interface RecPerson {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  headline: string | null;
  sharedTags: string[];
}

export interface RecommendationsResponse {
  projects: RecProject[];
  posts: RecPost[];
  people: RecPerson[];
  basedOn: string[];
}
