import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Users, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  Plus,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface RecentItem {
  id: string;
  type: 'deal' | 'customer' | 'journey';
  name: string;
  subtitle: string;
  status?: string;
  value?: number;
  updatedAt: string;
}

interface QuickAccessPanelProps {
  recentDeals: RecentItem[];
  pendingApprovals: RecentItem[];
  atRiskCustomers: RecentItem[];
}

export function QuickAccessPanel({
  recentDeals,
  pendingApprovals,
  atRiskCustomers,
}: QuickAccessPanelProps) {
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'deal': return FileText;
      case 'customer': return Users;
      default: return FileText;
    }
  };

  const navigateTo = (item: RecentItem) => {
    switch (item.type) {
      case 'deal':
        navigate(`/deals/${item.id}`);
        break;
      case 'customer':
        navigate(`/customers/${item.id}`);
        break;
      case 'journey':
        navigate(`/journeys/${item.id}`);
        break;
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Recent Deals */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Recent Deals
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => navigate('/deals')}
            >
              View all
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentDeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No recent deals</p>
              <Button
                size="sm"
                className="mt-3"
                onClick={() => navigate('/deals/new')}
              >
                <Plus className="mr-1 h-3 w-3" />
                Create Deal
              </Button>
            </div>
          ) : (
            recentDeals.map((item) => {
              const Icon = getItemIcon(item.type);
              return (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-lg cursor-pointer',
                    'hover:bg-muted/50 transition-colors'
                  )}
                  onClick={() => navigateTo(item)}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                    <Icon className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                  </div>
                  {item.value && (
                    <Badge variant="secondary" className="shrink-0">
                      {formatCurrency(item.value)}
                    </Badge>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Pending Approvals
              {pendingApprovals.length > 0 && (
                <Badge className="bg-amber-500 text-white ml-1">
                  {pendingApprovals.length}
                </Badge>
              )}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => navigate('/deals')}
            >
              Review
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {pendingApprovals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 mb-2">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-sm font-medium text-green-600">All caught up!</p>
              <p className="text-xs text-muted-foreground">No pending approvals</p>
            </div>
          ) : (
            pendingApprovals.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-lg cursor-pointer',
                  'hover:bg-muted/50 transition-colors',
                  'border-l-2 border-amber-500'
                )}
                onClick={() => navigateTo(item)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* At-Risk Customers */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              At-Risk Customers
              {atRiskCustomers.length > 0 && (
                <Badge className="bg-red-500 text-white ml-1">
                  {atRiskCustomers.length}
                </Badge>
              )}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => navigate('/customers')}
            >
              View all
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {atRiskCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 mb-2">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-sm font-medium text-green-600">Healthy portfolio!</p>
              <p className="text-xs text-muted-foreground">No at-risk customers</p>
            </div>
          ) : (
            atRiskCustomers.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-lg cursor-pointer',
                  'hover:bg-muted/50 transition-colors',
                  'border-l-2 border-red-500'
                )}
                onClick={() => navigateTo(item)}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                  <Users className="h-4 w-4 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                </div>
                <Badge variant="destructive" className="shrink-0 text-xs">
                  At Risk
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
