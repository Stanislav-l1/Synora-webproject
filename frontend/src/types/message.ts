export type ChatType = 'DIRECT' | 'GROUP';

export interface Chat {
  id: string;
  name: string | null;
  type: ChatType;
  lastMessage: Message | null;
  unreadCount: number;
  participants: ChatParticipant[];
  createdAt: string;
}

export interface ChatParticipant {
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderUsername: string;
  senderDisplayName: string | null;
  senderAvatarUrl: string | null;
  content: string;
  createdAt: string;
}

export interface SendMessageRequest {
  content: string;
}

export interface CreateChatRequest {
  participantIds: string[];
  name?: string;
  type?: ChatType;
}
