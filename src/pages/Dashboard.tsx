import { useAuth } from '@/contexts/AuthContext';
import { useDeals } from '@/hooks/useDeals';
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
  Loader2,
} from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS } from '@/types/auth';
import { CLASSIFICATION_COLORS, STATUS_LABELS } from '@/types/deals';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: deals, isLoading } = useDeals();
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.profile?.full_name?.split(' ')[0] || 'there';

  // Calculate stats from real data
  const stats = {
    activeDeals: deals?.filter((d) => !['closed_won', 'closed_lost'].includes(d.status)).length || 0,
    pipelineValue: deals?.reduce((sum, d) => sum + (d.deal_value || 0), 0) || 0,
    greenDeals: deals?.filter((d) => d.classification === 'green').length || 0,
    yellowDeals: deals?.filter((d) => d.classification === 'yellow').length || 0,
    redDeals: deals?.filter((d) => d.classification === 'red').length || 0,
    pendingApproval: deals?.filter((d) => d.status === 'pending_approval').length || 0,
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  const recentDeals = deals?.slice(0, 5) || [];

  const quickActions = [
    { title: 'Create Deal', description: 'Start a new deal', icon: Plus, href: '/deals/new' },
    { title: 'View All Deals', description: 'See all opportunities', icon: FileText, href: '/deals' },
    { title: 'Customer Health', description: 'Check at-risk accounts', icon: Users, href: '/customers' },
    { title: 'Analytics', description: 'View reports', icon: BarChart3, href: '/analytics' },
  ];

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
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Deals
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeDeals}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <span>{stats.pendingApproval} pending approval</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pipeline Value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.pipelineValue)}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <span>Total opportunity value</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Deal Quality
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge className="bg-success text-success-foreground">{stats.greenDeals}</Badge>
                <Badge className="bg-warning text-warning-foreground">{stats.yellowDeals}</Badge>
                <Badge className="bg-destructive text-destructive-foreground">{stats.redDeals}</Badge>
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <span>Green / Yellow / Red</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Approval
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApproval}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <span>Deals awaiting review</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
                  onClick={() => navigate(action.href)}
                >
                  <div className="flex w-full items-center gap-2">
                    <action.icon className="h-4 w-4 text-accent" />
                    <span className="font-medium">{action.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{action.description}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Deals */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Deals</CardTitle>
            <CardDescription>Your latest deals</CardDescription>
          </CardHeader>
          <CardContent>
            {recentDeals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No deals yet</p>
                <Button
                  className="mt-4"
                  size="sm"
                  onClick={() => navigate('/deals/new')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first deal
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="flex items-start gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg -mx-2"
                    onClick={() => navigate(`/deals/${deal.id}`)}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
                      <FileText className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{deal.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {deal.customer_name} • {formatCurrency(deal.deal_value)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {deal.classification && (
                        <Badge className={`${CLASSIFICATION_COLORS[deal.classification]} text-xs`}>
                          {Math.round(deal.total_score || 0)}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(deal.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Deal Score Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Deal Score Distribution</CardTitle>
          <CardDescription>
            Overview of your deals by score classification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deals && deals.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-6 rounded-lg bg-success/10 border border-success/20">
                <div className="text-3xl font-bold text-success">{stats.greenDeals}</div>
                <p className="text-sm text-muted-foreground">Green Deals</p>
                <p className="text-xs text-muted-foreground mt-1">Score ≥ 70</p>
              </div>
              <div className="p-6 rounded-lg bg-warning/10 border border-warning/20">
                <div className="text-3xl font-bold text-warning">{stats.yellowDeals}</div>
                <p className="text-sm text-muted-foreground">Yellow Deals</p>
                <p className="text-xs text-muted-foreground mt-1">Score 40-69</p>
              </div>
              <div className="p-6 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="text-3xl font-bold text-destructive">{stats.redDeals}</div>
                <p className="text-sm text-muted-foreground">Red Deals</p>
                <p className="text-xs text-muted-foreground mt-1">Score &lt; 40</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
              <div className="text-center">
                <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Create and score deals to see distribution
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
