'use client';

import { useState } from 'react';
import { Search, Send, Paperclip, Smile, Phone, Video, MoreVertical } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  isGroup?: boolean;
}

interface Message {
  id: string;
  text: string;
  time: string;
  isMine: boolean;
  sender?: string;
}

const mockChats: Chat[] = [
  { id: '1', name: 'Alice Chen', lastMessage: 'Sure, I will review the PR today', time: '2m', unread: 2, online: true },
  { id: '2', name: 'Bob Smith', lastMessage: 'The deployment was successful!', time: '15m', unread: 0, online: true },
  { id: '3', name: 'Synora Team', lastMessage: 'Carol: Next standup at 10am', time: '1h', unread: 5, online: false, isGroup: true },
  { id: '4', name: 'Carol Wang', lastMessage: 'Check the new ML model results', time: '3h', unread: 0, online: false },
  { id: '5', name: 'David Kim', lastMessage: 'Thanks for the code review!', time: '1d', unread: 0, online: false },
  { id: '6', name: 'Backend Guild', lastMessage: 'Eve: RFC for new auth flow', time: '2d', unread: 0, online: false, isGroup: true },
];

const mockMessages: Message[] = [
  { id: '1', text: 'Hey! Did you see the new feature spec?', time: '10:15', isMine: false },
  { id: '2', text: 'Yes! I have some concerns about the database schema though', time: '10:17', isMine: true },
  { id: '3', text: 'What specifically? The normalization strategy?', time: '10:18', isMine: false },
  { id: '4', text: 'Exactly. I think we should denormalize the user_stats table for read performance. We are hitting 50ms+ on the profile endpoint.', time: '10:20', isMine: true },
  { id: '5', text: 'Good point. Let me create a benchmark and compare both approaches. I will push a branch by EOD.', time: '10:22', isMine: false },
  { id: '6', text: 'Sure, I will review the PR today', time: '10:23', isMine: false },
];

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState('1');
  const [message, setMessage] = useState('');

  const currentChat = mockChats.find((c) => c.id === activeChat);

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-theme(spacing.navbar))]">
        {/* Chat list */}
        <div className="w-80 border-r border-border flex flex-col shrink-0">
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" size={14} />
              <input
                type="text"
                placeholder="Search chats..."
                className="w-full h-9 pl-8 pr-3 bg-surface-tertiary border border-transparent rounded-sm text-xs text-content-primary placeholder:text-content-tertiary focus:outline-none focus:bg-surface-input focus:border-border-hover transition-colors"
              />
            </div>
          </div>

          {/* Chats */}
          <div className="flex-1 overflow-y-auto scrollbar-hidden">
            {mockChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                  activeChat === chat.id
                    ? 'bg-accent-muted'
                    : 'hover:bg-surface-tertiary',
                )}
              >
                <Avatar
                  name={chat.name}
                  size="md"
                  online={chat.isGroup ? undefined : chat.online}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-content-primary truncate">
                      {chat.name}
                    </span>
                    <span className="text-[10px] text-content-tertiary shrink-0 ml-2">
                      {chat.time}
                    </span>
                  </div>
                  <p className="text-xs text-content-tertiary truncate mt-0.5">
                    {chat.lastMessage}
                  </p>
                </div>
                {chat.unread > 0 && (
                  <span className="shrink-0 w-5 h-5 bg-accent rounded-full flex items-center justify-center text-[10px] font-semibold text-white">
                    {chat.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          {currentChat && (
            <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <Avatar name={currentChat.name} size="sm" online={currentChat.online} />
                <div>
                  <p className="text-sm font-medium text-content-primary">{currentChat.name}</p>
                  <p className="text-[10px] text-content-tertiary">
                    {currentChat.online ? 'Online' : 'Last seen recently'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-sm text-content-tertiary hover:text-content-secondary hover:bg-surface-tertiary transition-colors">
                  <Phone size={16} />
                </button>
                <button className="p-2 rounded-sm text-content-tertiary hover:text-content-secondary hover:bg-surface-tertiary transition-colors">
                  <Video size={16} />
                </button>
                <button className="p-2 rounded-sm text-content-tertiary hover:text-content-secondary hover:bg-surface-tertiary transition-colors">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-hidden px-4 py-4 space-y-3">
            {/* Date separator */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] text-content-tertiary font-medium">Today</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {mockMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex',
                  msg.isMine ? 'justify-end' : 'justify-start',
                )}
              >
                <div
                  className={cn(
                    'max-w-[70%] px-3.5 py-2.5 text-sm leading-relaxed',
                    msg.isMine
                      ? 'bg-accent text-white rounded-2xl rounded-br-md'
                      : 'bg-surface-tertiary text-content-primary rounded-2xl rounded-bl-md',
                  )}
                >
                  <p>{msg.text}</p>
                  <p
                    className={cn(
                      'text-[10px] mt-1 text-right',
                      msg.isMine ? 'text-white/60' : 'text-content-tertiary',
                    )}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-border">
            <div className="flex items-end gap-2">
              <button className="p-2 rounded-sm text-content-tertiary hover:text-content-secondary hover:bg-surface-tertiary transition-colors shrink-0">
                <Paperclip size={18} />
              </button>
              <div className="flex-1 bg-surface-input border border-border rounded-lg px-3 py-2 focus-within:border-accent transition-colors">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  rows={1}
                  className="w-full bg-transparent text-sm text-content-primary placeholder:text-content-tertiary focus:outline-none resize-none"
                />
              </div>
              <button className="p-2 rounded-sm text-content-tertiary hover:text-content-secondary hover:bg-surface-tertiary transition-colors shrink-0">
                <Smile size={18} />
              </button>
              <button
                className={cn(
                  'p-2.5 rounded-lg transition-colors shrink-0',
                  message.trim()
                    ? 'bg-accent text-white hover:bg-accent-hover'
                    : 'bg-surface-tertiary text-content-tertiary',
                )}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
