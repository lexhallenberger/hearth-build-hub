import { cn } from '@/lib/utils';
import { JourneyTouchpoint } from '@/types/journeys';
import { TouchpointNode } from './TouchpointNode';
import { Button } from '@/components/ui/button';
import { Plus, User, Server, Eye, Sparkles } from 'lucide-react';

interface SwimLaneProps {
  title: string;
  subtitle?: string;
  type: 'front' | 'back';
  touchpoints: JourneyTouchpoint[];
  onAddTouchpoint: () => void;
  onEditTouchpoint: (touchpoint: JourneyTouchpoint) => void;
  onDeleteTouchpoint: (touchpointId: string) => void;
  className?: string;
}

export function SwimLane({
  title,
  subtitle,
  type,
  touchpoints,
  onAddTouchpoint,
  onEditTouchpoint,
  onDeleteTouchpoint,
  className,
}: SwimLaneProps) {
  const LaneIcon = type === 'front' ? User : Server;
  const isFront = type === 'front';
  
  return (
    <div className={cn('space-y-2', className)}>
      {/* Lane Header */}
      <div className="flex items-center gap-3 px-1">
        <div className={cn(
          'flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
          isFront 
            ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 text-blue-400' 
            : 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 text-purple-400'
        )}>
          <LaneIcon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <span className={cn(
            'text-xs font-bold uppercase tracking-wider',
            isFront ? 'text-blue-400' : 'text-purple-400'
          )}>
            {title}
          </span>
          {subtitle && (
            <p className="text-[10px] text-muted-foreground -mt-0.5">{subtitle}</p>
          )}
        </div>
        <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">
          {touchpoints.length}
        </span>
      </div>

      {/* Lane Content */}
      <div className={cn(
        'min-h-[120px] p-3 rounded-xl border transition-all duration-300',
        isFront 
          ? 'bg-gradient-to-b from-blue-500/5 to-transparent border-blue-500/20 hover:border-blue-500/30' 
          : 'bg-gradient-to-b from-purple-500/5 to-transparent border-purple-500/20 hover:border-purple-500/30',
        'space-y-2'
      )}>
        {touchpoints.length > 0 ? (
          touchpoints.map((touchpoint, idx) => (
            <div 
              key={touchpoint.id} 
              className="animate-stagger-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <TouchpointNode
                touchpoint={touchpoint}
                onEdit={() => onEditTouchpoint(touchpoint)}
                onDelete={() => onDeleteTouchpoint(touchpoint.id)}
              />
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-6 text-center">
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center mb-2',
              isFront ? 'bg-blue-500/10' : 'bg-purple-500/10'
            )}>
              {isFront ? (
                <Eye className={cn('h-5 w-5', isFront ? 'text-blue-400' : 'text-purple-400')} />
              ) : (
                <Sparkles className="h-5 w-5 text-purple-400" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              No {isFront ? 'customer-facing' : 'internal'} touchpoints
            </p>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'w-full border border-dashed h-10 text-xs rounded-lg',
            'hover:bg-white/5 transition-all duration-300',
            isFront 
              ? 'border-blue-500/30 hover:border-blue-500/50 text-blue-400' 
              : 'border-purple-500/30 hover:border-purple-500/50 text-purple-400'
          )}
          onClick={onAddTouchpoint}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add {isFront ? 'Customer' : 'Internal'} Touchpoint
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
    <div className={cn('flex items-center gap-3 py-3', className)}>
      <div className="flex-1 relative h-px">
        {/* Gradient line */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        {/* Animated glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent blur-sm" />
      </div>
      
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
        <Eye className="h-3 w-3 text-amber-400" />
        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
          Line of Visibility
        </span>
      </div>
      
      <div className="flex-1 relative h-px">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent blur-sm" />
      </div>
    </div>
  );
}
