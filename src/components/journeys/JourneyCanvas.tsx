import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Journey, JourneyStage, JourneyTouchpoint } from '@/types/journeys';
import { useJourneyCanvas } from '@/hooks/useJourneyCanvas';
import { JourneyToolbar } from './JourneyToolbar';
import { JourneyMetricsBar } from './JourneyMetricsBar';
import { JourneyLegend } from './JourneyLegend';
import { StageColumn, AddStageCard } from './StageColumn';
import { ConnectionLine } from './ConnectionLine';

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
    <div className={cn('relative flex flex-col h-[calc(100vh-200px)] min-h-[600px]', className)}>
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
          'flex-1 relative overflow-hidden rounded-xl border bg-muted/30',
          isDragging && 'cursor-grabbing',
          !isDragging && 'cursor-grab'
        )}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid Background */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                radial-gradient(circle, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)
              `,
              backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
              backgroundPosition: `${pan.x % (24 * zoom)}px ${pan.y % (24 * zoom)}px`,
            }}
          />
        )}

        {/* Canvas Content */}
        <div
          className="absolute inset-0 flex items-start p-8"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'top left',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
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
                  fromX={index * 344 + 320}
                  fromY={200}
                  toX={(index + 1) * 344}
                  toY={200}
                  animated
                />
              ))}
            </svg>
          )}

          {/* Stage Columns */}
          <div className="flex gap-6">
            {stages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] min-w-[400px] text-center">
                <div className="p-6 rounded-2xl bg-card/80 backdrop-blur-sm border shadow-lg">
                  <h3 className="text-lg font-semibold mb-2">Start Your Journey</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                    Create stages to map out the customer experience from awareness to advocacy
                  </p>
                  <AddStageCard onClick={onAddStage} className="mx-auto" />
                </div>
              </div>
            ) : (
              <>
                {stages.map((stage, index) => (
                  <StageColumn
                    key={stage.id}
                    stage={stage}
                    index={index}
                    onEditStage={() => onEditStage(stage)}
                    onDeleteStage={() => onDeleteStage(stage.id)}
                    onAddTouchpoint={(lane) => onAddTouchpoint(stage.id, lane)}
                    onEditTouchpoint={(tp) => onEditTouchpoint(tp, stage.id)}
                    onDeleteTouchpoint={onDeleteTouchpoint}
                  />
                ))}
                <AddStageCard onClick={onAddStage} />
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <JourneyLegend className="absolute bottom-4 left-4" />

        {/* Help Text */}
        <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-2 py-1 rounded border">
          Alt+Drag to pan • ⌘+Scroll to zoom
        </div>
      </div>
    </div>
  );
}
