import { useAuth } from '@/contexts/AuthContext';
import { usePendingApprovals, useDealSegments, useDealDeskMetrics } from '@/hooks/useDealDesk';
import { ApprovalQueue, SegmentationMatrix, DealDeskMetrics, DealQualityDistribution } from '@/components/deal-desk';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Briefcase, 
  Clock, 
  LayoutGrid, 
  BarChart3,
  Loader2,
  Shield
} from 'lucide-react';

export default function DealDesk() {
  const { user, hasAnyRole } = useAuth();
  const { data: pendingDeals, isLoading: dealsLoading } = usePendingApprovals();
  const { data: segments, isLoading: segmentsLoading } = useDealSegments();
  const { data: metrics, isLoading: metricsLoading } = useDealDeskMetrics();

  const canApprove = hasAnyRole(['admin', 'deal_desk', 'executive', 'finance']);

  if (dealsLoading || segmentsLoading || metricsLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Deal Desk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            Deal Desk
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and approve deals, manage governance policies
          </p>
        </div>
        {(pendingDeals?.length || 0) > 0 && (
          <Badge className="bg-amber-500 text-white text-lg px-4 py-2">
            <Clock className="h-4 w-4 mr-2" />
            {pendingDeals?.length} Pending
          </Badge>
        )}
      </div>

      {/* Metrics Overview */}
      <DealDeskMetrics metrics={metrics || null} isLoading={metricsLoading} />

      {/* Main Content */}
      <Tabs defaultValue="queue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Approval Queue
            {(pendingDeals?.length || 0) > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingDeals?.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="segments" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            Segmentation
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          {canApprove ? (
            <ApprovalQueue deals={pendingDeals || []} isLoading={dealsLoading} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold">Access Restricted</h3>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  You don't have permission to approve deals.<br />
                  Contact an administrator for access.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="segments">
          <SegmentationMatrix segments={segments || []} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <DealQualityDistribution metrics={metrics || null} />
            
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold">More Analytics Coming</h3>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  Trend charts, exception tracking, and<br />
                  approval time analysis coming in Phase 6.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
