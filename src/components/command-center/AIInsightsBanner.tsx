import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'tip' | 'trend';
  title: string;
  description: string;
  action?: string;
  actionRoute?: string;
}

interface AIInsightsBannerProps {
  pipelineValue: number;
  greenDeals: number;
  yellowDeals: number;
  redDeals: number;
  pendingApprovals: number;
  atRiskCustomers: number;
}

export function AIInsightsBanner({
  pipelineValue,
  greenDeals,
  yellowDeals,
  redDeals,
  pendingApprovals,
  atRiskCustomers,
}: AIInsightsBannerProps) {
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate dynamic insights based on data
  const generateInsights = (): AIInsight[] => {
    const insights: AIInsight[] = [];
    const totalDeals = greenDeals + yellowDeals + redDeals;
    const qualityScore = totalDeals > 0 ? (greenDeals / totalDeals) * 100 : 0;

    // Pipeline insights
    if (pipelineValue > 0) {
      insights.push({
        id: '1',
        type: 'trend',
        title: 'Pipeline Health',
        description: `Your pipeline value is ${formatCurrency(pipelineValue)}. ${qualityScore >= 60 ? 'Deal quality is strong with ' + Math.round(qualityScore) + '% green deals.' : 'Consider focusing on improving deal scores to increase green deals.'}`,
        action: 'View Pipeline',
        actionRoute: '/deals',
      });
    }

    // Approval bottleneck
    if (pendingApprovals > 3) {
      insights.push({
        id: '2',
        type: 'warning',
        title: 'Approval Bottleneck Detected',
        description: `${pendingApprovals} deals are waiting for approval. Delayed approvals can impact deal velocity and customer experience.`,
        action: 'Review Approvals',
        actionRoute: '/deals',
      });
    }

    // At-risk customers
    if (atRiskCustomers > 0) {
      insights.push({
        id: '3',
        type: 'warning',
        title: 'Customer Health Alert',
        description: `${atRiskCustomers} ${atRiskCustomers === 1 ? 'customer is' : 'customers are'} showing signs of risk. Proactive engagement can prevent churn.`,
        action: 'View Customers',
        actionRoute: '/customers',
      });
    }

    // Red deals opportunity
    if (redDeals > 0) {
      insights.push({
        id: '4',
        type: 'opportunity',
        title: 'Deal Improvement Opportunity',
        description: `${redDeals} ${redDeals === 1 ? 'deal has' : 'deals have'} a red score. Review deal terms and consider adjustments to improve probability of approval.`,
        action: 'Optimize Deals',
        actionRoute: '/deals',
      });
    }

    // Success insight
    if (greenDeals > 0 && pendingApprovals === 0 && atRiskCustomers === 0) {
      insights.push({
        id: '5',
        type: 'tip',
        title: 'Great Performance!',
        description: `You have ${greenDeals} high-quality green ${greenDeals === 1 ? 'deal' : 'deals'} and no pending approvals or at-risk customers. Keep up the excellent work!`,
      });
    }

    // Default insight
    if (insights.length === 0) {
      insights.push({
        id: 'default',
        type: 'tip',
        title: 'Welcome to Revenue Accelerator',
        description: 'Start by creating deals and mapping your customer journeys to unlock AI-powered insights and recommendations.',
        action: 'Create Deal',
        actionRoute: '/deals/new',
      });
    }

    return insights;
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const insights = generateInsights();
  const currentInsight = insights[currentInsightIndex];

  const getInsightConfig = (type: string) => {
    switch (type) {
      case 'opportunity':
        return {
          icon: TrendingUp,
          gradient: 'from-emerald-500/10 to-green-500/10',
          borderColor: 'border-emerald-500/30',
          iconColor: 'text-emerald-500',
          badgeColor: 'bg-emerald-500',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          gradient: 'from-amber-500/10 to-orange-500/10',
          borderColor: 'border-amber-500/30',
          iconColor: 'text-amber-500',
          badgeColor: 'bg-amber-500',
        };
      case 'tip':
        return {
          icon: Lightbulb,
          gradient: 'from-blue-500/10 to-cyan-500/10',
          borderColor: 'border-blue-500/30',
          iconColor: 'text-blue-500',
          badgeColor: 'bg-blue-500',
        };
      case 'trend':
        return {
          icon: TrendingUp,
          gradient: 'from-purple-500/10 to-violet-500/10',
          borderColor: 'border-purple-500/30',
          iconColor: 'text-purple-500',
          badgeColor: 'bg-purple-500',
        };
      default:
        return {
          icon: Sparkles,
          gradient: 'from-primary/10 to-accent/10',
          borderColor: 'border-primary/30',
          iconColor: 'text-primary',
          badgeColor: 'bg-primary',
        };
    }
  };

  const config = getInsightConfig(currentInsight.type);
  const Icon = config.icon;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setCurrentInsightIndex((prev) => (prev + 1) % insights.length);
      setIsRefreshing(false);
    }, 500);
  };

  // Auto-rotate insights
  useEffect(() => {
    if (insights.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentInsightIndex((prev) => (prev + 1) % insights.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [insights.length]);

  if (!isVisible) return null;

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300',
      'bg-gradient-to-r',
      config.gradient,
      config.borderColor,
      'border'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* AI Icon */}
          <div className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            'bg-background/80 backdrop-blur-sm shadow-sm'
          )}>
            <Sparkles className="h-5 w-5 text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={cn('text-white text-xs', config.badgeColor)}>
                AI Insight
              </Badge>
              <Icon className={cn('h-4 w-4', config.iconColor)} />
              <span className="text-sm font-semibold">{currentInsight.title}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {currentInsight.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {currentInsight.action && (
              <Button 
                size="sm" 
                className="h-8"
                onClick={() => currentInsight.actionRoute && window.location.assign(currentInsight.actionRoute)}
              >
                {currentInsight.action}
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Insight indicator dots */}
        {insights.length > 1 && (
          <div className="flex items-center justify-center gap-1 mt-3">
            {insights.map((_, index) => (
              <button
                key={index}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  index === currentInsightIndex 
                    ? 'w-4 bg-primary' 
                    : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                )}
                onClick={() => setCurrentInsightIndex(index)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
