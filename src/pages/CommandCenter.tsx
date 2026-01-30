import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useJourneys } from '@/hooks/useJourneys';
import { useExecutiveMetrics } from '@/hooks/useExecutiveMetrics';
import { 
  JourneySelector, 
  MetricsOverlay, 
  QuickAccessPanel, 
  AIInsightsBanner,
  StrategicKPIPanel,
  AlignmentScorecard,
  ExecutiveSummary,
  PerformanceTrends,
} from '@/components/command-center';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Rocket, LayoutDashboard, TrendingUp, Target } from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS } from '@/types/auth';

export default function CommandCenter() {
  const navigate = useNavigate();
  const { user, hasAnyRole } = useAuth();
  const { data: journeys, isLoading: journeysLoading } = useJourneys();
  const { data: metrics, isLoading: metricsLoading } = useExecutiveMetrics();

  const isExecutive = hasAnyRole(['admin', 'executive', 'finance']);
  const [activeView, setActiveView] = useState<'overview' | 'executive' | 'journeys'>(
    isExecutive ? 'executive' : 'overview'
  );

  const isLoading = journeysLoading || metricsLoading;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.profile?.full_name?.split(' ')[0] || 'there';

  // Prepare quick access data using metrics
  const recentDeals: any[] = [];
  const pendingApprovalDeals: any[] = [];
  const atRiskCustomersList: any[] = [];

  const handleJourneySelect = (journey: any) => {
    navigate(`/journeys/${journey.id}`);
  };

  if (isLoading || !metrics) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your command center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {getGreeting()}, {firstName}!
              </h1>
              <p className="text-sm text-muted-foreground">
                Revenue Acceleration Command Center
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user?.roles.map((role) => (
            <Badge key={role} className={ROLE_COLORS[role]}>
              {ROLE_LABELS[role]}
            </Badge>
          ))}
        </div>
      </div>

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </TabsTrigger>
          {isExecutive && (
            <TabsTrigger value="executive" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Executive
            </TabsTrigger>
          )}
          <TabsTrigger value="journeys" className="gap-2">
            <Target className="h-4 w-4" />
            Journeys
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Original Command Center */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* AI Insights Banner */}
          <AIInsightsBanner
            pipelineValue={metrics.pipelineValue}
            greenDeals={metrics.dealQuality.green}
            yellowDeals={metrics.dealQuality.yellow}
            redDeals={metrics.dealQuality.red}
            pendingApprovals={metrics.pendingApprovals}
            atRiskCustomers={metrics.atRiskCustomers}
          />

          {/* Metrics Overlay */}
          <MetricsOverlay
            pipelineValue={metrics.pipelineValue}
            dealQuality={metrics.dealQuality}
            pendingApprovals={metrics.pendingApprovals}
            atRiskCustomers={metrics.atRiskCustomers}
          />

          {/* Quick Access Panel */}
          <QuickAccessPanel
            recentDeals={recentDeals}
            pendingApprovals={pendingApprovalDeals}
            atRiskCustomers={atRiskCustomersList}
          />
        </TabsContent>

        {/* Executive Tab - Strategic Dashboard */}
        {isExecutive && (
          <TabsContent value="executive" className="space-y-6 mt-6">
            {/* Executive Summary */}
            <ExecutiveSummary
              pipelineValue={metrics.pipelineValue}
              totalARR={metrics.totalARR}
              dealQuality={metrics.dealQuality}
              pendingApprovals={metrics.pendingApprovals}
              atRiskCustomers={metrics.atRiskCustomers}
              winRate={metrics.winRate}
            />

            {/* Strategic KPIs with Drill-down */}
            <StrategicKPIPanel
              pipelineValue={metrics.pipelineValue}
              totalARR={metrics.totalARR}
              winRate={metrics.winRate}
              avgDealSize={metrics.avgDealSize}
              nrrPercent={metrics.nrrPercent}
              cacPaybackMonths={metrics.cacPaybackMonths}
            />

            {/* Performance Trends */}
            <PerformanceTrends
              pipelineValue={metrics.pipelineValue}
              totalARR={metrics.totalARR}
              winRate={metrics.winRate}
            />

            {/* Alignment Scorecard */}
            <AlignmentScorecard
              dealQuality={metrics.dealQuality}
              pendingApprovals={metrics.pendingApprovals}
              atRiskCustomers={metrics.atRiskCustomers}
              totalCustomers={metrics.totalCustomers}
              winRate={metrics.winRate}
            />
          </TabsContent>
        )}

        {/* Journeys Tab */}
        <TabsContent value="journeys" className="space-y-6 mt-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Journey Blueprints</h2>
                <p className="text-sm text-muted-foreground">
                  Select a journey to explore and optimize your revenue engine
                </p>
              </div>
            </div>
            <JourneySelector 
              journeys={journeys || []} 
              onSelect={handleJourneySelect}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
