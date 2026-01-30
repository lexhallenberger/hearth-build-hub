import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFrictionEvents, FrictionType } from '@/hooks/useFinancials';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  Activity, Shield, AlertTriangle, Clock, CheckCircle, 
  XCircle, Loader2, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const FRICTION_COLORS = {
  healthy: 'hsl(var(--success))',
  unhealthy: 'hsl(var(--destructive))',
};

const CATEGORY_EXAMPLES = {
  healthy: [
    { category: 'Pricing Governance', description: 'Deal desk review for high-value discounts' },
    { category: 'Approval Process', description: 'Multi-level approval for enterprise deals' },
    { category: 'Compliance Check', description: 'Legal review for non-standard terms' },
    { category: 'Risk Assessment', description: 'Credit check for new customers' },
  ],
  unhealthy: [
    { category: 'Approval Delays', description: 'Waiting 48+ hours for standard approval' },
    { category: 'Rework Required', description: 'Quote revision due to pricing errors' },
    { category: 'System Issues', description: 'CRM downtime during deal submission' },
    { category: 'Process Unclear', description: 'Confusion about required documentation' },
  ],
};

export function FrictionDashboard() {
  const { data: events, isLoading } = useFrictionEvents();
  const [activeTab, setActiveTab] = useState<'overview' | 'healthy' | 'unhealthy'>('overview');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const healthyEvents = events?.filter(e => e.friction_type === 'healthy') || [];
  const unhealthyEvents = events?.filter(e => e.friction_type === 'unhealthy') || [];
  const resolvedEvents = events?.filter(e => e.resolved_at) || [];
  const pendingEvents = events?.filter(e => !e.resolved_at) || [];

  // Calculate average resolution time
  const avgResolutionTime = resolvedEvents.length > 0
    ? resolvedEvents.reduce((sum, e) => {
        const duration = e.duration_hours || 0;
        return sum + duration;
      }, 0) / resolvedEvents.length
    : 0;

  // Pie chart data
  const pieData = [
    { name: 'Healthy Friction', value: healthyEvents.length, color: FRICTION_COLORS.healthy },
    { name: 'Unhealthy Friction', value: unhealthyEvents.length, color: FRICTION_COLORS.unhealthy },
  ];

  // Category breakdown
  const categoryBreakdown = events?.reduce((acc, event) => {
    const key = `${event.friction_type}-${event.category}`;
    if (!acc[key]) {
      acc[key] = { 
        category: event.category, 
        type: event.friction_type,
        count: 0, 
        totalHours: 0 
      };
    }
    acc[key].count++;
    acc[key].totalHours += event.duration_hours || 0;
    return acc;
  }, {} as Record<string, { category: string; type: FrictionType; count: number; totalHours: number }>);

  const categoryData = Object.values(categoryBreakdown || {})
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const frictionScore = events && events.length > 0
    ? Math.round((healthyEvents.length / events.length) * 100)
    : 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-accent" />
          Friction Analysis
        </CardTitle>
        <CardDescription>
          Healthy vs Unhealthy friction in your deal process
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground">Healthy</span>
            </div>
            <p className="text-2xl font-bold text-success">{healthyEvents.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Unhealthy</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{unhealthyEvents.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Avg Resolution</span>
            </div>
            <p className="text-2xl font-bold">{avgResolutionTime.toFixed(1)}h</p>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-accent" />
              <span className="text-xs text-muted-foreground">Health Score</span>
            </div>
            <p className={cn(
              "text-2xl font-bold",
              frictionScore >= 70 ? "text-success" : frictionScore >= 40 ? "text-warning" : "text-destructive"
            )}>
              {frictionScore}%
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="healthy" className="text-success">
              Healthy ({healthyEvents.length})
            </TabsTrigger>
            <TabsTrigger value="unhealthy" className="text-destructive">
              Unhealthy ({unhealthyEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Pie Chart */}
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Breakdown */}
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis 
                      type="category" 
                      dataKey="category" 
                      tick={{ fontSize: 11 }}
                      width={75}
                    />
                    <Tooltip />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--accent))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="healthy" className="space-y-3">
            <div className="bg-success/5 border border-success/20 rounded-lg p-3">
              <h4 className="font-medium text-success mb-2">What is Healthy Friction?</h4>
              <p className="text-sm text-muted-foreground">
                Intentional controls that protect revenue quality: pricing governance, approval workflows, compliance checks.
              </p>
            </div>
            <div className="space-y-2">
              {healthyEvents.length > 0 ? (
                healthyEvents.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                  >
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {event.category}
                        </Badge>
                        {event.resolved_at && (
                          <Badge className="bg-success/20 text-success text-xs">
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm mt-1">{event.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No healthy friction events recorded</p>
                  <p className="text-xs mt-1">Examples: Pricing approvals, compliance reviews</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="unhealthy" className="space-y-3">
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
              <h4 className="font-medium text-destructive mb-2">What is Unhealthy Friction?</h4>
              <p className="text-sm text-muted-foreground">
                Process inefficiencies that slow deals without adding value: approval delays, rework, system issues.
              </p>
            </div>
            <div className="space-y-2">
              {unhealthyEvents.length > 0 ? (
                unhealthyEvents.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                  >
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-xs">
                          {event.category}
                        </Badge>
                        {event.duration_hours && (
                          <span className="text-xs text-muted-foreground">
                            {event.duration_hours}h impact
                          </span>
                        )}
                      </div>
                      <p className="text-sm mt-1">{event.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No unhealthy friction events recorded</p>
                  <p className="text-xs mt-1">Examples: Approval delays, rework, system issues</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
