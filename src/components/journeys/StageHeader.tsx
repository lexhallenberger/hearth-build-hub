import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { JourneyStage } from '@/types/journeys';
import { EmotionRange } from './EmotionIndicator';
import { PersonaAvatar } from './PersonaAvatar';
import { Edit2, Trash2, GripVertical, Clock, TrendingUp, Sparkles } from 'lucide-react';

interface StageHeaderProps {
  stage: JourneyStage;
  index: number;
  color?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

// Stunning stage visual configurations
const STAGE_CONFIGS = [
  { 
    gradient: 'from-purple-600 via-purple-500 to-violet-400',
    glow: 'shadow-purple-500/30',
    accent: 'purple',
    border: 'border-purple-400/50',
    icon: '🔮',
  },
  { 
    gradient: 'from-blue-600 via-blue-500 to-sky-400',
    glow: 'shadow-blue-500/30',
    accent: 'blue',
    border: 'border-blue-400/50',
    icon: '🌊',
  },
  { 
    gradient: 'from-cyan-600 via-cyan-500 to-teal-400',
    glow: 'shadow-cyan-500/30',
    accent: 'cyan',
    border: 'border-cyan-400/50',
    icon: '💎',
  },
  { 
    gradient: 'from-emerald-600 via-green-500 to-lime-400',
    glow: 'shadow-green-500/30',
    accent: 'green',
    border: 'border-green-400/50',
    icon: '🚀',
  },
  { 
    gradient: 'from-orange-600 via-amber-500 to-yellow-400',
    glow: 'shadow-orange-500/30',
    accent: 'orange',
    border: 'border-orange-400/50',
    icon: '⭐',
  },
  { 
    gradient: 'from-pink-600 via-rose-500 to-red-400',
    glow: 'shadow-pink-500/30',
    accent: 'pink',
    border: 'border-pink-400/50',
    icon: '💖',
  },
];

export function StageHeader({
  stage,
  index,
  color,
  onEdit,
  onDelete,
  className,
}: StageHeaderProps) {
  const config = STAGE_CONFIGS[index % STAGE_CONFIGS.length];
  
  const emotionStart = (stage as any).emotion_start as number | undefined;
  const emotionEnd = (stage as any).emotion_end as number | undefined;
  const persona = (stage as any).persona as string | undefined;

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Animated background gradient */}
      <div 
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-90',
          config.gradient
        )}
      />
      
      {/* Shimmer overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
      
      {/* Glass morphism overlay */}
      <div className="absolute inset-0 backdrop-blur-[1px] bg-white/5" />
      
      {/* Decorative elements */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-black/10 blur-xl" />
      
      {/* Content */}
      <div className="relative p-5">
        {/* Top Row - Stage Badge & Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
              <span className="text-xl">{config.icon}</span>
            </div>
            <div>
              <Badge 
                variant="outline" 
                className="bg-white/20 border-white/40 text-white font-bold text-xs backdrop-blur-sm"
              >
                STAGE {index + 1}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-1">
            <GripVertical className="h-5 w-5 text-white/50 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
            {onEdit && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all" 
                onClick={onEdit}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/70 hover:text-red-200 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Stage Title with Persona */}
        <div className="flex items-start gap-3 mb-4">
          {persona && (
            <div className="relative">
              <PersonaAvatar persona={persona} size="lg" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl text-white drop-shadow-md truncate">
              {stage.name}
            </h3>
            {stage.description && (
              <p className="text-sm text-white/80 line-clamp-2 mt-1">
                {stage.description}
              </p>
            )}
          </div>
        </div>

        {/* Metrics Cards */}
        {(stage.target_conversion_rate || stage.target_time_days) && (
          <div className="flex gap-2 mb-4">
            {stage.target_conversion_rate && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/15 backdrop-blur-sm border border-white/20">
                <TrendingUp className="h-4 w-4 text-white" />
                <div>
                  <p className="text-lg font-bold text-white leading-none">
                    {stage.target_conversion_rate}%
                  </p>
                  <p className="text-[10px] text-white/70 uppercase tracking-wide">
                    Target
                  </p>
                </div>
              </div>
            )}
            {stage.target_time_days && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/15 backdrop-blur-sm border border-white/20">
                <Clock className="h-4 w-4 text-white" />
                <div>
                  <p className="text-lg font-bold text-white leading-none">
                    {stage.target_time_days}d
                  </p>
                  <p className="text-[10px] text-white/70 uppercase tracking-wide">
                    Duration
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Emotion Arc */}
        {emotionStart && emotionEnd && (
          <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
            <p className="text-[10px] text-white/70 uppercase tracking-wide mb-2 font-medium">
              Customer Emotion Journey
            </p>
            <EmotionRange start={emotionStart} end={emotionEnd} />
          </div>
        )}
      </div>
    </div>
  );
}
