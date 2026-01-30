-- =====================================================
-- PHASE 1: Clean up empty journeys (check if deletions already occurred)
-- =====================================================

DELETE FROM journeys WHERE id IN (
  '57c4a4bc-c45a-4954-b209-73968c52554e',
  'c86d20e7-9664-4e17-9568-4e7cca5aa35a'
);

-- =====================================================
-- PHASE 2: Update Partner Enablement Journey
-- =====================================================

UPDATE journeys SET 
  name = 'Channel Partner Enablement',
  description = 'Comprehensive partner lifecycle from recruitment through strategic growth.',
  color = '#8b5cf6'
WHERE id = '6c0e1366-c23a-48a6-9772-f43c00925bdf';

-- Insert Partner Journey Stages (emotion values 1-5)
INSERT INTO journey_stages (journey_id, name, description, stage_order, emotion_start, emotion_end, persona, stage_color, target_conversion_rate, target_time_days) VALUES
('6c0e1366-c23a-48a6-9772-f43c00925bdf', 'Recruitment', 'Identify, qualify, and attract high-potential channel partners', 0, 2, 3, 'Prospective Partner', '#8b5cf6', 25, 30),
('6c0e1366-c23a-48a6-9772-f43c00925bdf', 'Onboarding', 'Legal agreements, system access, and business relationship setup', 1, 3, 4, 'New Partner', '#a855f7', 90, 14),
('6c0e1366-c23a-48a6-9772-f43c00925bdf', 'Enablement', 'Training, certification, and tools provisioning for partner success', 2, 3, 4, 'Partner Rep', '#c084fc', 85, 45),
('6c0e1366-c23a-48a6-9772-f43c00925bdf', 'Activation', 'First deal win and revenue generation kickoff', 3, 4, 5, 'Active Partner', '#d8b4fe', 60, 60),
('6c0e1366-c23a-48a6-9772-f43c00925bdf', 'Performance', 'Ongoing partner management, optimization, and support', 4, 4, 5, 'Producing Partner', '#e9d5ff', 80, 90),
('6c0e1366-c23a-48a6-9772-f43c00925bdf', 'Growth', 'Strategic expansion, tier advancement, and executive alignment', 5, 5, 5, 'Strategic Partner', '#f3e8ff', 40, 180);

-- =====================================================
-- PHASE 3: Update Deal Lifecycle Journey
-- =====================================================

UPDATE journeys SET 
  name = 'Deal Lifecycle',
  description = 'End-to-end deal management from initial qualification through close and handoff.',
  color = '#f59e0b'
WHERE id = 'e6b4c24d-42e0-422b-8b77-3f2514cf3ac7';

INSERT INTO journey_stages (journey_id, name, description, stage_order, emotion_start, emotion_end, persona, stage_color, target_conversion_rate, target_time_days) VALUES
('e6b4c24d-42e0-422b-8b77-3f2514cf3ac7', 'Lead Qualification', 'Initial assessment and scoring of inbound/outbound leads', 0, 2, 3, 'SDR', '#f59e0b', 30, 7),
('e6b4c24d-42e0-422b-8b77-3f2514cf3ac7', 'Discovery', 'Deep-dive into prospect needs, stakeholders, and buying process', 1, 3, 3, 'AE', '#fb923c', 70, 14),
('e6b4c24d-42e0-422b-8b77-3f2514cf3ac7', 'Solution Design', 'Custom solution architecture and proposal development', 2, 3, 4, 'Solutions Architect', '#fdba74', 80, 21),
('e6b4c24d-42e0-422b-8b77-3f2514cf3ac7', 'Business Case', 'ROI, TCO, and value justification for economic buyers', 3, 4, 4, 'AE', '#fed7aa', 75, 14),
('e6b4c24d-42e0-422b-8b77-3f2514cf3ac7', 'Negotiation', 'Terms, pricing, and contract discussions with procurement', 4, 4, 4, 'Deal Desk', '#fef3c7', 85, 21),
('e6b4c24d-42e0-422b-8b77-3f2514cf3ac7', 'Close', 'Contract execution and deal closure', 5, 4, 5, 'AE', '#fef9c3', 90, 7),
('e6b4c24d-42e0-422b-8b77-3f2514cf3ac7', 'Post-Sale', 'Transition to implementation and customer success', 6, 5, 5, 'CSM', '#fefce8', 95, 14);