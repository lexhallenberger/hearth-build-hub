import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Journey, JourneyStage, JourneyTouchpoint } from '@/types/journeys';
import { useJourneyCanvas } from '@/hooks/useJourneyCanvas';
import { JourneyToolbar } from './JourneyToolbar';
import { JourneyMetricsBar } from './JourneyMetricsBar';
import { JourneyLegend } from './JourneyLegend';
import { StageColumn, AddStageCard } from './StageColumn';
import { ConnectionLine } from './ConnectionLine';
import { Sparkles, Map } from 'lucide-react';

interface JourneyCanvasProps {
  journey: Journey;
  onAddStage: () => void;
  onEditStage: (stage: JourneyStage) => void;
  onDeleteStage: (stageId: string) => void;
  onAddTouchpoint: (stageId: string, lane: 'front' | 'back') => void;
  onEditTouchpoint: (touchpoint: JourneyTouchpoint, stageId: string) => void;
  onDeleteTouchpoint: (touchpointId: string) => void;
  className?: string;
}

export function JourneyCanvas({
  journey,
  onAddStage,
  onEditStage,
  onDeleteStage,
  onAddTouchpoint,
  onEditTouchpoint,
  onDeleteTouchpoint,
  className,
}: JourneyCanvasProps) {
  const [showGrid, setShowGrid] = useState(true);
  const [showConnections, setShowConnections] = useState(true);
  
  const {
    zoom,
    pan,
    isDragging,
    containerRef,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleFitToScreen,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useJourneyCanvas();

  const stages = journey.stages || [];

  return (
    <div className={cn('relative flex flex-col h-[calc(100vh-180px)] min-h-[650px]', className)}>
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <JourneyMetricsBar journey={journey} className="flex-1" />
        <JourneyToolbar
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          onFitToScreen={handleFitToScreen}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          showConnections={showConnections}
          onToggleConnections={() => setShowConnections(!showConnections)}
        />
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className={cn(
          'flex-1 relative overflow-hidden rounded-2xl',
          'bg-gradient-to-br from-background via-background to-muted/30',
          'border border-white/10 shadow-2xl',
          isDragging && 'cursor-grabbing',
          !isDragging && 'cursor-grab'
        )}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Ambient background gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
        </div>

        {/* Grid Background */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                radial-gradient(circle, hsl(var(--muted-foreground) / 0.12) 1px, transparent 1px)
              `,
              backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
              backgroundPosition: `${pan.x % (32 * zoom)}px ${pan.y % (32 * zoom)}px`,
            }}
          />
        )}

        {/* Canvas Content */}
        <div
          className="absolute inset-0 flex items-start p-10"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'top left',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          {/* Connection Lines SVG Layer */}
          {showConnections && stages.length > 1 && (
            <svg
              className="absolute inset-0 pointer-events-none overflow-visible"
              style={{ width: '100%', height: '100%' }}
            >
              {stages.slice(0, -1).map((stage, index) => (
                <ConnectionLine
                  key={`connection-${stage.id}`}
                  fromX={index * 400 + 360}
                  fromY={250}
                  toX={(index + 1) * 400}
                  toY={250}
                  stageIndex={index}
                  animated
                />
              ))}
            </svg>
          )}

          {/* Stage Columns */}
          <div className="flex gap-10">
            {stages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[500px] min-w-[600px] text-center">
                <div className="relative p-10 rounded-3xl bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl">
                  {/* Decorative elements */}
                  <div className="absolute -top-6 -right-6 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl" />
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-500/20 rounded-full blur-xl" />
                  
                  <div className="relative">
                    <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30">
                      <Map className="h-10 w-10 text-accent" />
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                      Start Your Journey Blueprint
                    </h3>
                    <p className="text-muted-foreground mb-8 max-w-md">
                      Create stages to map out the complete customer experience from first awareness to loyal advocacy
                    </p>
                    
                    <AddStageCard onClick={onAddStage} className="mx-auto min-h-[200px]" />
                  </div>
                </div>
              </div>
            ) : (
              <>
                {stages.map((stage, index) => (
                  <div 
                    key={stage.id}
                    className="animate-stagger-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <StageColumn
                      stage={stage}
                      index={index}
                      onEditStage={() => onEditStage(stage)}
                      onDeleteStage={() => onDeleteStage(stage.id)}
                      onAddTouchpoint={(lane) => onAddTouchpoint(stage.id, lane)}
                      onEditTouchpoint={(tp) => onEditTouchpoint(tp, stage.id)}
                      onDeleteTouchpoint={onDeleteTouchpoint}
                    />
                  </div>
                ))}
                <div className="animate-stagger-in" style={{ animationDelay: `${stages.length * 100}ms` }}>
                  <AddStageCard onClick={onAddStage} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <JourneyLegend className="absolute bottom-4 left-4" />

        {/* Help Text */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-muted-foreground bg-card/60 backdrop-blur-md px-3 py-2 rounded-full border border-white/10 shadow-lg">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span>Alt+Drag to pan</span>
          <span className="text-muted-foreground/50">•</span>
          <span>⌘+Scroll to zoom</span>
        </div>
      </div>
    </div>
  );
}
