'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-cloud flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={28} className="text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-cloud-ink mb-2">Something went wrong</h1>
        <p className="text-cloud-muted text-sm mb-6 leading-relaxed">
          An unexpected error occurred. We&apos;ve been notified and will look into it.
        </p>
        {error.digest && (
          <p className="text-[11px] text-cloud-muted mb-4 font-mono bg-cloud-deep/50 px-3 py-1.5 rounded-lg inline-block">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 bg-tyrian text-white rounded-xl text-sm font-semibold hover:bg-tyrian/90 transition-colors"
          >
            <RefreshCw size={15} />
            Try again
          </button>
          <Link
            href="/feed"
            className="flex items-center gap-2 px-5 py-2.5 bg-cloud border border-cloud-deep text-cloud-ink rounded-xl text-sm font-medium hover:bg-cloud-deep/50 transition-colors"
          >
            <Home size={15} />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
