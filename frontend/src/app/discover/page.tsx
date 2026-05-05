'use client';

import { useState } from 'react';
import {
  UserPlus, FolderGit2, BookOpen, CalendarCheck,
  Briefcase, Send, MapPin, Clock, Star, Users,
  Check, Sparkles, ChevronRight, ExternalLink, Flame,
} from 'lucide-react';
import Link from 'next/link';
import { Avatar, Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

type Tab = 'people' | 'projects' | 'courses' | 'events' | 'career' | 'invite';

interface PersonRec { id: string; name: string; username: string; role: string; tags: string[]; mutual: number; reason: string }
interface ProjectRec { id: string; name: string; desc: string; tags: string[]; members: number; stars: number; openRoles: string[]; match: number }
interface CourseRec { id: string; title: string; instructor: string; duration: string; level: string; rating: number; students: number; tags: string[]; free: boolean }
interface EventRec { id: string; title: string; date: string; format: string; attendees: number; tags: string[]; organizer: string }
interface CareerRec { id: string; role: string; company: string; location: string; salary: string; match: number; tags: string[]; type: string }
interface InviteRec { id: string; name: string; platform: string; handle: string; likelihood: number }

const PEOPLE: PersonRec[] = [
  { id: '1', name: 'Sarah Lin', username: 'slin', role: 'Senior Frontend @ Vercel', tags: ['react', 'typescript', 'next.js'], mutual: 4, reason: 'Works with React & TypeScript like you' },
  { id: '2', name: 'Marcus Webb', username: 'mwebb', role: 'Open Source Maintainer', tags: ['rust', 'wasm', 'open-source'], mutual: 2, reason: 'Active in communities you follow' },
  { id: '3', name: 'Priya Nair', username: 'priya_n', role: 'DevOps Engineer @ AWS', tags: ['devops', 'kubernetes', 'terraform'], mutual: 3, reason: '3 mutual connections' },
  { id: '4', name: 'Alex Müller', username: 'alexm_de', role: 'Full-stack Developer', tags: ['node.js', 'postgresql', 'docker'], mutual: 6, reason: 'Trending in your field' },
  { id: '5', name: 'Yuki Tanaka', username: 'yukidev', role: 'ML Engineer @ DeepMind', tags: ['python', 'pytorch', 'ml'], mutual: 1, reason: 'Popular in AI communities' },
  { id: '6', name: 'Omar Hassan', username: 'ohardev', role: 'Indie Hacker & SaaS Builder', tags: ['react', 'saas', 'startup'], mutual: 5, reason: 'You both build SaaS products' },
];

const PROJECTS: ProjectRec[] = [
  { id: '1', name: 'OpenUI Kit', desc: 'Comprehensive open-source React component library with TypeScript and Tailwind CSS.', tags: ['react', 'typescript', 'tailwind'], members: 24, stars: 1240, openRoles: ['Frontend Dev', 'Designer'], match: 94 },
  { id: '2', name: 'DevMetrics', desc: 'Analytics platform for engineering teams tracking velocity, code quality, and team health.', tags: ['next.js', 'postgresql', 'analytics'], members: 8, stars: 430, openRoles: ['Backend Dev'], match: 87 },
  { id: '3', name: 'RustDB', desc: 'High-performance embedded database written in Rust — a SQLite alternative with better concurrency.', tags: ['rust', 'database', 'open-source'], members: 12, stars: 2100, openRoles: ['Rust Dev', 'Tech Writer'], match: 72 },
  { id: '4', name: 'CloudCanvas', desc: 'Visual infrastructure-as-code tool. Design AWS architectures visually, export to Terraform.', tags: ['devops', 'aws', 'react'], members: 6, stars: 890, openRoles: ['Frontend Dev', 'DevOps'], match: 81 },
  { id: '5', name: 'LernPath', desc: 'AI-powered learning path generator. Personalized dev roadmaps based on your goals.', tags: ['python', 'ai', 'education'], members: 15, stars: 560, openRoles: ['Full-stack', 'ML Engineer'], match: 78 },
  { id: '6', name: 'Hatchery', desc: 'Startup collaboration platform for solo founders. Find co-founders, advisors, and early users.', tags: ['startup', 'node.js', 'mongodb'], members: 9, stars: 340, openRoles: ['Frontend Dev'], match: 85 },
];

const COURSES: CourseRec[] = [
  { id: '1', title: 'Advanced TypeScript Patterns', instructor: 'Matt Pocock', duration: '8h', level: 'Advanced', rating: 4.9, students: 12400, tags: ['typescript'], free: false },
  { id: '2', title: 'System Design for Developers', instructor: 'Alex Xu', duration: '12h', level: 'Intermediate', rating: 4.8, students: 34000, tags: ['system-design', 'architecture'], free: false },
  { id: '3', title: 'Next.js 14 Full Course', instructor: 'Traversy Media', duration: '6h', level: 'Intermediate', rating: 4.7, students: 8900, tags: ['next.js', 'react'], free: true },
  { id: '4', title: 'Rust for Backend Developers', instructor: 'Jon Gjengset', duration: '20h', level: 'Advanced', rating: 4.9, students: 5600, tags: ['rust', 'backend'], free: false },
  { id: '5', title: 'Docker & Kubernetes Mastery', instructor: 'Bret Fisher', duration: '15h', level: 'Intermediate', rating: 4.6, students: 21000, tags: ['docker', 'kubernetes'], free: false },
  { id: '6', title: 'Building AI Apps with OpenAI API', instructor: 'Ania Kubów', duration: '4h', level: 'Beginner', rating: 4.5, students: 7800, tags: ['ai', 'api', 'javascript'], free: true },
];

const EVENTS: EventRec[] = [
  { id: '1', title: 'TypeScript Conf 2026', date: 'May 15–16, 2026', format: 'Online', attendees: 4200, tags: ['typescript', 'javascript'], organizer: 'TypeScript Team' },
  { id: '2', title: 'Rust & WebAssembly Summit', date: 'May 22, 2026', format: 'Hybrid', attendees: 850, tags: ['rust', 'wasm'], organizer: 'Rust Foundation' },
  { id: '3', title: 'DevOps Day Berlin', date: 'Jun 3, 2026', format: 'In-person', attendees: 1200, tags: ['devops', 'kubernetes'], organizer: 'CNCF Berlin' },
  { id: '4', title: 'AI/ML Builders Hackathon', date: 'Jun 10–12, 2026', format: 'Online', attendees: 3400, tags: ['ai', 'ml', 'hackathon'], organizer: 'Synora Community' },
  { id: '5', title: 'React Advanced London', date: 'Jun 20, 2026', format: 'Hybrid', attendees: 2100, tags: ['react', 'typescript'], organizer: 'GitNation' },
  { id: '6', title: 'Open Source Dev Meetup', date: 'May 28, 2026', format: 'In-person', attendees: 180, tags: ['open-source', 'networking'], organizer: 'Local DevGroup' },
];

const CAREER: CareerRec[] = [
  { id: '1', role: 'Senior Frontend Engineer', company: 'Vercel', location: 'Remote', salary: '$160k–$200k', match: 96, tags: ['react', 'next.js', 'typescript'], type: 'Full-time' },
  { id: '2', role: 'Full-stack Engineer', company: 'Linear', location: 'Remote', salary: '$140k–$175k', match: 91, tags: ['react', 'node.js', 'postgresql'], type: 'Full-time' },
  { id: '3', role: 'TypeScript SDK Engineer', company: 'Anthropic', location: 'SF / Remote', salary: '$155k–$195k', match: 88, tags: ['typescript', 'api', 'sdk'], type: 'Full-time' },
  { id: '4', role: 'Open Source Developer', company: 'Prisma', location: 'Remote', salary: '$130k–$160k', match: 84, tags: ['typescript', 'database', 'open-source'], type: 'Full-time' },
  { id: '5', role: 'DevTools Engineer', company: 'Netlify', location: 'Remote', salary: '$135k–$165k', match: 82, tags: ['devtools', 'node.js', 'typescript'], type: 'Full-time' },
  { id: '6', role: 'Freelance React Developer', company: 'Multiple clients', location: 'Remote', salary: '$80–$120/hr', match: 79, tags: ['react', 'typescript', 'freelance'], type: 'Contract' },
];

const INVITES: InviteRec[] = [
  { id: '1', name: 'David Kim', platform: 'GitHub', handle: '@davidkim', likelihood: 92 },
  { id: '2', name: 'Emma Wilson', platform: 'Twitter', handle: '@emmawilson_dev', likelihood: 87 },
  { id: '3', name: 'Raj Patel', platform: 'LinkedIn', handle: 'Raj Patel', likelihood: 84 },
  { id: '4', name: 'Nina Kovacs', platform: 'GitHub', handle: '@nkovacs', likelihood: 78 },
  { id: '5', name: 'Tom Bradley', platform: 'Twitter', handle: '@tombradleydev', likelihood: 74 },
  { id: '6', name: 'Sofia Rossi', platform: 'LinkedIn', handle: 'Sofia Rossi', likelihood: 71 },
];

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'people',   label: 'People',   icon: <UserPlus size={15} /> },
  { id: 'projects', label: 'Projects', icon: <FolderGit2 size={15} /> },
  { id: 'courses',  label: 'Courses',  icon: <BookOpen size={15} /> },
  { id: 'events',   label: 'Events',   icon: <CalendarCheck size={15} /> },
  { id: 'career',   label: 'Career',   icon: <Briefcase size={15} /> },
  { id: 'invite',   label: 'Invite',   icon: <Send size={15} /> },
];

const FORMAT_COLOR: Record<string, string> = {
  Online: 'bg-green-100 text-green-700',
  Hybrid: 'bg-blue-100 text-blue-700',
  'In-person': 'bg-orange-100 text-orange-700',
};

const LEVEL_COLOR: Record<string, string> = {
  Beginner: 'bg-green-100 text-green-700',
  Intermediate: 'bg-yellow-100 text-yellow-700',
  Advanced: 'bg-red-100 text-red-700',
};

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<Tab>('people');
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const [enrolled, setEnrolled] = useState<Set<string>>(new Set());
  const [registered, setRegistered] = useState<Set<string>>(new Set());
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [invited, setInvited] = useState<Set<string>>(new Set());

  const toggle = (set: Set<string>, id: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    setter(next);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} className="text-tyrian" />
          <h1 className="text-xl font-bold text-cloud-ink">Discover</h1>
        </div>
        <p className="text-sm text-cloud-muted">Personalized recommendations based on your profile and activity</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-cloud-deep/40 p-1 rounded-xl overflow-x-auto scrollbar-hidden">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
              activeTab === tab.id
                ? 'bg-cloud shadow-sm text-tyrian'
                : 'text-cloud-muted hover:text-cloud-ink',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* People */}
      {activeTab === 'people' && (
        <div className="space-y-3">
          {PEOPLE.map((p) => (
            <div key={p.id} className="bg-cloud border border-cloud-deep rounded-xl p-4 flex items-start gap-4">
              <Avatar name={p.name} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-cloud-ink text-sm">{p.name}</p>
                    <p className="text-xs text-cloud-muted">@{p.username} · {p.role}</p>
                  </div>
                  <Button
                    variant={followed.has(p.id) ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => toggle(followed, p.id, setFollowed)}
                    icon={followed.has(p.id) ? <Check size={13} /> : <UserPlus size={13} />}
                  >
                    {followed.has(p.id) ? 'Following' : 'Follow'}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {p.tags.map((tag) => (
                    <span key={tag} className="px-1.5 py-0.5 bg-tyrian/10 text-tyrian text-[11px] rounded-md">#{tag}</span>
                  ))}
                </div>
                <p className="text-[11px] text-cloud-muted mt-1.5 flex items-center gap-1">
                  <Sparkles size={10} className="text-tyrian" />
                  {p.reason} · {p.mutual} mutual
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {activeTab === 'projects' && (
        <div className="space-y-3">
          {PROJECTS.map((p) => (
            <div key={p.id} className="bg-cloud border border-cloud-deep rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FolderGit2 size={15} className="text-tyrian shrink-0" />
                    <p className="font-semibold text-cloud-ink text-sm">{p.name}</p>
                    <span className="ml-auto text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md shrink-0">{p.match}% match</span>
                  </div>
                  <p className="text-xs text-cloud-muted leading-relaxed">{p.desc}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {p.tags.map((tag) => (
                  <span key={tag} className="px-1.5 py-0.5 bg-tyrian/10 text-tyrian text-[11px] rounded-md">#{tag}</span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-cloud-muted">
                  <span className="flex items-center gap-1"><Users size={12} />{p.members} members</span>
                  <span className="flex items-center gap-1"><Star size={12} />{p.stars.toLocaleString()}</span>
                  {p.openRoles.length > 0 && (
                    <span className="text-green-600 font-medium">{p.openRoles.length} open role{p.openRoles.length > 1 ? 's' : ''}</span>
                  )}
                </div>
                <Button
                  variant={joined.has(p.id) ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => toggle(joined, p.id, setJoined)}
                  icon={joined.has(p.id) ? <Check size={13} /> : <ChevronRight size={13} />}
                >
                  {joined.has(p.id) ? 'Joined' : 'Join'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Courses */}
      {activeTab === 'courses' && (
        <div className="space-y-3">
          {COURSES.map((c) => (
            <div key={c.id} className="bg-cloud border border-cloud-deep rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-cloud-ink text-sm">{c.title}</p>
                    {c.free && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-md">FREE</span>}
                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-md ${LEVEL_COLOR[c.level] ?? 'bg-cloud-deep text-cloud-muted'}`}>{c.level}</span>
                  </div>
                  <p className="text-xs text-cloud-muted">by {c.instructor}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-cloud-muted">
                    <span className="flex items-center gap-1"><Clock size={11} />{c.duration}</span>
                    <span className="flex items-center gap-1"><Star size={11} className="text-yellow-400" />{c.rating}</span>
                    <span>{c.students.toLocaleString()} students</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {c.tags.map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 bg-tyrian/10 text-tyrian text-[11px] rounded-md">#{tag}</span>
                    ))}
                  </div>
                </div>
                <Button
                  variant={enrolled.has(c.id) ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => toggle(enrolled, c.id, setEnrolled)}
                  icon={enrolled.has(c.id) ? <Check size={13} /> : undefined}
                >
                  {enrolled.has(c.id) ? 'Enrolled' : 'Enroll'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Events */}
      {activeTab === 'events' && (
        <div className="space-y-3">
          {EVENTS.map((e) => (
            <div key={e.id} className="bg-cloud border border-cloud-deep rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-cloud-ink text-sm">{e.title}</p>
                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-md ${FORMAT_COLOR[e.format] ?? 'bg-cloud-deep text-cloud-muted'}`}>{e.format}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-cloud-muted mt-1">
                    <span className="flex items-center gap-1"><CalendarCheck size={11} />{e.date}</span>
                    <span className="flex items-center gap-1"><Users size={11} />{e.attendees.toLocaleString()} attending</span>
                  </div>
                  <p className="text-xs text-cloud-muted mt-1">by {e.organizer}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {e.tags.map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 bg-tyrian/10 text-tyrian text-[11px] rounded-md">#{tag}</span>
                    ))}
                  </div>
                </div>
                <Button
                  variant={registered.has(e.id) ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => toggle(registered, e.id, setRegistered)}
                  icon={registered.has(e.id) ? <Check size={13} /> : undefined}
                >
                  {registered.has(e.id) ? 'Registered' : 'Register'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Career */}
      {activeTab === 'career' && (
        <div className="space-y-3">
          {CAREER.map((job) => (
            <div key={job.id} className="bg-cloud border border-cloud-deep rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-semibold text-cloud-ink text-sm">{job.role}</p>
                    <span className="ml-auto text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md shrink-0">{job.match}% match</span>
                  </div>
                  <p className="text-sm text-tyrian font-medium">{job.company}</p>
                  <div className="flex items-center gap-3 text-xs text-cloud-muted mt-1">
                    <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>
                    <span>{job.salary}</span>
                    <span className="px-1.5 py-0.5 bg-cloud-deep text-cloud-muted rounded-md text-[10px]">{job.type}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {job.tags.map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 bg-tyrian/10 text-tyrian text-[11px] rounded-md">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <Button
                  variant={applied.has(job.id) ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => toggle(applied, job.id, setApplied)}
                  icon={applied.has(job.id) ? <Check size={13} /> : <ExternalLink size={13} />}
                >
                  {applied.has(job.id) ? 'Applied' : 'Apply'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite */}
      {activeTab === 'invite' && (
        <div className="space-y-3">
          <div className="bg-tyrian/10 border border-tyrian/20 rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-cloud-ink mb-1">Invite your network to Synora</p>
            <p className="text-xs text-cloud-muted">These developers are likely to love Synora based on their activity and interests.</p>
            <Link href="/referral" className="mt-2 inline-flex items-center gap-1 text-xs text-tyrian font-medium hover:underline">
              View your referral dashboard <ChevronRight size={12} />
            </Link>
          </div>
          {INVITES.map((inv) => (
            <div key={inv.id} className="bg-cloud border border-cloud-deep rounded-xl p-4 flex items-center gap-4">
              <Avatar name={inv.name} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-cloud-ink text-sm">{inv.name}</p>
                <p className="text-xs text-cloud-muted">{inv.handle} · {inv.platform}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <div className="flex-1 bg-cloud-deep rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-tyrian" style={{ width: `${inv.likelihood}%` }} />
                  </div>
                  <span className="text-[11px] text-tyrian font-semibold">{inv.likelihood}% likely to join</span>
                </div>
              </div>
              <Button
                variant={invited.has(inv.id) ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => toggle(invited, inv.id, setInvited)}
                icon={invited.has(inv.id) ? <Check size={13} /> : <Send size={13} />}
              >
                {invited.has(inv.id) ? 'Invited' : 'Invite'}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
