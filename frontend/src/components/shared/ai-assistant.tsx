'use client';

import { useEffect, useState } from 'react';
import { Sparkles, X, Send, Bot } from 'lucide-react';

export function AiAssistantButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    const openAi = () => setOpen(true);
    window.addEventListener('synora:open-ai', openAi as EventListener);
    return () => window.removeEventListener('synora:open-ai', openAi as EventListener);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="AI Assistant"
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
            className="h-full w-full max-w-md bg-white border-l border-cloud-deep shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between px-4 h-12 border-b border-cloud-deep">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-tyrian text-cloud">
                  <Sparkles size={14} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-cloud-ink leading-tight">AI Assistant</p>
                  <p className="text-[10px] text-cloud-muted leading-tight">Preview</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="p-1 text-cloud-muted hover:text-cloud-ink"
              >
                <X size={16} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-cloud-soft/40">
              <div className="flex items-start gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-tyrian/10 text-tyrian">
                  <Bot size={14} />
                </span>
                <div className="rounded-lg bg-white border border-cloud-deep px-3 py-2 text-sm text-cloud-ink">
                  Hey! The AI assistant will help you draft posts, summarize threads,
                  search across projects and explain code. It&apos;s not plugged into a model yet —
                  this is a preview of the surface.
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  'Draft a post about my last commit',
                  'Summarize the #react tag this week',
                  'Explain this error',
                  'Find projects similar to mine',
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="text-xs px-2.5 py-1 rounded-full border border-cloud-deep bg-white text-cloud-ink hover:bg-cloud-soft"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <footer className="border-t border-cloud-deep p-3">
              <div className="flex items-center gap-2">
                <input
                  disabled
                  placeholder="Coming soon…"
                  className="flex-1 h-10 px-3 rounded-md bg-cloud-soft border border-cloud-deep text-sm text-cloud-ink placeholder:text-cloud-muted focus:outline-none"
                />
                <button
                  type="button"
                  disabled
                  aria-label="Send"
                  className="h-10 w-10 flex items-center justify-center rounded-md bg-tyrian/40 text-cloud cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </div>
            </footer>
          </aside>
        </div>
      )}
    </>
  );
}
