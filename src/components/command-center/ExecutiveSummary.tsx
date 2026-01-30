import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Users,
  DollarSign,
  Target,
  Zap,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExecutiveSummaryProps {
  pipelineValue: number;
  totalARR: number;
  dealQuality: { green: number; yellow: number; red: number };
  pendingApprovals: number;
  atRiskCustomers: number;
  winRate: number;
}

export function ExecutiveSummary({
  pipelineValue,
  totalARR,
  dealQuality,
  pendingApprovals,
  atRiskCustomers,
  winRate,
}: ExecutiveSummaryProps) {
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const totalDeals = dealQuality.green + dealQuality.yellow + dealQuality.red;
  const qualityScore = totalDeals > 0 ? (dealQuality.green / totalDeals) * 100 : 0;

  // Calculate overall health score
  const healthFactors = [
    { score: qualityScore, weight: 0.3 },
    { score: winRate, weight: 0.25 },
    { score: pendingApprovals <= 3 ? 100 : Math.max(0, 100 - pendingApprovals * 10), weight: 0.2 },
    { score: atRiskCustomers === 0 ? 100 : Math.max(0, 100 - atRiskCustomers * 15), weight: 0.25 },
  ];
  const overallHealth = healthFactors.reduce((sum, f) => sum + f.score * f.weight, 0);

  // Generate executive insights
  const insights = [];
  
  if (pendingApprovals > 5) {
    insights.push({
      type: 'warning',
      icon: Clock,
      title: 'Approval Bottleneck',
      description: `${pendingApprovals} deals awaiting approval - potential revenue delay`,
      action: 'Review Approvals',
      route: '/deal-desk',
    });
  }

  if (atRiskCustomers > 0) {
    insights.push({
      type: 'danger',
      icon: AlertTriangle,
      title: 'Customer Health Alert',
      description: `${atRiskCustomers} customers showing risk signals`,
      action: 'View Customers',
      route: '/customers',
    });
  }

  if (dealQuality.red > dealQuality.green) {
    insights.push({
      type: 'warning',
      icon: Target,
      title: 'Deal Quality Concern',
      description: 'More red deals than green - review scoring criteria',
      action: 'Analyze Deals',
      route: '/analytics',
    });
  }

  if (qualityScore >= 70) {
    insights.push({
      type: 'success',
      icon: TrendingUp,
      title: 'Strong Pipeline Quality',
      description: `${Math.round(qualityScore)}% of deals are high quality`,
      action: 'View Pipeline',
      route: '/deals',
    });
  }

  if (pipelineValue > totalARR * 0.3) {
    insights.push({
      type: 'success',
      icon: DollarSign,
      title: 'Healthy Pipeline Coverage',
      description: `Pipeline at ${((pipelineValue / totalARR) * 100).toFixed(0)}% of ARR`,
      action: 'View Details',
      route: '/analytics',
    });
  }

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500/10',
          border: 'border-green-500/20',
          icon: 'text-green-500',
          badge: 'bg-green-500',
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          icon: 'text-amber-500',
          badge: 'bg-amber-500',
        };
      case 'danger':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          icon: 'text-red-500',
          badge: 'bg-red-500',
        };
      default:
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
          icon: 'text-blue-500',
          badge: 'bg-blue-500',
        };
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Executive Summary
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Key insights and actions requiring attention
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Health Score</p>
              <div className="flex items-center gap-2">
                <p className={cn(
                  'text-2xl font-bold',
                  overallHealth >= 80 ? 'text-green-500' :
                  overallHealth >= 60 ? 'text-amber-500' : 'text-red-500'
                )}>
                  {Math.round(overallHealth)}
                </p>
                {overallHealth >= 80 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : overallHealth >= 60 ? (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Quick Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{formatCurrency(pipelineValue)}</p>
            <p className="text-xs text-muted-foreground">Pipeline</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{formatCurrency(totalARR)}</p>
            <p className="text-xs text-muted-foreground">ARR</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{winRate.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{totalDeals}</p>
            <p className="text-xs text-muted-foreground">Active Deals</p>
          </div>
        </div>

        {/* Insights */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Priority Insights</p>
          {insights.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-center">
              <div>
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="font-medium text-green-600">All Systems Healthy</p>
                <p className="text-sm text-muted-foreground">No immediate actions required</p>
              </div>
            </div>
          ) : (
            insights.slice(0, 4).map((insight, idx) => {
              const style = getInsightStyle(insight.type);
              const Icon = insight.icon;
              
              return (
                <div
                  key={idx}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border',
                    style.bg,
                    style.border
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg',
                      'bg-background/80'
                    )}>
                      <Icon className={cn('h-4 w-4', style.icon)} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{insight.title}</p>
                      <p className="text-xs text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1"
                    onClick={() => navigate(insight.route)}
                  >
                    {insight.action}
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-4 border-t">
          <p className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate('/analytics')}>
              <BarChart3 className="h-4 w-4 mr-1" />
              Full Analytics
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/financials')}>
              <DollarSign className="h-4 w-4 mr-1" />
              Financials
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/deal-desk')}>
              <Target className="h-4 w-4 mr-1" />
              Deal Desk
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/customers')}>
              <Users className="h-4 w-4 mr-1" />
              Customers
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
