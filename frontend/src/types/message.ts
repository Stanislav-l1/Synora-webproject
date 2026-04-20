export type ChatType = 'DIRECT' | 'GROUP' | 'PROJECT';

export interface Chat {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  type: ChatType;
  lastMessage: Message | null;
  unreadCount: number;
  members: ChatMember[];
  projectId?: string | null;
  projectName?: string | null;
  createdAt: string;
}

export interface ChatMember {
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  admin: boolean;
  muted: boolean;
  joinedAt: string;
  lastReadAt: string | null;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderUsername: string;
  senderDisplayName: string | null;
  senderAvatarUrl: string | null;
  replyToId: string | null;
  replyToContent: string | null;
  content: string | null;
  deleted: boolean;
  editedAt: string | null;
  createdAt: string;
}

export interface SendMessageRequest {
  content: string;
  replyToId?: string;
}

export interface CreateGroupChatRequest {
  type: 'GROUP';
  name: string;
  avatarUrl?: string;
  memberIds: string[];
}
