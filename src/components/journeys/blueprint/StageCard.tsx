import { useState } from 'react';
import { JourneyStage, JourneyTouchpoint } from '@/types/journeys';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TouchpointRow } from './TouchpointRow';
import { ChevronDown, ChevronUp, Star, AlertTriangle, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StageCardProps {
  stage: JourneyStage;
  index: number;
  onTouchpointClick: (touchpoint: JourneyTouchpoint) => void;
  defaultOpen?: boolean;
}

export function StageCard({ stage, index, onTouchpointClick, defaultOpen = false }: StageCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const touchpoints = stage.touchpoints || [];
  const frontStageTouchpoints = touchpoints.filter(t => (t as any).lane !== 'back');
  const backStageTouchpoints = touchpoints.filter(t => (t as any).lane === 'back');
  
  const momentsOfTruth = touchpoints.filter(t => t.is_moment_of_truth).length;
  const highPainPoints = touchpoints.filter(t => t.pain_point_level >= 4).length;

  const stageColors = [
    'from-blue-500/20 to-blue-500/5 border-blue-500/30',
    'from-purple-500/20 to-purple-500/5 border-purple-500/30',
    'from-green-500/20 to-green-500/5 border-green-500/30',
    'from-orange-500/20 to-orange-500/5 border-orange-500/30',
    'from-pink-500/20 to-pink-500/5 border-pink-500/30',
    'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30',
    'from-amber-500/20 to-amber-500/5 border-amber-500/30',
  ];

  const colorClass = stageColors[index % stageColors.length];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn(
        'bg-gradient-to-br border transition-all',
        colorClass,
        isOpen && 'shadow-lg'
      )}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/20 transition-colors rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background/80 text-sm font-bold">
                  {index + 1}
                </div>
                <div>
                  <CardTitle className="text-lg">{stage.name}</CardTitle>
                  {stage.description && (
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                      {stage.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Quick Stats */}
                <div className="hidden md:flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Layers className="h-3 w-3" />
                    {touchpoints.length}
                  </Badge>
                  {momentsOfTruth > 0 && (
                    <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      {momentsOfTruth}
                    </Badge>
                  )}
                  {highPainPoints > 0 && (
                    <Badge className="bg-red-500/10 text-red-500 border-red-500/20 gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {highPainPoints}
                    </Badge>
                  )}
                </div>
                
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {touchpoints.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No touchpoints in this stage</p>
              </div>
            ) : (
              <>
                {/* Front-Stage Touchpoints */}
                {frontStageTouchpoints.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Front-Stage (Customer-Facing)
                    </h4>
                    <div className="rounded-lg border bg-background/50 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[250px]">Touchpoint</TableHead>
                            <TableHead className="w-[100px]">Channel</TableHead>
                            <TableHead className="w-[120px]">Owner</TableHead>
                            <TableHead className="w-[80px]">Pain</TableHead>
                            <TableHead>Value Message</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {frontStageTouchpoints.map(touchpoint => (
                            <TouchpointRow
                              key={touchpoint.id}
                              touchpoint={touchpoint}
                              onClick={onTouchpointClick}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* Back-Stage Touchpoints */}
                {backStageTouchpoints.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-500" />
                      Back-Stage (Internal Operations)
                    </h4>
                    <div className="rounded-lg border bg-background/50 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[250px]">Touchpoint</TableHead>
                            <TableHead className="w-[100px]">Channel</TableHead>
                            <TableHead className="w-[120px]">Owner</TableHead>
                            <TableHead className="w-[80px]">Pain</TableHead>
                            <TableHead>Value Message</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {backStageTouchpoints.map(touchpoint => (
                            <TouchpointRow
                              key={touchpoint.id}
                              touchpoint={touchpoint}
                              onClick={onTouchpointClick}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* If no lane distinction, show all */}
                {frontStageTouchpoints.length === 0 && backStageTouchpoints.length === 0 && touchpoints.length > 0 && (
                  <div className="rounded-lg border bg-background/50 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-[250px]">Touchpoint</TableHead>
                          <TableHead className="w-[100px]">Channel</TableHead>
                          <TableHead className="w-[120px]">Owner</TableHead>
                          <TableHead className="w-[80px]">Pain</TableHead>
                          <TableHead>Value Message</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {touchpoints.map(touchpoint => (
                          <TouchpointRow
                            key={touchpoint.id}
                            touchpoint={touchpoint}
                            onClick={onTouchpointClick}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
