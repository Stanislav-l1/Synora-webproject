'use client';

import { useState } from 'react';
import { X, Mail, Copy, Check, Send, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import type { ApiResponse, Invitation } from '@/types';

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  onInvited?: (invitation: Invitation) => void;
}

export function InviteModal({ open, onClose, onInvited }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Invitation | null>(null);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const submit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<ApiResponse<Invitation>>('/invitations', { email, message });
      setCreated(res.data.data);
      onInvited?.(res.data.data);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!created) return;
    await navigator.clipboard.writeText(created.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const reset = () => {
    setCreated(null);
    setEmail('');
    setMessage('');
    setError(null);
  };

  const shareText = created
    ? encodeURIComponent(`Join me on Synora: ${created.shareUrl}`)
    : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white border border-cloud-deep rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-cloud-deep">
          <h3 className="text-base font-semibold text-cloud-ink">Invite to Synora</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-cloud-muted hover:text-cloud-ink hover:bg-cloud-soft"
          >
            <X size={18} />
          </button>
        </div>

        {!created ? (
          <div className="p-5 space-y-3">
            <label className="block">
              <span className="text-xs text-cloud-muted">Email</span>
              <div className="relative mt-1">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cloud-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="w-full bg-white border border-cloud-deep rounded-md pl-9 pr-3 py-2 text-sm text-cloud-ink placeholder:text-cloud-muted focus:outline-none focus:border-tyrian"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs text-cloud-muted">Personal note (optional)</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Come build with me on Synora."
                className="w-full mt-1 bg-white border border-cloud-deep rounded-md px-3 py-2 text-sm text-cloud-ink placeholder:text-cloud-muted focus:outline-none focus:border-tyrian resize-none"
              />
            </label>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" onClick={submit} loading={loading} disabled={!email.trim()}>
                <Send size={14} className="mr-1.5" /> Send invitation
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <p className="text-sm text-cloud-ink">
              Invitation sent to <span className="font-medium">{created.email}</span>.
            </p>

            <div>
              <p className="text-xs text-cloud-muted mb-1">Shareable link</p>
              <div className="flex items-stretch border border-cloud-deep rounded-md overflow-hidden">
                <input
                  type="text"
                  readOnly
                  value={created.shareUrl}
                  className="flex-1 bg-cloud-soft px-3 py-2 text-xs text-cloud-ink"
                />
                <button
                  type="button"
                  onClick={copy}
                  className="px-3 bg-white hover:bg-cloud-soft text-cloud-ink border-l border-cloud-deep flex items-center gap-1 text-xs"
                >
                  {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-cloud-muted mb-2">Share via</p>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?text=${shareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 text-xs bg-cloud-soft border border-cloud-deep rounded-md text-cloud-ink hover:border-tyrian/40"
                >
                  <Twitter size={14} /> Twitter
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(created.shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 text-xs bg-cloud-soft border border-cloud-deep rounded-md text-cloud-ink hover:border-tyrian/40"
                >
                  <Linkedin size={14} /> LinkedIn
                </a>
                <a
                  href={`https://api.whatsapp.com/send?text=${shareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 text-xs bg-cloud-soft border border-cloud-deep rounded-md text-cloud-ink hover:border-tyrian/40"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={reset}>
                Invite another
              </Button>
              <Button type="button" onClick={onClose}>Done</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
