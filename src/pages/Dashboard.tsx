import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  TrendingUp,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Target,
  BarChart3,
  Plus,
} from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS } from '@/types/auth';

// Placeholder stats - will be dynamic in Phase 2
const stats = [
  {
    title: 'Active Deals',
    value: '24',
    change: '+12%',
    changeType: 'positive' as const,
    icon: FileText,
    description: 'From last month',
  },
  {
    title: 'Pipeline Value',
    value: '$2.4M',
    change: '+8%',
    changeType: 'positive' as const,
    icon: DollarSign,
    description: 'Total opportunity value',
  },
  {
    title: 'Win Rate',
    value: '68%',
    change: '-3%',
    changeType: 'negative' as const,
    icon: Target,
    description: 'Last 30 days',
  },
  {
    title: 'Avg. Deal Cycle',
    value: '32 days',
    change: '-5 days',
    changeType: 'positive' as const,
    icon: Clock,
    description: 'Time to close',
  },
];

const quickActions = [
  { title: 'Create Deal', description: 'Start a new deal', icon: Plus, href: '/deals/new' },
  { title: 'View Pipeline', description: 'See all opportunities', icon: TrendingUp, href: '/pipeline' },
  { title: 'Customer Health', description: 'Check at-risk accounts', icon: Users, href: '/customers' },
  { title: 'Analytics', description: 'View reports', icon: BarChart3, href: '/analytics' },
];

const recentActivity = [
  { action: 'Deal updated', deal: 'Acme Corp - Enterprise', user: 'John Doe', time: '2 min ago' },
  { action: 'Approval granted', deal: 'TechStart - Growth', user: 'Jane Smith', time: '15 min ago' },
  { action: 'New deal created', deal: 'GlobalFin - Premium', user: 'Mike Johnson', time: '1 hour ago' },
  { action: 'Score improved', deal: 'DataCo - Standard', user: 'Sarah Williams', time: '2 hours ago' },
];

export default function Dashboard() {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.profile?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {getGreeting()}, {firstName}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your revenue today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {user?.roles.map((role) => (
            <Badge key={role} className={ROLE_COLORS[role]}>
              {ROLE_LABELS[role]}
            </Badge>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {stat.changeType === 'positive' ? (
                  <ArrowUpRight className="h-3 w-3 text-success mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-destructive mr-1" />
                )}
                <span
                  className={
                    stat.changeType === 'positive' ? 'text-success' : 'text-destructive'
                  }
                >
                  {stat.change}
                </span>
                <span className="ml-1">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {quickActions.map((action) => (
                <Button
                  key={action.title}
                  variant="outline"
                  className="h-auto flex-col items-start gap-1 p-4 hover:bg-accent/10"
                  asChild
                >
                  <a href={action.href}>
                    <div className="flex w-full items-center gap-2">
                      <action.icon className="h-4 w-4 text-accent" />
                      <span className="font-medium">{action.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{action.description}</span>
                  </a>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across your deals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
                    <FileText className="h-4 w-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.deal} • {activity.user}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deal Score Distribution Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Deal Score Distribution</CardTitle>
          <CardDescription>
            Overview of your deals by score classification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
            <div className="text-center">
              <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Deal scoring visualizations coming in Phase 2
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
