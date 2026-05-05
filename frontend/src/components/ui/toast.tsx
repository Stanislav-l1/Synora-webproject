'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToastStore, type ToastItem } from '@/store/useToastStore';

const ICONS = {
  success: <CheckCircle size={16} className="shrink-0" />,
  error:   <AlertCircle size={16} className="shrink-0" />,
  info:    <Info size={16} className="shrink-0" />,
  warning: <AlertTriangle size={16} className="shrink-0" />,
};

const STYLES = {
  success: 'bg-green-600 text-white',
  error:   'bg-red-500 text-white',
  info:    'bg-tyrian text-white',
  warning: 'bg-amber-500 text-white',
};

function Toast({ toast }: { toast: ToastItem }) {
  const remove = useToastStore((s) => s.remove);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  function dismiss() {
    setVisible(false);
    setTimeout(() => remove(toast.id), 300);
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg min-w-[240px] max-w-sm transition-all duration-300',
        STYLES[toast.type],
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
      )}
    >
      {ICONS[toast.type]}
      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
      <button type="button" onClick={dismiss} className="opacity-70 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast toast={t} />
        </div>
      ))}
    </div>
  );
}
