'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Search, Clock, Users, Star, Filter, ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Level = 'all' | 'beginner' | 'intermediate' | 'advanced';
type Category = 'all' | 'frontend' | 'backend' | 'devops' | 'ml' | 'mobile';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorAvatar: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: Category;
  duration: string;
  lessons: number;
  enrolled: number;
  rating: number;
  price: number | null;
  tags: string[];
  cover: string;
}

const COURSES: Course[] = [
  { id: '1', title: 'React & TypeScript: From Zero to Production', description: 'Build real-world apps with React 18, TypeScript, and modern tooling.', instructor: 'Sarah Lin', instructorAvatar: 'SL', level: 'beginner', category: 'frontend', duration: '14h', lessons: 42, enrolled: 3240, rating: 4.9, price: null, tags: ['react', 'typescript'], cover: 'from-blue-400 to-cyan-500' },
  { id: '2', title: 'Node.js Microservices with Docker', description: 'Design, build, and deploy production-grade microservices at scale.', instructor: 'Alex Müller', instructorAvatar: 'AM', level: 'advanced', category: 'backend', duration: '18h', lessons: 56, enrolled: 1820, rating: 4.8, price: 49, tags: ['node.js', 'docker', 'microservices'], cover: 'from-green-400 to-emerald-600' },
  { id: '3', title: 'Kubernetes for Developers', description: 'Container orchestration from first pod to multi-cluster production setups.', instructor: 'Priya Nair', instructorAvatar: 'PN', level: 'intermediate', category: 'devops', duration: '12h', lessons: 38, enrolled: 2100, rating: 4.7, price: 39, tags: ['kubernetes', 'devops', 'cloud'], cover: 'from-purple-400 to-violet-600' },
  { id: '4', title: 'Machine Learning with Python', description: 'Neural networks, transformers, and deployment with PyTorch and scikit-learn.', instructor: 'Yuki Tanaka', instructorAvatar: 'YT', level: 'intermediate', category: 'ml', duration: '22h', lessons: 68, enrolled: 4100, rating: 4.9, price: 59, tags: ['python', 'ml', 'pytorch'], cover: 'from-orange-400 to-rose-500' },
  { id: '5', title: 'Go for Backend Engineers', description: 'Build high-performance APIs and CLIs with Go — from syntax to deployment.', instructor: 'Marcus Webb', instructorAvatar: 'MW', level: 'intermediate', category: 'backend', duration: '10h', lessons: 31, enrolled: 980, rating: 4.8, price: null, tags: ['go', 'backend', 'api'], cover: 'from-cyan-400 to-sky-600' },
  { id: '6', title: 'iOS Development with Swift', description: 'Build native iOS apps with SwiftUI, Core Data, and App Store deployment.', instructor: 'Nina Kovacs', instructorAvatar: 'NK', level: 'beginner', category: 'mobile', duration: '16h', lessons: 48, enrolled: 1560, rating: 4.6, price: 45, tags: ['swift', 'ios', 'swiftui'], cover: 'from-pink-400 to-fuchsia-600' },
  { id: '7', title: 'Next.js Full-Stack Mastery', description: 'App Router, Server Actions, edge functions, and full-stack TypeScript patterns.', instructor: 'Omar Hassan', instructorAvatar: 'OH', level: 'advanced', category: 'frontend', duration: '20h', lessons: 62, enrolled: 2780, rating: 4.9, price: 55, tags: ['next.js', 'react', 'fullstack'], cover: 'from-slate-400 to-zinc-600' },
  { id: '8', title: 'PostgreSQL: From Basics to Expert', description: 'Indexes, query planning, replication, partitioning, and performance tuning.', instructor: 'David Kim', instructorAvatar: 'DK', level: 'intermediate', category: 'backend', duration: '9h', lessons: 27, enrolled: 740, rating: 4.7, price: null, tags: ['postgresql', 'sql', 'databases'], cover: 'from-teal-400 to-green-600' },
];

const LEVEL_BADGE: Record<string, string> = {
  beginner:     'bg-green-100 text-green-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced:     'bg-red-100 text-red-600',
};

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'all',      label: 'All' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend',  label: 'Backend' },
  { id: 'devops',   label: 'DevOps' },
  { id: 'ml',       label: 'ML / AI' },
  { id: 'mobile',   label: 'Mobile' },
];

const LEVELS: { id: Level; label: string }[] = [
  { id: 'all',          label: 'All levels' },
  { id: 'beginner',     label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced',     label: 'Advanced' },
];

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category>('all');
  const [level, setLevel] = useState<Level>('all');

  const filtered = COURSES.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.title.toLowerCase().includes(q) || c.tags.some((t) => t.includes(q));
    const matchCat = category === 'all' || c.category === category;
    const matchLevel = level === 'all' || c.level === level;
    return matchSearch && matchCat && matchLevel;
  });

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={18} className="text-tyrian" />
            <h1 className="text-xl font-bold text-cloud-ink">Courses</h1>
          </div>
          <p className="text-sm text-cloud-muted">Learn from the community — curated by developers, for developers</p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cloud-muted" />
          <input
            className="w-full pl-9 pr-4 py-2.5 bg-cloud border border-cloud-deep rounded-xl text-sm text-cloud-ink placeholder:text-cloud-muted focus:outline-none focus:border-tyrian transition-colors"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 mb-3 overflow-x-auto scrollbar-hidden">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0',
                category === c.id ? 'bg-tyrian text-white' : 'bg-cloud-deep/50 text-cloud-muted hover:text-cloud-ink',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Level filter */}
        <div className="flex items-center gap-2 mb-6">
          <Filter size={13} className="text-cloud-muted shrink-0" />
          <div className="flex gap-1 flex-wrap">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLevel(l.id)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-medium transition-all',
                  level === l.id ? 'bg-cloud-deep text-cloud-ink' : 'text-cloud-muted hover:text-cloud-ink',
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-cloud-muted mb-4">{filtered.length} courses</p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-cloud-muted text-sm">No courses match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className="bg-cloud border border-cloud-deep rounded-2xl overflow-hidden hover:shadow-md hover:border-tyrian/30 transition-all group"
    >
      {/* Cover */}
      <div className={cn('h-28 bg-gradient-to-br', course.cover)} />

      <div className="p-4">
        {/* Level + category */}
        <div className="flex items-center gap-2 mb-2">
          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase', LEVEL_BADGE[course.level])}>
            {course.level}
          </span>
          <span className="text-[10px] text-cloud-muted capitalize">{course.category}</span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-cloud-ink leading-snug mb-1 group-hover:text-tyrian transition-colors">
          {course.title}
        </h3>
        <p className="text-[11px] text-cloud-muted leading-snug mb-3 line-clamp-2">{course.description}</p>

        {/* Instructor */}
        <p className="text-xs text-cloud-muted mb-3">by <span className="text-cloud-ink font-medium">{course.instructor}</span></p>

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-cloud-muted">
            <span className="flex items-center gap-1"><Clock size={11} />{course.duration}</span>
            <span className="flex items-center gap-1"><BookOpen size={11} />{course.lessons} lessons</span>
            <span className="flex items-center gap-1"><Users size={11} />{course.enrolled.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            {course.price === null ? (
              <span className="text-xs font-bold text-green-600">Free</span>
            ) : (
              <span className="text-xs font-bold text-cloud-ink">${course.price}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
