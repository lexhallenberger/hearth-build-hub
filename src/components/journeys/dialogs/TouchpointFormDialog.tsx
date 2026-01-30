import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
import { JourneyTouchpoint, TouchpointType, TOUCHPOINT_TYPE_LABELS, CHANNEL_OPTIONS } from '@/types/journeys';
import { EmotionIndicator } from '../EmotionIndicator';
import { TouchpointNode } from '../TouchpointNode';
import { Star, AlertTriangle, X } from 'lucide-react';

interface TouchpointFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  touchpoint?: JourneyTouchpoint | null;
  defaultLane?: 'front' | 'back';
  onSave: (data: Partial<JourneyTouchpoint> & { lane?: string; emotion?: number; systems?: string[]; kpis?: string[] }) => void;
  isLoading?: boolean;
}

const SYSTEM_OPTIONS = [
  'CRM',
  'Marketing Automation',
  'Email System',
  'Analytics Platform',
  'Support Ticketing',
  'Billing System',
  'ERP',
  'Data Warehouse',
  'Custom Integration',
];

export function TouchpointFormDialog({
  open,
  onOpenChange,
  touchpoint,
  defaultLane = 'front',
  onSave,
  isLoading,
}: TouchpointFormDialogProps) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    touchpoint_type: 'action' as TouchpointType,
    channel: '',
    owner_role: '',
    is_moment_of_truth: false,
    pain_point_level: 0,
    value_message: '',
    lane: defaultLane,
    emotion: 3,
    systems: [] as string[],
    kpis: [] as string[],
    newKpi: '',
  });

  useEffect(() => {
    if (touchpoint) {
      setForm({
        name: touchpoint.name,
        description: touchpoint.description || '',
        touchpoint_type: touchpoint.touchpoint_type,
        channel: touchpoint.channel || '',
        owner_role: touchpoint.owner_role || '',
        is_moment_of_truth: touchpoint.is_moment_of_truth,
        pain_point_level: touchpoint.pain_point_level,
        value_message: touchpoint.value_message || '',
        lane: (touchpoint as any).lane || 'front',
        emotion: (touchpoint as any).emotion || 3,
        systems: (touchpoint as any).systems || [],
        kpis: (touchpoint as any).kpis || [],
        newKpi: '',
      });
    } else {
      setForm({
        name: '',
        description: '',
        touchpoint_type: 'action',
        channel: '',
        owner_role: '',
        is_moment_of_truth: false,
        pain_point_level: 0,
        value_message: '',
        lane: defaultLane,
        emotion: 3,
        systems: [],
        kpis: [],
        newKpi: '',
      });
    }
  }, [touchpoint, defaultLane, open]);

  const handleAddKpi = () => {
    if (form.newKpi.trim()) {
      setForm({
        ...form,
        kpis: [...form.kpis, form.newKpi.trim()],
        newKpi: '',
      });
    }
  };

  const handleRemoveKpi = (index: number) => {
    setForm({
      ...form,
      kpis: form.kpis.filter((_, i) => i !== index),
    });
  };

  const handleSave = () => {
    onSave({
      name: form.name,
      description: form.description || null,
      touchpoint_type: form.touchpoint_type,
      channel: form.channel || null,
      owner_role: form.owner_role || null,
      is_moment_of_truth: form.is_moment_of_truth,
      pain_point_level: form.pain_point_level,
      value_message: form.value_message || null,
      lane: form.lane,
      emotion: form.emotion,
      systems: form.systems,
      kpis: form.kpis,
    });
  };

  // Create a preview touchpoint
  const previewTouchpoint: JourneyTouchpoint = {
    id: 'preview',
    stage_id: '',
    name: form.name || 'Touchpoint Name',
    description: form.description,
    touchpoint_type: form.touchpoint_type,
    touchpoint_order: 0,
    channel: form.channel,
    owner_role: form.owner_role,
    is_moment_of_truth: form.is_moment_of_truth,
    pain_point_level: form.pain_point_level,
    value_message: form.value_message,
    created_at: '',
    updated_at: '',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{touchpoint ? 'Edit Touchpoint' : 'Add Touchpoint'}</DialogTitle>
          <DialogDescription>
            Define a customer interaction or internal process step
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          {/* Form Column */}
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Lane Selection */}
            <div className="space-y-2">
              <Label>Lane</Label>
              <Select
                value={form.lane}
                onValueChange={(v) => setForm({ ...form, lane: v as 'front' | 'back' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="front">Front-Stage (Customer-facing)</SelectItem>
                  <SelectItem value="back">Backstage (Internal)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Basic Info */}
            <div className="space-y-2">
              <Label htmlFor="tp-name">Name</Label>
              <Input
                id="tp-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Initial Email, Demo Call"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tp-description">Description</Label>
              <Textarea
                id="tp-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.touchpoint_type}
                  onValueChange={(v) => setForm({ ...form, touchpoint_type: v as TouchpointType })}
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
                <Label>Channel</Label>
                <Select
                  value={form.channel}
                  onValueChange={(v) => setForm({ ...form, channel: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANNEL_OPTIONS.map((channel) => (
                      <SelectItem key={channel.value} value={channel.value}>
                        {channel.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner-role">Owner Role</Label>
              <Input
                id="owner-role"
                value={form.owner_role}
                onChange={(e) => setForm({ ...form, owner_role: e.target.value })}
                placeholder="e.g., Sales Rep, CSM"
              />
            </div>

            {/* Moment of Truth & Pain Point */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-warning" />
                <Label htmlFor="moment-of-truth" className="cursor-pointer">
                  Moment of Truth
                </Label>
              </div>
              <Switch
                id="moment-of-truth"
                checked={form.is_moment_of_truth}
                onCheckedChange={(v) => setForm({ ...form, is_moment_of_truth: v })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Pain Point Level
                </Label>
                <span className="text-sm font-medium">{form.pain_point_level}/5</span>
              </div>
              <Slider
                value={[form.pain_point_level]}
                onValueChange={([v]) => setForm({ ...form, pain_point_level: v })}
                min={0}
                max={5}
                step={1}
              />
            </div>

            {/* Emotion (for front-stage) */}
            {form.lane === 'front' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Customer Emotion</Label>
                  <EmotionIndicator level={form.emotion} showLabel size="sm" />
                </div>
                <Slider
                  value={[form.emotion]}
                  onValueChange={([v]) => setForm({ ...form, emotion: v })}
                  min={1}
                  max={5}
                  step={1}
                />
              </div>
            )}

            {/* Systems (for backstage) */}
            {form.lane === 'back' && (
              <div className="space-y-2">
                <Label>Supporting Systems</Label>
                <Select
                  value=""
                  onValueChange={(v) => {
                    if (!form.systems.includes(v)) {
                      setForm({ ...form, systems: [...form.systems, v] });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add system..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SYSTEM_OPTIONS.filter((s) => !form.systems.includes(s)).map((system) => (
                      <SelectItem key={system} value={system}>
                        {system}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-1">
                  {form.systems.map((system, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {system}
                      <button
                        type="button"
                        className="ml-1 hover:text-destructive"
                        onClick={() =>
                          setForm({ ...form, systems: form.systems.filter((_, idx) => idx !== i) })
                        }
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* KPIs (for backstage) */}
            {form.lane === 'back' && (
              <div className="space-y-2">
                <Label>KPIs</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.newKpi}
                    onChange={(e) => setForm({ ...form, newKpi: e.target.value })}
                    placeholder="Add KPI..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKpi())}
                  />
                  <Button type="button" variant="secondary" onClick={handleAddKpi}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {form.kpis.map((kpi, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {kpi}
                      <button
                        type="button"
                        className="ml-1 hover:text-destructive"
                        onClick={() => handleRemoveKpi(i)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Value Message */}
            <div className="space-y-2">
              <Label htmlFor="value-message">Value Message</Label>
              <Textarea
                id="value-message"
                value={form.value_message}
                onChange={(e) => setForm({ ...form, value_message: e.target.value })}
                placeholder="Key message or value proposition..."
                rows={2}
              />
            </div>
          </div>

          {/* Preview Column */}
          <div className="space-y-4">
            <Label>Preview</Label>
            <div className="p-4 rounded-lg bg-muted/30 border-2 border-dashed">
              <TouchpointNode touchpoint={previewTouchpoint} />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              This is how your touchpoint will appear
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!form.name || isLoading}>
            {touchpoint ? 'Update' : 'Add'} Touchpoint
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
