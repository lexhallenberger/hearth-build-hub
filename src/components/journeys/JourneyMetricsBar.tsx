import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Journey } from '@/types/journeys';
import { 
  LayoutGrid, 
  Star, 
  AlertTriangle, 
  Clock, 
  TrendingUp 
} from 'lucide-react';

interface JourneyMetricsBarProps {
  journey: Journey;
  className?: string;
}

export function JourneyMetricsBar({ journey, className }: JourneyMetricsBarProps) {
  const stages = journey.stages || [];
  const allTouchpoints = stages.flatMap((s) => s.touchpoints || []);
  
  const totalTouchpoints = allTouchpoints.length;
  const momentsOfTruth = allTouchpoints.filter((t) => t.is_moment_of_truth).length;
  const highPainPoints = allTouchpoints.filter((t) => t.pain_point_level > 2).length;
  
  const avgPainScore = totalTouchpoints > 0
    ? allTouchpoints.reduce((sum, t) => sum + t.pain_point_level, 0) / totalTouchpoints
    : 0;
  
  const totalTime = stages.reduce((sum, s) => sum + (s.target_time_days || 0), 0);
  const avgConversion = stages.length > 0
    ? stages.reduce((sum, s) => sum + (s.target_conversion_rate || 0), 0) / stages.length
    : 0;

  const metrics = [
    {
      icon: LayoutGrid,
      label: 'Touchpoints',
      value: totalTouchpoints,
      color: 'text-chart-1',
    },
    {
      icon: Star,
      label: 'Moments of Truth',
      value: momentsOfTruth,
      color: 'text-warning',
    },
    {
      icon: AlertTriangle,
      label: 'Pain Points',
      value: highPainPoints,
      color: highPainPoints > 0 ? 'text-destructive' : 'text-muted-foreground',
    },
    {
      icon: Clock,
      label: 'Est. Time',
      value: `${totalTime}d`,
      color: 'text-chart-2',
    },
    {
      icon: TrendingUp,
      label: 'Avg. Conversion',
      value: `${avgConversion.toFixed(0)}%`,
      color: 'text-success',
    },
  ];

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-3 rounded-lg bg-card/80 backdrop-blur-sm border shadow-sm overflow-x-auto',
        className
      )}
    >
      {metrics.map((metric, index) => (
        <div key={metric.label} className="flex items-center gap-2 shrink-0">
          <metric.icon className={cn('h-4 w-4', metric.color)} />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{metric.label}</span>
            <span className="text-sm font-semibold">{metric.value}</span>
          </div>
          {index < metrics.length - 1 && (
            <div className="h-8 w-px bg-border ml-2" />
          )}
        </div>
      ))}
    </div>
  );
}
