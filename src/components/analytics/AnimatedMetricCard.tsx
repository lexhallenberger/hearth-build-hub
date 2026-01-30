import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from '@/components/animations/AnimatedCounter';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AnimatedMetricCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  formatAsCurrency?: boolean;
  formatAsPercent?: boolean;
  decimals?: number;
  className?: string;
  trend?: 'up' | 'down' | 'neutral';
  accentColor?: 'default' | 'success' | 'warning' | 'destructive' | 'accent';
}

export function AnimatedMetricCard({
  title,
  value,
  prefix,
  suffix,
  change,
  changeLabel,
  icon,
  formatAsCurrency = false,
  formatAsPercent = false,
  decimals = 0,
  className,
  trend,
  accentColor = 'default',
}: AnimatedMetricCardProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-success';
    if (trend === 'down') return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getAccentStyles = () => {
    switch (accentColor) {
      case 'success':
        return 'border-l-4 border-l-success bg-success/5';
      case 'warning':
        return 'border-l-4 border-l-warning bg-warning/5';
      case 'destructive':
        return 'border-l-4 border-l-destructive bg-destructive/5';
      case 'accent':
        return 'border-l-4 border-l-accent bg-accent/5';
      default:
        return '';
    }
  };

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300 hover:shadow-lg',
      getAccentStyles(),
      className
    )}>
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-muted/20 pointer-events-none" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl",
            "bg-gradient-to-br from-muted to-muted/50",
            accentColor === 'accent' && 'from-accent/20 to-accent/10 text-accent',
            accentColor === 'success' && 'from-success/20 to-success/10 text-success',
            accentColor === 'warning' && 'from-warning/20 to-warning/10 text-warning',
            accentColor === 'destructive' && 'from-destructive/20 to-destructive/10 text-destructive',
          )}>
            {icon}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="relative">
        <div className="text-3xl font-bold tracking-tight">
          <AnimatedCounter
            value={value}
            prefix={prefix}
            suffix={suffix}
            formatAsCurrency={formatAsCurrency}
            formatAsPercent={formatAsPercent}
            decimals={decimals}
            duration={1200}
          />
        </div>
        
        {(change !== undefined || changeLabel) && (
          <div className="flex items-center gap-1 mt-2">
            {change !== undefined && (
              <div className={cn('flex items-center gap-1 text-sm font-medium', getTrendColor())}>
                {getTrendIcon()}
                <span>{change > 0 ? '+' : ''}{change}%</span>
              </div>
            )}
            {changeLabel && (
              <span className="text-sm text-muted-foreground ml-1">
                {changeLabel}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}