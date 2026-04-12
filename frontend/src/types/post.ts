export interface Post {
  id: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string | null;
  authorAvatarUrl: string | null;
  title: string;
  content: string;
  tags: string[];
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  pinned: boolean;
  liked?: boolean;
  bookmarked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  tags?: string[];
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  tags?: string[];
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string | null;
  authorAvatarUrl: string | null;
  content: string;
  parentId: string | null;
  likesCount: number;
  liked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
  parentId?: string;
}
