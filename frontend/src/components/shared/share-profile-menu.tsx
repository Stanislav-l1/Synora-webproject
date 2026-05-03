'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Share2, Copy, Check, Twitter, Linkedin, MessageCircle,
  Download, FileJson, IdCard,
} from 'lucide-react';
import api from '@/lib/api';

interface ShareProfileMenuProps {
  username: string;
  displayName: string;
  canExport?: boolean;
}

export function ShareProfileMenu({ username, displayName, canExport }: ShareProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const publicUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/u/${username}` : `/u/${username}`;
  const shareText = encodeURIComponent(`${displayName} on Synora — ${publicUrl}`);

  const copy = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadVCard = () => {
    const url =
      (process.env.NEXT_PUBLIC_API_URL || '/api/v1') + `/users/${username}/vcard`;
    window.open(url, '_blank');
  };

  const exportJson = async () => {
    try {
      const res = await api.get(`/users/me/export`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `synora-profile-${username}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      // ignore
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-tyrian text-cloud hover:bg-tyrian-soft"
      >
        <Share2 size={14} /> Share
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-cloud-deep rounded-md shadow-lg z-50 overflow-hidden">
          <Row onClick={copy} icon={copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}>
            {copied ? 'Link copied' : 'Copy public link'}
          </Row>
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-cloud-ink hover:bg-cloud-soft"
            onClick={() => setOpen(false)}
          >
            <Twitter size={14} /> Share on Twitter
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-cloud-ink hover:bg-cloud-soft"
            onClick={() => setOpen(false)}
          >
            <Linkedin size={14} /> Share on LinkedIn
          </a>
          <a
            href={`https://api.whatsapp.com/send?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-cloud-ink hover:bg-cloud-soft"
            onClick={() => setOpen(false)}
          >
            <MessageCircle size={14} /> Share on WhatsApp
          </a>
          <div className="h-px bg-cloud-deep" />
          <Row onClick={downloadVCard} icon={<IdCard size={14} />}>
            Download vCard (.vcf)
          </Row>
          {canExport && (
            <Row onClick={exportJson} icon={<FileJson size={14} />}>
              Export profile (JSON)
            </Row>
          )}
        </div>
      )}
    </div>
  );
}

function Row({
  onClick,
  icon,
  children,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-cloud-ink hover:bg-cloud-soft text-left"
    >
      {icon} {children}
    </button>
  );
}
