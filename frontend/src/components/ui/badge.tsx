import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'moss' | 'banana';
type BadgeTone = 'light' | 'dark';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  tone?: BadgeTone;
  className?: string;
}

const variantsLight: Record<BadgeVariant, string> = {
  default: 'bg-cloud-deep text-cloud-ink/80',
  accent: 'bg-tyrian-muted text-tyrian',
  success: 'bg-success-muted text-success',
  warning: 'bg-warning-muted text-warning',
  danger: 'bg-tyrian-muted text-tyrian',
  info: 'bg-info-muted text-info',
  moss: 'bg-moss/12 text-moss',
  banana: 'bg-banana-soft text-moss-deep',
};

const variantsDark: Record<BadgeVariant, string> = {
  default: 'bg-moss-velvet text-cloud/80',
  accent: 'bg-tyrian text-cloud',
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
  danger: 'bg-tyrian/30 text-banana',
  info: 'bg-info/20 text-info',
  moss: 'bg-moss-deep text-cloud',
  banana: 'bg-banana text-moss-deep',
};

export function Badge({ children, variant = 'default', tone = 'light', className }: BadgeProps) {
  const variants = tone === 'dark' ? variantsDark : variantsLight;
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
