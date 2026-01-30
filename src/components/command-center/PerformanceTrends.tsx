import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  Download,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceTrendsProps {
  pipelineValue: number;
  totalARR: number;
  winRate: number;
}

export function PerformanceTrends({
  pipelineValue,
  totalARR,
  winRate,
}: PerformanceTrendsProps) {
  const [timeRange, setTimeRange] = useState<'6m' | '12m' | 'ytd'>('6m');

  // Generate mock historical data
  const generateTrendData = () => {
    const months = timeRange === '6m' ? 6 : timeRange === '12m' ? 12 : 8;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const startMonth = timeRange === 'ytd' ? 0 : 12 - months;

    return Array.from({ length: months }, (_, i) => {
      const monthIndex = (startMonth + i) % 12;
      const baseMultiplier = 0.7 + (i / months) * 0.3;
      
      return {
        month: monthNames[monthIndex],
        pipeline: Math.round(pipelineValue * baseMultiplier * (0.9 + Math.random() * 0.2)),
        arr: Math.round((totalARR / 12) * baseMultiplier * (0.95 + Math.random() * 0.1)),
        winRate: Math.round(winRate * baseMultiplier * (0.9 + Math.random() * 0.2)),
        deals: Math.round(15 + i * 2 + Math.random() * 5),
        target: Math.round(pipelineValue * 0.9),
      };
    });
  };

  const data = generateTrendData();

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    return (
      <div className="rounded-lg border bg-card p-3 shadow-lg">
        <p className="font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span className="font-medium">
              {entry.name === 'Win Rate' 
                ? `${entry.value}%`
                : entry.name === 'Deals'
                ? entry.value
                : formatCurrency(entry.value)
              }
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Performance Trends
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Historical performance and forecasting
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border p-0.5">
              {(['6m', '12m', 'ytd'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 px-3 text-xs"
                  onClick={() => setTimeRange(range)}
                >
                  {range.toUpperCase()}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="h-8">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorArr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis 
                    className="text-xs"
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="arr"
                    name="Monthly ARR"
                    stroke="hsl(var(--primary))"
                    fill="url(#colorArr)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="gap-1">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  Monthly ARR
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Trend: <span className="text-green-500 font-medium">+12.5% MoM</span>
              </p>
            </div>
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-4">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis 
                    yAxisId="left"
                    className="text-xs"
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    className="text-xs"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="pipeline"
                    name="Pipeline Value"
                    fill="hsl(var(--primary))"
                    opacity={0.6}
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="deals"
                    name="Deals"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--chart-2))' }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="target"
                    name="Target"
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="gap-1">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  Pipeline
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <div className="h-2 w-2 rounded-full bg-chart-2" />
                  Deal Count
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Coverage: <span className="text-green-500 font-medium">3.2x quota</span>
              </p>
            </div>
          </TabsContent>

          <TabsContent value="efficiency" className="space-y-4">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis 
                    className="text-xs"
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="winRate"
                    name="Win Rate"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--chart-1))' }}
                  />
                  <Line
                    type="monotone"
                    dataKey={() => 35}
                    name="Target"
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="gap-1">
                  <div className="h-2 w-2 rounded-full bg-chart-1" />
                  Win Rate
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                  Target (35%)
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Current: <span className={cn(
                  'font-medium',
                  winRate >= 35 ? 'text-green-500' : 'text-amber-500'
                )}>{winRate.toFixed(1)}%</span>
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
