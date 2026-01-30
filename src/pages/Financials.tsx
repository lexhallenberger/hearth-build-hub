import { CACLTVAnalysis } from '@/components/financials/CACLTVAnalysis';
import { FrictionDashboard } from '@/components/financials/FrictionDashboard';
import { EnhancedRule40Tracker } from '@/components/financials/EnhancedRule40Tracker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Activity, Target, TrendingUp } from 'lucide-react';

export default function Financials() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Intelligence</h1>
        <p className="text-muted-foreground mt-1">
          CAC/LTV analysis, friction tracking, and SaaS health metrics
        </p>
      </div>

      <Tabs defaultValue="rule40" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rule40" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Rule of 40
          </TabsTrigger>
          <TabsTrigger value="cac-ltv" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            CAC/LTV
          </TabsTrigger>
          <TabsTrigger value="friction" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Friction
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rule40">
          <EnhancedRule40Tracker />
        </TabsContent>

        <TabsContent value="cac-ltv">
          <CACLTVAnalysis />
        </TabsContent>

        <TabsContent value="friction">
          <FrictionDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
