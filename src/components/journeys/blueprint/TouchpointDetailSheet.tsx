import { JourneyTouchpoint, TOUCHPOINT_TYPE_LABELS, CHANNEL_OPTIONS } from '@/types/journeys';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Star, 
  AlertTriangle, 
  MessageSquare, 
  Users, 
  Zap, 
  Target, 
  Settings2, 
  Lightbulb,
  Edit,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface TouchpointDetailSheetProps {
  touchpoint: JourneyTouchpoint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (touchpoint: JourneyTouchpoint) => void;
}

export function TouchpointDetailSheet({ 
  touchpoint, 
  open, 
  onOpenChange,
  onEdit 
}: TouchpointDetailSheetProps) {
  if (!touchpoint) return null;

  const channelLabel = CHANNEL_OPTIONS.find(c => c.value === touchpoint.channel)?.label || touchpoint.channel;
  const painLevel = touchpoint.pain_point_level || 0;
  
  const getPainColor = (level: number) => {
    if (level >= 4) return 'text-red-500 bg-red-500/10';
    if (level >= 3) return 'text-yellow-500 bg-yellow-500/10';
    return 'text-green-500 bg-green-500/10';
  };

  const getPainLabel = (level: number) => {
    if (level >= 4) return 'High Friction';
    if (level >= 3) return 'Medium Friction';
    if (level >= 1) return 'Low Friction';
    return 'No Friction';
  };

  // Generate optimization hints based on touchpoint data
  const getOptimizationHints = () => {
    const hints: string[] = [];
    
    if (painLevel >= 4) {
      hints.push('🔴 This is a high-friction point. Consider streamlining or automating this step.');
    }
    if (painLevel >= 3) {
      hints.push('🟡 Moderate friction detected. Look for ways to reduce customer effort.');
    }
    if (!touchpoint.value_message) {
      hints.push('💬 Missing value message. Add a compelling message to reinforce value at this moment.');
    }
    if (touchpoint.is_moment_of_truth && !touchpoint.value_message) {
      hints.push('⭐ Critical: This is a moment of truth without a value message. High priority to add one.');
    }
    if (!touchpoint.owner_role) {
      hints.push('👤 No owner assigned. Define who is responsible for this touchpoint.');
    }
    if (!touchpoint.channel) {
      hints.push('📡 Channel not specified. Define how this interaction happens.');
    }
    
    return hints;
  };

  const optimizationHints = getOptimizationHints();
  const hasIssues = optimizationHints.length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start gap-3">
            {touchpoint.is_moment_of_truth && (
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              </div>
            )}
            <div className="flex-1">
              <SheetTitle className="text-xl flex items-center gap-2">
                {touchpoint.name}
                {touchpoint.is_moment_of_truth && (
                  <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                    Moment of Truth
                  </Badge>
                )}
              </SheetTitle>
              <SheetDescription className="mt-1">
                {TOUCHPOINT_TYPE_LABELS[touchpoint.touchpoint_type]}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={getPainColor(painLevel)}>
              <AlertTriangle className="h-3 w-3 mr-1" />
              {getPainLabel(painLevel)} ({painLevel}/5)
            </Badge>
            {channelLabel && (
              <Badge variant="secondary">
                {channelLabel}
              </Badge>
            )}
          </div>

          {/* Description */}
          {touchpoint.description && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                What Happens
              </h4>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                {touchpoint.description}
              </p>
            </div>
          )}

          <Separator />

          {/* World-Class Execution */}
          <div>
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent" />
              World-Class Execution
            </h4>
            
            <div className="space-y-4">
              {/* Owner */}
              <div className="flex items-start gap-3">
                <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">Owner Role</span>
                  <p className="text-sm font-medium">
                    {touchpoint.owner_role || (
                      <span className="text-muted-foreground italic">Not assigned</span>
                    )}
                  </p>
                </div>
                {touchpoint.owner_role ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              {/* Value Message */}
              <div className="flex items-start gap-3">
                <Target className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">Value Message</span>
                  {touchpoint.value_message ? (
                    <p className="text-sm font-medium bg-accent/10 p-2 rounded-lg border border-accent/20 mt-1">
                      "{touchpoint.value_message}"
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No value message defined
                    </p>
                  )}
                </div>
                {touchpoint.value_message ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              {/* Channel */}
              <div className="flex items-start gap-3">
                <Settings2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">Channel</span>
                  <p className="text-sm font-medium">
                    {channelLabel || (
                      <span className="text-muted-foreground italic">Not specified</span>
                    )}
                  </p>
                </div>
                {touchpoint.channel ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>

          {/* Moment of Truth Context */}
          {touchpoint.is_moment_of_truth && (
            <>
              <Separator />
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-yellow-600">
                  <Star className="h-4 w-4 fill-yellow-500" />
                  Why This Matters
                </h4>
                <p className="text-sm text-muted-foreground">
                  This is a <strong>critical moment of truth</strong>. The customer's experience 
                  at this touchpoint significantly impacts their perception and decision to continue. 
                  Best-in-class companies focus extra attention on perfecting these moments.
                </p>
              </div>
            </>
          )}

          {/* Optimization Hints */}
          {hasIssues && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-accent" />
                  Optimization Opportunities
                </h4>
                <div className="space-y-2">
                  {optimizationHints.map((hint, index) => (
                    <div 
                      key={index}
                      className="text-sm p-3 bg-muted/50 rounded-lg border border-border/50"
                    >
                      {hint}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Edit Button */}
          {onEdit && (
            <div className="pt-4">
              <Button 
                onClick={() => onEdit(touchpoint)} 
                className="w-full"
                variant="outline"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Touchpoint
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
