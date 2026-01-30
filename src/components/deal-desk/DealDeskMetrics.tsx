import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  Target,
  Zap,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DealDeskMetrics {
  pending: number;
  approved: number;
  rejected: number;
  totalThisMonth: number;
  totalLastMonth: number;
  avgApprovalHours: number;
  approvalRate: number;
  greenDeals: number;
  yellowDeals: number;
  redDeals: number;
}

interface DealDeskMetricsProps {
  metrics: DealDeskMetrics | null;
  isLoading?: boolean;
}

export function DealDeskMetrics({ metrics, isLoading }: DealDeskMetricsProps) {
  if (isLoading || !metrics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-16 animate-pulse bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const monthChange = metrics.totalLastMonth > 0
    ? Math.round(((metrics.totalThisMonth - metrics.totalLastMonth) / metrics.totalLastMonth) * 100)
    : 0;

  const metricCards = [
    {
      title: 'Pending Approvals',
      value: metrics.pending,
      icon: Clock,
      color: metrics.pending > 5 ? 'text-amber-500' : 'text-blue-500',
      bgColor: metrics.pending > 5 ? 'bg-amber-500/10' : 'bg-blue-500/10',
      subtitle: metrics.pending === 0 ? 'All caught up!' : `${metrics.pending} awaiting review`,
    },
    {
      title: 'Avg. Approval Time',
      value: `${metrics.avgApprovalHours}h`,
      icon: Zap,
      color: metrics.avgApprovalHours <= 12 ? 'text-green-500' : 'text-amber-500',
      bgColor: metrics.avgApprovalHours <= 12 ? 'bg-green-500/10' : 'bg-amber-500/10',
      subtitle: metrics.avgApprovalHours <= 12 ? 'Within SLA' : 'Needs improvement',
    },
    {
      title: 'Approval Rate',
      value: `${metrics.approvalRate}%`,
      icon: Target,
      color: metrics.approvalRate >= 70 ? 'text-green-500' : 'text-amber-500',
      bgColor: metrics.approvalRate >= 70 ? 'bg-green-500/10' : 'bg-amber-500/10',
      subtitle: `${metrics.approved} approved, ${metrics.rejected} rejected`,
    },
    {
      title: 'This Month',
      value: metrics.totalThisMonth,
      icon: BarChart3,
      color: monthChange >= 0 ? 'text-green-500' : 'text-red-500',
      bgColor: monthChange >= 0 ? 'bg-green-500/10' : 'bg-red-500/10',
      subtitle: `${monthChange >= 0 ? '+' : ''}${monthChange}% vs last month`,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metricCards.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-3xl font-bold mt-1">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
              </div>
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', card.bgColor)}>
                <card.icon className={cn('h-5 w-5', card.color)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Deal Quality Distribution component
export function DealQualityDistribution({ metrics }: { metrics: DealDeskMetrics | null }) {
  if (!metrics) return null;

  const total = metrics.greenDeals + metrics.yellowDeals + metrics.redDeals;
  if (total === 0) return null;

  const greenPercent = Math.round((metrics.greenDeals / total) * 100);
  const yellowPercent = Math.round((metrics.yellowDeals / total) * 100);
  const redPercent = Math.round((metrics.redDeals / total) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Deal Quality Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="h-4 w-full rounded-full overflow-hidden flex">
            <div 
              className="bg-green-500 transition-all" 
              style={{ width: `${greenPercent}%` }} 
            />
            <div 
              className="bg-amber-500 transition-all" 
              style={{ width: `${yellowPercent}%` }} 
            />
            <div 
              className="bg-red-500 transition-all" 
              style={{ width: `${redPercent}%` }} 
            />
          </div>

          {/* Legend */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <div>
                <p className="text-sm font-medium">{metrics.greenDeals}</p>
                <p className="text-xs text-muted-foreground">Green ({greenPercent}%)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <div>
                <p className="text-sm font-medium">{metrics.yellowDeals}</p>
                <p className="text-xs text-muted-foreground">Yellow ({yellowPercent}%)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div>
                <p className="text-sm font-medium">{metrics.redDeals}</p>
                <p className="text-xs text-muted-foreground">Red ({redPercent}%)</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
