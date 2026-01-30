import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  TrendingUp,
  Users,
  DollarSign,
  Layers,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlignmentMetric {
  id: string;
  name: string;
  score: number;
  target: number;
  status: 'aligned' | 'at_risk' | 'misaligned';
  details: string;
  actions?: string[];
}

interface AlignmentCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  overallScore: number;
  metrics: AlignmentMetric[];
}

interface AlignmentScorecardProps {
  dealQuality: { green: number; yellow: number; red: number };
  pendingApprovals: number;
  atRiskCustomers: number;
  totalCustomers: number;
  winRate: number;
}

export function AlignmentScorecard({
  dealQuality,
  pendingApprovals,
  atRiskCustomers,
  totalCustomers,
  winRate,
}: AlignmentScorecardProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const totalDeals = dealQuality.green + dealQuality.yellow + dealQuality.red;
  const dealQualityScore = totalDeals > 0 ? (dealQuality.green / totalDeals) * 100 : 0;
  const customerHealthScore = totalCustomers > 0 ? ((totalCustomers - atRiskCustomers) / totalCustomers) * 100 : 100;
  const approvalEfficiency = pendingApprovals <= 3 ? 100 : Math.max(0, 100 - (pendingApprovals - 3) * 15);

  const categories: AlignmentCategory[] = [
    {
      id: 'revenue',
      name: 'Revenue Alignment',
      icon: DollarSign,
      description: 'How well revenue activities align with strategic goals',
      overallScore: Math.round((dealQualityScore + winRate) / 2),
      metrics: [
        {
          id: 'deal-quality',
          name: 'Deal Quality Score',
          score: dealQualityScore,
          target: 70,
          status: dealQualityScore >= 70 ? 'aligned' : dealQualityScore >= 50 ? 'at_risk' : 'misaligned',
          details: `${dealQuality.green} green, ${dealQuality.yellow} yellow, ${dealQuality.red} red deals`,
          actions: dealQualityScore < 70 ? [
            'Review red deals for improvement opportunities',
            'Implement deal scoring workshops for sales team',
          ] : undefined,
        },
        {
          id: 'win-rate',
          name: 'Win Rate',
          score: winRate,
          target: 35,
          status: winRate >= 35 ? 'aligned' : winRate >= 25 ? 'at_risk' : 'misaligned',
          details: `Current: ${winRate.toFixed(1)}% vs Target: 35%`,
          actions: winRate < 35 ? [
            'Analyze lost deals for common patterns',
            'Improve qualification criteria',
          ] : undefined,
        },
      ],
    },
    {
      id: 'customer',
      name: 'Customer Success Alignment',
      icon: Users,
      description: 'Customer health and retention metrics alignment',
      overallScore: Math.round(customerHealthScore),
      metrics: [
        {
          id: 'customer-health',
          name: 'Customer Health',
          score: customerHealthScore,
          target: 90,
          status: customerHealthScore >= 90 ? 'aligned' : customerHealthScore >= 75 ? 'at_risk' : 'misaligned',
          details: `${atRiskCustomers} of ${totalCustomers} customers at risk`,
          actions: customerHealthScore < 90 ? [
            'Schedule health check calls with at-risk customers',
            'Review churn prevention playbooks',
          ] : undefined,
        },
        {
          id: 'nps-alignment',
          name: 'NPS Alignment',
          score: 72,
          target: 70,
          status: 'aligned',
          details: 'NPS score of 42 (industry average: 38)',
        },
      ],
    },
    {
      id: 'operations',
      name: 'Operational Efficiency',
      icon: Zap,
      description: 'Process efficiency and workflow alignment',
      overallScore: Math.round(approvalEfficiency),
      metrics: [
        {
          id: 'approval-velocity',
          name: 'Approval Velocity',
          score: approvalEfficiency,
          target: 100,
          status: approvalEfficiency >= 85 ? 'aligned' : approvalEfficiency >= 60 ? 'at_risk' : 'misaligned',
          details: `${pendingApprovals} deals pending approval`,
          actions: approvalEfficiency < 85 ? [
            'Review approval queue and prioritize by deal value',
            'Consider increasing auto-approval thresholds',
          ] : undefined,
        },
        {
          id: 'cycle-time',
          name: 'Sales Cycle Time',
          score: 78,
          target: 80,
          status: 'at_risk',
          details: 'Average 45 days vs target 40 days',
          actions: [
            'Identify bottlenecks in qualification stage',
            'Streamline proposal generation process',
          ],
        },
      ],
    },
    {
      id: 'strategy',
      name: 'Strategic Alignment',
      icon: Target,
      description: 'How well execution aligns with strategic priorities',
      overallScore: 85,
      metrics: [
        {
          id: 'market-focus',
          name: 'Market Focus',
          score: 88,
          target: 85,
          status: 'aligned',
          details: '78% of deals in target segments',
        },
        {
          id: 'product-mix',
          name: 'Product Mix',
          score: 72,
          target: 80,
          status: 'at_risk',
          details: 'Strategic product adoption at 68%',
          actions: [
            'Increase cross-sell training for sales team',
            'Update value messaging for strategic products',
          ],
        },
      ],
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aligned':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'at_risk':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'misaligned':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aligned':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Aligned</Badge>;
      case 'at_risk':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">At Risk</Badge>;
      case 'misaligned':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Misaligned</Badge>;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const overallAlignment = Math.round(
    categories.reduce((sum, cat) => sum + cat.overallScore, 0) / categories.length
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Strategic Alignment Scorecard
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Track alignment across revenue, customer success, and operations
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Overall Alignment</p>
            <p className={cn('text-3xl font-bold', getScoreColor(overallAlignment))}>
              {overallAlignment}%
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((category) => {
          const Icon = category.icon;
          const isExpanded = expandedCategory === category.id;

          return (
            <Collapsible
              key={category.id}
              open={isExpanded}
              onOpenChange={() => setExpandedCategory(isExpanded ? null : category.id)}
            >
              <Card className={cn(
                'transition-all duration-200',
                isExpanded && 'ring-2 ring-primary/20'
              )}>
                <CollapsibleTrigger asChild>
                  <div className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-xl',
                          category.overallScore >= 80 ? 'bg-green-500/10' : 
                          category.overallScore >= 60 ? 'bg-amber-500/10' : 'bg-red-500/10'
                        )}>
                          <Icon className={cn(
                            'h-5 w-5',
                            category.overallScore >= 80 ? 'text-green-500' : 
                            category.overallScore >= 60 ? 'text-amber-500' : 'text-red-500'
                          )} />
                        </div>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={cn('text-2xl font-bold', getScoreColor(category.overallScore))}>
                            {category.overallScore}%
                          </p>
                        </div>
                        <ChevronDown className={cn(
                          'h-5 w-5 text-muted-foreground transition-transform',
                          isExpanded && 'rotate-180'
                        )} />
                      </div>
                    </div>
                    <Progress
                      value={category.overallScore}
                      className="mt-3 h-1.5"
                    />
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3 border-t pt-3">
                    {category.metrics.map((metric) => (
                      <div
                        key={metric.id}
                        className="p-3 rounded-lg bg-muted/30"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(metric.status)}
                            <span className="font-medium">{metric.name}</span>
                          </div>
                          {getStatusBadge(metric.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{metric.details}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <Progress
                            value={Math.min(100, (metric.score / metric.target) * 100)}
                            className="h-1.5 flex-1"
                          />
                          <span className="text-xs text-muted-foreground">
                            {metric.score.toFixed(0)}% / {metric.target}%
                          </span>
                        </div>
                        {metric.actions && metric.actions.length > 0 && (
                          <div className="mt-2 p-2 rounded bg-amber-500/5 border border-amber-500/20">
                            <p className="text-xs font-medium text-amber-600 mb-1">Recommended Actions:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {metric.actions.map((action, idx) => (
                                <li key={idx} className="flex items-start gap-1">
                                  <span className="text-amber-500">•</span>
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </CardContent>
    </Card>
  );
}
