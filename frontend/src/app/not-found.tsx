'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-cloud flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-tyrian/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-banana/10 rounded-full blur-3xl pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center gap-2 mb-12">
        <Zap size={22} className="text-tyrian" />
        <span className="text-lg font-bold text-cloud-ink">Synora</span>
      </div>

      {/* 404 text */}
      <div className="text-center mb-8">
        <p className="text-[120px] font-black leading-none text-cloud-deep select-none mb-4">404</p>
        <h1 className="text-2xl font-bold text-cloud-ink mb-3">Page not found</h1>
        <p className="text-cloud-muted text-sm max-w-sm leading-relaxed">
          Looks like this page wandered off. It might have been moved, deleted, or never existed.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/feed"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-tyrian text-white rounded-xl text-sm font-semibold hover:bg-tyrian/90 transition-colors"
        >
          <Home size={16} />
          Go to Feed
        </Link>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-cloud border border-cloud-deep text-cloud-ink rounded-xl text-sm font-medium hover:bg-cloud-deep/50 transition-colors"
        >
          <ArrowLeft size={16} />
          Go back
        </button>
        <Link
          href="/search"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-cloud border border-cloud-deep text-cloud-ink rounded-xl text-sm font-medium hover:bg-cloud-deep/50 transition-colors"
        >
          <Search size={16} />
          Search
        </Link>
      </div>
    </div>
  );
}
