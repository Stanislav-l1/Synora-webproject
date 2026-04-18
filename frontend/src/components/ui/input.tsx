import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type FieldTone = 'light' | 'dark';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  tone?: FieldTone;
}

const toneBase: Record<FieldTone, string> = {
  light: 'bg-white border-cloud-deep text-cloud-ink placeholder:text-cloud-muted focus:border-tyrian focus:ring-tyrian/25',
  dark: 'bg-moss-deep border-moss-velvet text-cloud placeholder:text-moss-soft focus:border-banana focus:ring-banana/30',
};

const labelTone: Record<FieldTone, string> = {
  light: 'text-cloud-ink/80',
  dark: 'text-cloud/70',
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, tone = 'light', ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className={cn('text-sm font-medium', labelTone[tone])}>
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2',
              tone === 'dark' ? 'text-moss-soft' : 'text-cloud-muted',
            )}>
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-10 px-3 border rounded-md text-sm',
              'focus:outline-none focus:ring-1',
              'transition-colors duration-150',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              toneBase[tone],
              icon && 'pl-10',
              error && 'border-tyrian focus:border-tyrian focus:ring-tyrian/30',
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-tyrian">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  tone?: FieldTone;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, tone = 'light', ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className={cn('text-sm font-medium', labelTone[tone])}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full min-h-[80px] px-3 py-2 border rounded-md text-sm',
            'focus:outline-none focus:ring-1',
            'transition-colors duration-150 resize-y',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            toneBase[tone],
            error && 'border-tyrian focus:border-tyrian focus:ring-tyrian/30',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-tyrian">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

export { Input, Textarea };
