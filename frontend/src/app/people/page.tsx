'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { UserPlus, Upload, Mail, Trash2, Sparkles } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { TabBar } from '@/components/ui/tab-bar';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InviteModal } from '@/components/shared/invite-modal';
import api from '@/lib/api';
import type {
  ApiResponse,
  PageResponse,
  UserProfile,
  Invitation,
  Contact,
  ImportContactEntry,
} from '@/types';

type PeopleTab = 'suggestions' | 'contacts' | 'invitations';

export default function PeoplePage() {
  const [tab, setTab] = useState<PeopleTab>('suggestions');
  const [inviteOpen, setInviteOpen] = useState(false);

  const [suggested, setSuggested] = useState<UserProfile[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const loadSuggested = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<UserProfile[]>>('/users/suggested', {
        params: { limit: 12 },
      });
      setSuggested(res.data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<PageResponse<Contact>>>('/contacts', {
        params: { page: 0, size: 100 },
      });
      setContacts(res.data.data.content);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadInvitations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<PageResponse<Invitation>>>('/invitations/mine', {
        params: { page: 0, size: 50 },
      });
      setInvitations(res.data.data.content);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'suggestions') loadSuggested();
    else if (tab === 'contacts') loadContacts();
    else loadInvitations();
  }, [tab, loadSuggested, loadContacts, loadInvitations]);

  const follow = async (userId: string) => {
    try {
      await api.post(`/users/${userId}/follow`);
      setFollowingIds((s) => new Set(s).add(userId));
    } catch {
      // ignore
    }
  };

  const revoke = async (id: string) => {
    await api.delete(`/invitations/${id}`);
    setInvitations((list) => list.map((i) => (i.id === id ? { ...i, status: 'REVOKED' } : i)));
  };

  const counts = {
    suggestions: suggested.length,
    contacts: contacts.length,
    invitations: invitations.length,
  };

  return (
    <AppShell>
      <div className="max-w-feed mx-auto px-4 py-6 space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-cloud-ink">People</h1>
            <p className="text-sm text-cloud-muted">
              Find people you know, grow your network, and invite friends.
            </p>
          </div>
          <Button type="button" onClick={() => setInviteOpen(true)}>
            <UserPlus size={14} className="mr-1.5" /> Invite
          </Button>
        </header>

        <TabBar
          tabs={[
            { id: 'suggestions', label: 'Suggestions', count: counts.suggestions },
            { id: 'contacts', label: 'Contacts', count: counts.contacts },
            { id: 'invitations', label: 'Invitations', count: counts.invitations },
          ]}
          activeTab={tab}
          onChange={(id) => setTab(id as PeopleTab)}
        />

        {loading && (
          <div className="text-center py-10 text-cloud-muted text-sm">Loading…</div>
        )}

        {!loading && tab === 'suggestions' && (
          <SuggestionsList items={suggested} onFollow={follow} followingIds={followingIds} />
        )}

        {!loading && tab === 'contacts' && (
          <ContactsList items={contacts} onImported={loadContacts} onInvite={() => setInviteOpen(true)} />
        )}

        {!loading && tab === 'invitations' && (
          <InvitationsList items={invitations} onRevoke={revoke} />
        )}
      </div>

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvited={(inv) => setInvitations((list) => [inv, ...list])}
      />
    </AppShell>
  );
}

function SuggestionsList({
  items,
  onFollow,
  followingIds,
}: {
  items: UserProfile[];
  onFollow: (id: string) => void;
  followingIds: Set<string>;
}) {
  if (items.length === 0) {
    return <EmptyState icon={<Sparkles size={18} />} text="No suggestions right now." />;
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((u) => (
        <div
          key={u.id}
          className="flex items-center gap-3 p-3 bg-cloud-soft border border-cloud-deep rounded-md hover:border-tyrian/40 transition-colors"
        >
          <Link href={`/profile/${u.username}`}>
            <Avatar name={u.displayName || u.username} src={u.avatarUrl ?? undefined} size="md" />
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/profile/${u.username}`} className="block">
              <p className="text-sm font-medium text-cloud-ink truncate">
                {u.displayName || u.username}
              </p>
              <p className="text-xs text-cloud-muted truncate">
                @{u.username} · {u.reputationScore} rep
              </p>
            </Link>
          </div>
          <Button
            type="button"
            size="sm"
            variant={followingIds.has(u.id) ? 'ghost' : 'secondary'}
            disabled={followingIds.has(u.id)}
            onClick={() => onFollow(u.id)}
          >
            {followingIds.has(u.id) ? 'Following' : 'Follow'}
          </Button>
        </div>
      ))}
    </div>
  );
}

function ContactsList({
  items,
  onImported,
  onInvite,
}: {
  items: Contact[];
  onImported: () => void;
  onInvite: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    try {
      const text = await file.text();
      const entries = parseContactsCsv(text);
      if (entries.length === 0) {
        setImportResult('No valid emails found.');
        return;
      }
      const res = await api.post<ApiResponse<{ imported: number; matched: number; skipped: number }>>(
        '/contacts/import',
        { contacts: entries, source: 'CSV' },
      );
      const { imported, matched, skipped } = res.data.data;
      setImportResult(`Imported ${imported} · matched ${matched} · skipped ${skipped}`);
      onImported();
    } catch {
      setImportResult('Import failed.');
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const matched = items.filter((c) => c.matchedUserId);
  const unmatched = items.filter((c) => !c.matchedUserId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 bg-cloud-soft border border-cloud-deep rounded-md">
        <div>
          <p className="text-sm font-medium text-cloud-ink">Import from contacts</p>
          <p className="text-xs text-cloud-muted">CSV with email,name — one per line.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv,text/plain"
            className="hidden"
            onChange={onFile}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={importing}
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={14} className="mr-1.5" /> Upload CSV
          </Button>
        </div>
      </div>
      {importResult && <p className="text-xs text-cloud-muted">{importResult}</p>}

      {matched.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-cloud-muted">
            Already on Synora
          </h3>
          {matched.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 p-3 bg-cloud-soft border border-cloud-deep rounded-md"
            >
              <Avatar
                name={c.matchedDisplayName || c.matchedUsername || c.email}
                src={c.matchedAvatarUrl ?? undefined}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-cloud-ink truncate">
                  {c.matchedDisplayName || c.matchedUsername}
                </p>
                <p className="text-xs text-cloud-muted truncate">{c.email}</p>
              </div>
              <Link href={`/profile/${c.matchedUsername}`}>
                <Button type="button" size="sm" variant="secondary">View</Button>
              </Link>
            </div>
          ))}
        </section>
      )}

      {unmatched.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-cloud-muted">
              Not yet on Synora
            </h3>
            <Button type="button" size="sm" variant="ghost" onClick={onInvite}>
              <Mail size={12} className="mr-1" /> Invite
            </Button>
          </div>
          {unmatched.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 p-3 bg-cloud-soft border border-cloud-deep rounded-md"
            >
              <Avatar name={c.name || c.email} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-cloud-ink truncate">{c.name || c.email}</p>
                <p className="text-xs text-cloud-muted truncate">{c.email}</p>
              </div>
              <Badge variant="default">{c.source}</Badge>
            </div>
          ))}
        </section>
      )}

      {items.length === 0 && (
        <EmptyState
          icon={<Upload size={18} />}
          text="No contacts imported yet — upload a CSV to start."
        />
      )}
    </div>
  );
}

function InvitationsList({
  items,
  onRevoke,
}: {
  items: Invitation[];
  onRevoke: (id: string) => void;
}) {
  if (items.length === 0) {
    return <EmptyState icon={<Mail size={18} />} text="No invitations sent yet." />;
  }
  return (
    <div className="space-y-2">
      {items.map((inv) => (
        <div
          key={inv.id}
          className="flex items-center gap-3 p-3 bg-cloud-soft border border-cloud-deep rounded-md"
        >
          <Mail size={16} className="text-cloud-muted" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-cloud-ink truncate">{inv.email}</p>
            <p className="text-xs text-cloud-muted truncate">
              Sent {new Date(inv.createdAt).toLocaleDateString()} · expires{' '}
              {new Date(inv.expiresAt).toLocaleDateString()}
            </p>
          </div>
          <Badge variant={statusVariant(inv.status)}>{inv.status}</Badge>
          {inv.status === 'PENDING' && (
            <button
              type="button"
              onClick={() => onRevoke(inv.id)}
              className="p-1.5 rounded-md text-cloud-muted hover:text-red-600 hover:bg-red-50"
              title="Revoke"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-cloud-muted text-sm gap-2">
      {icon}
      <p>{text}</p>
    </div>
  );
}

function statusVariant(
  status: Invitation['status'],
): 'default' | 'success' | 'warning' | 'danger' {
  switch (status) {
    case 'ACCEPTED': return 'success';
    case 'PENDING':  return 'warning';
    case 'REVOKED':
    case 'EXPIRED':  return 'danger';
    default:         return 'default';
  }
}

function parseContactsCsv(text: string): ImportContactEntry[] {
  const emailRe = /^[^\s,]+@[^\s,]+\.[^\s,]+$/;
  const out: ImportContactEntry[] = [];
  const seen = new Set<string>();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.toLowerCase().startsWith('email')) continue;
    const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
    const email = parts.find((p) => emailRe.test(p));
    if (!email) continue;
    const key = email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const name = parts.find((p) => p !== email && p.length > 0);
    out.push({ email, name });
  }
  return out;
}
