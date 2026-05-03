'use client';

import { BadgeCheck, Building2, GraduationCap, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VerificationType } from '@/types';

interface VerificationBadgeProps {
  type: VerificationType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const CONFIG: Record<VerificationType, { icon: React.ElementType; color: string; label: string }> = {
  PROFESSIONAL: { icon: BadgeCheck,    color: 'text-[#1d9bf0]', label: 'Verified Professional' },
  COMPANY:      { icon: Building2,     color: 'text-[#7c3aed]', label: 'Verified Company'      },
  MENTOR:       { icon: GraduationCap, color: 'text-[#059669]', label: 'Verified Mentor'       },
  STARTUP:      { icon: Rocket,        color: 'text-[#f59e0b]', label: 'Verified Startup'      },
};

const SIZES = {
  sm: { icon: 13, text: 'text-[10px]' },
  md: { icon: 16, text: 'text-xs'     },
  lg: { icon: 20, text: 'text-sm'     },
};

export function VerificationBadge({
  type,
  size = 'sm',
  showLabel = false,
  className,
}: VerificationBadgeProps) {
  const { icon: Icon, color, label } = CONFIG[type];
  const { icon: iconSize, text } = SIZES[size];

  return (
    <span
      className={cn('inline-flex items-center gap-1', className)}
      title={label}
    >
      <Icon size={iconSize} className={color} />
      {showLabel && <span className={cn(text, color, 'font-medium')}>{label}</span>}
    </span>
  );
}
