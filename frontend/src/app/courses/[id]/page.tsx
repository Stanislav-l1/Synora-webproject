'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, BookOpen, Clock, Users, Star, ChevronDown,
  CheckCircle2, Play, FileText, Code2, Lock,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/store/useToastStore';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'code';
  duration: string;
  free: boolean;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  instructor: string;
  instructorAvatar: string;
  instructorBio: string;
  level: string;
  category: string;
  duration: string;
  lessons: number;
  enrolled: number;
  rating: number;
  ratingCount: number;
  price: number | null;
  tags: string[];
  cover: string;
  modules: Module[];
  whatYouLearn: string[];
}

const COURSES: Record<string, CourseDetail> = {
  '1': {
    id: '1',
    title: 'React & TypeScript: From Zero to Production',
    description: 'Build real-world apps with React 18, TypeScript, and modern tooling.',
    longDescription: 'Start from absolute zero and end up shipping production React + TypeScript apps with confidence. We cover the core language features you actually need, state management with Zustand, server state with TanStack Query, and deploy a full-stack app to Vercel.',
    instructor: 'Sarah Lin',
    instructorAvatar: 'SL',
    instructorBio: 'Senior Frontend Engineer at Vercel. Open source contributor, ex-Shopify.',
    level: 'Beginner',
    category: 'Frontend',
    duration: '14h',
    lessons: 42,
    enrolled: 3240,
    rating: 4.9,
    ratingCount: 412,
    price: null,
    tags: ['react', 'typescript', 'frontend'],
    cover: 'from-blue-400 to-cyan-500',
    whatYouLearn: [
      'TypeScript fundamentals and type safety patterns',
      'React 18 hooks, context, and performance',
      'State management with Zustand',
      'Data fetching with TanStack Query',
      'Testing with Vitest and Testing Library',
      'Deploy to production with Vercel',
    ],
    modules: [
      {
        id: 'm1', title: 'TypeScript Foundations', lessons: [
          { id: 'l1', title: 'Why TypeScript?', type: 'video', duration: '8m', free: true },
          { id: 'l2', title: 'Types, interfaces, generics', type: 'text', duration: '15m', free: true },
          { id: 'l3', title: 'Utility types deep dive', type: 'code', duration: '20m', free: false },
        ],
      },
      {
        id: 'm2', title: 'React with TypeScript', lessons: [
          { id: 'l4', title: 'Component typing patterns', type: 'video', duration: '12m', free: false },
          { id: 'l5', title: 'Hooks and generics', type: 'video', duration: '18m', free: false },
          { id: 'l6', title: 'Event handling types', type: 'code', duration: '10m', free: false },
          { id: 'l7', title: 'Context API typed', type: 'text', duration: '14m', free: false },
        ],
      },
      {
        id: 'm3', title: 'State Management', lessons: [
          { id: 'l8', title: 'Zustand setup and slices', type: 'video', duration: '16m', free: false },
          { id: 'l9', title: 'Async actions and immer', type: 'code', duration: '22m', free: false },
        ],
      },
      {
        id: 'm4', title: 'Data Fetching', lessons: [
          { id: 'l10', title: 'TanStack Query intro', type: 'video', duration: '14m', free: false },
          { id: 'l11', title: 'Mutations and optimistic updates', type: 'code', duration: '25m', free: false },
          { id: 'l12', title: 'Infinite scroll', type: 'video', duration: '18m', free: false },
        ],
      },
    ],
  },
};

const LESSON_ICON = {
  video: <Play size={12} />,
  text:  <FileText size={12} />,
  code:  <Code2 size={12} />,
};

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const course = COURSES[id] ?? null;
  const [openModules, setOpenModules] = useState<Set<string>>(new Set(['m1']));
  const [enrolled, setEnrolled] = useState(false);

  function toggleModule(mid: string) {
    setOpenModules((prev) => {
      const n = new Set(prev);
      n.has(mid) ? n.delete(mid) : n.add(mid);
      return n;
    });
  }

  function handleEnroll() {
    setEnrolled(true);
    toast.success('Enrolled! Happy learning 🎉');
  }

  if (!course) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto py-16 px-4 text-center">
          <p className="text-4xl mb-4">📚</p>
          <h2 className="text-lg font-bold text-cloud-ink mb-2">Course not found</h2>
          <Button variant="primary" onClick={() => router.push('/courses')}>Browse courses</Button>
        </div>
      </AppShell>
    );
  }

  const totalLessons = course.modules.reduce((a, m) => a + m.lessons.length, 0);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto py-6 px-4">
        {/* Back */}
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-cloud-muted hover:text-cloud-ink transition-colors mb-5"
        >
          <ArrowLeft size={16} /> Courses
        </button>

        {/* Hero */}
        <div className={cn('h-40 rounded-2xl bg-gradient-to-br mb-6', course.cover)} />

        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">
          {/* Left column */}
          <div>
            {/* Title */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-tyrian/10 text-tyrian uppercase">{course.level}</span>
              <span className="text-xs text-cloud-muted capitalize">{course.category}</span>
            </div>
            <h1 className="text-xl font-bold text-cloud-ink leading-tight mb-2">{course.title}</h1>
            <p className="text-sm text-cloud-muted mb-4 leading-relaxed">{course.longDescription}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {course.tags.map((t) => (
                <Badge key={t} variant="default" className="text-xs">#{t}</Badge>
              ))}
            </div>

            {/* Instructor */}
            <div className="flex items-center gap-3 bg-cloud border border-cloud-deep rounded-xl p-4 mb-6">
              <Avatar name={course.instructor} size="md" />
              <div>
                <p className="text-sm font-semibold text-cloud-ink">{course.instructor}</p>
                <p className="text-xs text-cloud-muted leading-snug">{course.instructorBio}</p>
              </div>
            </div>

            {/* What you'll learn */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-cloud-ink mb-3">What you&apos;ll learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {course.whatYouLearn.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-cloud-ink/80 leading-snug">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum */}
            <div>
              <h2 className="text-sm font-semibold text-cloud-ink mb-3">
                Curriculum · {course.modules.length} modules · {totalLessons} lessons
              </h2>
              <div className="space-y-2">
                {course.modules.map((mod) => {
                  const isOpen = openModules.has(mod.id);
                  return (
                    <div key={mod.id} className="bg-cloud border border-cloud-deep rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleModule(mod.id)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-cloud-deep/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-cloud-ink">{mod.title}</span>
                          <span className="text-xs text-cloud-muted">{mod.lessons.length} lessons</span>
                        </div>
                        <ChevronDown
                          size={16}
                          className={cn('text-cloud-muted transition-transform', isOpen && 'rotate-180')}
                        />
                      </button>
                      {isOpen && (
                        <div className="border-t border-cloud-deep">
                          {mod.lessons.map((lesson, li) => (
                            <div
                              key={lesson.id}
                              className={cn(
                                'flex items-center gap-3 px-4 py-2.5 text-sm',
                                li < mod.lessons.length - 1 && 'border-b border-cloud-deep',
                                lesson.free ? 'cursor-pointer hover:bg-cloud-deep/30 transition-colors' : 'opacity-60',
                              )}
                            >
                              <span className="text-cloud-muted">{LESSON_ICON[lesson.type]}</span>
                              <span className="flex-1 text-cloud-ink/80">{lesson.title}</span>
                              <span className="text-xs text-cloud-muted">{lesson.duration}</span>
                              {!lesson.free && !enrolled && <Lock size={11} className="text-cloud-muted" />}
                              {lesson.free && <span className="text-[10px] text-green-600 font-semibold">Free</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right sidebar (sticky) */}
          <div className="md:sticky md:top-20 h-fit">
            <div className="bg-cloud border border-cloud-deep rounded-2xl p-5 space-y-4">
              {/* Price */}
              <div className="text-center pb-3 border-b border-cloud-deep">
                {course.price === null ? (
                  <span className="text-2xl font-black text-green-600">Free</span>
                ) : (
                  <>
                    <span className="text-2xl font-black text-cloud-ink">${course.price}</span>
                    <span className="text-cloud-muted text-sm ml-1">one-time</span>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="space-y-2 text-sm">
                {[
                  { icon: <Star size={14} className="text-yellow-500" />, label: `${course.rating} (${course.ratingCount} reviews)` },
                  { icon: <Users size={14} className="text-tyrian" />, label: `${course.enrolled.toLocaleString()} enrolled` },
                  { icon: <Clock size={14} className="text-cloud-muted" />, label: `${course.duration} total` },
                  { icon: <BookOpen size={14} className="text-cloud-muted" />, label: `${course.lessons} lessons` },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2 text-cloud-ink/80">
                    {s.icon}
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Enroll button */}
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={enrolled ? undefined : handleEnroll}
                disabled={enrolled}
              >
                {enrolled ? '✓ Enrolled — Continue' : course.price === null ? 'Enroll for free' : `Enroll for $${course.price}`}
              </Button>

              <p className="text-[11px] text-cloud-muted text-center">
                Lifetime access · Certificate on completion
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
