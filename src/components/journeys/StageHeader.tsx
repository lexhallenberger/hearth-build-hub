import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { JourneyStage } from '@/types/journeys';
import { EmotionRange } from './EmotionIndicator';
import { PersonaAvatar } from './PersonaAvatar';
import { Edit2, Trash2, GripVertical, Clock, TrendingUp } from 'lucide-react';

interface StageHeaderProps {
  stage: JourneyStage;
  index: number;
  color?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

// Default stage colors based on index
const STAGE_GRADIENTS = [
  'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
  'from-green-500/20 to-green-600/10 border-green-500/30',
  'from-orange-500/20 to-orange-600/10 border-orange-500/30',
  'from-pink-500/20 to-pink-600/10 border-pink-500/30',
];

const STAGE_COLORS = [
  { bg: 'bg-purple-500', text: 'text-purple-500' },
  { bg: 'bg-blue-500', text: 'text-blue-500' },
  { bg: 'bg-cyan-500', text: 'text-cyan-500' },
  { bg: 'bg-green-500', text: 'text-green-500' },
  { bg: 'bg-orange-500', text: 'text-orange-500' },
  { bg: 'bg-pink-500', text: 'text-pink-500' },
];

export function StageHeader({
  stage,
  index,
  color,
  onEdit,
  onDelete,
  className,
}: StageHeaderProps) {
  const gradientClass = STAGE_GRADIENTS[index % STAGE_GRADIENTS.length];
  const colorClass = STAGE_COLORS[index % STAGE_COLORS.length];
  
  const emotionStart = (stage as any).emotion_start as number | undefined;
  const emotionEnd = (stage as any).emotion_end as number | undefined;
  const persona = (stage as any).persona as string | undefined;

  return (
    <div
      className={cn(
        'group p-4 rounded-t-xl border-b-2 bg-gradient-to-br backdrop-blur-sm',
        gradientClass,
        className
      )}
    >
      {/* Top Row - Stage Number & Actions */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
          <Badge 
            variant="outline" 
            className={cn('text-xs font-semibold', colorClass.text, 'border-current')}
          >
            Stage {index + 1}
          </Badge>
        </div>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Stage Title */}
      <div className="flex items-start gap-3">
        {persona && <PersonaAvatar persona={persona} size="md" />}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate">{stage.name}</h3>
          {stage.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
              {stage.description}
            </p>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      {(stage.target_conversion_rate || stage.target_time_days) && (
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-current/10">
          {stage.target_conversion_rate && (
            <div className="flex items-center gap-1.5 text-xs">
              <TrendingUp className="h-3.5 w-3.5 text-success" />
              <span className="font-medium">{stage.target_conversion_rate}%</span>
              <span className="text-muted-foreground">target</span>
            </div>
          )}
          {stage.target_time_days && (
            <div className="flex items-center gap-1.5 text-xs">
              <Clock className="h-3.5 w-3.5 text-chart-1" />
              <span className="font-medium">{stage.target_time_days}d</span>
              <span className="text-muted-foreground">target</span>
            </div>
          )}
        </div>
      )}

      {/* Emotion Arc */}
      {emotionStart && emotionEnd && (
        <div className="mt-3 pt-3 border-t border-current/10">
          <EmotionRange start={emotionStart} end={emotionEnd} />
        </div>
      )}
    </div>
  );
}
