import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useJourney,
  useCreateStage,
  useUpdateStage,
  useDeleteStage,
  useCreateTouchpoint,
  useUpdateTouchpoint,
  useDeleteTouchpoint,
  useUpdateJourney,
} from '@/hooks/useJourneys';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Settings, Share2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { JourneyStage, JourneyTouchpoint, JOURNEY_TYPE_LABELS, JOURNEY_TYPE_COLORS } from '@/types/journeys';
import { JourneyCanvas } from '@/components/journeys/JourneyCanvas';
import { StageFormDialog } from '@/components/journeys/dialogs/StageFormDialog';
import { TouchpointFormDialog } from '@/components/journeys/dialogs/TouchpointFormDialog';

export default function JourneyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: journey, isLoading } = useJourney(id);
  const createStage = useCreateStage();
  const updateStage = useUpdateStage();
  const deleteStage = useDeleteStage();
  const createTouchpoint = useCreateTouchpoint();
  const updateTouchpoint = useUpdateTouchpoint();
  const deleteTouchpoint = useDeleteTouchpoint();

  // Dialog state
  const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
  const [isTouchpointDialogOpen, setIsTouchpointDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<JourneyStage | null>(null);
  const [editingTouchpoint, setEditingTouchpoint] = useState<JourneyTouchpoint | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [defaultLane, setDefaultLane] = useState<'front' | 'back'>('front');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
          <p className="text-sm text-muted-foreground">Loading journey blueprint...</p>
        </div>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center p-8 rounded-xl bg-card border shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Journey not found</h2>
          <p className="text-muted-foreground mb-4">
            The journey you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/journeys')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Journeys
          </Button>
        </div>
      </div>
    );
  }

  // Stage handlers
  const handleAddStage = () => {
    setEditingStage(null);
    setIsStageDialogOpen(true);
  };

  const handleEditStage = (stage: JourneyStage) => {
    setEditingStage(stage);
    setIsStageDialogOpen(true);
  };

  const handleSaveStage = async (data: Partial<JourneyStage>) => {
    if (editingStage) {
      await updateStage.mutateAsync({
        id: editingStage.id,
        journey_id: journey.id,
        ...data,
      } as any);
    } else {
      await createStage.mutateAsync({
        journey_id: journey.id,
        stage_order: journey.stages?.length || 0,
        ...data,
      } as any);
    }
    setIsStageDialogOpen(false);
  };

  const handleDeleteStage = async (stageId: string) => {
    if (confirm('Delete this stage and all its touchpoints?')) {
      await deleteStage.mutateAsync({ id: stageId, journey_id: journey.id });
    }
  };

  // Touchpoint handlers
  const handleAddTouchpoint = (stageId: string, lane: 'front' | 'back') => {
    setSelectedStageId(stageId);
    setDefaultLane(lane);
    setEditingTouchpoint(null);
    setIsTouchpointDialogOpen(true);
  };

  const handleEditTouchpoint = (touchpoint: JourneyTouchpoint, stageId: string) => {
    setSelectedStageId(stageId);
    setEditingTouchpoint(touchpoint);
    setDefaultLane((touchpoint as any).lane || 'front');
    setIsTouchpointDialogOpen(true);
  };

  const handleSaveTouchpoint = async (data: any) => {
    if (!selectedStageId) return;

    if (editingTouchpoint) {
      await updateTouchpoint.mutateAsync({
        id: editingTouchpoint.id,
        journey_id: journey.id,
        ...data,
      });
    } else {
      const stage = journey.stages?.find((s) => s.id === selectedStageId);
      await createTouchpoint.mutateAsync({
        journey_id: journey.id,
        stage_id: selectedStageId,
        touchpoint_order: stage?.touchpoints?.length || 0,
        ...data,
      });
    }
    setIsTouchpointDialogOpen(false);
  };

  const handleDeleteTouchpoint = async (touchpointId: string) => {
    if (confirm('Delete this touchpoint?')) {
      await deleteTouchpoint.mutateAsync({ id: touchpointId, journey_id: journey.id });
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Premium Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="mt-1"
            onClick={() => navigate('/journeys')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">{journey.name}</h1>
              <Badge className={JOURNEY_TYPE_COLORS[journey.journey_type]}>
                {JOURNEY_TYPE_LABELS[journey.journey_type]}
              </Badge>
              {journey.is_template && (
                <Badge variant="outline">Template</Badge>
              )}
            </div>
            {journey.description && (
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                {journey.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Journey Settings
              </DropdownMenuItem>
              <DropdownMenuItem>Duplicate Journey</DropdownMenuItem>
              <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Delete Journey
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Premium Canvas */}
      <JourneyCanvas
        journey={journey}
        onAddStage={handleAddStage}
        onEditStage={handleEditStage}
        onDeleteStage={handleDeleteStage}
        onAddTouchpoint={handleAddTouchpoint}
        onEditTouchpoint={handleEditTouchpoint}
        onDeleteTouchpoint={handleDeleteTouchpoint}
      />

      {/* Stage Dialog */}
      <StageFormDialog
        open={isStageDialogOpen}
        onOpenChange={setIsStageDialogOpen}
        stage={editingStage}
        onSave={handleSaveStage}
        isLoading={createStage.isPending || updateStage.isPending}
      />

      {/* Touchpoint Dialog */}
      <TouchpointFormDialog
        open={isTouchpointDialogOpen}
        onOpenChange={setIsTouchpointDialogOpen}
        touchpoint={editingTouchpoint}
        defaultLane={defaultLane}
        onSave={handleSaveTouchpoint}
        isLoading={createTouchpoint.isPending || updateTouchpoint.isPending}
      />
    </div>
  );
}
