'use client';

import { useState } from 'react';
import { Sparkles, ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

const INTERESTS = [
  'AI & ML', 'Web3 & Crypto', 'Open Source', 'Games',
  'Education', 'Fintech', 'Health tech', 'DevOps',
  'Security', 'Design', 'Hardware', 'Mobile apps',
];

const SPECIALIZATIONS = [
  'Frontend', 'Backend', 'Fullstack', 'Mobile',
  'DevOps / SRE', 'Data / ML', 'Design', 'PM',
  'Security', 'QA', 'Student', 'Other',
];

const TECHNOLOGIES = [
  'TypeScript', 'JavaScript', 'Python', 'Go',
  'Rust', 'Java', 'Kotlin', 'Swift',
  'React', 'Next.js', 'Vue', 'Svelte',
  'Node.js', 'Spring', 'Django', 'FastAPI',
  'PostgreSQL', 'Redis', 'Docker', 'Kubernetes',
  'AWS', 'GCP',
];

const CAREER_GOALS = [
  { value: 'LEARN',        label: 'Learn new things' },
  { value: 'JOB',          label: 'Find a job' },
  { value: 'NETWORK',      label: 'Grow my network' },
  { value: 'OPEN_SOURCE',  label: 'Contribute to OSS' },
  { value: 'BUILD',        label: 'Build my own product' },
  { value: 'TEACH',        label: 'Teach & mentor' },
];

const AVAILABILITY = [
  'Full-time job',
  'Freelance projects',
  'Open-source collabs',
  'Mentoring',
  'Just exploring',
];

type Step = 0 | 1 | 2 | 3 | 4;

export function OnboardingWizard({ onClose }: { onClose: () => void }) {
  const { setUser, user } = useAuthStore();
  const [step, setStep] = useState<Step>(0);
  const [interests, setInterests] = useState<Set<string>>(new Set());
  const [specialization, setSpecialization] = useState<string>('');
  const [technologies, setTechnologies] = useState<Set<string>>(new Set());
  const [careerGoal, setCareerGoal] = useState<string>('');
  const [availableFor, setAvailableFor] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = ['Interests', 'Specialization', 'Technologies', 'Career goal', 'Preferences'];

  const toggle = (set: Set<string>, value: string, apply: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    apply(next);
  };

  function canProceed(): boolean {
    switch (step) {
      case 0: return interests.size > 0;
      case 1: return !!specialization;
      case 2: return technologies.size > 0;
      case 3: return !!careerGoal;
      case 4: return true;
      default: return true;
    }
  }

  async function finish() {
    setError(null);
    setSaving(true);
    try {
      await api.post('/users/me/onboarding', {
        interests: Array.from(interests),
        specialization,
        technologies: Array.from(technologies),
        careerGoal,
        availableFor: availableFor || undefined,
      });
      if (user) setUser({ ...user, onboardingCompleted: true });
      onClose();
    } catch {
      setError('Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] bg-moss-deep/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-cloud-deep rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <header className="flex items-center justify-between px-5 h-14 border-b border-cloud-deep bg-cloud-soft">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-tyrian text-cloud">
              <Sparkles size={16} />
            </span>
            <div>
              <p className="text-sm font-semibold text-cloud-ink leading-tight">Welcome to Synora</p>
              <p className="text-[11px] text-cloud-muted leading-tight">Step {step + 1} of {steps.length} — {steps[step]}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Skip for now"
            className="text-xs text-cloud-muted hover:text-cloud-ink flex items-center gap-1"
          >
            Skip <X size={14} />
          </button>
        </header>

        <div className="px-5 pt-3">
          <div className="flex items-center gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1 rounded-full ${
                  i < step ? 'bg-tyrian' : i === step ? 'bg-tyrian/60' : 'bg-cloud-deep'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {step === 0 && (
            <>
              <h3 className="text-lg font-semibold text-cloud-ink">What are you into?</h3>
              <p className="text-sm text-cloud-muted">Pick a few topics you want to see more of. You can change this later.</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {INTERESTS.map((i) => (
                  <Chip key={i} active={interests.has(i)} onClick={() => toggle(interests, i, setInterests)}>
                    {i}
                  </Chip>
                ))}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h3 className="text-lg font-semibold text-cloud-ink">What do you do?</h3>
              <p className="text-sm text-cloud-muted">Your main specialization — helps us tailor suggestions.</p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                {SPECIALIZATIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSpecialization(s)}
                    className={`h-10 rounded-md border text-sm transition-colors ${
                      specialization === s
                        ? 'border-tyrian bg-tyrian/10 text-tyrian font-medium'
                        : 'border-cloud-deep bg-white text-cloud-ink hover:bg-cloud-soft'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h3 className="text-lg font-semibold text-cloud-ink">Your technologies</h3>
              <p className="text-sm text-cloud-muted">Pick what you use — we&apos;ll add them to your profile skills.</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {TECHNOLOGIES.map((t) => (
                  <Chip key={t} active={technologies.has(t)} onClick={() => toggle(technologies, t, setTechnologies)}>
                    {t}
                  </Chip>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h3 className="text-lg font-semibold text-cloud-ink">Career goal</h3>
              <p className="text-sm text-cloud-muted">What brings you here?</p>
              <div className="grid grid-cols-1 gap-2 pt-2">
                {CAREER_GOALS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setCareerGoal(g.value)}
                    className={`h-11 px-3 rounded-md border text-sm text-left transition-colors ${
                      careerGoal === g.value
                        ? 'border-tyrian bg-tyrian/10 text-tyrian font-medium'
                        : 'border-cloud-deep bg-white text-cloud-ink hover:bg-cloud-soft'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h3 className="text-lg font-semibold text-cloud-ink">Open for…</h3>
              <p className="text-sm text-cloud-muted">Shown on your profile. Optional — you can leave it empty.</p>
              <div className="grid grid-cols-1 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAvailableFor('')}
                  className={`h-10 px-3 rounded-md border text-sm text-left transition-colors ${
                    availableFor === ''
                      ? 'border-tyrian bg-tyrian/10 text-tyrian font-medium'
                      : 'border-cloud-deep bg-white text-cloud-ink hover:bg-cloud-soft'
                  }`}
                >
                  Nothing specific
                </button>
                {AVAILABILITY.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAvailableFor(a)}
                    className={`h-10 px-3 rounded-md border text-sm text-left transition-colors ${
                      availableFor === a
                        ? 'border-tyrian bg-tyrian/10 text-tyrian font-medium'
                        : 'border-cloud-deep bg-white text-cloud-ink hover:bg-cloud-soft'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <footer className="flex items-center justify-between gap-2 px-5 h-14 border-t border-cloud-deep bg-cloud-soft">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setStep((s) => Math.max(0, s - 1) as Step)}
            disabled={step === 0 || saving}
          >
            <ArrowLeft size={14} className="mr-1" /> Back
          </Button>

          {step < 4 ? (
            <Button
              type="button"
              size="sm"
              onClick={() => setStep((s) => (s + 1) as Step)}
              disabled={!canProceed()}
            >
              Next <ArrowRight size={14} className="ml-1" />
            </Button>
          ) : (
            <Button type="button" size="sm" onClick={finish} loading={saving}>
              <Check size={14} className="mr-1" /> Finish
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
        active
          ? 'bg-tyrian text-cloud border-tyrian'
          : 'bg-white text-cloud-ink border-cloud-deep hover:bg-cloud-soft'
      }`}
    >
      {children}
    </button>
  );
}
