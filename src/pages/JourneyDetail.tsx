import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJourney, useCreateStage, useUpdateStage, useDeleteStage, useCreateTouchpoint, useUpdateTouchpoint, useDeleteTouchpoint, useUpdateJourney } from '@/hooks/useJourneys';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Loader2, Plus, GripVertical, Trash2, Edit2, MessageCircle, GitBranch, Play, Flag, AlertTriangle, Star } from 'lucide-react';
import { JourneyStage, JourneyTouchpoint, TouchpointType, JOURNEY_TYPE_LABELS, JOURNEY_TYPE_COLORS, TOUCHPOINT_TYPE_LABELS, CHANNEL_OPTIONS } from '@/types/journeys';

const TOUCHPOINT_ICONS: Record<TouchpointType, React.ElementType> = {
  action: Play,
  decision: GitBranch,
  communication: MessageCircle,
  milestone: Flag,
};

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
  const updateJourney = useUpdateJourney();

  const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
  const [isTouchpointDialogOpen, setIsTouchpointDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<JourneyStage | null>(null);
  const [editingTouchpoint, setEditingTouchpoint] = useState<JourneyTouchpoint | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  const [stageForm, setStageForm] = useState({
    name: '',
    description: '',
    target_conversion_rate: '',
    target_time_days: '',
  });

  const [touchpointForm, setTouchpointForm] = useState({
    name: '',
    description: '',
    touchpoint_type: 'action' as TouchpointType,
    channel: '',
    owner_role: '',
    is_moment_of_truth: false,
    pain_point_level: 0,
    value_message: '',
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-lg font-medium">Journey not found</h2>
        <Button className="mt-4" onClick={() => navigate('/journeys')}>
          Back to Journeys
        </Button>
      </div>
    );
  }

  const handleAddStage = () => {
    setEditingStage(null);
    setStageForm({ name: '', description: '', target_conversion_rate: '', target_time_days: '' });
    setIsStageDialogOpen(true);
  };

  const handleEditStage = (stage: JourneyStage) => {
    setEditingStage(stage);
    setStageForm({
      name: stage.name,
      description: stage.description || '',
      target_conversion_rate: stage.target_conversion_rate?.toString() || '',
      target_time_days: stage.target_time_days?.toString() || '',
    });
    setIsStageDialogOpen(true);
  };

  const handleSaveStage = async () => {
    const stageData = {
      name: stageForm.name,
      description: stageForm.description || null,
      target_conversion_rate: stageForm.target_conversion_rate ? parseFloat(stageForm.target_conversion_rate) : null,
      target_time_days: stageForm.target_time_days ? parseInt(stageForm.target_time_days) : null,
    };

    if (editingStage) {
      await updateStage.mutateAsync({
        id: editingStage.id,
        journey_id: journey.id,
        ...stageData,
      });
    } else {
      await createStage.mutateAsync({
        journey_id: journey.id,
        stage_order: (journey.stages?.length || 0),
        ...stageData,
      });
    }

    setIsStageDialogOpen(false);
  };

  const handleDeleteStage = async (stageId: string) => {
    if (confirm('Delete this stage and all its touchpoints?')) {
      await deleteStage.mutateAsync({ id: stageId, journey_id: journey.id });
    }
  };

  const handleAddTouchpoint = (stageId: string) => {
    setSelectedStageId(stageId);
    setEditingTouchpoint(null);
    setTouchpointForm({
      name: '',
      description: '',
      touchpoint_type: 'action',
      channel: '',
      owner_role: '',
      is_moment_of_truth: false,
      pain_point_level: 0,
      value_message: '',
    });
    setIsTouchpointDialogOpen(true);
  };

  const handleEditTouchpoint = (touchpoint: JourneyTouchpoint, stageId: string) => {
    setSelectedStageId(stageId);
    setEditingTouchpoint(touchpoint);
    setTouchpointForm({
      name: touchpoint.name,
      description: touchpoint.description || '',
      touchpoint_type: touchpoint.touchpoint_type,
      channel: touchpoint.channel || '',
      owner_role: touchpoint.owner_role || '',
      is_moment_of_truth: touchpoint.is_moment_of_truth,
      pain_point_level: touchpoint.pain_point_level,
      value_message: touchpoint.value_message || '',
    });
    setIsTouchpointDialogOpen(true);
  };

  const handleSaveTouchpoint = async () => {
    if (!selectedStageId) return;

    const touchpointData = {
      name: touchpointForm.name,
      description: touchpointForm.description || null,
      touchpoint_type: touchpointForm.touchpoint_type,
      channel: touchpointForm.channel || null,
      owner_role: touchpointForm.owner_role || null,
      is_moment_of_truth: touchpointForm.is_moment_of_truth,
      pain_point_level: touchpointForm.pain_point_level,
      value_message: touchpointForm.value_message || null,
    };

    if (editingTouchpoint) {
      await updateTouchpoint.mutateAsync({
        id: editingTouchpoint.id,
        journey_id: journey.id,
        ...touchpointData,
      });
    } else {
      const stage = journey.stages?.find((s) => s.id === selectedStageId);
      await createTouchpoint.mutateAsync({
        journey_id: journey.id,
        stage_id: selectedStageId,
        touchpoint_order: (stage?.touchpoints?.length || 0),
        ...touchpointData,
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/journeys')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{journey.name}</h1>
              <Badge className={JOURNEY_TYPE_COLORS[journey.journey_type]}>
                {JOURNEY_TYPE_LABELS[journey.journey_type]}
              </Badge>
            </div>
            {journey.description && (
              <p className="text-muted-foreground mt-1">{journey.description}</p>
            )}
          </div>
        </div>
        <Button onClick={handleAddStage} className="bg-accent hover:bg-accent/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Stage
        </Button>
      </div>

      {/* Journey Canvas */}
      {!journey.stages || journey.stages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">No stages yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start building your journey by adding stages
              </p>
              <Button onClick={handleAddStage}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Stage
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {journey.stages.map((stage, stageIndex) => (
            <Card
              key={stage.id}
              className="min-w-[300px] max-w-[300px] flex-shrink-0"
              style={{ borderTopColor: journey.color, borderTopWidth: 3 }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <Badge variant="outline" className="text-xs">
                      Stage {stageIndex + 1}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEditStage(stage)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => handleDeleteStage(stage.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-base">{stage.name}</CardTitle>
                {stage.description && (
                  <CardDescription className="text-xs">{stage.description}</CardDescription>
                )}
                {(stage.target_conversion_rate || stage.target_time_days) && (
                  <div className="flex gap-2 mt-2">
                    {stage.target_conversion_rate && (
                      <Badge variant="secondary" className="text-xs">
                        {stage.target_conversion_rate}% target
                      </Badge>
                    )}
                    {stage.target_time_days && (
                      <Badge variant="secondary" className="text-xs">
                        {stage.target_time_days}d target
                      </Badge>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {stage.touchpoints?.map((touchpoint) => {
                  const Icon = TOUCHPOINT_ICONS[touchpoint.touchpoint_type];
                  return (
                    <div
                      key={touchpoint.id}
                      className={`p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors group ${
                        touchpoint.is_moment_of_truth ? 'ring-2 ring-warning' : ''
                      }`}
                      onClick={() => handleEditTouchpoint(touchpoint, stage.id)}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{touchpoint.name}</p>
                            {touchpoint.is_moment_of_truth && (
                              <Star className="h-3 w-3 text-warning fill-warning" />
                            )}
                            {touchpoint.pain_point_level > 2 && (
                              <AlertTriangle className="h-3 w-3 text-destructive" />
                            )}
                          </div>
                          {touchpoint.channel && (
                            <p className="text-xs text-muted-foreground">{touchpoint.channel}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTouchpoint(touchpoint.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                <Button
                  variant="ghost"
                  className="w-full border-2 border-dashed"
                  onClick={() => handleAddTouchpoint(stage.id)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Touchpoint
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* Add Stage Card */}
          <Card
            className="min-w-[200px] max-w-[200px] flex-shrink-0 border-2 border-dashed cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={handleAddStage}
          >
            <CardContent className="flex flex-col items-center justify-center h-full py-8">
              <Plus className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Add Stage</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stage Dialog */}
      <Dialog open={isStageDialogOpen} onOpenChange={setIsStageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStage ? 'Edit Stage' : 'Add Stage'}</DialogTitle>
            <DialogDescription>
              Define a stage in your journey
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stage-name">Stage Name</Label>
              <Input
                id="stage-name"
                value={stageForm.name}
                onChange={(e) => setStageForm({ ...stageForm, name: e.target.value })}
                placeholder="e.g., Awareness, Consideration"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage-description">Description</Label>
              <Textarea
                id="stage-description"
                value={stageForm.description}
                onChange={(e) => setStageForm({ ...stageForm, description: e.target.value })}
                placeholder="What happens in this stage?"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="conversion-rate">Target Conversion (%)</Label>
                <Input
                  id="conversion-rate"
                  type="number"
                  min="0"
                  max="100"
                  value={stageForm.target_conversion_rate}
                  onChange={(e) => setStageForm({ ...stageForm, target_conversion_rate: e.target.value })}
                  placeholder="e.g., 25"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time-days">Target Time (days)</Label>
                <Input
                  id="time-days"
                  type="number"
                  min="0"
                  value={stageForm.target_time_days}
                  onChange={(e) => setStageForm({ ...stageForm, target_time_days: e.target.value })}
                  placeholder="e.g., 7"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveStage} disabled={!stageForm.name}>
              {editingStage ? 'Update' : 'Add'} Stage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Touchpoint Dialog */}
      <Dialog open={isTouchpointDialogOpen} onOpenChange={setIsTouchpointDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTouchpoint ? 'Edit Touchpoint' : 'Add Touchpoint'}</DialogTitle>
            <DialogDescription>
              Define a touchpoint or interaction in this stage
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="tp-name">Touchpoint Name</Label>
              <Input
                id="tp-name"
                value={touchpointForm.name}
                onChange={(e) => setTouchpointForm({ ...touchpointForm, name: e.target.value })}
                placeholder="e.g., Initial Email, Demo Call"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tp-type">Type</Label>
                <Select
                  value={touchpointForm.touchpoint_type}
                  onValueChange={(v) => setTouchpointForm({ ...touchpointForm, touchpoint_type: v as TouchpointType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TOUCHPOINT_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tp-channel">Channel</Label>
                <Select
                  value={touchpointForm.channel}
                  onValueChange={(v) => setTouchpointForm({ ...touchpointForm, channel: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANNEL_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tp-description">Description</Label>
              <Textarea
                id="tp-description"
                value={touchpointForm.description}
                onChange={(e) => setTouchpointForm({ ...touchpointForm, description: e.target.value })}
                placeholder="What happens at this touchpoint?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tp-owner">Owner Role</Label>
              <Input
                id="tp-owner"
                value={touchpointForm.owner_role}
                onChange={(e) => setTouchpointForm({ ...touchpointForm, owner_role: e.target.value })}
                placeholder="e.g., SDR, AE, CSM"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tp-value">Value Message</Label>
              <Textarea
                id="tp-value"
                value={touchpointForm.value_message}
                onChange={(e) => setTouchpointForm({ ...touchpointForm, value_message: e.target.value })}
                placeholder="Key value proposition to communicate"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <Label htmlFor="tp-mot">Moment of Truth</Label>
                <p className="text-xs text-muted-foreground">Critical decision point</p>
              </div>
              <Switch
                id="tp-mot"
                checked={touchpointForm.is_moment_of_truth}
                onCheckedChange={(v) => setTouchpointForm({ ...touchpointForm, is_moment_of_truth: v })}
              />
            </div>
            <div className="space-y-2">
              <Label>Pain Point Level (0-5)</Label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map((level) => (
                  <Button
                    key={level}
                    type="button"
                    variant={touchpointForm.pain_point_level === level ? 'default' : 'outline'}
                    size="sm"
                    className={touchpointForm.pain_point_level === level ? 'bg-accent' : ''}
                    onClick={() => setTouchpointForm({ ...touchpointForm, pain_point_level: level })}
                  >
                    {level}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {touchpointForm.pain_point_level === 0 && 'No friction'}
                {touchpointForm.pain_point_level === 1 && 'Minor friction'}
                {touchpointForm.pain_point_level === 2 && 'Some friction'}
                {touchpointForm.pain_point_level === 3 && 'Moderate friction'}
                {touchpointForm.pain_point_level === 4 && 'High friction'}
                {touchpointForm.pain_point_level === 5 && 'Critical pain point'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTouchpointDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTouchpoint} disabled={!touchpointForm.name}>
              {editingTouchpoint ? 'Update' : 'Add'} Touchpoint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
