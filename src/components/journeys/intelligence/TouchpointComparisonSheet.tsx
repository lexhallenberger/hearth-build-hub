import { JourneyTouchpoint, JourneyStage, TOUCHPOINT_TYPE_LABELS, CHANNEL_OPTIONS } from '@/types/journeys';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Star, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Edit, 
  Sparkles,
  Target,
  Users,
  Layers,
  BarChart3,
  MessageSquare,
  Clock,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BENCHMARK_DEFAULTS, WorldClassBenchmark } from './types';

interface TouchpointComparisonSheetProps {
  touchpoint: JourneyTouchpoint | null;
  stage: JourneyStage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (touchpoint: JourneyTouchpoint) => void;
  onRunAnalysis?: (touchpoint: JourneyTouchpoint) => void;
}

interface ComparisonRow {
  label: string;
  icon: React.ReactNode;
  benchmark: React.ReactNode;
  current: React.ReactNode;
  status: 'good' | 'warning' | 'critical' | 'missing';
}

function getBenchmark(touchpoint: JourneyTouchpoint): WorldClassBenchmark {
  // Try to match by name, otherwise return generic benchmark
  const benchmark = BENCHMARK_DEFAULTS[touchpoint.name];
  if (benchmark) return benchmark;
  
  // Generic benchmarks based on type
  return {
    channel: 'meeting',
    ownerRole: 'Dedicated Owner',
    systems: ['CRM', 'Communication Platform'],
    kpis: ['Conversion Rate', 'Time to Complete'],
    valueMessage: 'Clear value proposition aligned to customer needs',
    conversionRate: 75,
    velocityDays: 3,
  };
}

function getChannelLabel(value: string | null): string {
  if (!value) return 'Not defined';
  const option = CHANNEL_OPTIONS.find(o => o.value === value);
  return option?.label || value;
}

function StatusIcon({ status }: { status: ComparisonRow['status'] }) {
  switch (status) {
    case 'good':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'critical':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'missing':
      return <XCircle className="h-4 w-4 text-muted-foreground" />;
  }
}

export function TouchpointComparisonSheet({
  touchpoint,
  stage,
  open,
  onOpenChange,
  onEdit,
  onRunAnalysis,
}: TouchpointComparisonSheetProps) {
  if (!touchpoint || !stage) return null;

  const tp = touchpoint as any;
  const benchmark = getBenchmark(touchpoint);
  
  // Build comparison rows
  const comparisons: ComparisonRow[] = [
    {
      label: 'Channel',
      icon: <MessageSquare className="h-4 w-4" />,
      benchmark: <span>{getChannelLabel(benchmark.channel || null)}</span>,
      current: touchpoint.channel ? (
        <span>{getChannelLabel(touchpoint.channel)}</span>
      ) : (
        <span className="text-muted-foreground italic">Not defined</span>
      ),
      status: touchpoint.channel ? 'good' : 'warning',
    },
    {
      label: 'Owner',
      icon: <Users className="h-4 w-4" />,
      benchmark: <span>{benchmark.ownerRole}</span>,
      current: touchpoint.owner_role ? (
        <span>{touchpoint.owner_role}</span>
      ) : (
        <span className="text-muted-foreground italic">Not assigned</span>
      ),
      status: touchpoint.owner_role ? 'good' : 'critical',
    },
    {
      label: 'Systems',
      icon: <Layers className="h-4 w-4" />,
      benchmark: (
        <div className="flex flex-wrap gap-1">
          {(benchmark.systems || []).map((s, i) => (
            <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
          ))}
        </div>
      ),
      current: tp.systems?.length ? (
        <div className="flex flex-wrap gap-1">
          {tp.systems.map((s: string, i: number) => (
            <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground italic">None defined</span>
      ),
      status: tp.systems?.length >= (benchmark.systems?.length || 0) ? 'good' : 
              tp.systems?.length > 0 ? 'warning' : 'critical',
    },
    {
      label: 'KPIs',
      icon: <BarChart3 className="h-4 w-4" />,
      benchmark: (
        <div className="flex flex-wrap gap-1">
          {(benchmark.kpis || []).map((k, i) => (
            <Badge key={i} variant="outline" className="text-xs">{k}</Badge>
          ))}
        </div>
      ),
      current: tp.kpis?.length ? (
        <div className="flex flex-wrap gap-1">
          {tp.kpis.map((k: string, i: number) => (
            <Badge key={i} variant="secondary" className="text-xs">{k}</Badge>
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground italic">Not tracking</span>
      ),
      status: tp.kpis?.length >= (benchmark.kpis?.length || 0) ? 'good' : 
              tp.kpis?.length > 0 ? 'warning' : 'critical',
    },
    {
      label: 'Value Message',
      icon: <Target className="h-4 w-4" />,
      benchmark: (
        <span className="text-sm italic">"{benchmark.valueMessage}"</span>
      ),
      current: touchpoint.value_message ? (
        <span className="text-sm">"{touchpoint.value_message}"</span>
      ) : (
        <span className="text-muted-foreground italic">Not documented</span>
      ),
      status: touchpoint.value_message ? 'good' : 
              touchpoint.is_moment_of_truth ? 'critical' : 'warning',
    },
  ];

  const gapCount = comparisons.filter(c => c.status === 'critical' || c.status === 'warning').length;
  const overallStatus = gapCount === 0 ? 'Optimized' : 
                        gapCount <= 2 ? 'Needs Attention' : 'Critical Gaps';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {touchpoint.is_moment_of_truth && (
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                )}
                <SheetTitle className="text-xl">{touchpoint.name}</SheetTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{stage.name}</Badge>
                <Badge variant="outline">{TOUCHPOINT_TYPE_LABELS[touchpoint.touchpoint_type]}</Badge>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={cn(
                gapCount === 0 && 'border-green-500 text-green-500',
                gapCount > 0 && gapCount <= 2 && 'border-yellow-500 text-yellow-500',
                gapCount > 2 && 'border-red-500 text-red-500'
              )}
            >
              {overallStatus}
            </Badge>
          </div>
          
          {touchpoint.description && (
            <p className="text-sm text-muted-foreground">{touchpoint.description}</p>
          )}
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Pain Level Indicator */}
          {touchpoint.pain_point_level >= 3 && (
            <Card className="border-red-500/30 bg-red-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium text-red-500">
                      High Friction Point (Level {touchpoint.pain_point_level}/5)
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This touchpoint is causing significant customer friction and potential drop-off.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comparison Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                World-Class vs. Current State
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {comparisons.map((row, index) => (
                <div key={row.label}>
                  <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 py-3 items-start">
                    <div className="flex items-center gap-2 text-muted-foreground min-w-[100px]">
                      {row.icon}
                      <span className="text-sm font-medium">{row.label}</span>
                    </div>
                    <div className="bg-primary/5 p-2 rounded-md border border-primary/20">
                      <p className="text-[10px] text-muted-foreground uppercase mb-1">Benchmark</p>
                      {row.benchmark}
                    </div>
                    <div className="bg-muted/50 p-2 rounded-md border">
                      <p className="text-[10px] text-muted-foreground uppercase mb-1">Current</p>
                      {row.current}
                    </div>
                    <StatusIcon status={row.status} />
                  </div>
                  {index < comparisons.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Improvement Roadmap */}
          {gapCount > 0 && (
            <Card className="border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Improvement Roadmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {comparisons
                    .filter(c => c.status === 'critical' || c.status === 'warning')
                    .map((gap, index) => (
                      <div key={gap.label} className="flex items-start gap-3">
                        <div className={cn(
                          'flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold',
                          gap.status === 'critical' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                        )}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {gap.status === 'critical' ? 'Critical:' : 'Improve:'} {gap.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Align with world-class benchmark to improve conversion and reduce friction
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onEdit?.(touchpoint)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Current State
            </Button>
            <Button 
              className="flex-1"
              onClick={() => onRunAnalysis?.(touchpoint)}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Get AI Analysis
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
