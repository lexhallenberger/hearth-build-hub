-- Add enhanced fields to journey_stages table for service blueprint visualization
ALTER TABLE public.journey_stages
ADD COLUMN IF NOT EXISTS emotion_start integer CHECK (emotion_start >= 1 AND emotion_start <= 5),
ADD COLUMN IF NOT EXISTS emotion_end integer CHECK (emotion_end >= 1 AND emotion_end <= 5),
ADD COLUMN IF NOT EXISTS persona text,
ADD COLUMN IF NOT EXISTS stage_color text;

-- Add enhanced fields to journey_touchpoints table for service blueprint visualization
ALTER TABLE public.journey_touchpoints
ADD COLUMN IF NOT EXISTS lane text DEFAULT 'front' CHECK (lane IN ('front', 'back')),
ADD COLUMN IF NOT EXISTS emotion integer CHECK (emotion >= 1 AND emotion <= 5),
ADD COLUMN IF NOT EXISTS systems text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS kpis text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS position_x integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS position_y integer DEFAULT 0;