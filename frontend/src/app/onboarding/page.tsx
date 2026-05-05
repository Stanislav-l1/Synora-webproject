'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check, ChevronRight, ChevronLeft, Sparkles,
  User, Zap, Users, MapPin, Globe, Github,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { Avatar } from '@/components/ui';
import { cn } from '@/lib/utils';

const TOTAL_STEPS = 6;

const INTEREST_TAGS = [
  'react', 'typescript', 'next.js', 'node.js', 'rust', 'python', 'go',
  'devops', 'kubernetes', 'docker', 'machine-learning', 'ai', 'blockchain',
  'mobile', 'ios', 'android', 'open-source', 'startup', 'system-design',
  'web3', 'databases', 'security', 'frontend', 'backend', 'fullstack',
];

const SKILLS = [
  { id: 'react', label: 'React', category: 'Frontend' },
  { id: 'typescript', label: 'TypeScript', category: 'Language' },
  { id: 'nextjs', label: 'Next.js', category: 'Framework' },
  { id: 'nodejs', label: 'Node.js', category: 'Backend' },
  { id: 'python', label: 'Python', category: 'Language' },
  { id: 'rust', label: 'Rust', category: 'Language' },
  { id: 'go', label: 'Go', category: 'Language' },
  { id: 'postgresql', label: 'PostgreSQL', category: 'Database' },
  { id: 'docker', label: 'Docker', category: 'DevOps' },
  { id: 'kubernetes', label: 'Kubernetes', category: 'DevOps' },
  { id: 'aws', label: 'AWS', category: 'Cloud' },
  { id: 'graphql', label: 'GraphQL', category: 'API' },
];

const SUGGESTED_PEOPLE = [
  { id: '1', name: 'Sarah Lin', username: 'slin', role: 'Senior Frontend @ Vercel', tags: ['react', 'typescript'] },
  { id: '2', name: 'Marcus Webb', username: 'mwebb', role: 'Open Source Maintainer', tags: ['rust', 'wasm'] },
  { id: '3', name: 'Priya Nair', username: 'priya_n', role: 'DevOps @ AWS', tags: ['kubernetes', 'terraform'] },
  { id: '4', name: 'Alex Müller', username: 'alexm_de', role: 'Full-stack Developer', tags: ['node.js', 'docker'] },
  { id: '5', name: 'Yuki Tanaka', username: 'yukidev', role: 'ML Engineer @ DeepMind', tags: ['python', 'ml'] },
  { id: '6', name: 'Omar Hassan', username: 'ohardev', role: 'Indie Hacker', tags: ['react', 'startup'] },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({ displayName: '', bio: '', location: '', website: '' });
  const [interests, setInterests] = useState<Set<string>>(new Set());
  const [skills, setSkills] = useState<Set<string>>(new Set());
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 1));
  const toggleInterest = (tag: string) => setInterests((prev) => { const n = new Set(prev); n.has(tag) ? n.delete(tag) : n.add(tag); return n; });
  const toggleSkill = (id: string) => setSkills((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleFollow = (id: string) => setFollowed((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="min-h-screen bg-gradient-to-br from-moss via-moss-deep to-moss flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <Zap size={22} className="text-tyrian" />
        <span className="text-lg font-bold text-cloud">Synora</span>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'rounded-full transition-all duration-300',
              i + 1 === step ? 'w-6 h-2 bg-tyrian' : i + 1 < step ? 'w-2 h-2 bg-tyrian/50' : 'w-2 h-2 bg-moss-velvet',
            )}
          />
        ))}
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-cloud rounded-2xl shadow-2xl overflow-hidden">
        {/* Step 1 — Welcome */}
        {step === 1 && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-tyrian/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles size={28} className="text-tyrian" />
            </div>
            <h1 className="text-2xl font-bold text-cloud-ink mb-2">Welcome to Synora</h1>
            <p className="text-cloud-muted mb-6 text-sm leading-relaxed">Your unified platform for code, community, and career. Let&apos;s take 2 minutes to set you up.</p>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { emoji: '🚀', label: 'Build projects together' },
                { emoji: '💬', label: 'Connect with developers' },
                { emoji: '📈', label: 'Grow your career' },
              ].map((item) => (
                <div key={item.label} className="bg-cloud-deep/50 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">{item.emoji}</div>
                  <p className="text-[11px] text-cloud-muted leading-tight">{item.label}</p>
                </div>
              ))}
            </div>
            <Button variant="primary" size="lg" className="w-full" onClick={next} icon={<ChevronRight size={16} />}>
              Get started
            </Button>
          </div>
        )}

        {/* Step 2 — Profile */}
        {step === 2 && (
          <div className="p-8">
            <h2 className="text-lg font-bold text-cloud-ink mb-1">Set up your profile</h2>
            <p className="text-sm text-cloud-muted mb-5">Let the community know who you are</p>
            <div className="flex items-center gap-4 mb-5">
              <Avatar name={profile.displayName || 'You'} size="lg" />
              <button type="button" className="text-sm text-tyrian hover:underline">Upload photo</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-cloud-muted mb-1 block">Display name</label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-cloud-deep bg-white text-cloud-ink text-sm focus:outline-none focus:border-tyrian"
                  placeholder="How others see you"
                  value={profile.displayName}
                  onChange={(e) => setProfile((p) => ({ ...p, displayName: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-cloud-muted mb-1 block">Bio</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-cloud-deep bg-white text-cloud-ink text-sm focus:outline-none focus:border-tyrian resize-none"
                  placeholder="Tell the community about yourself"
                  value={profile.bio}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-cloud-muted mb-1 block flex items-center gap-1"><MapPin size={10} /> Location</label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-cloud-deep bg-white text-cloud-ink text-sm focus:outline-none focus:border-tyrian"
                    placeholder="City, country"
                    value={profile.location}
                    onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-cloud-muted mb-1 block flex items-center gap-1"><Globe size={10} /> Website</label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-cloud-deep bg-white text-cloud-ink text-sm focus:outline-none focus:border-tyrian"
                    placeholder="https://..."
                    value={profile.website}
                    onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Interests */}
        {step === 3 && (
          <div className="p-8">
            <h2 className="text-lg font-bold text-cloud-ink mb-1">Choose your interests</h2>
            <p className="text-sm text-cloud-muted mb-5">We&apos;ll personalize your feed and recommendations. Pick at least 3.</p>
            <div className="flex flex-wrap gap-2">
              {INTEREST_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleInterest(tag)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm border transition-all',
                    interests.has(tag)
                      ? 'bg-tyrian text-cloud border-tyrian font-medium'
                      : 'bg-white text-cloud-ink border-cloud-deep hover:border-tyrian',
                  )}
                >
                  #{tag}
                </button>
              ))}
            </div>
            {interests.size > 0 && (
              <p className="mt-4 text-xs text-tyrian font-medium">{interests.size} selected ✓</p>
            )}
          </div>
        )}

        {/* Step 4 — Skills */}
        {step === 4 && (
          <div className="p-8">
            <h2 className="text-lg font-bold text-cloud-ink mb-1">Select your skills</h2>
            <p className="text-sm text-cloud-muted mb-5">Help us match you with the right projects and opportunities.</p>
            <div className="grid grid-cols-2 gap-2">
              {SKILLS.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => toggleSkill(skill.id)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all',
                    skills.has(skill.id)
                      ? 'bg-tyrian/10 border-tyrian text-tyrian'
                      : 'bg-white border-cloud-deep text-cloud-ink hover:border-tyrian/50',
                  )}
                >
                  <div>
                    <p className="text-sm font-medium">{skill.label}</p>
                    <p className="text-[10px] opacity-70">{skill.category}</p>
                  </div>
                  {skills.has(skill.id) && <Check size={14} className="text-tyrian shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5 — Follow people */}
        {step === 5 && (
          <div className="p-8">
            <h2 className="text-lg font-bold text-cloud-ink mb-1">Find people to follow</h2>
            <p className="text-sm text-cloud-muted mb-5">Build your network from day one.</p>
            <div className="space-y-3">
              {SUGGESTED_PEOPLE.map((person) => (
                <div key={person.id} className="flex items-center gap-3">
                  <Avatar name={person.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-cloud-ink truncate">{person.name}</p>
                    <p className="text-xs text-cloud-muted truncate">{person.role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFollow(person.id)}
                    className={cn(
                      'text-xs font-semibold px-3 py-1.5 rounded-lg transition-all',
                      followed.has(person.id)
                        ? 'bg-cloud-deep text-cloud-muted'
                        : 'bg-tyrian text-cloud hover:bg-tyrian/90',
                    )}
                  >
                    {followed.has(person.id) ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 6 — Done */}
        {step === 6 && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={36} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-cloud-ink mb-2">You&apos;re all set!</h2>
            <p className="text-cloud-muted text-sm mb-6">Welcome to the community of builders. Your personalized feed is ready.</p>
            <div className="grid grid-cols-3 gap-3 mb-8 text-center">
              {[
                { value: interests.size, label: 'Interests' },
                { value: skills.size, label: 'Skills' },
                { value: followed.size, label: 'Following' },
              ].map((s) => (
                <div key={s.label} className="bg-cloud-deep/50 rounded-xl py-3">
                  <p className="text-xl font-bold text-cloud-ink">{s.value}</p>
                  <p className="text-xs text-cloud-muted">{s.label}</p>
                </div>
              ))}
            </div>
            <Button variant="primary" size="lg" className="w-full" onClick={() => router.push('/feed')}>
              Go to feed 🚀
            </Button>
          </div>
        )}

        {/* Footer nav */}
        {step > 1 && step < TOTAL_STEPS && (
          <div className="px-8 pb-6 flex items-center justify-between">
            <button type="button" onClick={back} className="flex items-center gap-1 text-sm text-cloud-muted hover:text-cloud-ink">
              <ChevronLeft size={16} /> Back
            </button>
            <span className="text-xs text-cloud-muted">Step {step} of {TOTAL_STEPS}</span>
            <Button variant="primary" size="sm" onClick={next} icon={<ChevronRight size={14} />}>
              Next
            </Button>
          </div>
        )}
        {step === 2 && (
          <div className="px-8 pb-6 -mt-2 flex justify-center">
            <button type="button" onClick={next} className="text-xs text-cloud-muted hover:text-cloud-ink underline">
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
