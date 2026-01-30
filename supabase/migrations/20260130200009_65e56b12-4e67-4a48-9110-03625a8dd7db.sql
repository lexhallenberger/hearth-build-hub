-- =====================================================
-- DEAL LIFECYCLE JOURNEY TOUCHPOINTS
-- =====================================================

-- Stage 1: Lead Qualification (fc110e58-1874-4ff7-b5ce-5610dae20e3a)
INSERT INTO journey_touchpoints (stage_id, name, description, touchpoint_type, touchpoint_order, lane, channel, owner_role, is_moment_of_truth, pain_point_level, value_message, systems, kpis) VALUES
('fc110e58-1874-4ff7-b5ce-5610dae20e3a', 'Lead Capture', 'Inbound lead arrives via form, chat, or campaign', 'action', 0, 'front', 'web', 'Marketing', false, 2, 'Take the first step toward transformation', ARRAY['Marketing Automation', 'CRM'], ARRAY['Lead volume', 'Source distribution']),
('fc110e58-1874-4ff7-b5ce-5610dae20e3a', 'Lead Enrichment', 'Append firmographic and technographic data', 'action', 1, 'back', 'system', 'Marketing Ops', false, 1, NULL, ARRAY['ZoomInfo', 'Clearbit'], ARRAY['Enrichment rate']),
('fc110e58-1874-4ff7-b5ce-5610dae20e3a', 'Lead Scoring', 'Automated scoring based on fit and intent', 'decision', 2, 'back', 'system', 'Marketing Ops', false, 2, NULL, ARRAY['Marketing Automation'], ARRAY['Score distribution']),
('fc110e58-1874-4ff7-b5ce-5610dae20e3a', 'Initial Outreach', 'SDR reaches out via phone, email, or social', 'communication', 3, 'front', 'email', 'SDR', false, 3, 'Let me share how companies like yours achieve results', ARRAY['Outreach', 'LinkedIn'], ARRAY['Response rate']),
('fc110e58-1874-4ff7-b5ce-5610dae20e3a', 'Discovery Call Scheduled', 'First meeting booked with qualified prospect', 'milestone', 4, 'front', 'meeting', 'SDR', true, 2, 'Looking forward to learning about your challenges', ARRAY['Calendly', 'CRM'], ARRAY['Show rate']),
('fc110e58-1874-4ff7-b5ce-5610dae20e3a', 'Lead Qualification', 'Assess BANT/MEDDIC criteria', 'decision', 5, 'back', 'system', 'SDR', false, 3, NULL, ARRAY['CRM'], ARRAY['Qualification rate']);

-- Stage 2: Discovery (fa47a1c8-dedb-468d-92c3-7c6c41def293)
INSERT INTO journey_touchpoints (stage_id, name, description, touchpoint_type, touchpoint_order, lane, channel, owner_role, is_moment_of_truth, pain_point_level, value_message, systems, kpis) VALUES
('fa47a1c8-dedb-468d-92c3-7c6c41def293', 'Discovery Call', 'Deep dive into pain points, goals, and current state', 'communication', 0, 'front', 'meeting', 'AE', true, 3, 'Help me understand your biggest challenges', ARRAY['Zoom', 'Gong'], ARRAY['Discovery depth score']),
('fa47a1c8-dedb-468d-92c3-7c6c41def293', 'Stakeholder Mapping', 'Identify key decision makers and influencers', 'action', 1, 'back', 'internal', 'AE', false, 4, NULL, ARRAY['CRM', 'Org Chart Tool'], ARRAY['Stakeholder count']),
('fa47a1c8-dedb-468d-92c3-7c6c41def293', 'Pain Point Documentation', 'Capture and prioritize business challenges', 'action', 2, 'back', 'internal', 'AE', false, 2, NULL, ARRAY['CRM', 'Notes'], ARRAY['Pain clarity score']),
('fa47a1c8-dedb-468d-92c3-7c6c41def293', 'Technical Discovery', 'Understand current tech stack and requirements', 'communication', 3, 'front', 'meeting', 'SE', false, 4, 'Ensure we fit seamlessly into your environment', ARRAY['Zoom'], ARRAY['Technical fit score']),
('fa47a1c8-dedb-468d-92c3-7c6c41def293', 'Use Case Validation', 'Confirm primary use cases and success criteria', 'decision', 4, 'front', 'meeting', 'AE', true, 3, 'Agree on what success looks like for you', ARRAY['CRM'], ARRAY['Use case match']),
('fa47a1c8-dedb-468d-92c3-7c6c41def293', 'Opportunity Creation', 'Create formal opportunity with deal value', 'milestone', 5, 'back', 'system', 'AE', false, 2, NULL, ARRAY['CRM'], ARRAY['Opportunity value']),
('fa47a1c8-dedb-468d-92c3-7c6c41def293', 'Competition Assessment', 'Identify competitive alternatives being evaluated', 'action', 6, 'back', 'internal', 'AE', false, 3, NULL, ARRAY['Competitive Intel'], ARRAY['Competitive deals']);

-- Stage 3: Solution Design (f95a3937-a969-4776-82ff-343e8b74a542)
INSERT INTO journey_touchpoints (stage_id, name, description, touchpoint_type, touchpoint_order, lane, channel, owner_role, is_moment_of_truth, pain_point_level, value_message, systems, kpis) VALUES
('f95a3937-a969-4776-82ff-343e8b74a542', 'Solution Workshop', 'Collaborative session to design custom solution', 'communication', 0, 'front', 'meeting', 'SE', true, 3, 'Design a solution tailored to your needs', ARRAY['Zoom', 'Whiteboard'], ARRAY['Workshop attendance']),
('f95a3937-a969-4776-82ff-343e8b74a542', 'Technical Architecture', 'Document integration points and deployment', 'action', 1, 'back', 'internal', 'SE', false, 4, NULL, ARRAY['Architecture Tool'], ARRAY['Architecture complexity']),
('f95a3937-a969-4776-82ff-343e8b74a542', 'Custom Demo', 'Tailored product demonstration', 'communication', 2, 'front', 'meeting', 'SE', true, 2, 'See exactly how we solve your specific challenges', ARRAY['Demo Environment'], ARRAY['Demo effectiveness']),
('f95a3937-a969-4776-82ff-343e8b74a542', 'Proof of Concept Planning', 'Define POC scope and success criteria', 'action', 3, 'front', 'meeting', 'SE', false, 4, 'Prove value with a focused pilot', ARRAY['POC Framework'], ARRAY['POC scope clarity']),
('f95a3937-a969-4776-82ff-343e8b74a542', 'POC Execution', 'Run technical proof of concept', 'action', 4, 'front', 'web', 'SE', true, 5, 'Experience the value firsthand', ARRAY['Product', 'POC Environment'], ARRAY['POC success rate']),
('f95a3937-a969-4776-82ff-343e8b74a542', 'Implementation Scoping', 'Estimate implementation effort and resources', 'action', 5, 'back', 'internal', 'Professional Services', false, 3, NULL, ARRAY['PS Tool'], ARRAY['Scope accuracy']),
('f95a3937-a969-4776-82ff-343e8b74a542', 'Proposal Draft', 'Create initial proposal with solution and pricing', 'action', 6, 'back', 'internal', 'AE', false, 3, NULL, ARRAY['CPQ', 'Proposal Tool'], ARRAY['Proposal quality']);

-- Stage 4: Business Case (91f2fa1e-bfaa-41f7-9d90-0866bc9beca3)
INSERT INTO journey_touchpoints (stage_id, name, description, touchpoint_type, touchpoint_order, lane, channel, owner_role, is_moment_of_truth, pain_point_level, value_message, systems, kpis) VALUES
('91f2fa1e-bfaa-41f7-9d90-0866bc9beca3', 'Value Assessment', 'Quantify business value and expected outcomes', 'action', 0, 'front', 'meeting', 'Value Engineer', true, 3, 'Build a bulletproof business case together', ARRAY['Value Calculator'], ARRAY['Value documented']),
('91f2fa1e-bfaa-41f7-9d90-0866bc9beca3', 'ROI Analysis', 'Calculate return on investment with customer data', 'action', 1, 'front', 'document', 'Value Engineer', false, 3, 'See the financial impact in black and white', ARRAY['ROI Tool'], ARRAY['ROI ratio']),
('91f2fa1e-bfaa-41f7-9d90-0866bc9beca3', 'TCO Comparison', 'Compare total cost of ownership vs alternatives', 'action', 2, 'front', 'document', 'AE', false, 3, 'Understand the full picture of your investment', ARRAY['TCO Calculator'], ARRAY['TCO clarity']),
('91f2fa1e-bfaa-41f7-9d90-0866bc9beca3', 'Executive Presentation', 'Present business case to economic buyer', 'communication', 3, 'front', 'meeting', 'AE', true, 4, 'This investment makes business sense', ARRAY['Slides', 'Zoom'], ARRAY['Exec attendance']),
('91f2fa1e-bfaa-41f7-9d90-0866bc9beca3', 'Reference Calls', 'Connect prospect with existing customers', 'communication', 4, 'front', 'phone', 'Customer Marketing', false, 2, 'Hear directly from customers who achieved results', ARRAY['Reference Tool'], ARRAY['Reference NPS']),
('91f2fa1e-bfaa-41f7-9d90-0866bc9beca3', 'Budget Confirmation', 'Confirm budget allocation and approval process', 'decision', 5, 'front', 'meeting', 'AE', true, 4, 'Align on investment and timeline', ARRAY['CRM'], ARRAY['Budget confirmed']),
('91f2fa1e-bfaa-41f7-9d90-0866bc9beca3', 'Internal Deal Review', 'Sales leadership review of deal strategy', 'decision', 6, 'back', 'internal', 'Sales Manager', false, 2, NULL, ARRAY['CRM'], ARRAY['Review pass rate']);

-- Stage 5: Negotiation (6a8847f4-3995-4073-9666-efcffb13aaa3)
INSERT INTO journey_touchpoints (stage_id, name, description, touchpoint_type, touchpoint_order, lane, channel, owner_role, is_moment_of_truth, pain_point_level, value_message, systems, kpis) VALUES
('6a8847f4-3995-4073-9666-efcffb13aaa3', 'Proposal Delivery', 'Present formal proposal with pricing and terms', 'communication', 0, 'front', 'meeting', 'AE', true, 3, 'Here is our commitment to your success', ARRAY['Proposal Tool'], ARRAY['Proposal engagement']),
('6a8847f4-3995-4073-9666-efcffb13aaa3', 'Pricing Discussion', 'Negotiate pricing, discounts, and payment terms', 'communication', 1, 'front', 'meeting', 'AE', false, 4, 'Find a structure that works for both of us', ARRAY['CPQ', 'Zoom'], ARRAY['Discount level']),
('6a8847f4-3995-4073-9666-efcffb13aaa3', 'Deal Desk Review', 'Internal review of non-standard terms', 'decision', 2, 'back', 'internal', 'Deal Desk', false, 3, NULL, ARRAY['CPQ', 'Approval Flow'], ARRAY['Approval time']),
('6a8847f4-3995-4073-9666-efcffb13aaa3', 'Legal Redlines', 'Customer legal team reviews contract', 'action', 3, 'front', 'email', 'Legal', false, 5, 'Our terms protect both parties fairly', ARRAY['Contract System'], ARRAY['Redline count']),
('6a8847f4-3995-4073-9666-efcffb13aaa3', 'Legal Negotiation', 'Resolve contract terms and liability provisions', 'communication', 4, 'front', 'meeting', 'Legal', false, 5, 'Find common ground on these terms', ARRAY['Zoom'], ARRAY['Negotiation time']),
('6a8847f4-3995-4073-9666-efcffb13aaa3', 'Security Review', 'Complete security questionnaire and compliance', 'action', 5, 'front', 'document', 'Security', false, 4, 'Your data security is our top priority', ARRAY['Security Tool'], ARRAY['Security approval']),
('6a8847f4-3995-4073-9666-efcffb13aaa3', 'Final Approval Gate', 'Executive approval for final terms', 'decision', 6, 'back', 'internal', 'VP Sales', true, 3, NULL, ARRAY['Approval Flow'], ARRAY['Approval time']),
('6a8847f4-3995-4073-9666-efcffb13aaa3', 'Contract Finalization', 'Prepare final contract for signature', 'action', 7, 'back', 'system', 'Legal', false, 2, NULL, ARRAY['DocuSign'], ARRAY['Contract accuracy']);

-- Stage 6: Close (29aeb9a2-6e93-4193-bb34-9d3ee421ef6d)
INSERT INTO journey_touchpoints (stage_id, name, description, touchpoint_type, touchpoint_order, lane, channel, owner_role, is_moment_of_truth, pain_point_level, value_message, systems, kpis) VALUES
('29aeb9a2-6e93-4193-bb34-9d3ee421ef6d', 'Contract Sent', 'Send final contract for customer signature', 'action', 0, 'front', 'document', 'AE', false, 2, 'Ready to make it official?', ARRAY['DocuSign'], ARRAY['Send to sign time']),
('29aeb9a2-6e93-4193-bb34-9d3ee421ef6d', 'Signature Collection', 'Obtain all required signatures', 'milestone', 1, 'front', 'document', 'AE', true, 2, 'Welcome to the partnership!', ARRAY['DocuSign', 'CRM'], ARRAY['Signature time']),
('29aeb9a2-6e93-4193-bb34-9d3ee421ef6d', 'Deal Closed', 'Mark opportunity as closed-won in CRM', 'milestone', 2, 'back', 'system', 'AE', false, 1, NULL, ARRAY['CRM'], ARRAY['Close date accuracy']),
('29aeb9a2-6e93-4193-bb34-9d3ee421ef6d', 'Win Announcement', 'Internal celebration and win communication', 'communication', 3, 'back', 'email', 'Sales Ops', false, 1, NULL, ARRAY['Email', 'Slack'], ARRAY['Win visibility']),
('29aeb9a2-6e93-4193-bb34-9d3ee421ef6d', 'Commission Processing', 'Calculate and process sales commission', 'action', 4, 'back', 'system', 'Finance', false, 2, NULL, ARRAY['Commission System'], ARRAY['Processing time']),
('29aeb9a2-6e93-4193-bb34-9d3ee421ef6d', 'Customer Record Creation', 'Create customer record and initial setup', 'action', 5, 'back', 'system', 'Customer Ops', false, 2, NULL, ARRAY['CRM', 'Customer Portal'], ARRAY['Setup time']);

-- Stage 7: Post-Sale (a8f09eff-f7c6-4711-84ad-8d41796a524a)
INSERT INTO journey_touchpoints (stage_id, name, description, touchpoint_type, touchpoint_order, lane, channel, owner_role, is_moment_of_truth, pain_point_level, value_message, systems, kpis) VALUES
('a8f09eff-f7c6-4711-84ad-8d41796a524a', 'Sales to CS Handoff', 'Structured handoff meeting from sales to CS', 'communication', 0, 'front', 'meeting', 'AE', true, 3, 'Let me introduce you to your success team', ARRAY['Zoom', 'CRM'], ARRAY['Handoff quality']),
('a8f09eff-f7c6-4711-84ad-8d41796a524a', 'Welcome Call', 'CSM introduces themselves and sets expectations', 'communication', 1, 'front', 'meeting', 'CSM', true, 2, 'I am here to ensure you get maximum value', ARRAY['Zoom'], ARRAY['NPS score']),
('a8f09eff-f7c6-4711-84ad-8d41796a524a', 'Kick-off Meeting', 'Formal project kickoff with implementation team', 'communication', 2, 'front', 'meeting', 'Implementation PM', true, 3, 'Get you live and seeing value quickly', ARRAY['Zoom', 'Project Tool'], ARRAY['Kickoff attendance']),
('a8f09eff-f7c6-4711-84ad-8d41796a524a', 'Implementation Planning', 'Detailed project plan with milestones', 'action', 3, 'front', 'document', 'Implementation PM', false, 3, 'Our roadmap to your success', ARRAY['Project Tool'], ARRAY['Plan quality']),
('a8f09eff-f7c6-4711-84ad-8d41796a524a', 'Training Scheduled', 'Book end-user and admin training sessions', 'action', 4, 'front', 'web', 'Training', false, 2, 'Get your team ready to hit the ground running', ARRAY['LMS', 'Calendly'], ARRAY['Training booked']),
('a8f09eff-f7c6-4711-84ad-8d41796a524a', 'Health Score Baseline', 'Establish initial customer health baseline', 'action', 5, 'back', 'system', 'CSM', false, 1, NULL, ARRAY['CS Platform'], ARRAY['Initial score']),
('a8f09eff-f7c6-4711-84ad-8d41796a524a', 'Expansion Opportunity ID', 'Identify potential upsell opportunities', 'action', 6, 'back', 'system', 'CSM', false, 2, NULL, ARRAY['CRM', 'CS Platform'], ARRAY['Expansion pipeline']);