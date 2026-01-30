import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeads, useOpportunities, useValueMessages } from '@/hooks/usePipeline';
import { LeadsList } from '@/components/pipeline/LeadsList';
import { OpportunitiesKanban } from '@/components/pipeline/OpportunitiesKanban';
import { ValueMessagesLibrary } from '@/components/pipeline/ValueMessagesLibrary';
import { Users, Target, MessageSquareText, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';

export default function Pipeline() {
  const { data: leads } = useLeads();
  const { data: opportunities } = useOpportunities();
  const { data: valueMessages } = useValueMessages();

  // Calculate metrics
  const activeLeads = leads?.filter(l => !['converted', 'unqualified'].includes(l.status)).length || 0;
  const qualifiedLeads = leads?.filter(l => l.status === 'qualified').length || 0;
  const openOpportunities = opportunities?.filter(o => !['closed_won', 'closed_lost'].includes(o.stage)) || [];
  const pipelineValue = openOpportunities.reduce((sum, o) => sum + (o.amount || 0), 0);
  const weightedPipeline = openOpportunities.reduce((sum, o) => sum + ((o.amount || 0) * (o.probability || 0) / 100), 0);
  const wonOpportunities = opportunities?.filter(o => o.stage === 'closed_won') || [];
  const wonValue = wonOpportunities.reduce((sum, o) => sum + (o.amount || 0), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pipeline</h1>
        <p className="text-muted-foreground">Track leads and opportunities from marketing to sales</p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLeads}</div>
            <p className="text-xs text-muted-foreground">
              {qualifiedLeads} qualified
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Opportunities</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openOpportunities.length}</div>
            <p className="text-xs text-muted-foreground">
              In active stages
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pipelineValue)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(weightedPipeline)} weighted
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed Won</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(wonValue)}</div>
            <p className="text-xs text-muted-foreground">
              {wonOpportunities.length} deals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="leads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leads" className="gap-2">
            <Users className="h-4 w-4" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="gap-2">
            <Target className="h-4 w-4" />
            Opportunities
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2">
            <MessageSquareText className="h-4 w-4" />
            Value Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leads">
          <LeadsList />
        </TabsContent>

        <TabsContent value="opportunities">
          <OpportunitiesKanban />
        </TabsContent>

        <TabsContent value="messages">
          <ValueMessagesLibrary />
        </TabsContent>
      </Tabs>
    </div>
  );
}
