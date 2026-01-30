import { cn } from '@/lib/utils';
import { 
  Play, 
  GitBranch, 
  MessageCircle, 
  Flag, 
  Star, 
  AlertTriangle 
} from 'lucide-react';

interface JourneyLegendProps {
  className?: string;
  compact?: boolean;
}

const LEGEND_ITEMS = [
  { icon: Play, label: 'Action', color: 'text-chart-1' },
  { icon: GitBranch, label: 'Decision', color: 'text-chart-4' },
  { icon: MessageCircle, label: 'Communication', color: 'text-chart-2' },
  { icon: Flag, label: 'Milestone', color: 'text-chart-3' },
  { icon: Star, label: 'Moment of Truth', color: 'text-warning', fill: true },
  { icon: AlertTriangle, label: 'Pain Point', color: 'text-destructive' },
];

export function JourneyLegend({ className, compact = false }: JourneyLegendProps) {
  if (compact) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        {LEGEND_ITEMS.slice(0, 4).map((item) => (
          <div key={item.label} className="flex items-center gap-1" title={item.label}>
            <item.icon className={cn('h-3 w-3', item.color)} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-2 p-2 rounded-lg bg-card/80 backdrop-blur-sm border text-xs',
        className
      )}
    >
      <span className="font-medium text-muted-foreground">Legend:</span>
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <item.icon
            className={cn('h-3.5 w-3.5', item.color, item.fill && 'fill-current')}
          />
          <span className="text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
