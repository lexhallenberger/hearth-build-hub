import { cn } from '@/lib/utils';

interface ConnectionLineProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  stageIndex?: number;
  animated?: boolean;
  className?: string;
}

// Stunning gradient colors for each stage connection
const STAGE_GRADIENT_COLORS = [
  { from: '#8B5CF6', to: '#3B82F6' },  // Purple to Blue
  { from: '#3B82F6', to: '#06B6D4' },  // Blue to Cyan
  { from: '#06B6D4', to: '#10B981' },  // Cyan to Green
  { from: '#10B981', to: '#F59E0B' },  // Green to Orange
  { from: '#F59E0B', to: '#EC4899' },  // Orange to Pink
  { from: '#EC4899', to: '#8B5CF6' },  // Pink to Purple
];

export function ConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  stageIndex = 0,
  animated = true,
  className,
}: ConnectionLineProps) {
  const colors = STAGE_GRADIENT_COLORS[stageIndex % STAGE_GRADIENT_COLORS.length];
  const gradientId = `flow-gradient-${stageIndex}`;
  const glowId = `flow-glow-${stageIndex}`;
  
  // Create a beautiful curved path
  const midX = (fromX + toX) / 2;
  const controlOffset = 30;
  const path = `M ${fromX} ${fromY} C ${midX} ${fromY - controlOffset}, ${midX} ${toY + controlOffset}, ${toX} ${toY}`;

  return (
    <g className={cn('connection-line', className)}>
      <defs>
        {/* Stunning gradient for the flow line */}
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors.from} stopOpacity="1" />
          <stop offset="50%" stopColor={colors.to} stopOpacity="1" />
          <stop offset="100%" stopColor={colors.to} stopOpacity="0.6" />
        </linearGradient>
        
        {/* Glow filter for the neon effect */}
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer glow layer */}
      <path
        d={path}
        fill="none"
        stroke={colors.from}
        strokeWidth={12}
        strokeLinecap="round"
        opacity={0.15}
        filter={`url(#${glowId})`}
      />
      
      {/* Middle glow layer */}
      <path
        d={path}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={6}
        strokeLinecap="round"
        opacity={0.3}
      />
      
      {/* Main animated flow line */}
      <path
        d={path}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={animated ? '12 6' : 'none'}
        className={cn(animated && 'animate-flow')}
        style={{ filter: `drop-shadow(0 0 6px ${colors.from})` }}
      />

      {/* Flowing particles effect */}
      <circle r={4} fill={colors.from} opacity={0.9}>
        <animateMotion
          dur="2s"
          repeatCount="indefinite"
          path={path}
        />
      </circle>
      <circle r={3} fill={colors.to} opacity={0.7}>
        <animateMotion
          dur="2s"
          repeatCount="indefinite"
          path={path}
          begin="0.5s"
        />
      </circle>
      <circle r={2} fill="white" opacity={0.5}>
        <animateMotion
          dur="2s"
          repeatCount="indefinite"
          path={path}
          begin="1s"
        />
      </circle>
      
      {/* Destination pulse circle */}
      <circle cx={toX} cy={toY} r={8} fill={colors.to} opacity={0.2}>
        <animate
          attributeName="r"
          values="6;12;6"
          dur="1.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.3;0.1;0.3"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>
      
      {/* Destination dot */}
      <circle
        cx={toX}
        cy={toY}
        r={5}
        fill={colors.to}
        style={{ filter: `drop-shadow(0 0 8px ${colors.to})` }}
      />
    </g>
  );
}
