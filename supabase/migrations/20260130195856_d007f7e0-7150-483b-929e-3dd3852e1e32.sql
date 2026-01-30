-- =====================================================
-- PARTNER ENABLEMENT JOURNEY TOUCHPOINTS
-- =====================================================

-- Stage 1: Recruitment (5ed13235-eac8-4f08-a52f-9d5a78249191)
INSERT INTO journey_touchpoints (stage_id, name, description, touchpoint_type, touchpoint_order, lane, channel, owner_role, is_moment_of_truth, pain_point_level, value_message, systems, kpis) VALUES
('5ed13235-eac8-4f08-a52f-9d5a78249191', 'Partner Portal Discovery', 'Prospective partner discovers partner program via web search or referral', 'action', 0, 'front', 'web', 'Marketing', false, 2, 'Join a partner ecosystem that accelerates your growth', ARRAY['Website', 'CMS'], ARRAY['Portal traffic', 'Referral sources']),
('5ed13235-eac8-4f08-a52f-9d5a78249191', 'Initial Application Form', 'Partner completes online application with company details', 'action', 1, 'front', 'web', 'Partner Manager', true, 3, 'Tell us about your business', ARRAY['PRM', 'CRM'], ARRAY['Application completion rate']),
('5ed13235-eac8-4f08-a52f-9d5a78249191', 'Lead Enrichment', 'Research partner company background and market fit', 'action', 2, 'back', 'system', 'Partner Ops', false, 1, NULL, ARRAY['ZoomInfo', 'LinkedIn'], ARRAY['Enrichment accuracy']),
('5ed13235-eac8-4f08-a52f-9d5a78249191', 'Credit & Background Check', 'Financial and reputation verification', 'action', 3, 'back', 'system', 'Finance', false, 2, NULL, ARRAY['D&B', 'Credit Bureau'], ARRAY['Check completion time']),
('5ed13235-eac8-4f08-a52f-9d5a78249191', 'Territory Validation', 'Confirm territory alignment', 'decision', 4, 'back', 'internal', 'Channel Director', false, 3, NULL, ARRAY['Territory Map'], ARRAY['Territory conflicts']),
('5ed13235-eac8-4f08-a52f-9d5a78249191', 'Qualification Assessment', 'Video call to assess partner capabilities', 'communication', 5, 'front', 'meeting', 'Partner Manager', true, 4, 'Explore how we can drive mutual success', ARRAY['Zoom', 'CRM'], ARRAY['Assessment pass rate']),
('5ed13235-eac8-4f08-a52f-9d5a78249191', 'Partner Fit Scoring', 'Automated scoring based on criteria', 'milestone', 6, 'back', 'system', 'Partner Ops', false, 2, NULL, ARRAY['PRM', 'Scoring Engine'], ARRAY['Fit score distribution']);

-- Stage 2: Onboarding (778d435a-9fb3-4bf2-8fa5-e39e5bef13e2)
INSERT INTO journey_touchpoints (stage_id, name, description, touchpoint_type, touchpoint_order, lane, channel, owner_role, is_moment_of_truth, pain_point_level, value_message, systems, kpis) VALUES
('778d435a-9fb3-4bf2-8fa5-e39e5bef13e2', 'Welcome Package Delivery', 'Send branded welcome kit with partnership materials', 'communication', 0, 'front', 'email', 'Partner Marketing', false, 1, 'Welcome to the family', ARRAY['Email', 'Swag Platform'], ARRAY['Open rate']),
('778d435a-9fb3-4bf2-8fa5-e39e5bef13e2', 'Partner Agreement Signing', 'Execute partner contract with terms and commission structure', 'milestone', 1, 'front', 'document', 'Legal', true, 4, 'Fair terms for long-term success', ARRAY['DocuSign', 'Legal'], ARRAY['Signing time']),
('778d435a-9fb3-4bf2-8fa5-e39e5bef13e2', 'Legal Review', 'Internal legal review of any redlines', 'action', 2, 'back', 'internal', 'Legal', false, 3, NULL, ARRAY['Legal System'], ARRAY['Review time']),
('778d435a-9fb3-4bf2-8fa5-e39e5bef13e2', 'Kickoff Meeting', 'Formal partnership launch meeting', 'communication', 3, 'front', 'meeting', 'Partner Manager', true, 2, 'Align on goals and set you up for success', ARRAY['Zoom', 'Slides'], ARRAY['Attendance rate']),
('778d435a-9fb3-4bf2-8fa5-e39e5bef13e2', 'Portal Account Setup', 'Provision partner portal access', 'action', 4, 'front', 'web', 'Partner Ops', false, 3, 'Your one-stop shop for deals and support', ARRAY['PRM', 'SSO'], ARRAY['Setup completion']),
('778d435a-9fb3-4bf2-8fa5-e39e5bef13e2', 'System Provisioning', 'Configure CRM and deal registration access', 'action', 5, 'back', 'system', 'IT', false, 3, NULL, ARRAY['Salesforce', 'CPQ'], ARRAY['Provisioning time']),
('778d435a-9fb3-4bf2-8fa5-e39e5bef13e2', 'Tier Assignment', 'Assign initial partner tier', 'decision', 6, 'back', 'system', 'Channel Director', false, 2, NULL, ARRAY['PRM'], ARRAY['Tier distribution']);

-- Stage 3: Enablement (49e598a1-a8dc-4a43-8599-b0d41e231964)
INSERT INTO journey_touchpoints (stage_id, name, description, touchpoint_type, touchpoint_order, lane, channel, owner_role, is_moment_of_truth, pain_point_level, value_message, systems, kpis) VALUES
('49e598a1-a8dc-4a43-8599-b0d41e231964', 'Product Training', 'Core product knowledge sessions', 'action', 0, 'front', 'meeting', 'Product Marketing', false, 3, 'Master our platform to demo with confidence', ARRAY['LMS', 'Zoom'], ARRAY['Training completion']),
('49e598a1-a8dc-4a43-8599-b0d41e231964', 'Sales Methodology Workshop', 'In-depth training on value selling', 'action', 1, 'front', 'in-person', 'Sales Enablement', true, 4, 'Learn the winning playbook', ARRAY['LMS', 'Workshop'], ARRAY['Workshop attendance']),
('49e598a1-a8dc-4a43-8599-b0d41e231964', 'Technical Certification', 'Hands-on technical certification', 'milestone', 2, 'front', 'web', 'Technical Training', true, 4, 'Become a certified expert', ARRAY['LMS', 'Lab'], ARRAY['Certification pass rate']),
('49e598a1-a8dc-4a43-8599-b0d41e231964', 'Demo Environment Access', 'Provision dedicated demo environment', 'action', 3, 'front', 'web', 'Partner Ops', false, 2, 'Your personal sandbox', ARRAY['Demo Platform'], ARRAY['Demo usage']),
('49e598a1-a8dc-4a43-8599-b0d41e231964', 'Co-Marketing Assets', 'Access to co-branded collateral', 'action', 4, 'front', 'web', 'Partner Marketing', false, 2, 'Ready-made materials to accelerate marketing', ARRAY['Asset Library'], ARRAY['Asset downloads']),
('49e598a1-a8dc-4a43-8599-b0d41e231964', 'LMS Enrollment', 'Register partner reps in learning system', 'action', 5, 'back', 'system', 'Partner Ops', false, 1, NULL, ARRAY['LMS'], ARRAY['Enrollment rate']),
('49e598a1-a8dc-4a43-8599-b0d41e231964', 'Certification Tracking', 'Monitor certification progress', 'action', 6, 'back', 'system', 'Partner Ops', false, 2, NULL, ARRAY['LMS', 'PRM'], ARRAY['Certified headcount']),
('49e598a1-a8dc-4a43-8599-b0d41e231964', 'Content Library Access', 'Grant access to sales playbooks', 'action', 7, 'back', 'system', 'Sales Enablement', false, 1, NULL, ARRAY['Highspot'], ARRAY['Content engagement']);

-- Stage 4: Activation (3e17bce7-3c58-49ca-a73f-46fe95c379d4)
INSERT INTO journey_touchpoints (stage_id, name, description, touchpoint_type, touchpoint_order, lane, channel, owner_role, is_moment_of_truth, pain_point_level, value_message, systems, kpis) VALUES
('3e17bce7-3c58-49ca-a73f-46fe95c379d4', 'First Deal Registration', 'Partner registers first qualified opportunity', 'milestone', 0, 'front', 'web', 'Partner Manager', true, 3, 'Register your deal to protect your investment', ARRAY['PRM', 'CRM'], ARRAY['Registration time']),
('3e17bce7-3c58-49ca-a73f-46fe95c379d4', 'Joint Sales Call Support', 'Vendor SE joins partner customer call', 'communication', 1, 'front', 'meeting', 'Sales Engineer', true, 4, 'We are with you every step of the way', ARRAY['Zoom', 'CRM'], ARRAY['Support request rate']),
('3e17bce7-3c58-49ca-a73f-46fe95c379d4', 'Deal Desk Assistance', 'Support with pricing and deal structuring', 'action', 2, 'front', 'email', 'Deal Desk', false, 4, 'Get competitive pricing that helps you win', ARRAY['CPQ', 'Email'], ARRAY['Response time']),
('3e17bce7-3c58-49ca-a73f-46fe95c379d4', 'Pipeline Tracking', 'Monitor partner opportunity pipeline', 'action', 3, 'back', 'system', 'Partner Manager', false, 2, NULL, ARRAY['CRM', 'PRM'], ARRAY['Pipeline value']),
('3e17bce7-3c58-49ca-a73f-46fe95c379d4', 'Deal Scoring', 'Assess deal health and probability', 'action', 4, 'back', 'system', 'Partner Ops', false, 2, NULL, ARRAY['AI Scoring'], ARRAY['Score accuracy']),
('3e17bce7-3c58-49ca-a73f-46fe95c379d4', 'Commission Setup', 'Configure partner commission for deal', 'action', 5, 'back', 'system', 'Finance', false, 2, NULL, ARRAY['Commission System'], ARRAY['Processing time']),
('3e17bce7-3c58-49ca-a73f-46fe95c379d4', 'Win Celebration', 'Celebrate first deal closure', 'milestone', 6, 'front', 'communication', 'Partner Manager', true, 1, 'Congratulations on your first win!', ARRAY['Email', 'Social'], ARRAY['Time to first deal']);

-- Stage 5: Performance (f1470e89-cc89-43c0-9000-2f9cbe550848)
INSERT INTO journey_touchpoints (stage_id, name, description, touchpoint_type, touchpoint_order, lane, channel, owner_role, is_moment_of_truth, pain_point_level, value_message, systems, kpis) VALUES
('f1470e89-cc89-43c0-9000-2f9cbe550848', 'Monthly Business Review', 'Regular cadence call to review pipeline', 'communication', 0, 'front', 'meeting', 'Partner Manager', false, 2, 'Review progress and remove obstacles together', ARRAY['Zoom', 'Dashboard'], ARRAY['MBR attendance']),
('f1470e89-cc89-43c0-9000-2f9cbe550848', 'Performance Dashboard', 'Real-time performance metrics access', 'action', 1, 'front', 'web', 'Partner Ops', false, 2, 'Full visibility into your success metrics', ARRAY['PRM', 'BI'], ARRAY['Dashboard logins']),
('f1470e89-cc89-43c0-9000-2f9cbe550848', 'Incentive Program Updates', 'Communicate SPIFFs and bonuses', 'communication', 2, 'front', 'email', 'Partner Marketing', false, 1, 'Earn more with our latest incentive programs', ARRAY['Email', 'Portal'], ARRAY['Program participation']),
('f1470e89-cc89-43c0-9000-2f9cbe550848', 'Co-Selling Opportunities', 'Identify joint selling opportunities', 'action', 3, 'front', 'meeting', 'Channel Sales', false, 3, 'Win together on strategic accounts', ARRAY['CRM', 'Zoom'], ARRAY['Co-sell pipeline']),
('f1470e89-cc89-43c0-9000-2f9cbe550848', 'Revenue Tracking', 'Monitor partner-sourced revenue', 'action', 4, 'back', 'system', 'Finance', false, 2, NULL, ARRAY['CRM', 'ERP'], ARRAY['Revenue attainment']),
('f1470e89-cc89-43c0-9000-2f9cbe550848', 'Tier Evaluation', 'Assess performance against tier requirements', 'decision', 5, 'back', 'system', 'Channel Director', false, 3, NULL, ARRAY['PRM', 'Scoring'], ARRAY['Tier movements']),
('f1470e89-cc89-43c0-9000-2f9cbe550848', 'Risk Assessment', 'Identify partners at risk of churn', 'action', 6, 'back', 'system', 'Partner Ops', false, 3, NULL, ARRAY['AI Analytics'], ARRAY['Churn prediction']);

-- Stage 6: Growth (1d8dec47-1754-43f6-95ab-d92e3d50bc2f)
INSERT INTO journey_touchpoints (stage_id, name, description, touchpoint_type, touchpoint_order, lane, channel, owner_role, is_moment_of_truth, pain_point_level, value_message, systems, kpis) VALUES
('1d8dec47-1754-43f6-95ab-d92e3d50bc2f', 'Tier Advancement Notification', 'Celebrate partner tier promotion', 'milestone', 0, 'front', 'email', 'Partner Manager', true, 1, 'Your hard work has earned you elite partner status', ARRAY['Email', 'Portal'], ARRAY['Advancement rate']),
('1d8dec47-1754-43f6-95ab-d92e3d50bc2f', 'Strategic Planning Session', 'Annual planning to align on goals', 'communication', 1, 'front', 'meeting', 'Channel Director', true, 2, 'Build your growth roadmap together', ARRAY['Planning Tool'], ARRAY['Plans completed']),
('1d8dec47-1754-43f6-95ab-d92e3d50bc2f', 'Executive Sponsorship', 'Assign executive sponsor for strategic partners', 'action', 2, 'front', 'in-person', 'VP Partnerships', true, 2, 'Direct line to leadership', ARRAY['CRM'], ARRAY['Sponsor assignment']),
('1d8dec47-1754-43f6-95ab-d92e3d50bc2f', 'Joint Marketing Campaign', 'Collaborate on co-funded marketing', 'action', 3, 'front', 'web', 'Partner Marketing', false, 3, 'Amplify your reach with joint go-to-market', ARRAY['Marketing Platform'], ARRAY['Campaign ROI']),
('1d8dec47-1754-43f6-95ab-d92e3d50bc2f', 'Partner Scoring', 'Comprehensive partner health assessment', 'action', 4, 'back', 'system', 'Partner Analytics', false, 2, NULL, ARRAY['AI Scoring', 'PRM'], ARRAY['Score distribution']),
('1d8dec47-1754-43f6-95ab-d92e3d50bc2f', 'Strategic Account Planning', 'Develop joint account plans', 'action', 5, 'back', 'internal', 'Channel Director', false, 3, NULL, ARRAY['Planning Tool', 'CRM'], ARRAY['Plans created']),
('1d8dec47-1754-43f6-95ab-d92e3d50bc2f', 'Investment Approval', 'Approve MDF and strategic funding', 'decision', 6, 'back', 'internal', 'Finance', false, 3, NULL, ARRAY['Budget System'], ARRAY['Investment ROI']);