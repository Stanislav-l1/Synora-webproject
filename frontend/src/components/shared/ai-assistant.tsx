'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles, X, Send, Bot, Briefcase, FolderGit2, Code2, BookOpen,
  Network, Zap, ExternalLink, Plus,
} from 'lucide-react';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type Mode = 'career' | 'project' | 'code' | 'learning' | 'network' | 'productivity';

interface Msg {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const MODES: { id: Mode; icon: React.ElementType }[] = [
  { id: 'career',       icon: Briefcase   },
  { id: 'project',      icon: FolderGit2  },
  { id: 'code',         icon: Code2       },
  { id: 'learning',     icon: BookOpen    },
  { id: 'network',      icon: Network     },
  { id: 'productivity', icon: Zap         },
];

const MOCK_RESPONSES: Record<Mode, string[]> = {
  career: [
    "Based on current market trends, the most in-demand skills are TypeScript, cloud infrastructure (AWS/GCP), and AI integration. Given your developer profile, you're likely strong on the frontend — want me to outline a 3-month plan to fill the gaps?",
    "For technical interview prep, focus on three areas: data structures & algorithms (LeetCode medium tier), system design (design a URL shortener, a feed, a chat system), and behavioral questions using the STAR method. Shall I put together a study schedule?",
    "Your GitHub activity and Synora contributions are excellent portfolio material. I'd suggest writing 2-3 technical posts per month about what you're building — this dramatically increases recruiter visibility and demonstrates communication skills alongside technical depth.",
    "Common career paths from full-stack: Staff Engineer (depth), Engineering Manager (people), Solutions Architect (breadth), or Indie/Founder (autonomy). Which direction resonates with you? I can map out concrete steps.",
  ],
  project: [
    "Good project planning starts with a problem statement: who has the problem, how painful is it, and what's the simplest version that proves the concept. Once we have that, I can help break it into a 3-week MVP sprint. What are you trying to build?",
    "For a modern web app in 2026, a solid stack is: Next.js 14 + TypeScript (frontend), Spring Boot or Node/Fastify (backend), PostgreSQL + Redis (data), deployed via Docker on Railway or Render. Want to discuss trade-offs for your specific use case?",
    "Let's break the project into phases: Phase 1 — core user flow, no polish (2–3 weeks); Phase 2 — feedback loop, iterate on the core (2 weeks); Phase 3 — UX polish, performance, launch prep (1 week). What is the single most important thing a user should be able to do in Phase 1?",
    "For project naming: keep it 1–2 syllables, easy to spell, and available as a domain. Avoid acronyms or names that only make sense internally. Want me to generate 10 name ideas if you describe what your project does?",
  ],
  code: [
    "I can help you understand, refactor, or debug code. Paste a snippet along with context (what it's supposed to do and what's actually happening) and I'll analyze it, suggest improvements, and explain the reasoning step by step.",
    "For clean code: prefer small functions with a single responsibility, name variables by what they represent (not how they're used), and avoid deep nesting with early returns. Want me to review a specific piece of your code?",
    "Common issues I can diagnose: async/await race conditions, state mutation bugs in React, N+1 query problems in ORMs, memory leaks in event listeners, and TypeScript type widening issues. Which one are you dealing with?",
    "A good code review focuses on four things in this order: correctness, security, readability, then performance. Most PRs fail on readability — unclear naming and missing context. Want me to walk through a checklist for your next review?",
  ],
  learning: [
    "A full-stack roadmap for 2026: master TypeScript and React patterns → learn one backend well (Node.js or Java/Spring) → understand databases (SQL + basic indexing + Redis) → add DevOps basics (Docker, CI/CD) → then specialize. What's your current level in each area?",
    "Best resources by area: system design → 'Designing Data-Intensive Applications' (DDIA); frontend patterns → Kent C. Dodds blog + Epic React; algorithms → NeetCode 150; backend → Hussein Nasser on YouTube. Want a week-by-week study plan?",
    "The most efficient learning method I've seen: build something → hit a wall → learn exactly what you need to break through it → ship it. Repeat. Abstract learning without projects doesn't stick. What are you building while learning?",
    "For 2026, AI/ML integration is the highest-leverage skill add-on for full-stack devs. You don't need to become an ML engineer — learning to call APIs (Anthropic, OpenAI), handle streaming responses, and design AI-assisted features is enough to differentiate you significantly.",
  ],
  network: [
    "To grow your developer network effectively: post consistently about your actual work (not opinions — projects, problems, learnings), engage with specificity (not 'great post!' but a real reaction), and join 2–3 communities where you can contribute, not just consume.",
    "Finding collaborators: post in the feed with specific roles you need (e.g., 'looking for a designer for my open-source CLI tool'), search communities by your tech stack, and engage with people's projects before DMing them about collaboration. Cold outreach after context always works better.",
    "The communities worth joining depend on your stack, but universally valuable: a local dev community (real connections), one community around your primary language/framework, and one around a domain you want to enter. Active contribution in a smaller community beats passive membership in a large one.",
    "Quality beats quantity in networking. Having 50 people who know your work well is worth more than 500 passive followers. Focus on depth — comment thoughtfully, help people debug, share what you're learning. Reputation compounds.",
  ],
  productivity: [
    "For deep coding work: schedule your highest-complexity tasks in the first 2–3 hours of the day before any meetings or messages. Use timeboxing — set a 90-minute block with a specific exit condition ('this feature is working end-to-end'), not an open-ended session.",
    "Task prioritization: list everything → classify as 'important' or 'urgent' (they're different) → work on important-but-not-urgent items first. Urgent-but-not-important tasks (most Slack messages) are usually someone else's emergency, not yours.",
    "Developer-specific productivity drains: context switching between PRs, unclear requirements starting work, notification overload during focus time, and 'just one more feature' scope creep. Which one is costing you the most hours this week?",
    "Weekly review ritual (30 min every Friday): what shipped? what got stuck? what did I learn? what's the single most important task for next week? This prevents drift, builds momentum, and surfaces blockers before they become crises.",
  ],
};

function uid() {
  return Math.random().toString(36).slice(2);
}

function modeLabel(id: Mode, t: ReturnType<typeof useT>): string {
  const map: Record<Mode, string> = {
    career:       t.ai.modeCareer,
    project:      t.ai.modeProject,
    code:         t.ai.modeCode,
    learning:     t.ai.modeLearning,
    network:      t.ai.modeNetwork,
    productivity: t.ai.modeProductivity,
  };
  return map[id];
}

function welcomeMsg(id: Mode, t: ReturnType<typeof useT>): string {
  const map: Record<Mode, string> = {
    career:       t.ai.welcomeCareer,
    project:      t.ai.welcomeProject,
    code:         t.ai.welcomeCode,
    learning:     t.ai.welcomeLearning,
    network:      t.ai.welcomeNetwork,
    productivity: t.ai.welcomeProductivity,
  };
  return map[id];
}

function getSuggestions(id: Mode, t: ReturnType<typeof useT>): string[] {
  const map: Record<Mode, string[]> = {
    career:       [t.ai.suggestCareer1,       t.ai.suggestCareer2,       t.ai.suggestCareer3],
    project:      [t.ai.suggestProject1,      t.ai.suggestProject2,      t.ai.suggestProject3],
    code:         [t.ai.suggestCode1,         t.ai.suggestCode2,         t.ai.suggestCode3],
    learning:     [t.ai.suggestLearning1,     t.ai.suggestLearning2,     t.ai.suggestLearning3],
    network:      [t.ai.suggestNetwork1,      t.ai.suggestNetwork2,      t.ai.suggestNetwork3],
    productivity: [t.ai.suggestProductivity1, t.ai.suggestProductivity2, t.ai.suggestProductivity3],
  };
  return map[id];
}

const emptyHistory = (): Record<Mode, Msg[]> => ({
  career: [], project: [], code: [], learning: [], network: [], productivity: [],
});

export function AiAssistantButton() {
  const t = useT();
  const [open, setOpen]       = useState(false);
  const [mode, setMode]       = useState<Mode>('career');
  const [history, setHistory] = useState<Record<Mode, Msg[]>>(emptyHistory);
  const [input, setInput]     = useState('');
  const [thinking, setThinking] = useState(false);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const responseIdx = useRef<Record<Mode, number>>(
    { career: 0, project: 0, code: 0, learning: 0, network: 0, productivity: 0 },
  );

  const msgs = history[mode];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, mode, thinking]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open, mode]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    const openAi = () => setOpen(true);
    window.addEventListener('synora:open-ai', openAi as EventListener);
    return () => window.removeEventListener('synora:open-ai', openAi as EventListener);
  }, []);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text || thinking) return;
    setInput('');
    setHistory((prev) => ({
      ...prev,
      [mode]: [...prev[mode], { id: uid(), role: 'user', text }],
    }));
    setThinking(true);
    const delay = 1100 + Math.random() * 900;
    setTimeout(() => {
      const pool = MOCK_RESPONSES[mode];
      const idx  = responseIdx.current[mode] % pool.length;
      responseIdx.current[mode]++;
      setHistory((prev) => ({
        ...prev,
        [mode]: [...prev[mode], { id: uid(), role: 'assistant', text: pool[idx] }],
      }));
      setThinking(false);
    }, delay);
  }, [input, mode, thinking]);

  const handleSuggest = (text: string) => {
    setInput(text);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const clearMode = () => {
    setHistory((prev) => ({ ...prev, [mode]: [] }));
  };

  return (
    <>
      <button
        type="button"
        aria-label={t.ai.title}
        onClick={() => setOpen(true)}
        className="relative p-2 rounded-md text-cloud/80 hover:text-cloud hover:bg-moss-velvet transition-colors"
      >
        <Sparkles size={20} />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-banana rounded-full" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] bg-black/40 flex justify-end"
          onClick={() => setOpen(false)}
        >
          <aside
            className="h-full w-full max-w-[420px] bg-cloud border-l border-cloud-deep shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <header className="flex items-center justify-between px-4 h-12 border-b border-cloud-deep shrink-0">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-tyrian text-cloud">
                  <Sparkles size={14} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-cloud-ink leading-tight">{t.ai.title}</p>
                  <p className="text-[10px] text-cloud-muted leading-tight">{t.ai.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <Link
                  href="/assistant"
                  onClick={() => setOpen(false)}
                  title={t.ai.openFullPage}
                  className="p-1.5 rounded text-cloud-muted hover:text-cloud-ink hover:bg-cloud-deep/60 transition-colors"
                >
                  <ExternalLink size={15} />
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="p-1.5 rounded text-cloud-muted hover:text-cloud-ink hover:bg-cloud-deep/60 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </header>

            {/* Mode tabs */}
            <div className="flex border-b border-cloud-deep shrink-0">
              {MODES.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  title={modeLabel(id, t)}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors border-b-2',
                    mode === id
                      ? 'text-tyrian border-tyrian bg-tyrian/5'
                      : 'text-cloud-muted border-transparent hover:text-cloud-ink hover:bg-cloud-deep/40',
                  )}
                >
                  <Icon size={15} />
                  <span className="truncate px-0.5">{modeLabel(id, t)}</span>
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-cloud-soft/30">
              {msgs.length === 0 && (
                <>
                  <div className="flex items-start gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-tyrian/10 text-tyrian">
                      <Bot size={14} />
                    </span>
                    <div className="rounded-lg bg-white border border-cloud-deep px-3 py-2 text-sm text-cloud-ink leading-relaxed">
                      {welcomeMsg(mode, t)}
                    </div>
                  </div>

                  <p className="text-[11px] text-cloud-muted px-1 pt-1">{t.ai.welcomeSubtitle}</p>

                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {getSuggestions(mode, t).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSuggest(s)}
                        className="text-xs px-3 py-1.5 rounded-full border border-cloud-deep bg-white text-cloud-ink hover:bg-tyrian/5 hover:border-tyrian/30 transition-colors text-left"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {msgs.map((msg) => (
                <div
                  key={msg.id}
                  className={cn('flex items-start gap-2', msg.role === 'user' && 'flex-row-reverse')}
                >
                  {msg.role === 'assistant' && (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-tyrian/10 text-tyrian mt-0.5">
                      <Bot size={14} />
                    </span>
                  )}
                  <div
                    className={cn(
                      'rounded-xl px-3 py-2 text-sm max-w-[85%] leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-tyrian text-cloud'
                        : 'bg-white border border-cloud-deep text-cloud-ink',
                    )}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {thinking && (
                <div className="flex items-start gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-tyrian/10 text-tyrian mt-0.5">
                    <Bot size={14} />
                  </span>
                  <div className="rounded-xl bg-white border border-cloud-deep px-3 py-3">
                    <div className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-tyrian/50 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-tyrian/50 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-tyrian/50 animate-bounce" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <footer className="border-t border-cloud-deep p-3 shrink-0">
              <div className="flex items-center gap-2">
                {msgs.length > 0 && (
                  <button
                    type="button"
                    title={t.ai.newChat}
                    onClick={clearMode}
                    className="h-9 w-9 flex items-center justify-center rounded-md text-cloud-muted hover:text-cloud-ink hover:bg-cloud-deep/60 transition-colors shrink-0"
                  >
                    <Plus size={16} />
                  </button>
                )}
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
                  }}
                  placeholder={t.ai.placeholder}
                  className="flex-1 h-9 px-3 rounded-lg bg-cloud-soft border border-cloud-deep text-sm text-cloud-ink placeholder:text-cloud-muted focus:outline-none focus:ring-1 focus:ring-tyrian/40"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={!input.trim() || thinking}
                  aria-label={t.ai.send}
                  className="h-9 w-9 flex items-center justify-center rounded-lg bg-tyrian text-cloud disabled:opacity-40 disabled:cursor-not-allowed hover:bg-tyrian-soft transition-colors shrink-0"
                >
                  <Send size={15} />
                </button>
              </div>
            </footer>
          </aside>
        </div>
      )}
    </>
  );
}
