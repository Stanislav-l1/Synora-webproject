'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Send, Paperclip, Smile, Phone, Video, MoreVertical, Loader2 } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Avatar } from '@/components/ui/avatar';
import { cn, timeAgo } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { Chat } from '@/types';
import { useT } from '@/lib/i18n';

function chatDisplayName(chat: Chat, currentUserId: string | undefined, directFallback: string, groupFallback: string): string {
  if (chat.name) return chat.name;
  if (chat.type === 'DIRECT') {
    const other = chat.participants.find((p) => p.userId !== currentUserId);
    return other?.displayName || other?.username || directFallback;
  }
  return groupFallback;
}

export default function MessagesPage() {
  const t = useT();
  const { user } = useAuthStore();
  const {
    chats,
    activeChat,
    messages,
    isLoading,
    fetchChats,
    setActiveChat,
    fetchMessages,
  } = useChatStore();
  const { sendMessage, sendTyping } = useWebSocket();
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (activeChat) fetchMessages(activeChat.id);
  }, [activeChat, fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const filteredChats = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((c) =>
      chatDisplayName(c, user?.id, t.messages.directChat, 'Group chat').toLowerCase().includes(q),
    );
  }, [chats, search, user?.id, t.messages.directChat]);

  const activeName = activeChat ? chatDisplayName(activeChat, user?.id, t.messages.directChat, 'Group chat') : '';

  function handleSend() {
    const text = message.trim();
    if (!text || !activeChat) return;
    sendMessage(activeChat.id, text);
    setMessage('');
  }

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-theme(spacing.navbar))] bg-cloud">
        {/* Chat list */}
        <div className="w-80 border-r border-cloud-deep bg-cloud-soft flex flex-col shrink-0">
          <div className="p-3 border-b border-cloud-deep">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cloud-muted" size={14} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.messages.searchPlaceholder}
                className="w-full h-9 pl-8 pr-3 bg-white border border-cloud-deep rounded-sm text-xs text-cloud-ink placeholder:text-cloud-muted focus:outline-none focus:border-tyrian transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hidden">
            {isLoading && chats.length === 0 ? (
              <div className="flex justify-center py-8">
                <Loader2 size={20} className="animate-spin text-tyrian/60" />
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="text-center py-8 text-cloud-muted text-xs">
                {search ? t.messages.noMatch : t.messages.noChats}
              </div>
            ) : (
              filteredChats.map((chat) => {
                const name = chatDisplayName(chat, user?.id, t.messages.directChat, 'Group chat');
                const preview = chat.lastMessage?.content || '—';
                const stamp = chat.lastMessage ? timeAgo(chat.lastMessage.createdAt) : '';
                return (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => setActiveChat(chat)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                      activeChat?.id === chat.id
                        ? 'bg-tyrian/10'
                        : 'hover:bg-cloud-deep/50',
                    )}
                  >
                    <Avatar name={name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-cloud-ink truncate">{name}</span>
                        <span className="text-[10px] text-cloud-muted shrink-0 ml-2">{stamp}</span>
                      </div>
                      <p className="text-xs text-cloud-muted truncate mt-0.5">{preview}</p>
                    </div>
                    {chat.unreadCount > 0 && (
                      <span className="shrink-0 w-5 h-5 bg-tyrian rounded-full flex items-center justify-center text-[10px] font-semibold text-cloud">
                        {chat.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-cloud">
          {activeChat ? (
            <>
              <div className="flex items-center justify-between px-4 h-14 border-b border-cloud-deep bg-cloud-soft shrink-0">
                <div className="flex items-center gap-3">
                  <Avatar name={activeName} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-cloud-ink">{activeName}</p>
                    <p className="text-[10px] text-cloud-muted">
                      {activeChat.type === 'GROUP'
                        ? t.messages.groupMembers.replace('{count}', String(activeChat.participants.length))
                        : t.messages.directChat}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" aria-label={t.messages.voiceCall} className="p-2 rounded-sm text-cloud-muted hover:text-tyrian hover:bg-cloud-deep transition-colors">
                    <Phone size={16} />
                  </button>
                  <button type="button" aria-label={t.messages.videoCall} className="p-2 rounded-sm text-cloud-muted hover:text-tyrian hover:bg-cloud-deep transition-colors">
                    <Video size={16} />
                  </button>
                  <button type="button" aria-label={t.messages.moreOptions} className="p-2 rounded-sm text-cloud-muted hover:text-tyrian hover:bg-cloud-deep transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hidden px-4 py-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-cloud-muted text-xs">
                    {t.messages.noMessages}
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderId === user?.id;
                    return (
                      <div key={msg.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                        <div
                          className={cn(
                            'max-w-[70%] px-3.5 py-2.5 text-sm leading-relaxed',
                            isMine
                              ? 'bg-tyrian text-cloud rounded-2xl rounded-br-md'
                              : 'bg-cloud-soft border border-cloud-deep text-cloud-ink rounded-2xl rounded-bl-md',
                          )}
                        >
                          {!isMine && activeChat.type === 'GROUP' && (
                            <p className="text-[10px] font-semibold text-tyrian mb-0.5">
                              {msg.senderDisplayName || msg.senderUsername}
                            </p>
                          )}
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <p className={cn('text-[10px] mt-1 text-right', isMine ? 'text-cloud/70' : 'text-cloud-muted')}>
                            {timeAgo(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="px-4 py-3 border-t border-cloud-deep bg-cloud-soft">
                <div className="flex items-end gap-2">
                  <button type="button" aria-label="Attach file" className="p-2 rounded-sm text-cloud-muted hover:text-tyrian hover:bg-cloud-deep transition-colors shrink-0">
                    <Paperclip size={18} />
                  </button>
                  <div className="flex-1 bg-white border border-cloud-deep rounded-lg px-3 py-2 focus-within:border-tyrian transition-colors">
                    <textarea
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (activeChat) sendTyping(activeChat.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder={t.messages.typePlaceholder}
                      rows={1}
                      className="w-full bg-transparent text-sm text-cloud-ink placeholder:text-cloud-muted focus:outline-none resize-none"
                    />
                  </div>
                  <button type="button" aria-label="Emoji" className="p-2 rounded-sm text-cloud-muted hover:text-tyrian hover:bg-cloud-deep transition-colors shrink-0">
                    <Smile size={18} />
                  </button>
                  <button
                    type="button"
                    aria-label="Send message"
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className={cn(
                      'p-2.5 rounded-lg transition-colors shrink-0',
                      message.trim()
                        ? 'bg-tyrian text-cloud hover:bg-tyrian-soft'
                        : 'bg-cloud-deep text-cloud-muted cursor-not-allowed',
                    )}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-cloud-muted text-sm">
              {t.messages.selectChat}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
