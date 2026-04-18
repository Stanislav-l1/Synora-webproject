import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'moss' | 'banana';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonTone = 'light' | 'dark';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  tone?: ButtonTone;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantsLight: Record<ButtonVariant, string> = {
  primary:
    'bg-tyrian text-cloud hover:bg-tyrian-soft active:bg-tyrian/90 shadow-sm',
  secondary:
    'bg-cloud-soft text-cloud-ink border border-cloud-deep hover:border-moss-soft hover:bg-cloud',
  ghost:
    'bg-transparent text-cloud-ink/80 hover:text-cloud-ink hover:bg-cloud-deep/60',
  danger:
    'bg-transparent text-tyrian border border-tyrian hover:bg-tyrian hover:text-cloud',
  moss:
    'bg-moss text-cloud hover:bg-moss-velvet active:bg-moss-deep shadow-moss',
  banana:
    'bg-banana text-moss-deep hover:bg-banana-deep active:bg-banana-deep/90',
};

const variantsDark: Record<ButtonVariant, string> = {
  primary:
    'bg-tyrian text-cloud hover:bg-tyrian-soft active:bg-tyrian/90 shadow-tyrian',
  secondary:
    'bg-moss-velvet text-cloud border border-moss-soft/40 hover:border-banana/40 hover:bg-moss-deep',
  ghost:
    'bg-transparent text-cloud/80 hover:text-cloud hover:bg-moss-velvet',
  danger:
    'bg-transparent text-banana border border-banana/60 hover:bg-banana hover:text-moss-deep',
  moss:
    'bg-moss-deep text-cloud hover:bg-moss-velvet active:bg-moss',
  banana:
    'bg-banana text-moss-deep hover:bg-banana-deep',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', tone = 'light', loading, icon, children, disabled, ...props }, ref) => {
    const variants = tone === 'dark' ? variantsDark : variantsLight;
    const focusRing = tone === 'dark'
      ? 'focus-visible:ring-banana/60 focus-visible:ring-offset-moss'
      : 'focus-visible:ring-tyrian/40 focus-visible:ring-offset-cloud';

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-md transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          focusRing,
          variants[variant],
          sizes[size],
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize, type ButtonTone };
