import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  usePipelineMetrics, 
  useDealDistribution, 
  useOpportunityMetrics, 
  useCustomerMetrics,
  useRule40Data 
} from '@/hooks/useAnalytics';
import { MetricCard } from '@/components/analytics/MetricCard';
import { DealDistributionChart } from '@/components/analytics/DealDistributionChart';
import { PipelineFunnel } from '@/components/analytics/PipelineFunnel';
import { Rule40Calculator } from '@/components/analytics/Rule40Calculator';
import { CustomerHealthBreakdown } from '@/components/analytics/CustomerHealthBreakdown';
import { 
  BarChart3, DollarSign, Target, TrendingUp, Users, 
  CheckCircle, XCircle, Clock, Loader2, Percent
} from 'lucide-react';

export default function Analytics() {
  const { data: pipelineMetrics, isLoading: pipelineLoading } = usePipelineMetrics();
  const { data: dealDistribution = [], isLoading: distributionLoading } = useDealDistribution();
  const { data: opportunityMetrics, isLoading: oppLoading } = useOpportunityMetrics();
  const { data: customerMetrics, isLoading: customerLoading } = useCustomerMetrics();
  const { data: rule40Data } = useRule40Data();

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const isLoading = pipelineLoading || distributionLoading || oppLoading || customerLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Executive insights and performance reporting</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Pipeline Value"
          value={formatCurrency(opportunityMetrics?.pipelineValue || 0)}
          description="Unweighted"
          icon={DollarSign}
        />
        <MetricCard
          title="Weighted Pipeline"
          value={formatCurrency(opportunityMetrics?.weightedValue || 0)}
          description="Probability adjusted"
          icon={Target}
        />
        <MetricCard
          title="Win Rate"
          value={`${(pipelineMetrics?.winRate || 0).toFixed(0)}%`}
          description={`${pipelineMetrics?.wonDeals || 0} won / ${(pipelineMetrics?.wonDeals || 0) + (pipelineMetrics?.lostDeals || 0)} closed`}
          icon={Percent}
        />
        <MetricCard
          title="Total ARR"
          value={formatCurrency(customerMetrics?.totalARR || 0)}
          description={`${customerMetrics?.total || 0} customers`}
          icon={TrendingUp}
        />
      </div>

      <Tabs defaultValue="deals" className="space-y-6">
        <TabsList>
          <TabsTrigger value="deals">Deal Quality</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="rule40">Rule of 40</TabsTrigger>
        </TabsList>

        <TabsContent value="deals" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Deals"
              value={pipelineMetrics?.totalDeals || 0}
              icon={BarChart3}
            />
            <MetricCard
              title="Green Deals"
              value={pipelineMetrics?.greenDeals || 0}
              description="High quality"
              valueClassName="text-green-500"
            />
            <MetricCard
              title="Yellow Deals"
              value={pipelineMetrics?.yellowDeals || 0}
              description="Needs review"
              valueClassName="text-yellow-500"
            />
            <MetricCard
              title="Red Deals"
              value={pipelineMetrics?.redDeals || 0}
              description="Exception required"
              valueClassName="text-red-500"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <DealDistributionChart data={dealDistribution} />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Deal Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span>Pending Approval</span>
                  </div>
                  <span className="font-bold">{pipelineMetrics?.pendingDeals || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Approved</span>
                  </div>
                  <span className="font-bold">{pipelineMetrics?.approvedDeals || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span>Closed Won</span>
                  </div>
                  <span className="font-bold">{pipelineMetrics?.wonDeals || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>Closed Lost</span>
                  </div>
                  <span className="font-bold">{pipelineMetrics?.lostDeals || 0}</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between font-medium">
                    <span>Average Deal Size</span>
                    <span>{formatCurrency(pipelineMetrics?.avgDealSize || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Active Opportunities"
              value={opportunityMetrics?.total || 0}
              icon={Target}
            />
            <MetricCard
              title="Pipeline Value"
              value={formatCurrency(opportunityMetrics?.pipelineValue || 0)}
              icon={DollarSign}
            />
            <MetricCard
              title="Weighted Value"
              value={formatCurrency(opportunityMetrics?.weightedValue || 0)}
              icon={TrendingUp}
            />
            <MetricCard
              title="Win Rate"
              value={`${(opportunityMetrics?.winRate || 0).toFixed(0)}%`}
              icon={Percent}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <PipelineFunnel data={opportunityMetrics?.stageBreakdown || {}} />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Pipeline Summary</CardTitle>
                <CardDescription>Opportunity breakdown by stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(opportunityMetrics?.stageBreakdown || {}).map(([stage, count]) => (
                    <div key={stage} className="flex items-center justify-between">
                      <span className="capitalize">{stage.replace('_', ' ')}</span>
                      <span className="font-bold">{count as number}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Customers"
              value={customerMetrics?.total || 0}
              icon={Users}
            />
            <MetricCard
              title="Total ARR"
              value={formatCurrency(customerMetrics?.totalARR || 0)}
              icon={DollarSign}
            />
            <MetricCard
              title="Total MRR"
              value={formatCurrency(customerMetrics?.totalMRR || 0)}
              icon={TrendingUp}
            />
            <MetricCard
              title="Healthy Rate"
              value={`${customerMetrics?.total ? ((customerMetrics.healthyCount / customerMetrics.total) * 100).toFixed(0) : 0}%`}
              description={`${customerMetrics?.healthyCount || 0} healthy`}
              icon={CheckCircle}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <CustomerHealthBreakdown
              healthy={customerMetrics?.healthyCount || 0}
              atRisk={customerMetrics?.atRiskCount || 0}
              critical={customerMetrics?.criticalCount || 0}
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Customer Tier Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      Enterprise
                    </span>
                    <span className="font-bold">{customerMetrics?.tierBreakdown?.enterprise || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      Mid-Market
                    </span>
                    <span className="font-bold">{customerMetrics?.tierBreakdown?.mid_market || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      SMB
                    </span>
                    <span className="font-bold">{customerMetrics?.tierBreakdown?.smb || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      Startup
                    </span>
                    <span className="font-bold">{customerMetrics?.tierBreakdown?.startup || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rule40" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Rule40Calculator 
              initialRevenueGrowth={rule40Data?.revenueGrowth} 
              initialProfitMargin={rule40Data?.profitMargin} 
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">About Rule of 40</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  The Rule of 40 is a principle that states a SaaS company's combined 
                  revenue growth rate and profit margin should exceed 40%.
                </p>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-mono text-center">
                    Revenue Growth % + Profit Margin % ≥ 40%
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>≥ 60%:</strong> Exceptional performance</p>
                  <p><strong>40-60%:</strong> Healthy balance</p>
                  <p><strong>&lt; 40%:</strong> Needs attention</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Use the calculator to model different scenarios and understand 
                  the trade-offs between growth and profitability.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
