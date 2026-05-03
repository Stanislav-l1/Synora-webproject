export type ReactionType = 'LIKE' | 'LOVE' | 'FIRE' | 'CLAP' | 'THINKING' | 'LAUGH';

export interface PostSummary {
  id: string;
  authorUsername: string;
  authorDisplayName: string | null;
  authorAvatarUrl: string | null;
  title: string | null;
  preview: string | null;
  coverUrl?: string | null;
  status?: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  pinned?: boolean;
  tags: { id: number; name: string; color?: string | null }[];
  liked?: boolean;
  bookmarked?: boolean;
  reposted?: boolean;
  myReaction?: ReactionType | null;
  reactions?: Record<string, number>;
  repostOf?: PostSummary | null;
  createdAt: string;
}

export interface Post extends PostSummary {
  content: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  preview?: string;
  coverUrl?: string;
  tagIds?: number[];
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  preview?: string;
  coverUrl?: string;
  tagIds?: number[];
}

export interface Comment {
  id: string;
  postId?: string;
  parentId: string | null;
  authorUsername: string;
  authorDisplayName: string | null;
  authorAvatarUrl: string | null;
  content: string;
  likesCount: number;
  deleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
  parentId?: string;
}
