'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search, Send, Paperclip, Smile, Phone, Video, MoreVertical, Loader2, Plus,
  Briefcase, Users as UsersIcon, CornerUpLeft, X, Check, CheckCheck,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Avatar } from '@/components/ui/avatar';
import { NewChatModal } from '@/components/shared';
import { cn, timeAgo } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { Chat, Message, ChatMember } from '@/types';
import { useT } from '@/lib/i18n';

function chatDisplayName(chat: Chat, currentUserId: string | undefined, directFallback: string, groupFallback: string): string {
  if (chat.name) return chat.name;
  if (chat.type === 'DIRECT') {
    const other = chat.members.find((p) => p.userId !== currentUserId);
    return other?.displayName || other?.username || directFallback;
  }
  if (chat.type === 'PROJECT' && chat.projectName) return chat.projectName;
  return groupFallback;
}

function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatDayLabel(iso: string, today: string, yesterday: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return today;
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return yesterday;
  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
  }
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

type TimelineItem =
  | { kind: 'divider'; id: string; label: string }
  | { kind: 'message'; id: string; msg: Message };

function buildTimeline(messages: Message[], todayLabel: string, yesterdayLabel: string): TimelineItem[] {
  const out: TimelineItem[] = [];
  let lastKey: string | null = null;
  for (const msg of messages) {
    const k = dayKey(msg.createdAt);
    if (k !== lastKey) {
      out.push({
        kind: 'divider',
        id: `divider-${k}`,
        label: formatDayLabel(msg.createdAt, todayLabel, yesterdayLabel),
      });
      lastKey = k;
    }
    out.push({ kind: 'message', id: msg.id, msg });
  }
  return out;
}

function seenByMembers(
  msg: Message,
  chat: Chat,
  currentUserId: string | undefined,
): ChatMember[] {
  const msgTime = new Date(msg.createdAt).getTime();
  return chat.members.filter((m) => {
    if (m.userId === msg.senderId) return false;
    if (m.userId === currentUserId) return false;
    if (!m.lastReadAt) return false;
    return new Date(m.lastReadAt).getTime() >= msgTime;
  });
}

export default function MessagesPage() {
  const t = useT();
  const { user } = useAuthStore();
  const {
    chats,
    activeChat,
    messages,
    isLoading,
    typingUsers,
    fetchChats,
    setActiveChat,
    fetchMessages,
  } = useChatStore();
  const { sendMessage, sendTyping } = useWebSocket();
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (activeChat) fetchMessages(activeChat.id);
    setReplyingTo(null);
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

  const groupedChats = useMemo(() => {
    const direct: Chat[] = [];
    const group: Chat[] = [];
    const project: Chat[] = [];
    for (const c of filteredChats) {
      if (c.type === 'DIRECT') direct.push(c);
      else if (c.type === 'GROUP') group.push(c);
      else if (c.type === 'PROJECT') project.push(c);
    }
    return { direct, group, project };
  }, [filteredChats]);

  const activeName = activeChat ? chatDisplayName(activeChat, user?.id, t.messages.directChat, 'Group chat') : '';

  const timeline = useMemo(
    () => buildTimeline(messages, t.messages.today, t.messages.yesterday),
    [messages, t.messages.today, t.messages.yesterday],
  );

  const typingLabel = useMemo(() => {
    if (!activeChat) return '';
    const prefix = `${activeChat.id}:`;
    const names: string[] = [];
    typingUsers.forEach((name, key) => {
      if (key.startsWith(prefix)) names.push(name);
    });
    if (names.length === 0) return '';
    if (names.length === 1) return t.messages.typingOne.replace('{name}', names[0]);
    if (names.length === 2) return t.messages.typingTwo.replace('{a}', names[0]).replace('{b}', names[1]);
    return t.messages.typingMany;
  }, [typingUsers, activeChat, t.messages]);

  function handleSend() {
    const text = message.trim();
    if (!text || !activeChat) return;
    sendMessage(activeChat.id, text, replyingTo?.id);
    setMessage('');
    setReplyingTo(null);
  }

  function startReply(msg: Message) {
    if (msg.deleted) return;
    setReplyingTo(msg);
    inputRef.current?.focus();
  }

  function renderChatSection(title: string, items: Chat[], key: string) {
    if (items.length === 0) return null;
    return (
      <div key={key} className="mb-1">
        <div className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-cloud-muted">
          {title}
        </div>
        {items.map((chat) => {
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
                activeChat?.id === chat.id ? 'bg-tyrian/10' : 'hover:bg-cloud-deep/50',
              )}
            >
              <div className="relative">
                <Avatar name={name} src={chat.avatarUrl ?? undefined} size="md" />
                {chat.type === 'PROJECT' && (
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-tyrian text-cloud rounded-full flex items-center justify-center border-2 border-cloud-soft"
                    aria-label="Project chat"
                  >
                    <Briefcase size={8} />
                  </span>
                )}
                {chat.type === 'GROUP' && (
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-tyrian/70 text-cloud rounded-full flex items-center justify-center border-2 border-cloud-soft"
                    aria-label="Group chat"
                  >
                    <UsersIcon size={8} />
                  </span>
                )}
              </div>
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
        })}
      </div>
    );
  }

  function renderMessage(msg: Message) {
    const isMine = msg.senderId === user?.id;
    const readers = activeChat && activeChat.type !== 'DIRECT' ? seenByMembers(msg, activeChat, user?.id) : [];
    const directReaders = activeChat && activeChat.type === 'DIRECT'
      ? activeChat.members.filter(
          (m) => m.userId !== user?.id && m.lastReadAt && new Date(m.lastReadAt).getTime() >= new Date(msg.createdAt).getTime(),
        )
      : [];
    const seenInDirect = isMine && activeChat?.type === 'DIRECT' && directReaders.length > 0;

    return (
      <div key={msg.id} className={cn('group flex', isMine ? 'justify-end' : 'justify-start')}>
        <div className="flex items-start gap-1.5 max-w-[75%]">
          {!isMine && (
            <button
              type="button"
              onClick={() => startReply(msg)}
              aria-label={t.messages.reply}
              title={t.messages.reply}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-sm text-cloud-muted hover:text-tyrian hover:bg-cloud-deep/40 self-center shrink-0"
            >
              <CornerUpLeft size={14} />
            </button>
          )}
          <div
            className={cn(
              'px-3.5 py-2.5 text-sm leading-relaxed',
              isMine
                ? 'bg-tyrian text-cloud rounded-2xl rounded-br-md'
                : 'bg-cloud-soft border border-cloud-deep text-cloud-ink rounded-2xl rounded-bl-md',
            )}
          >
            {!isMine && activeChat && activeChat.type !== 'DIRECT' && (
              <p className="text-[10px] font-semibold text-tyrian mb-0.5">
                {msg.senderDisplayName || msg.senderUsername}
              </p>
            )}
            {msg.replyToId && msg.replyToContent && (
              <div
                className={cn(
                  'mb-1.5 pl-2 py-1 border-l-2 text-[11px] leading-snug',
                  isMine
                    ? 'border-cloud/60 text-cloud/85'
                    : 'border-tyrian/60 text-cloud-ink/75',
                )}
              >
                <p className="line-clamp-2 italic">{msg.replyToContent}</p>
              </div>
            )}
            <p className={cn('whitespace-pre-wrap break-words', msg.deleted && 'italic opacity-60')}>
              {msg.deleted ? t.messages.messageDeleted : msg.content}
            </p>
            <div className={cn('flex items-center gap-1 mt-1 justify-end text-[10px]', isMine ? 'text-cloud/70' : 'text-cloud-muted')}>
              <span>{timeAgo(msg.createdAt)}</span>
              {seenInDirect && <CheckCheck size={11} className="shrink-0" />}
              {isMine && !seenInDirect && activeChat?.type === 'DIRECT' && <Check size={11} className="shrink-0" />}
            </div>
            {readers.length > 0 && (
              <div className="mt-1 flex items-center gap-1 justify-end">
                <span className={cn('text-[9px]', isMine ? 'text-cloud/70' : 'text-cloud-muted')}>
                  {t.messages.seen}
                </span>
                <div className="flex -space-x-1">
                  {readers.slice(0, 3).map((r) => (
                    <Avatar
                      key={r.userId}
                      name={r.displayName || r.username}
                      src={r.avatarUrl ?? undefined}
                      size="xs"
                    />
                  ))}
                  {readers.length > 3 && (
                    <span className={cn(
                      'text-[9px] leading-4 h-4 px-1 rounded-full border',
                      isMine ? 'bg-cloud/20 border-cloud/30 text-cloud' : 'bg-cloud-deep border-cloud-deep text-cloud-muted',
                    )}>
                      +{readers.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          {isMine && (
            <button
              type="button"
              onClick={() => startReply(msg)}
              aria-label={t.messages.reply}
              title={t.messages.reply}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-sm text-cloud-muted hover:text-tyrian hover:bg-cloud-deep/40 self-center shrink-0"
            >
              <CornerUpLeft size={14} />
            </button>
          )}
        </div>
      </div>
    );
  }

  const replyingName = replyingTo
    ? (replyingTo.senderId === user?.id ? t.messages.reply : (replyingTo.senderDisplayName || replyingTo.senderUsername))
    : '';

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-theme(spacing.navbar))] bg-cloud">
        {/* Chat list */}
        <div className="w-80 border-r border-cloud-deep bg-cloud-soft flex flex-col shrink-0">
          <div className="p-3 border-b border-cloud-deep space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cloud-muted" size={14} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.messages.searchPlaceholder}
                  className="w-full h-9 pl-8 pr-3 bg-white border border-cloud-deep rounded-sm text-xs text-cloud-ink placeholder:text-cloud-muted focus:outline-none focus:border-tyrian transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowNewChat(true)}
                aria-label={t.messages.newChat}
                title={t.messages.newChat}
                className="h-9 w-9 shrink-0 flex items-center justify-center bg-tyrian text-cloud rounded-sm hover:bg-tyrian-soft transition-colors"
              >
                <Plus size={16} />
              </button>
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
              <>
                {renderChatSection(t.messages.directSection, groupedChats.direct, 'direct')}
                {renderChatSection(t.messages.groupSection, groupedChats.group, 'group')}
                {renderChatSection(t.messages.projectSection, groupedChats.project, 'project')}
              </>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-cloud">
          {activeChat ? (
            <>
              <div className="flex items-center justify-between px-4 h-14 border-b border-cloud-deep bg-cloud-soft shrink-0">
                <div className="flex items-center gap-3">
                  <Avatar name={activeName} src={activeChat.avatarUrl ?? undefined} size="sm" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-cloud-ink">{activeName}</p>
                      {activeChat.type === 'PROJECT' && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-tyrian/10 text-tyrian rounded-sm text-[10px] font-medium">
                          <Briefcase size={10} /> {t.messages.projectSection}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-cloud-muted">
                      {activeChat.type === 'DIRECT'
                        ? t.messages.directChat
                        : t.messages.groupMembers.replace('{count}', String(activeChat.members.length))}
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
                {timeline.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-cloud-muted text-xs">
                    {t.messages.noMessages}
                  </div>
                ) : (
                  timeline.map((item) =>
                    item.kind === 'divider' ? (
                      <div key={item.id} className="flex items-center gap-3 py-2">
                        <div className="flex-1 h-px bg-cloud-deep" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-cloud-muted">
                          {item.label}
                        </span>
                        <div className="flex-1 h-px bg-cloud-deep" />
                      </div>
                    ) : (
                      renderMessage(item.msg)
                    ),
                  )
                )}
                {typingLabel && (
                  <div className="flex items-center gap-2 pl-1 text-[11px] text-cloud-muted italic">
                    <span className="flex gap-0.5">
                      <span className="w-1 h-1 bg-tyrian/60 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1 h-1 bg-tyrian/60 rounded-full animate-bounce [animation-delay:120ms]" />
                      <span className="w-1 h-1 bg-tyrian/60 rounded-full animate-bounce [animation-delay:240ms]" />
                    </span>
                    <span>{typingLabel}</span>
                  </div>
                )}
              </div>

              {replyingTo && (
                <div className="flex items-center gap-2 px-4 py-2 bg-tyrian/5 border-t border-tyrian/20">
                  <CornerUpLeft size={14} className="text-tyrian shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-tyrian">
                      {t.messages.replyingTo.replace('{name}', replyingName)}
                    </p>
                    <p className="text-xs text-cloud-ink/80 truncate">{replyingTo.content}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    aria-label={t.messages.cancelReply}
                    title={t.messages.cancelReply}
                    className="p-1 rounded-sm text-cloud-muted hover:text-tyrian hover:bg-cloud-deep/40 shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className="px-4 py-3 border-t border-cloud-deep bg-cloud-soft">
                <div className="flex items-end gap-2">
                  <button type="button" aria-label="Attach file" className="p-2 rounded-sm text-cloud-muted hover:text-tyrian hover:bg-cloud-deep transition-colors shrink-0">
                    <Paperclip size={18} />
                  </button>
                  <div className="flex-1 bg-white border border-cloud-deep rounded-lg px-3 py-2 focus-within:border-tyrian transition-colors">
                    <textarea
                      ref={inputRef}
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
                        if (e.key === 'Escape' && replyingTo) {
                          e.preventDefault();
                          setReplyingTo(null);
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
      <NewChatModal
        open={showNewChat}
        onClose={() => setShowNewChat(false)}
        onCreated={(chat) => setActiveChat(chat)}
      />
    </AppShell>
  );
}
