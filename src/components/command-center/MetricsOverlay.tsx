import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users, 
  Clock,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricItem {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  status?: 'success' | 'warning' | 'danger' | 'neutral';
}

interface MetricsOverlayProps {
  pipelineValue: number;
  dealQuality: { green: number; yellow: number; red: number };
  pendingApprovals: number;
  atRiskCustomers: number;
  avgDealVelocity?: number;
}

export function MetricsOverlay({
  pipelineValue,
  dealQuality,
  pendingApprovals,
  atRiskCustomers,
  avgDealVelocity = 0,
}: MetricsOverlayProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const totalDeals = dealQuality.green + dealQuality.yellow + dealQuality.red;
  const qualityScore = totalDeals > 0 
    ? Math.round((dealQuality.green / totalDeals) * 100) 
    : 0;

  const metrics: MetricItem[] = [
    {
      label: 'Pipeline Value',
      value: formatCurrency(pipelineValue),
      icon: DollarSign,
      status: 'neutral',
    },
    {
      label: 'Deal Quality',
      value: `${qualityScore}%`,
      changeLabel: `${dealQuality.green}G / ${dealQuality.yellow}Y / ${dealQuality.red}R`,
      icon: Target,
      status: qualityScore >= 70 ? 'success' : qualityScore >= 40 ? 'warning' : 'danger',
    },
    {
      label: 'Pending Approvals',
      value: pendingApprovals,
      icon: Clock,
      status: pendingApprovals === 0 ? 'success' : pendingApprovals <= 3 ? 'warning' : 'danger',
    },
    {
      label: 'At-Risk Customers',
      value: atRiskCustomers,
      icon: AlertTriangle,
      status: atRiskCustomers === 0 ? 'success' : atRiskCustomers <= 2 ? 'warning' : 'danger',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-500 bg-green-500/10';
      case 'warning': return 'text-amber-500 bg-amber-500/10';
      case 'danger': return 'text-red-500 bg-red-500/10';
      default: return 'text-blue-500 bg-blue-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle2;
      case 'warning': return AlertTriangle;
      case 'danger': return AlertTriangle;
      default: return TrendingUp;
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const StatusIcon = getStatusIcon(metric.status || 'neutral');
        
        return (
          <Card 
            key={metric.label}
            className={cn(
              'relative overflow-hidden transition-all duration-200',
              'hover:shadow-md hover:-translate-y-0.5'
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold tracking-tight">{metric.value}</p>
                  {metric.changeLabel && (
                    <p className="text-xs text-muted-foreground">{metric.changeLabel}</p>
                  )}
                </div>
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl',
                  getStatusColor(metric.status || 'neutral')
                )}>
                  <metric.icon className="h-5 w-5" />
                </div>
              </div>

              {/* Status indicator bar */}
              <div className="mt-3 h-1 w-full rounded-full bg-muted overflow-hidden">
                <div 
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    metric.status === 'success' && 'bg-green-500 w-full',
                    metric.status === 'warning' && 'bg-amber-500 w-2/3',
                    metric.status === 'danger' && 'bg-red-500 w-1/3',
                    metric.status === 'neutral' && 'bg-blue-500 w-full'
                  )}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
