export type NotificationType =
  | 'POST_LIKE'
  | 'POST_COMMENT'
  | 'COMMENT_REPLY'
  | 'COMMENT_LIKE'
  | 'PROJECT_INVITE'
  | 'PROJECT_JOIN'
  | 'TASK_ASSIGNED'
  | 'TASK_COMPLETED'
  | 'MESSAGE_RECEIVED'
  | 'FOLLOW'
  | 'REPUTATION_MILESTONE'
  | 'SYSTEM';

export interface Notification {
  id: string;
  type: NotificationType;
  actorId: string | null;
  actorUsername: string | null;
  actorDisplayName: string | null;
  actorAvatarUrl: string | null;
  entityId: string | null;
  entityType: string | null;
  payload: Record<string, unknown> | null;
  read: boolean;
  createdAt: string;
}
