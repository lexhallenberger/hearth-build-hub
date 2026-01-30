import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
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
import { JourneyStage } from '@/types/journeys';
import { EmotionIndicator } from '../EmotionIndicator';
import { PERSONA_OPTIONS } from '../PersonaAvatar';

interface StageFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage?: JourneyStage | null;
  onSave: (data: Partial<JourneyStage>) => void;
  isLoading?: boolean;
}

const STAGE_COLORS = [
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#3B82F6', label: 'Blue' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#10B981', label: 'Green' },
  { value: '#F59E0B', label: 'Orange' },
  { value: '#EC4899', label: 'Pink' },
];

export function StageFormDialog({
  open,
  onOpenChange,
  stage,
  onSave,
  isLoading,
}: StageFormDialogProps) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    target_conversion_rate: '',
    target_time_days: '',
    emotion_start: 3,
    emotion_end: 3,
    persona: '',
    stage_color: '#3B82F6',
  });

  useEffect(() => {
    if (stage) {
      setForm({
        name: stage.name,
        description: stage.description || '',
        target_conversion_rate: stage.target_conversion_rate?.toString() || '',
        target_time_days: stage.target_time_days?.toString() || '',
        emotion_start: (stage as any).emotion_start || 3,
        emotion_end: (stage as any).emotion_end || 3,
        persona: (stage as any).persona || '',
        stage_color: (stage as any).stage_color || '#3B82F6',
      });
    } else {
      setForm({
        name: '',
        description: '',
        target_conversion_rate: '',
        target_time_days: '',
        emotion_start: 3,
        emotion_end: 3,
        persona: '',
        stage_color: '#3B82F6',
      });
    }
  }, [stage, open]);

  const handleSave = () => {
    onSave({
      name: form.name,
      description: form.description || null,
      target_conversion_rate: form.target_conversion_rate
        ? parseFloat(form.target_conversion_rate)
        : null,
      target_time_days: form.target_time_days
        ? parseInt(form.target_time_days)
        : null,
      ...(({
        emotion_start: form.emotion_start,
        emotion_end: form.emotion_end,
        persona: form.persona || null,
        stage_color: form.stage_color,
      }) as any),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{stage ? 'Edit Stage' : 'Add Stage'}</DialogTitle>
          <DialogDescription>
            Define a stage in your customer journey blueprint
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4 max-h-[60vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="space-y-2">
            <Label htmlFor="stage-name">Stage Name</Label>
            <Input
              id="stage-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Discover, Explore, Engage"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage-description">Description</Label>
            <Textarea
              id="stage-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What happens in this stage?"
              rows={2}
            />
          </div>

          {/* Targets */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="conversion-rate">Target Conversion (%)</Label>
              <Input
                id="conversion-rate"
                type="number"
                min="0"
                max="100"
                value={form.target_conversion_rate}
                onChange={(e) =>
                  setForm({ ...form, target_conversion_rate: e.target.value })
                }
                placeholder="e.g., 25"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time-days">Target Time (days)</Label>
              <Input
                id="time-days"
                type="number"
                min="0"
                value={form.target_time_days}
                onChange={(e) =>
                  setForm({ ...form, target_time_days: e.target.value })
                }
                placeholder="e.g., 7"
              />
            </div>
          </div>

          {/* Persona */}
          <div className="space-y-2">
            <Label>Target Persona</Label>
            <Select
              value={form.persona}
              onValueChange={(v) => setForm({ ...form, persona: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select persona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {PERSONA_OPTIONS.map((persona) => (
                  <SelectItem key={persona} value={persona}>
                    {persona}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stage Color */}
          <div className="space-y-2">
            <Label>Stage Color</Label>
            <div className="flex gap-2">
              {STAGE_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    form.stage_color === color.value
                      ? 'border-foreground scale-110'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setForm({ ...form, stage_color: color.value })}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Emotion Range */}
          <div className="space-y-4 p-4 rounded-lg bg-muted/50">
            <Label>Customer Emotion Journey</Label>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Starting emotion</span>
                <EmotionIndicator level={form.emotion_start} showLabel size="sm" />
              </div>
              <Slider
                value={[form.emotion_start]}
                onValueChange={([v]) => setForm({ ...form, emotion_start: v })}
                min={1}
                max={5}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Ending emotion</span>
                <EmotionIndicator level={form.emotion_end} showLabel size="sm" />
              </div>
              <Slider
                value={[form.emotion_end]}
                onValueChange={([v]) => setForm({ ...form, emotion_end: v })}
                min={1}
                max={5}
                step={1}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!form.name || isLoading}>
            {stage ? 'Update' : 'Add'} Stage
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
