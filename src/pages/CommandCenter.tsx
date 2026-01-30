import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useJourneys } from '@/hooks/useJourneys';
import { useDeals } from '@/hooks/useDeals';
import { useCustomers } from '@/hooks/useCustomers';
import { 
  JourneySelector, 
  MetricsOverlay, 
  QuickAccessPanel, 
  AIInsightsBanner 
} from '@/components/command-center';
import { Badge } from '@/components/ui/badge';
import { Loader2, Rocket } from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS } from '@/types/auth';

export default function CommandCenter() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: journeys, isLoading: journeysLoading } = useJourneys();
  const { data: deals, isLoading: dealsLoading } = useDeals();
  const { data: customers, isLoading: customersLoading } = useCustomers();

  const isLoading = journeysLoading || dealsLoading || customersLoading;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.profile?.full_name?.split(' ')[0] || 'there';

  // Calculate metrics
  const pipelineValue = deals?.reduce((sum, d) => sum + (d.deal_value || 0), 0) || 0;
  const greenDeals = deals?.filter((d) => d.classification === 'green').length || 0;
  const yellowDeals = deals?.filter((d) => d.classification === 'yellow').length || 0;
  const redDeals = deals?.filter((d) => d.classification === 'red').length || 0;
  const pendingApprovals = deals?.filter((d) => d.status === 'pending_approval').length || 0;
  const atRiskCustomers = customers?.filter((c) => c.health_status === 'at_risk' || c.health_status === 'critical').length || 0;

  // Prepare quick access data
  const recentDeals = (deals?.slice(0, 4) || []).map((deal) => ({
    id: deal.id,
    type: 'deal' as const,
    name: deal.name,
    subtitle: deal.customer_name,
    value: deal.deal_value,
    updatedAt: deal.updated_at,
  }));

  const pendingApprovalDeals = (deals?.filter((d) => d.status === 'pending_approval').slice(0, 4) || []).map((deal) => ({
    id: deal.id,
    type: 'deal' as const,
    name: deal.name,
    subtitle: deal.customer_name,
    value: deal.deal_value,
    updatedAt: deal.updated_at,
  }));

  const atRiskCustomersList = (customers?.filter((c) => c.health_status === 'at_risk' || c.health_status === 'critical').slice(0, 4) || []).map((customer) => ({
    id: customer.id,
    type: 'customer' as const,
    name: customer.name,
    subtitle: customer.industry || 'No industry',
    updatedAt: customer.updated_at,
  }));

  const handleJourneySelect = (journey: any) => {
    navigate(`/journeys/${journey.id}`);
  };

  if (isLoading) {
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
    <div className="space-y-8 animate-fade-in">
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

      {/* AI Insights Banner */}
      <AIInsightsBanner
        pipelineValue={pipelineValue}
        greenDeals={greenDeals}
        yellowDeals={yellowDeals}
        redDeals={redDeals}
        pendingApprovals={pendingApprovals}
        atRiskCustomers={atRiskCustomers}
      />

      {/* Metrics Overlay */}
      <MetricsOverlay
        pipelineValue={pipelineValue}
        dealQuality={{ green: greenDeals, yellow: yellowDeals, red: redDeals }}
        pendingApprovals={pendingApprovals}
        atRiskCustomers={atRiskCustomers}
      />

      {/* Journey Selector - The Hero */}
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

      {/* Quick Access Panel */}
      <QuickAccessPanel
        recentDeals={recentDeals}
        pendingApprovals={pendingApprovalDeals}
        atRiskCustomers={atRiskCustomersList}
      />
    </div>
  );
}
