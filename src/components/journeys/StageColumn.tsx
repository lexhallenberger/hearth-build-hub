import { cn } from '@/lib/utils';
import { JourneyStage, JourneyTouchpoint } from '@/types/journeys';
import { StageHeader } from './StageHeader';
import { SwimLane, LineOfVisibility } from './SwimLane';
import { Plus, Sparkles } from 'lucide-react';

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

// Stage glow colors
const STAGE_GLOWS = [
  'hover:shadow-purple-500/20',
  'hover:shadow-blue-500/20',
  'hover:shadow-cyan-500/20',
  'hover:shadow-green-500/20',
  'hover:shadow-orange-500/20',
  'hover:shadow-pink-500/20',
];

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
  
  // Separate touchpoints by lane
  const frontStageTouchpoints = touchpoints.filter((t) => (t as any).lane !== 'back');
  const backstageTouchpoints = touchpoints.filter((t) => (t as any).lane === 'back');
  
  const glowClass = STAGE_GLOWS[index % STAGE_GLOWS.length];

  return (
    <div
      className={cn(
        'group min-w-[360px] max-w-[360px] flex-shrink-0 rounded-2xl overflow-hidden',
        'bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl',
        'border border-white/10 shadow-xl',
        'transition-all duration-500 ease-out',
        'hover:scale-[1.01] hover:-translate-y-1',
        'hover:shadow-2xl',
        glowClass,
        className
      )}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Stage Header */}
      <StageHeader
        stage={stage}
        index={index}
        onEdit={onEditStage}
        onDelete={onDeleteStage}
      />

      {/* Swim Lanes Container */}
      <div className="p-4 space-y-3 bg-gradient-to-b from-transparent to-black/5">
        {/* Front-Stage Lane */}
        <SwimLane
          title="Front-Stage"
          subtitle="Customer Experience"
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
          subtitle="Internal Operations"
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
        'group min-w-[240px] max-w-[240px] flex-shrink-0 rounded-2xl',
        'bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm',
        'border-2 border-dashed border-white/20 hover:border-white/40',
        'cursor-pointer transition-all duration-300',
        'flex flex-col items-center justify-center min-h-[400px]',
        'hover:bg-white/5 hover:shadow-xl hover:shadow-accent/10',
        'hover:scale-[1.02] hover:-translate-y-1',
        className
      )}
      onClick={onClick}
    >
      {/* Animated plus icon */}
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-accent/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 group-hover:border-accent/50 transition-all duration-300">
          <Plus className="h-8 w-8 text-accent group-hover:scale-110 transition-transform duration-300" />
        </div>
      </div>
      
      <p className="text-base font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
        Add Stage
      </p>
      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5" />
        Define next phase
      </p>
    </div>
  );
}
