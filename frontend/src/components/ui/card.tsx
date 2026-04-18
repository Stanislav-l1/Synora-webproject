import { cn } from '@/lib/utils';

type CardTone = 'light' | 'dark';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  tone?: CardTone;
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const toneBase: Record<CardTone, string> = {
  light: 'bg-cloud-soft border-cloud-deep text-cloud-ink',
  dark: 'bg-moss-velvet border-moss-deep text-cloud',
};

const toneHover: Record<CardTone, string> = {
  light: 'hover:border-moss-soft hover:shadow-md hover:-translate-y-0.5',
  dark: 'hover:border-banana/40 hover:shadow-moss hover:-translate-y-0.5',
};

export function Card({ children, className, hover = false, padding = 'md', tone = 'light' }: CardProps) {
  return (
    <div
      className={cn(
        'border rounded-lg transition-all duration-200',
        toneBase[tone],
        paddingMap[padding],
        hover && `${toneHover[tone]} cursor-pointer`,
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center gap-3', className)}>{children}</div>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mt-3', className)}>{children}</div>;
}

export function CardFooter({ children, className, tone = 'light' }: { children: React.ReactNode; className?: string; tone?: CardTone }) {
  const borderCls = tone === 'dark' ? 'border-moss-deep' : 'border-cloud-deep';
  return (
    <div className={cn('mt-3 pt-3 border-t flex items-center', borderCls, className)}>
      {children}
    </div>
  );
}
