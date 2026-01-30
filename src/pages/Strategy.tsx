import { useAuth } from '@/contexts/AuthContext';
import { useMarketStrategy } from '@/hooks/useMarketStrategy';
import { MarketModeCard } from '@/components/deal-governance/MarketModeCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings2, 
  Shield, 
  Target, 
  Loader2,
  Building2,
  Scale,
  TrendingUp
} from 'lucide-react';

export default function Strategy() {
  const { user, hasAnyRole } = useAuth();
  const { data: strategy, isLoading } = useMarketStrategy();

  const isAdmin = hasAnyRole(['admin']);
  const isExecutive = hasAnyRole(['executive']);
  const canEdit = isAdmin;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              <Settings2 className="h-5 w-5 text-primary" />
            </div>
            Strategy Configuration
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure your market strategy and deal governance policies
          </p>
        </div>
        {strategy && (
          <Badge variant="outline" className="text-sm">
            Active: {strategy.name}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="market" className="space-y-6">
        <TabsList>
          <TabsTrigger value="market" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Market Mode
          </TabsTrigger>
          <TabsTrigger value="scoring" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Scoring Weights
          </TabsTrigger>
          <TabsTrigger value="governance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Governance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="market">
          <MarketModeCard strategy={strategy || null} />
        </TabsContent>

        <TabsContent value="scoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Scoring Attribute Weights
              </CardTitle>
              <CardDescription>
                Configure how different attributes contribute to deal scores based on market mode
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <h4 className="font-medium flex items-center gap-2 text-blue-600 mb-2">
                    <TrendingUp className="h-4 w-4" />
                    Market Share Mode
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Deal Size: High weight</li>
                    <li>• Discount: Low weight</li>
                    <li>• Strategic Value: High weight</li>
                    <li>• Margin: Low weight</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <h4 className="font-medium flex items-center gap-2 text-emerald-600 mb-2">
                    <Target className="h-4 w-4" />
                    Revenue Optimal Mode
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Deal Size: Medium weight</li>
                    <li>• Discount: Medium weight</li>
                    <li>• Strategic Value: Medium weight</li>
                    <li>• Margin: Medium weight</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                  <h4 className="font-medium flex items-center gap-2 text-purple-600 mb-2">
                    <Shield className="h-4 w-4" />
                    Margin Optimal Mode
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Deal Size: Low weight</li>
                    <li>• Discount: High weight</li>
                    <li>• Strategic Value: Medium weight</li>
                    <li>• Margin: High weight</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Scoring weights automatically adjust based on the selected market mode. 
                Contact an administrator to customize individual attribute weights.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Deal Governance Policies
              </CardTitle>
              <CardDescription>
                Rules for automatic approvals and escalation triggers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Auto-Approval Rules */}
                <div>
                  <h4 className="font-medium mb-3">Auto-Approval Rules</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium text-sm">Green Deals</p>
                        <p className="text-xs text-muted-foreground">Score ≥ 70, within guardrails</p>
                      </div>
                      <Badge className="bg-green-500">Auto-Approve</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium text-sm">Yellow Deals</p>
                        <p className="text-xs text-muted-foreground">Score 40-69</p>
                      </div>
                      <Badge className="bg-amber-500">L1 Approval</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium text-sm">Red Deals</p>
                        <p className="text-xs text-muted-foreground">Score &lt; 40</p>
                      </div>
                      <Badge className="bg-red-500">L2+ Approval</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium text-sm">Exception Requests</p>
                        <p className="text-xs text-muted-foreground">Outside guardrails</p>
                      </div>
                      <Badge variant="outline">Executive Review</Badge>
                    </div>
                  </div>
                </div>

                {/* Escalation Triggers */}
                <div>
                  <h4 className="font-medium mb-3">Escalation Triggers</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span>Discount exceeds maximum for segment</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span>Contract length below minimum</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span>Non-standard payment terms requested</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span>Deal value below segment minimum</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
