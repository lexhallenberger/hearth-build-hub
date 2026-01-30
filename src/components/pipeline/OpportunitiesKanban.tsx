import { useState, useMemo } from 'react';
import { useOpportunities, useUpdateOpportunity, useDeleteOpportunity } from '@/hooks/usePipeline';
import { Opportunity, OPPORTUNITY_STAGE_CONFIG, OpportunityStage } from '@/types/pipeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreHorizontal, Trash2, DollarSign, Calendar, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { OpportunityFormDialog } from './OpportunityFormDialog';
import { cn } from '@/lib/utils';

const STAGES: OpportunityStage[] = ['discovery', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

export function OpportunitiesKanban() {
  const { data: opportunities, isLoading } = useOpportunities();
  const updateOpportunity = useUpdateOpportunity();
  const deleteOpportunity = useDeleteOpportunity();
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [draggedOpp, setDraggedOpp] = useState<Opportunity | null>(null);

  const filteredOpportunities = useMemo(() => {
    if (!opportunities) return {};
    
    const filtered = opportunities.filter(
      (opp) =>
        opp.name.toLowerCase().includes(search.toLowerCase()) ||
        opp.company.toLowerCase().includes(search.toLowerCase())
    );

    return STAGES.reduce((acc, stage) => {
      acc[stage] = filtered.filter((opp) => opp.stage === stage);
      return acc;
    }, {} as Record<OpportunityStage, Opportunity[]>);
  }, [opportunities, search]);

  const stageStats = useMemo(() => {
    return STAGES.reduce((acc, stage) => {
      const stageOpps = filteredOpportunities[stage] || [];
      acc[stage] = {
        count: stageOpps.length,
        value: stageOpps.reduce((sum, opp) => sum + (opp.amount || 0), 0),
      };
      return acc;
    }, {} as Record<OpportunityStage, { count: number; value: number }>);
  }, [filteredOpportunities]);

  const handleDragStart = (e: React.DragEvent, opp: Opportunity) => {
    setDraggedOpp(opp);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, stage: OpportunityStage) => {
    e.preventDefault();
    if (draggedOpp && draggedOpp.stage !== stage) {
      updateOpportunity.mutate({ id: draggedOpp.id, stage });
    }
    setDraggedOpp(null);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading opportunities...</div>;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Opportunity
        </Button>
      </div>

      <div className="grid grid-cols-6 gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const config = OPPORTUNITY_STAGE_CONFIG[stage];
          const stats = stageStats[stage];
          const opps = filteredOpportunities[stage] || [];

          return (
            <div
              key={stage}
              className={cn(
                "flex flex-col min-h-[500px] bg-muted/30 rounded-lg p-3 transition-colors",
                draggedOpp && "ring-2 ring-dashed ring-muted-foreground/20"
              )}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", config.color)} />
                  <h3 className="font-medium text-sm">{config.label}</h3>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {stats.count}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mb-3">
                {formatCurrency(stats.value)}
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto">
                {opps.map((opp) => (
                  <Card
                    key={opp.id}
                    className="cursor-move hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => handleDragStart(e, opp)}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm line-clamp-2">{opp.name}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Building2 className="h-3 w-3" />
                            {opp.company}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteOpportunity.mutate(opp.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-primary font-medium">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(opp.amount || 0)}
                        </div>
                        {opp.expected_close_date && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(opp.expected_close_date), 'MMM d')}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${opp.probability || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {opp.probability}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <OpportunityFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
