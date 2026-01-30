import { cn } from '@/lib/utils';
import { JourneyStage, JourneyTouchpoint } from '@/types/journeys';
import { StageHeader } from './StageHeader';
import { SwimLane, LineOfVisibility } from './SwimLane';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface StageColumnProps {
  stage: JourneyStage;
  index: number;
  onEditStage: () => void;
  onDeleteStage: () => void;
  onAddTouchpoint: (lane: 'front' | 'back') => void;
  onEditTouchpoint: (touchpoint: JourneyTouchpoint) => void;
  onDeleteTouchpoint: (touchpointId: string) => void;
  className?: string;
}

export function StageColumn({
  stage,
  index,
  onEditStage,
  onDeleteStage,
  onAddTouchpoint,
  onEditTouchpoint,
  onDeleteTouchpoint,
  className,
}: StageColumnProps) {
  const touchpoints = stage.touchpoints || [];
  
  // Separate touchpoints by lane - using type assertion for new field
  const frontStageTouchpoints = touchpoints.filter((t) => (t as any).lane !== 'back');
  const backstageTouchpoints = touchpoints.filter((t) => (t as any).lane === 'back');

  return (
    <div
      className={cn(
        'min-w-[320px] max-w-[320px] flex-shrink-0 rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden',
        'hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      {/* Stage Header */}
      <StageHeader
        stage={stage}
        index={index}
        onEdit={onEditStage}
        onDelete={onDeleteStage}
      />

      {/* Swim Lanes */}
      <div className="p-3 space-y-1">
        {/* Front-Stage Lane */}
        <SwimLane
          title="Front-Stage"
          type="front"
          touchpoints={frontStageTouchpoints}
          onAddTouchpoint={() => onAddTouchpoint('front')}
          onEditTouchpoint={onEditTouchpoint}
          onDeleteTouchpoint={onDeleteTouchpoint}
        />

        {/* Line of Visibility */}
        <LineOfVisibility />

        {/* Backstage Lane */}
        <SwimLane
          title="Backstage"
          type="back"
          touchpoints={backstageTouchpoints}
          onAddTouchpoint={() => onAddTouchpoint('back')}
          onEditTouchpoint={onEditTouchpoint}
          onDeleteTouchpoint={onDeleteTouchpoint}
        />
      </div>
    </div>
  );
}

interface AddStageCardProps {
  onClick: () => void;
  className?: string;
}

export function AddStageCard({ onClick, className }: AddStageCardProps) {
  return (
    <div
      className={cn(
        'min-w-[200px] max-w-[200px] flex-shrink-0 rounded-xl border-2 border-dashed',
        'bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors',
        'flex flex-col items-center justify-center min-h-[300px]',
        className
      )}
      onClick={onClick}
    >
      <div className="p-4 rounded-full bg-muted/50 mb-3">
        <Plus className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">Add Stage</p>
      <p className="text-xs text-muted-foreground mt-1">Define next phase</p>
    </div>
  );
}
