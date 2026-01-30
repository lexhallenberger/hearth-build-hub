import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCACByRevenueType, CAC_BENCHMARKS, RevenueType } from '@/hooks/useFinancials';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Users, RefreshCw, ArrowUpRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const typeColors: Record<RevenueType, string> = {
  new_customer: 'hsl(var(--chart-1))',
  upsell: 'hsl(var(--chart-2))',
  expansion: 'hsl(var(--chart-4))',
  renewal: 'hsl(var(--chart-3))',
};

const typeIcons: Record<RevenueType, React.ElementType> = {
  new_customer: Users,
  upsell: TrendingUp,
  expansion: ArrowUpRight,
  renewal: RefreshCw,
};

export function CACLTVAnalysis() {
  const { data: cacData, isLoading } = useCACByRevenueType();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Transform for chart - show CAC per $1 ACV
  const chartData = cacData?.map(item => ({
    name: item.benchmark.label,
    type: item.type,
    'Your CAC': item.avgCAC > 0 && item.avgLTV > 0 
      ? Number((item.avgCAC / item.avgLTV).toFixed(2)) 
      : item.benchmark.min,
    'Benchmark Min': item.benchmark.min,
    'Benchmark Max': item.benchmark.max,
    count: item.count,
  })) || [];

  // Calculate totals
  const totalDeals = cacData?.reduce((sum, item) => sum + item.count, 0) || 0;
  const avgOverallLTV = cacData && cacData.length > 0
    ? cacData.reduce((sum, item) => sum + item.avgLTV, 0) / cacData.length
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-accent" />
          CAC/LTV Analysis by Revenue Type
        </CardTitle>
        <CardDescription>
          Customer acquisition cost per $1 of Annual Contract Value
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cacData?.map((item) => {
            const Icon = typeIcons[item.type];
            const cacPerDollar = item.avgCAC > 0 && item.avgLTV > 0 
              ? item.avgCAC / item.avgLTV 
              : 0;
            const isEfficient = cacPerDollar <= item.benchmark.max;
            
            return (
              <div
                key={item.type}
                className={cn(
                  "rounded-lg border p-3 transition-colors",
                  isEfficient ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="h-8 w-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${typeColors[item.type]}20` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: typeColors[item.type] }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {item.benchmark.label}
                    </p>
                    <p className="text-lg font-bold">
                      ${cacPerDollar.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {item.count} deals
                  </span>
                  <Badge 
                    variant={isEfficient ? "default" : "destructive"}
                    className={cn(
                      "text-xs",
                      isEfficient && "bg-success text-success-foreground"
                    )}
                  >
                    {isEfficient ? 'Efficient' : 'High CAC'}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chart */}
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
                className="text-muted-foreground"
              />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar 
                dataKey="Your CAC" 
                fill="hsl(var(--accent))" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="Benchmark Min" 
                fill="hsl(var(--success))" 
                radius={[4, 4, 0, 0]}
                opacity={0.5}
              />
              <Bar 
                dataKey="Benchmark Max" 
                fill="hsl(var(--warning))" 
                radius={[4, 4, 0, 0]}
                opacity={0.5}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="font-medium mb-2">CAC Efficiency Insights</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• <strong>New customers</strong> typically cost $1.13-$1.50 per $1 ACV to acquire</li>
            <li>• <strong>Renewals</strong> are most efficient at $0.05-$0.13 per $1 ACV</li>
            <li>• Focus on <strong>expansion revenue</strong> for optimal CAC efficiency</li>
            <li>• Total deals tracked: {totalDeals}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
