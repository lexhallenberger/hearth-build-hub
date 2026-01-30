import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Users,
  Percent,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

interface KPIData {
  id: string;
  title: string;
  value: string | number;
  target?: number;
  current?: number;
  change?: number;
  changeLabel?: string;
  trend: 'up' | 'down' | 'neutral';
  status: 'success' | 'warning' | 'danger' | 'neutral';
  category: 'revenue' | 'efficiency' | 'growth' | 'health';
  drillDownData?: any[];
}

interface StrategicKPIPanelProps {
  pipelineValue: number;
  totalARR: number;
  winRate: number;
  avgDealSize: number;
  nrrPercent: number;
  cacPaybackMonths: number;
}

export function StrategicKPIPanel({
  pipelineValue,
  totalARR,
  winRate,
  avgDealSize,
  nrrPercent,
  cacPaybackMonths,
}: StrategicKPIPanelProps) {
  const [selectedKPI, setSelectedKPI] = useState<KPIData | null>(null);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  // Generate trend data for drill-downs
  const generateTrendData = (baseValue: number, months: number = 6) => {
    return Array.from({ length: months }, (_, i) => ({
      month: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      value: baseValue * (0.85 + Math.random() * 0.3),
      target: baseValue,
    }));
  };

  const kpis: KPIData[] = [
    {
      id: 'arr',
      title: 'Annual Recurring Revenue',
      value: formatCurrency(totalARR),
      target: totalARR * 1.2,
      current: totalARR,
      change: 12.5,
      changeLabel: 'vs last quarter',
      trend: 'up',
      status: 'success',
      category: 'revenue',
      drillDownData: generateTrendData(totalARR / 12),
    },
    {
      id: 'pipeline',
      title: 'Pipeline Value',
      value: formatCurrency(pipelineValue),
      target: pipelineValue * 1.3,
      current: pipelineValue,
      change: 8.3,
      changeLabel: 'vs last month',
      trend: 'up',
      status: 'success',
      category: 'revenue',
      drillDownData: generateTrendData(pipelineValue),
    },
    {
      id: 'winrate',
      title: 'Win Rate',
      value: `${winRate.toFixed(1)}%`,
      target: 35,
      current: winRate,
      change: winRate >= 30 ? 5.2 : -3.1,
      changeLabel: 'vs benchmark',
      trend: winRate >= 30 ? 'up' : 'down',
      status: winRate >= 35 ? 'success' : winRate >= 25 ? 'warning' : 'danger',
      category: 'efficiency',
      drillDownData: generateTrendData(winRate),
    },
    {
      id: 'avgdeal',
      title: 'Avg Deal Size',
      value: formatCurrency(avgDealSize),
      change: 15.7,
      changeLabel: 'vs last quarter',
      trend: 'up',
      status: 'success',
      category: 'efficiency',
      drillDownData: generateTrendData(avgDealSize),
    },
    {
      id: 'nrr',
      title: 'Net Revenue Retention',
      value: `${nrrPercent.toFixed(0)}%`,
      target: 120,
      current: nrrPercent,
      change: nrrPercent >= 100 ? 3.5 : -5.2,
      changeLabel: 'vs target',
      trend: nrrPercent >= 100 ? 'up' : 'down',
      status: nrrPercent >= 120 ? 'success' : nrrPercent >= 100 ? 'warning' : 'danger',
      category: 'health',
      drillDownData: generateTrendData(nrrPercent),
    },
    {
      id: 'cac',
      title: 'CAC Payback',
      value: `${cacPaybackMonths.toFixed(0)} mo`,
      target: 12,
      current: cacPaybackMonths,
      change: cacPaybackMonths <= 12 ? 8.3 : -12.5,
      changeLabel: 'vs target',
      trend: cacPaybackMonths <= 12 ? 'up' : 'down',
      status: cacPaybackMonths <= 12 ? 'success' : cacPaybackMonths <= 18 ? 'warning' : 'danger',
      category: 'health',
      drillDownData: generateTrendData(cacPaybackMonths),
    },
  ];

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'revenue':
        return { icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
      case 'efficiency':
        return { icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' };
      case 'growth':
        return { icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' };
      case 'health':
        return { icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10' };
      default:
        return { icon: BarChart3, color: 'text-muted-foreground', bg: 'bg-muted' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-amber-500';
      case 'danger': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Strategic KPIs</h2>
            <p className="text-sm text-muted-foreground">
              Click any metric for detailed analysis
            </p>
          </div>
          <Badge variant="outline" className="gap-1">
            <BarChart3 className="h-3 w-3" />
            Real-time
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {kpis.map((kpi) => {
            const config = getCategoryConfig(kpi.category);
            const Icon = config.icon;

            return (
              <Card
                key={kpi.id}
                className={cn(
                  'cursor-pointer transition-all duration-200',
                  'hover:shadow-lg hover:-translate-y-1 hover:border-primary/50'
                )}
                onClick={() => setSelectedKPI(kpi)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', config.bg)}>
                      <Icon className={cn('h-5 w-5', config.color)} />
                    </div>
                    <div className="flex items-center gap-1">
                      {kpi.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : kpi.trend === 'down' ? (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      ) : null}
                      {kpi.change && (
                        <span className={cn(
                          'text-sm font-medium',
                          kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'
                        )}>
                          {kpi.trend === 'up' ? '+' : ''}{kpi.change.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                    <p className={cn('text-2xl font-bold', getStatusColor(kpi.status))}>
                      {kpi.value}
                    </p>
                    {kpi.changeLabel && (
                      <p className="text-xs text-muted-foreground">{kpi.changeLabel}</p>
                    )}
                  </div>

                  {kpi.target && kpi.current && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progress to target</span>
                        <span className="font-medium">
                          {Math.min(100, Math.round((kpi.current / kpi.target) * 100))}%
                        </span>
                      </div>
                      <Progress
                        value={Math.min(100, (kpi.current / kpi.target) * 100)}
                        className="h-1.5"
                      />
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-end">
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                      Drill down
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Drill-down Dialog */}
      <Dialog open={!!selectedKPI} onOpenChange={() => setSelectedKPI(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              {selectedKPI?.title} - Deep Dive
            </DialogTitle>
            <DialogDescription>
              Detailed trend analysis and breakdown
            </DialogDescription>
          </DialogHeader>

          {selectedKPI && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">{selectedKPI.value}</p>
                  <p className="text-sm text-muted-foreground">Current</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">
                    {selectedKPI.target ? formatCurrency(selectedKPI.target) : 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">Target</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className={cn(
                    'text-2xl font-bold',
                    selectedKPI.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  )}>
                    {selectedKPI.change ? `${selectedKPI.trend === 'up' ? '+' : ''}${selectedKPI.change.toFixed(1)}%` : 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">Change</p>
                </div>
              </div>

              {/* Trend Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selectedKPI.drillDownData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                    />
                    <Area
                      type="monotone"
                      dataKey="target"
                      stroke="hsl(var(--muted-foreground))"
                      fill="none"
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Insights */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  AI Insight
                </h4>
                <p className="text-sm text-muted-foreground">
                  {selectedKPI.status === 'success'
                    ? `${selectedKPI.title} is performing above target. Consider increasing targets for next quarter to maintain momentum.`
                    : selectedKPI.status === 'warning'
                    ? `${selectedKPI.title} is slightly below target. Focus on improving conversion rates and deal velocity.`
                    : `${selectedKPI.title} needs attention. Review pipeline quality and consider adjusting go-to-market strategies.`
                  }
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
