export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center">
      <div className="text-center px-6">
        <div className="text-5xl mb-4">📡</div>
        <h1 className="text-2xl font-bold text-content-primary mb-2">You're offline</h1>
        <p className="text-content-secondary mb-6">Check your connection and try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
