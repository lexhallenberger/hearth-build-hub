import { cn } from '@/lib/utils';
import { Journey } from '@/types/journeys';
import { 
  LayoutGrid, 
  Star, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  Zap,
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
  
  const totalTime = stages.reduce((sum, s) => sum + (s.target_time_days || 0), 0);
  const avgConversion = stages.length > 0
    ? stages.reduce((sum, s) => sum + (s.target_conversion_rate || 0), 0) / stages.length
    : 0;

  const metrics = [
    {
      icon: LayoutGrid,
      label: 'Touchpoints',
      value: totalTouchpoints,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
    },
    {
      icon: Star,
      label: 'Moments of Truth',
      value: momentsOfTruth,
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-500/10',
      iconColor: 'text-amber-400',
    },
    {
      icon: AlertTriangle,
      label: 'Pain Points',
      value: highPainPoints,
      gradient: highPainPoints > 0 ? 'from-red-500 to-rose-500' : 'from-gray-400 to-gray-500',
      bg: highPainPoints > 0 ? 'bg-red-500/10' : 'bg-muted',
      iconColor: highPainPoints > 0 ? 'text-red-400' : 'text-muted-foreground',
    },
    {
      icon: Clock,
      label: 'Est. Duration',
      value: `${totalTime}d`,
      gradient: 'from-cyan-500 to-teal-500',
      bg: 'bg-cyan-500/10',
      iconColor: 'text-cyan-400',
    },
    {
      icon: TrendingUp,
      label: 'Avg. Conversion',
      value: `${avgConversion.toFixed(0)}%`,
      gradient: 'from-green-500 to-emerald-500',
      bg: 'bg-green-500/10',
      iconColor: 'text-green-400',
    },
  ];

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-2 rounded-xl',
        'bg-card/60 backdrop-blur-xl border border-white/10 shadow-xl',
        'overflow-x-auto scrollbar-thin',
        className
      )}
    >
      <div className="flex items-center gap-1.5 px-3 py-1 shrink-0">
        <Zap className="h-4 w-4 text-accent" />
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Metrics
        </span>
      </div>
      
      <div className="h-8 w-px bg-border shrink-0" />
      
      {metrics.map((metric, index) => (
        <div 
          key={metric.label} 
          className={cn(
            'flex items-center gap-3 px-4 py-2 rounded-lg shrink-0',
            'transition-all duration-300 hover:scale-105',
            metric.bg
          )}
        >
          <div className={cn(
            'flex items-center justify-center w-9 h-9 rounded-lg',
            'bg-gradient-to-br',
            metric.gradient,
            'shadow-lg'
          )}>
            <metric.icon className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-lg font-bold leading-none">{metric.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
              {metric.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
