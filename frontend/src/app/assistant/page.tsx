'use client';

import { useCallback, useRef, useState } from 'react';
import {
  Sparkles, Send, Bot, Briefcase, FolderGit2, Code2, BookOpen,
  Network, Zap, Plus, ChevronRight,
} from 'lucide-react';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type Mode = 'career' | 'project' | 'code' | 'learning' | 'network' | 'productivity';

interface Msg {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const MODES: {
  id: Mode;
  icon: React.ElementType;
  titleKey: string;
  descKey: string;
  color: string;
}[] = [
  { id: 'career',       icon: Briefcase,   titleKey: 'careerTitle',       descKey: 'careerDesc',       color: 'text-tyrian'   },
  { id: 'project',      icon: FolderGit2,  titleKey: 'projectTitle',      descKey: 'projectDesc',      color: 'text-moss'     },
  { id: 'code',         icon: Code2,       titleKey: 'codeTitle',         descKey: 'codeDesc',         color: 'text-banana-deep' },
  { id: 'learning',     icon: BookOpen,    titleKey: 'learningTitle',     descKey: 'learningDesc',     color: 'text-moss-soft' },
  { id: 'network',      icon: Network,     titleKey: 'networkTitle',      descKey: 'networkDesc',      color: 'text-tyrian-glow' },
  { id: 'productivity', icon: Zap,         titleKey: 'productivityTitle', descKey: 'productivityDesc', color: 'text-banana-deep' },
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

const emptyHistory = (): Record<Mode, Msg[]> => ({
  career: [], project: [], code: [], learning: [], network: [], productivity: [],
});

export default function AssistantPage() {
  const t = useT();
  const [mode, setMode]         = useState<Mode>('career');
  const [history, setHistory]   = useState<Record<Mode, Msg[]>>(emptyHistory);
  const [input, setInput]       = useState('');
  const [thinking, setThinking] = useState(false);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);
  const responseIdx = useRef<Record<Mode, number>>(
    { career: 0, project: 0, code: 0, learning: 0, network: 0, productivity: 0 },
  );

  const msgs = history[mode];
  const currentMode = MODES.find((m) => m.id === mode)!;

  const send = useCallback(() => {
    const text = input.trim();
    if (!text || thinking) return;
    setInput('');
    setHistory((prev) => ({
      ...prev,
      [mode]: [...prev[mode], { id: uid(), role: 'user', text }],
    }));
    setThinking(true);
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
    const delay = 1000 + Math.random() * 800;
    setTimeout(() => {
      const pool = MOCK_RESPONSES[mode];
      const idx  = responseIdx.current[mode] % pool.length;
      responseIdx.current[mode]++;
      setHistory((prev) => ({
        ...prev,
        [mode]: [...prev[mode], { id: uid(), role: 'assistant', text: pool[idx] }],
      }));
      setThinking(false);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, delay);
  }, [input, mode, thinking]);

  const handleSuggest = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  const suggestions: string[] = {
    career:       [t.ai.suggestCareer1, t.ai.suggestCareer2, t.ai.suggestCareer3],
    project:      [t.ai.suggestProject1, t.ai.suggestProject2, t.ai.suggestProject3],
    code:         [t.ai.suggestCode1, t.ai.suggestCode2, t.ai.suggestCode3],
    learning:     [t.ai.suggestLearning1, t.ai.suggestLearning2, t.ai.suggestLearning3],
    network:      [t.ai.suggestNetwork1, t.ai.suggestNetwork2, t.ai.suggestNetwork3],
    productivity: [t.ai.suggestProductivity1, t.ai.suggestProductivity2, t.ai.suggestProductivity3],
  }[mode];

  const welcomeMsg: Record<Mode, string> = {
    career:       t.ai.welcomeCareer,
    project:      t.ai.welcomeProject,
    code:         t.ai.welcomeCode,
    learning:     t.ai.welcomeLearning,
    network:      t.ai.welcomeNetwork,
    productivity: t.ai.welcomeProductivity,
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.navbar))] bg-retro-bg overflow-hidden">

      {/* Left sidebar — mode selection */}
      <aside className="w-72 shrink-0 border-r border-retro-border bg-retro-surface flex flex-col overflow-y-auto">
        <div className="p-5 border-b border-retro-border">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-tyrian text-cloud">
              <Sparkles size={15} />
            </span>
            <h1 className="text-base font-semibold text-retro-text">{t.ai.title}</h1>
          </div>
          <p className="text-xs text-retro-text-muted">{t.ai.welcomeTitle}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {MODES.map(({ id, icon: Icon, titleKey, descKey, color }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={cn(
                'w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all',
                mode === id
                  ? 'bg-tyrian/10 border border-tyrian/20'
                  : 'hover:bg-retro-bg border border-transparent',
              )}
            >
              <span className={cn('mt-0.5 shrink-0', mode === id ? 'text-tyrian' : color)}>
                <Icon size={17} />
              </span>
              <div className="min-w-0">
                <p className={cn(
                  'text-sm font-medium leading-tight',
                  mode === id ? 'text-tyrian' : 'text-retro-text',
                )}>
                  {t.ai[titleKey as keyof typeof t.ai] as string}
                </p>
                <p className="text-xs text-retro-text-muted leading-snug mt-0.5 line-clamp-2">
                  {t.ai[descKey as keyof typeof t.ai] as string}
                </p>
              </div>
              {mode === id && <ChevronRight size={14} className="text-tyrian shrink-0 mt-1 ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-retro-border">
          <p className="text-[10px] text-retro-text-muted">
            {t.ai.subtitle} · {t.ai.title}
          </p>
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Chat header */}
        <div className="shrink-0 flex items-center justify-between px-6 h-14 border-b border-retro-border bg-retro-surface">
          <div className="flex items-center gap-2.5">
            <span className={cn('shrink-0', currentMode.color)}>
              <currentMode.icon size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-retro-text leading-tight">
                {t.ai[currentMode.titleKey as keyof typeof t.ai] as string}
              </p>
              <p className="text-xs text-retro-text-muted leading-tight">
                {t.ai[currentMode.descKey as keyof typeof t.ai] as string}
              </p>
            </div>
          </div>
          {msgs.length > 0 && (
            <button
              type="button"
              onClick={() => setHistory((prev) => ({ ...prev, [mode]: [] }))}
              title={t.ai.newChat}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-retro-text-muted hover:text-retro-text rounded-lg hover:bg-retro-bg transition-colors border border-retro-border"
            >
              <Plus size={13} />
              {t.ai.newChat}
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {msgs.length === 0 && (
            <>
              <div className="flex items-start gap-3 max-w-2xl">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tyrian/10 text-tyrian mt-0.5">
                  <Bot size={16} />
                </span>
                <div className="rounded-2xl rounded-tl-sm bg-white border border-retro-border px-4 py-3 text-sm text-retro-text leading-relaxed shadow-sm">
                  {welcomeMsg[mode]}
                </div>
              </div>

              <p className="text-xs text-retro-text-muted px-11">{t.ai.welcomeSubtitle}</p>

              <div className="flex flex-wrap gap-2 px-11 pt-1">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSuggest(s)}
                    className="text-xs px-3 py-2 rounded-xl border border-retro-border bg-white text-retro-text hover:bg-tyrian/5 hover:border-tyrian/30 transition-colors text-left shadow-sm"
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
              className={cn('flex items-start gap-3', msg.role === 'user' && 'flex-row-reverse')}
            >
              {msg.role === 'assistant' && (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tyrian/10 text-tyrian mt-0.5">
                  <Bot size={16} />
                </span>
              )}
              <div
                className={cn(
                  'rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-2xl shadow-sm',
                  msg.role === 'user'
                    ? 'bg-tyrian text-cloud rounded-tr-sm'
                    : 'bg-white border border-retro-border text-retro-text rounded-tl-sm',
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tyrian/10 text-tyrian mt-0.5">
                <Bot size={16} />
              </span>
              <div className="rounded-2xl rounded-tl-sm bg-white border border-retro-border px-4 py-3.5 shadow-sm">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-tyrian/40 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-tyrian/40 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-tyrian/40 animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="shrink-0 border-t border-retro-border bg-retro-surface p-4">
          <div className="max-w-3xl mx-auto flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              placeholder={t.ai.placeholder}
              rows={1}
              className="flex-1 px-4 py-2.5 rounded-xl bg-retro-bg border border-retro-border text-sm text-retro-text placeholder:text-retro-text-muted focus:outline-none focus:ring-1 focus:ring-tyrian/40 resize-none leading-relaxed"
              style={{ minHeight: '42px', maxHeight: '120px' }}
            />
            <button
              type="button"
              onClick={send}
              disabled={!input.trim() || thinking}
              aria-label={t.ai.send}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-tyrian text-cloud disabled:opacity-40 disabled:cursor-not-allowed hover:bg-tyrian-soft transition-colors shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-center text-[10px] text-retro-text-muted mt-2">
            {t.ai.subtitle} — {t.ai.title}
          </p>
        </div>
      </div>
    </div>
  );
}
