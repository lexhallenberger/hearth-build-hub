import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface PersonaAvatarProps {
  persona?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const PERSONA_COLORS: Record<string, string> = {
  'Decision Maker': 'bg-chart-1/20 text-chart-1 border-chart-1/30',
  'Technical Lead': 'bg-chart-2/20 text-chart-2 border-chart-2/30',
  'End User': 'bg-chart-3/20 text-chart-3 border-chart-3/30',
  'Champion': 'bg-chart-4/20 text-chart-4 border-chart-4/30',
  'Blocker': 'bg-destructive/20 text-destructive border-destructive/30',
  'Influencer': 'bg-chart-5/20 text-chart-5 border-chart-5/30',
};

const SIZE_CLASSES = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
};

export function PersonaAvatar({ persona, size = 'md', className }: PersonaAvatarProps) {
  if (!persona) {
    return (
      <div
        className={cn(
          'rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/50',
          SIZE_CLASSES[size],
          className
        )}
      >
        <User className="h-1/2 w-1/2 text-muted-foreground/50" />
      </div>
    );
  }

  const colorClass = PERSONA_COLORS[persona] || 'bg-primary/20 text-primary border-primary/30';
  const initials = persona
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        'rounded-full border flex items-center justify-center font-semibold',
        SIZE_CLASSES[size],
        colorClass,
        className
      )}
      title={persona}
    >
      {initials}
    </div>
  );
}

export const PERSONA_OPTIONS = [
  'Decision Maker',
  'Technical Lead',
  'End User',
  'Champion',
  'Blocker',
  'Influencer',
];
