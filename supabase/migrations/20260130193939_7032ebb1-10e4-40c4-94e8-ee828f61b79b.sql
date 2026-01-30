-- Phase A: Core Configuration Data Seeding (Part 1)

-- Seed scoring_attributes if empty
INSERT INTO public.scoring_attributes (name, description, category, weight, evaluation_type, min_value, max_value, green_threshold, yellow_threshold, higher_is_better, is_active, display_order)
SELECT v.name, v.description, v.category::scoring_category, v.weight, v.evaluation_type, v.min_value, v.max_value, v.green_threshold, v.yellow_threshold, v.higher_is_better, v.is_active, v.display_order
FROM (VALUES
  ('Deal Size', 'Total contract value assessment', 'financial', 25, 'scale', 0, 100, 70, 40, true, true, 1),
  ('Gross Margin', 'Profitability after direct costs', 'financial', 20, 'scale', 0, 100, 75, 50, true, true, 2),
  ('Payment Terms', 'Cash flow impact assessment', 'financial', 15, 'scale', 0, 100, 80, 60, true, true, 3),
  ('Strategic Fit', 'Alignment with company goals', 'strategic', 20, 'scale', 0, 100, 70, 45, true, true, 4),
  ('Market Expansion', 'New market penetration potential', 'strategic', 15, 'scale', 0, 100, 65, 40, true, true, 5),
  ('Competitive Displacement', 'Winning against competitors', 'strategic', 10, 'scale', 0, 100, 60, 35, true, true, 6),
  ('Customer Creditworthiness', 'Financial stability of customer', 'risk', 20, 'scale', 0, 100, 75, 50, true, true, 7),
  ('Legal/Compliance Risk', 'Regulatory and legal exposure', 'risk', 15, 'scale', 0, 100, 80, 55, false, true, 8),
  ('Implementation Risk', 'Delivery and integration complexity', 'risk', 10, 'scale', 0, 100, 70, 45, false, true, 9),
  ('Customer Health', 'Existing relationship strength', 'customer', 20, 'scale', 0, 100, 75, 50, true, true, 10),
  ('Expansion Potential', 'Upsell and cross-sell opportunity', 'customer', 15, 'scale', 0, 100, 70, 45, true, true, 11),
  ('Reference Potential', 'Likelihood of becoming advocate', 'customer', 10, 'scale', 0, 100, 65, 40, true, true, 12)
) AS v(name, description, category, weight, evaluation_type, min_value, max_value, green_threshold, yellow_threshold, higher_is_better, is_active, display_order)
WHERE NOT EXISTS (SELECT 1 FROM public.scoring_attributes LIMIT 1);

-- Seed scoring_thresholds if empty
INSERT INTO public.scoring_thresholds (green_min, yellow_min, auto_approve_green)
SELECT 70, 40, true
WHERE NOT EXISTS (SELECT 1 FROM public.scoring_thresholds LIMIT 1);

-- Seed deal_segments for the 9-block matrix
INSERT INTO public.deal_segments (name, description, min_deal_value, max_deal_value, min_score, max_score, touch_model, approval_level, approval_sla_hours, auto_approve_enabled, color, priority, is_active)
SELECT v.name, v.description, v.min_deal_value, v.max_deal_value, v.min_score, v.max_score, v.touch_model, v.approval_level, v.approval_sla_hours, v.auto_approve_enabled, v.color, v.priority, v.is_active
FROM (VALUES
  ('Small Green', 'Low-value, high-quality deals - auto-approve', 0::numeric, 25000::numeric, 70::numeric, 100::numeric, 'low_touch', 0, 4, true, '#22c55e', 1, true),
  ('Small Yellow', 'Low-value, moderate quality - quick review', 0::numeric, 25000::numeric, 40::numeric, 69::numeric, 'low_touch', 1, 8, false, '#eab308', 2, true),
  ('Small Red', 'Low-value, poor quality - reject or restructure', 0::numeric, 25000::numeric, 0::numeric, 39::numeric, 'low_touch', 2, 24, false, '#ef4444', 3, true),
  ('Medium Green', 'Mid-value, high-quality - expedited approval', 25001::numeric, 100000::numeric, 70::numeric, 100::numeric, 'mid_touch', 1, 8, false, '#22c55e', 4, true),
  ('Medium Yellow', 'Mid-value, moderate quality - standard review', 25001::numeric, 100000::numeric, 40::numeric, 69::numeric, 'mid_touch', 2, 24, false, '#eab308', 5, true),
  ('Medium Red', 'Mid-value, poor quality - executive review', 25001::numeric, 100000::numeric, 0::numeric, 39::numeric, 'mid_touch', 3, 48, false, '#ef4444', 6, true),
  ('Large Green', 'High-value, high-quality - CFO approval', 100001::numeric, NULL, 70::numeric, 100::numeric, 'high_touch', 2, 24, false, '#22c55e', 7, true),
  ('Large Yellow', 'High-value, moderate quality - exec committee', 100001::numeric, NULL, 40::numeric, 69::numeric, 'high_touch', 3, 48, false, '#eab308', 8, true),
  ('Large Red', 'High-value, poor quality - CEO review required', 100001::numeric, NULL, 0::numeric, 39::numeric, 'high_touch', 4, 72, false, '#ef4444', 9, true)
) AS v(name, description, min_deal_value, max_deal_value, min_score, max_score, touch_model, approval_level, approval_sla_hours, auto_approve_enabled, color, priority, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.deal_segments LIMIT 1);

-- Seed market_strategy if empty
INSERT INTO public.market_strategy (name, market_mode, min_deal_value, max_discount_percent, min_contract_months, max_contract_months, is_active, business_unit)
SELECT v.name, v.market_mode, v.min_deal_value, v.max_discount_percent, v.min_contract_months, v.max_contract_months, v.is_active, v.business_unit
FROM (VALUES
  ('Revenue Optimal', 'revenue_optimal', 10000::numeric, 35::numeric, 12, 36, true, 'Enterprise'),
  ('Market Share', 'market_share', 5000::numeric, 50::numeric, 6, 24, false, 'Mid-Market'),
  ('Margin Optimal', 'margin_optimal', 25000::numeric, 20::numeric, 24, 60, false, 'Strategic Accounts')
) AS v(name, market_mode, min_deal_value, max_discount_percent, min_contract_months, max_contract_months, is_active, business_unit)
WHERE NOT EXISTS (SELECT 1 FROM public.market_strategy LIMIT 1);

-- Seed financial_metrics with historical data (past 12 months)
INSERT INTO public.financial_metrics (period_date, mrr, arr, new_arr, expansion_arr, churned_arr, revenue_growth_rate, profit_margin_percent, rule_of_40_score, net_revenue_retention, gross_revenue_retention, total_cac, avg_deal_size, avg_sales_cycle_days)
SELECT 
  (CURRENT_DATE - (n || ' months')::interval)::date,
  ROUND((800000 + n * 50000 + (random() * 30000 - 15000))::numeric, 0),
  ROUND(((800000 + n * 50000 + (random() * 30000 - 15000)) * 12)::numeric, 0),
  ROUND((150000 + random() * 100000)::numeric, 0),
  ROUND((80000 + random() * 60000)::numeric, 0),
  ROUND((30000 + random() * 40000)::numeric, 0),
  ROUND((25 + random() * 20)::numeric, 1),
  ROUND((15 + random() * 15)::numeric, 1),
  ROUND((35 + random() * 20)::numeric, 1),
  ROUND((105 + random() * 20)::numeric, 1),
  ROUND((90 + random() * 8)::numeric, 1),
  ROUND((200000 + random() * 100000)::numeric, 0),
  ROUND((45000 + random() * 30000)::numeric, 0),
  ROUND((35 + random() * 25)::numeric, 0)::integer
FROM generate_series(0, 11) n
WHERE NOT EXISTS (SELECT 1 FROM public.financial_metrics LIMIT 1);

-- Seed friction_events sample data
INSERT INTO public.friction_events (friction_type, category, description, duration_hours, created_at, resolved_at, resolution_notes)
SELECT 
  v.friction_type::friction_type,
  v.category,
  v.description,
  v.duration_hours,
  v.created_at,
  v.resolved_at,
  v.resolution_notes
FROM (VALUES
  ('healthy', 'Legal Review', 'Standard contract review for enterprise terms', 16::numeric, NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days', 'Approved with minor redlines'),
  ('healthy', 'Security Assessment', 'SOC2 compliance verification required', 24::numeric, NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days', 'Passed all security requirements'),
  ('unhealthy', 'Approval Delay', 'Deal desk reviewer on PTO, no backup assigned', 72::numeric, NOW() - INTERVAL '20 days', NOW() - INTERVAL '17 days', 'Escalated to VP for expedited review'),
  ('unhealthy', 'Pricing Dispute', 'Customer pushed back on non-standard discount', 48::numeric, NOW() - INTERVAL '8 days', NOW() - INTERVAL '6 days', 'Negotiated to 25% with extended term'),
  ('healthy', 'Executive Approval', 'CFO sign-off for deal over $500K threshold', 8::numeric, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', 'Approved with quarterly payment terms'),
  ('unhealthy', 'Missing Documentation', 'Customer procurement required additional vendor forms', 96::numeric, NOW() - INTERVAL '25 days', NOW() - INTERVAL '21 days', 'Submitted all required compliance docs'),
  ('healthy', 'Technical Validation', 'POC environment setup and testing', 40::numeric, NOW() - INTERVAL '12 days', NOW() - INTERVAL '10 days', 'Successful POC, customer satisfied'),
  ('unhealthy', 'Budget Reallocation', 'Customer needed internal budget approval', 120::numeric, NOW() - INTERVAL '30 days', NOW() - INTERVAL '25 days', 'Q2 budget approved by customer CFO')
) AS v(friction_type, category, description, duration_hours, created_at, resolved_at, resolution_notes)
WHERE NOT EXISTS (SELECT 1 FROM public.friction_events LIMIT 1);