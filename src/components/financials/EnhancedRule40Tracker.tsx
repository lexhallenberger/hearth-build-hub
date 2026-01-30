import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFinancialMetrics } from '@/hooks/useFinancials';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine, Area, ComposedChart
} from 'recharts';
import { TrendingUp, Target, ArrowUp, ArrowDown, Loader2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function EnhancedRule40Tracker() {
  const { data: metrics, isLoading } = useFinancialMetrics();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Transform data for charts
  const chartData = metrics?.map(m => ({
    month: format(new Date(m.period_date), 'MMM'),
    date: m.period_date,
    rule40: m.rule_of_40_score,
    growth: m.revenue_growth_rate,
    margin: m.profit_margin_percent,
    mrr: m.mrr / 1000, // in thousands
    arr: m.arr / 1000000, // in millions
    nrr: m.net_revenue_retention,
  })) || [];

  // Get latest and previous metrics
  const latest = metrics?.[metrics.length - 1];
  const previous = metrics?.[metrics.length - 2];

  // Calculate trends
  const rule40Trend = latest && previous 
    ? latest.rule_of_40_score - previous.rule_of_40_score 
    : 0;
  const growthTrend = latest && previous 
    ? latest.revenue_growth_rate - previous.revenue_growth_rate 
    : 0;
  const marginTrend = latest && previous 
    ? latest.profit_margin_percent - previous.profit_margin_percent 
    : 0;
  const nrrTrend = latest && previous 
    ? latest.net_revenue_retention - previous.net_revenue_retention 
    : 0;

  // Calculate forecast (simple linear projection)
  const forecastRule40 = latest 
    ? Math.min(latest.rule_of_40_score + rule40Trend * 2, 100) 
    : 40;

  const isHealthy = (latest?.rule_of_40_score || 0) >= 40;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-accent" />
          Rule of 40 Tracker
        </CardTitle>
        <CardDescription>
          Revenue Growth Rate + Profit Margin = {'>'}40% for healthy SaaS
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Score Display */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20">
          <div>
            <p className="text-sm text-muted-foreground">Current Rule of 40</p>
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "text-5xl font-bold",
                isHealthy ? "text-success" : "text-destructive"
              )}>
                {latest?.rule_of_40_score || 0}
              </span>
              <span className="text-2xl text-muted-foreground">%</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              {rule40Trend >= 0 ? (
                <ArrowUp className="h-4 w-4 text-success" />
              ) : (
                <ArrowDown className="h-4 w-4 text-destructive" />
              )}
              <span className={cn(
                "text-sm font-medium",
                rule40Trend >= 0 ? "text-success" : "text-destructive"
              )}>
                {rule40Trend >= 0 ? '+' : ''}{rule40Trend.toFixed(1)}% vs last month
              </span>
            </div>
          </div>
          <div className="text-right">
            <Badge 
              variant={isHealthy ? "default" : "destructive"}
              className={cn(
                "text-lg px-4 py-1",
                isHealthy && "bg-success text-success-foreground"
              )}
            >
              {isHealthy ? 'Healthy' : 'Below Target'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Forecast: {forecastRule40.toFixed(0)}% next month
            </p>
          </div>
        </div>

        {/* Component Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Revenue Growth</span>
              <TrendingUp className={cn(
                "h-4 w-4",
                growthTrend >= 0 ? "text-success" : "text-destructive"
              )} />
            </div>
            <p className="text-xl font-bold">{latest?.revenue_growth_rate || 0}%</p>
            <p className={cn(
              "text-xs",
              growthTrend >= 0 ? "text-success" : "text-destructive"
            )}>
              {growthTrend >= 0 ? '+' : ''}{growthTrend.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Profit Margin</span>
              <TrendingUp className={cn(
                "h-4 w-4",
                marginTrend >= 0 ? "text-success" : "text-destructive"
              )} />
            </div>
            <p className="text-xl font-bold">{latest?.profit_margin_percent || 0}%</p>
            <p className={cn(
              "text-xs",
              marginTrend >= 0 ? "text-success" : "text-destructive"
            )}>
              {marginTrend >= 0 ? '+' : ''}{marginTrend.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Net Revenue Retention</span>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xl font-bold">{latest?.net_revenue_retention || 100}%</p>
            <p className={cn(
              "text-xs",
              nrrTrend >= 0 ? "text-success" : "text-destructive"
            )}>
              {nrrTrend >= 0 ? '+' : ''}{nrrTrend.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">ARR</span>
              <span className="text-xs text-muted-foreground">$M</span>
            </div>
            <p className="text-xl font-bold">
              ${((latest?.arr || 0) / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-muted-foreground">
              MRR: ${((latest?.mrr || 0) / 1000).toFixed(0)}K
            </p>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                domain={[0, 60]}
                className="text-muted-foreground"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <ReferenceLine 
                y={40} 
                stroke="hsl(var(--success))" 
                strokeDasharray="5 5"
                label={{ 
                  value: 'Target: 40', 
                  position: 'right',
                  fill: 'hsl(var(--success))',
                  fontSize: 11
                }}
              />
              <Area 
                type="monotone" 
                dataKey="rule40" 
                fill="hsl(var(--accent))" 
                fillOpacity={0.2}
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                name="Rule of 40"
              />
              <Line 
                type="monotone" 
                dataKey="growth" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Growth %"
              />
              <Line 
                type="monotone" 
                dataKey="margin" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Margin %"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* ARR Waterfall Summary */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="font-medium mb-3">ARR Movement (Latest Period)</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">New ARR</p>
              <p className="text-lg font-bold text-success">
                +${((latest?.new_arr || 0) / 1000000).toFixed(2)}M
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Expansion</p>
              <p className="text-lg font-bold text-chart-4">
                +${((latest?.expansion_arr || 0) / 1000000).toFixed(2)}M
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Churned</p>
              <p className="text-lg font-bold text-destructive">
                -${((latest?.churned_arr || 0) / 1000000).toFixed(2)}M
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
