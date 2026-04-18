'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type PulseEntry = {
  type: 'post' | 'project' | 'follow' | 'commit' | 'event' | 'message';
  actor: string;
  text: string;
  createdAt: string;
};

const FALLBACK: PulseEntry[] = [
  { type: 'commit',  actor: 'vasya',   text: 'pushed 3 commits → synora-core', createdAt: new Date().toISOString() },
  { type: 'post',    actor: 'alice',   text: '«How I shipped auth in 2 hours»', createdAt: new Date().toISOString() },
  { type: 'project', actor: 'maria',   text: 'started project PulseUI', createdAt: new Date().toISOString() },
  { type: 'follow',  actor: 'dmitry',  text: 'followed @linus', createdAt: new Date().toISOString() },
  { type: 'message', actor: 'kate',    text: '«Anyone free for code review?»', createdAt: new Date().toISOString() },
  { type: 'post',    actor: 'arthur',  text: '«From Rails to Spring Boot»', createdAt: new Date().toISOString() },
  { type: 'commit',  actor: 'nadia',   text: 'merged PR #142 → dark-mode', createdAt: new Date().toISOString() },
  { type: 'event',   actor: 'gopher',  text: 'Go Meetup — tomorrow 19:00', createdAt: new Date().toISOString() },
  { type: 'project', actor: 'max',     text: 'opened issue #12 on kanban-ui', createdAt: new Date().toISOString() },
  { type: 'post',    actor: 'zhenya',  text: '«Postgres indexing for devs»', createdAt: new Date().toISOString() },
  { type: 'follow',  actor: 'natasha', text: 'joined community Rust/RU', createdAt: new Date().toISOString() },
  { type: 'commit',  actor: 'oleg',    text: 'refactored websocket handler', createdAt: new Date().toISOString() },
];

const TYPE_SIGIL: Record<PulseEntry['type'], { sign: string; color: string }> = {
  commit:  { sign: '+',  color: 'text-banana' },
  post:    { sign: '◆',  color: 'text-tyrian-glow' },
  project: { sign: '▲',  color: 'text-cloud' },
  follow:  { sign: '→',  color: 'text-moss-soft' },
  event:   { sign: '◉',  color: 'text-banana-deep' },
  message: { sign: '…',  color: 'text-cloud/60' },
};

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '--:--';
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return '--:--';
  }
}

export function TerminalPulse({ limit = 24 }: { limit?: number }) {
  const [entries, setEntries] = useState<PulseEntry[]>(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<{ data: PulseEntry[] }>(`/pulse/recent`, { params: { limit } });
        const data = (res.data as unknown as { data: PulseEntry[] }).data;
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setEntries(data);
        }
      } catch {
        // silent fallback — mocks already populated
      }
    })();
    return () => { cancelled = true; };
  }, [limit]);

  // duplicate for seamless infinite scroll
  const doubled = [...entries, ...entries];

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* glow */}
      <div className="absolute -inset-6 bg-tyrian/20 blur-3xl rounded-full opacity-60 pointer-events-none" aria-hidden />
      <div className="absolute -inset-8 bg-banana/25 blur-3xl rounded-full opacity-50 pointer-events-none -z-10" aria-hidden />

      <div className="relative rounded-2xl overflow-hidden border border-moss-deep shadow-moss bg-moss-deep">
        {/* terminal header */}
        <div className="flex items-center gap-2 px-4 h-9 bg-moss border-b border-moss-deep">
          <span className="w-3 h-3 rounded-full bg-tyrian" aria-hidden />
          <span className="w-3 h-3 rounded-full bg-banana" aria-hidden />
          <span className="w-3 h-3 rounded-full bg-moss-soft" aria-hidden />
          <span className="ml-3 text-[11px] font-mono text-moss-soft tracking-wide">
            synora — live pulse
          </span>
          <span className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-moss-soft">
            <span className="w-1.5 h-1.5 rounded-full bg-banana animate-pulse" />
            live
          </span>
        </div>

        {/* terminal body — scrolling feed */}
        <div className="relative h-[320px] overflow-hidden terminal-scroll-wrap font-mono text-[12.5px] leading-relaxed">
          <div className="terminal-scroll-inner will-change-transform animate-terminal-scroll">
            {/* prompt line */}
            <div className="px-4 pt-4 pb-2 text-banana">
              <span className="text-moss-soft">$</span> synora --watch
            </div>
            {doubled.map((e, i) => {
              const sigil = TYPE_SIGIL[e.type] || TYPE_SIGIL.post;
              return (
                <div key={i} className="px-4 py-1 flex items-start gap-2 text-cloud/90">
                  <span className="text-moss-soft shrink-0">[{formatTime(e.createdAt)}]</span>
                  <span className={`shrink-0 ${sigil.color}`}>{sigil.sign}</span>
                  <span className="text-tyrian-glow shrink-0">@{e.actor}</span>
                  <span className="text-cloud/80 truncate">{e.text}</span>
                </div>
              );
            })}
          </div>

          {/* fade mask top/bottom */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-moss-deep to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-moss-deep to-transparent" />
        </div>
      </div>
    </div>
  );
}
