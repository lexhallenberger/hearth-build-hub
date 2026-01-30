import { cn } from '@/lib/utils';
import { JourneyTouchpoint } from '@/types/journeys';
import { TouchpointNode } from './TouchpointNode';
import { Button } from '@/components/ui/button';
import { Plus, User, Server } from 'lucide-react';

interface SwimLaneProps {
  title: string;
  type: 'front' | 'back';
  touchpoints: JourneyTouchpoint[];
  onAddTouchpoint: () => void;
  onEditTouchpoint: (touchpoint: JourneyTouchpoint) => void;
  onDeleteTouchpoint: (touchpointId: string) => void;
  className?: string;
}

export function SwimLane({
  title,
  type,
  touchpoints,
  onAddTouchpoint,
  onEditTouchpoint,
  onDeleteTouchpoint,
  className,
}: SwimLaneProps) {
  const LaneIcon = type === 'front' ? User : Server;
  
  return (
    <div className={cn('space-y-2', className)}>
      {/* Lane Header */}
      <div className="flex items-center gap-2 px-2 py-1.5">
        <div className={cn(
          'p-1 rounded',
          type === 'front' ? 'bg-chart-1/10' : 'bg-chart-4/10'
        )}>
          <LaneIcon className={cn(
            'h-3.5 w-3.5',
            type === 'front' ? 'text-chart-1' : 'text-chart-4'
          )} />
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Lane Content */}
      <div className={cn(
        'min-h-[100px] p-2 rounded-lg border border-dashed',
        type === 'front' 
          ? 'bg-chart-1/5 border-chart-1/20' 
          : 'bg-chart-4/5 border-chart-4/20',
        'space-y-2'
      )}>
        {touchpoints.length > 0 ? (
          touchpoints.map((touchpoint) => (
            <TouchpointNode
              key={touchpoint.id}
              touchpoint={touchpoint}
              onEdit={() => onEditTouchpoint(touchpoint)}
              onDelete={() => onDeleteTouchpoint(touchpoint.id)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-4 text-center">
            <p className="text-xs text-muted-foreground mb-2">
              No {type === 'front' ? 'customer-facing' : 'internal'} touchpoints
            </p>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full border border-dashed h-8 text-xs"
          onClick={onAddTouchpoint}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add {type === 'front' ? 'Front-Stage' : 'Backstage'}
        </Button>
      </div>
    </div>
  );
}

interface LineOfVisibilityProps {
  className?: string;
}

export function LineOfVisibility({ className }: LineOfVisibilityProps) {
  return (
    <div className={cn('flex items-center gap-2 py-2', className)}>
      <div className="h-px flex-1 border-t-2 border-dashed border-muted-foreground/30" />
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest shrink-0 px-2">
        Line of Visibility
      </span>
      <div className="h-px flex-1 border-t-2 border-dashed border-muted-foreground/30" />
    </div>
  );
}
