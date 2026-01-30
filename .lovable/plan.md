

# Implementation Plan: Phases 5, 6 & 7

This plan covers the remaining phases to complete the Revenue Acceleration Platform.

---

## Current Status

| Phase | Status |
|-------|--------|
| Phase 1: Foundation & Authentication | Complete |
| Phase 2: Deal Scoring & Governance | Complete |
| Phase 3: Journey Mapping | Complete |
| Phase 4: Pipeline Management | Complete |
| **Phase 5: Customer Success & Renewals** | **Pending** |
| **Phase 6: Executive Analytics** | **Pending** |
| **Phase 7: AI Enhancements** | **Pending** |

---

## Phase 5: Customer Success & Renewals

### Database Schema

New tables to create:
- **customers** - Core customer records with contract details
- **customer_health_scores** - Time-series health tracking
- **health_score_configs** - Configurable health indicators
- **renewals** - Renewal opportunities linked to customers
- **customer_playbook_actions** - Triggered success actions

### UI Components

1. **Customers Dashboard** (`src/pages/Customers.tsx`)
   - Customer list with health indicators (green/yellow/red)
   - At-risk customers alert panel
   - Quick filters by health status, contract end date
   - Search and segmentation

2. **Customer Detail Page** (`src/pages/CustomerDetail.tsx`)
   - Health score history chart (using Recharts)
   - Contract information panel
   - Related deals and opportunities
   - Activity timeline
   - Renewal status indicator

3. **Health Score Components**
   - `CustomerHealthCard.tsx` - Visual health indicator
   - `HealthScoreHistory.tsx` - Time-series chart
   - `HealthIndicators.tsx` - Breakdown of contributing factors

4. **Renewal Management**
   - `RenewalPipeline.tsx` - Timeline view of upcoming renewals
   - `RenewalFormDialog.tsx` - Create/edit renewal opportunities
   - Integration with deal scoring engine for renewal deals

### Data Hooks
- `useCustomers.ts` - CRUD operations for customers
- `useHealthScores.ts` - Health score queries and updates
- `useRenewals.ts` - Renewal pipeline management

---

## Phase 6: Executive Dashboard & Analytics

### Database Views/Functions
- Aggregation functions for pipeline metrics
- Deal quality distribution queries
- Performance comparison queries

### Analytics Dashboard (`src/pages/Analytics.tsx`)

1. **Key Metrics Section**
   - Rule of 40 calculator (Revenue Growth % + Profit Margin %)
   - CAC ratio by segment cards
   - MRR/ARR trending chart

2. **Deal Quality Analytics**
   - Score distribution pie chart
   - Classification trend over time (line chart)
   - Approval cycle time metrics
   - Exception rate tracking

3. **Performance Comparisons**
   - Rep/team leaderboard table
   - Win rate by product line
   - Average deal size trends
   - Pipeline velocity metrics

4. **Pipeline Health**
   - Funnel visualization
   - Stage conversion rates
   - Weighted vs unweighted forecast

### Components
- `MetricCard.tsx` - Reusable KPI display
- `Rule40Calculator.tsx` - Interactive Rule of 40 widget
- `DealDistributionChart.tsx` - Pie/donut chart
- `PerformanceTable.tsx` - Sortable leaderboard
- `PipelineFunnel.tsx` - Visual funnel component

---

## Phase 7: AI Enhancements

### Edge Function: AI Deal Coach

Create a backend function that analyzes deals and provides recommendations.

**Endpoint**: `supabase/functions/ai-deal-coach/index.ts`

**Capabilities**:
- Score improvement suggestions based on deal attributes
- Similar winning deal recommendations
- Risk factor identification
- Natural language deal summaries

### UI Integration

1. **AI Coach Panel** (`src/components/deals/AICoachPanel.tsx`)
   - Integrated into Deal Detail page
   - "Get AI Suggestions" button
   - Displays actionable recommendations
   - Shows similar successful deals

2. **AI Insights Widget** (`src/components/ai/AIInsightsWidget.tsx`)
   - Dashboard integration
   - Quick pipeline insights
   - Trend explanations

3. **Natural Language Query** (`src/components/ai/AskAI.tsx`)
   - Simple input for asking questions
   - "How many deals are at risk?"
   - "What's my pipeline value?"

### Technical Implementation
- Uses Lovable AI (gemini-2.5-flash for fast responses)
- Edge function handles prompts and context building
- Client-side streaming for real-time response display

---

## Implementation Order

### Step 1: Phase 5 Database
Create customers, health scores, and renewals tables with RLS policies.

### Step 2: Phase 5 UI
Build customer management interface and health tracking.

### Step 3: Phase 6 Analytics
Implement executive dashboard with charts and metrics.

### Step 4: Phase 7 AI
Deploy edge function and integrate AI coach into deal workflow.

---

## Technical Details

### New Database Tables

```text
customers
├── id (uuid, PK)
├── name (text)
├── industry (text)
├── tier (customer_tier enum)
├── contract_start_date (date)
├── contract_end_date (date)
├── mrr (numeric)
├── arr (numeric)
├── health_score (numeric)
├── health_status (health_status enum)
├── owner_id (uuid, FK → auth.users)
└── created_at, updated_at (timestamps)

customer_health_scores
├── id (uuid, PK)
├── customer_id (uuid, FK → customers)
├── score (numeric)
├── indicators (jsonb)
├── scored_at (timestamp)
└── created_at (timestamp)

renewals
├── id (uuid, PK)
├── customer_id (uuid, FK → customers)
├── deal_id (uuid, FK → deals, nullable)
├── status (renewal_status enum)
├── renewal_date (date)
├── current_value (numeric)
├── proposed_value (numeric)
├── risk_level (text)
├── owner_id (uuid, FK → auth.users)
└── created_at, updated_at (timestamps)
```

### New Type Definitions

```text
src/types/customers.ts
├── Customer
├── CustomerHealthScore
├── Renewal
├── CustomerTier (enum)
├── HealthStatus (enum)
└── RenewalStatus (enum)
```

### New Hooks

```text
src/hooks/useCustomers.ts
├── useCustomers()
├── useCustomer(id)
├── useCreateCustomer()
├── useUpdateCustomer()
└── useDeleteCustomer()

src/hooks/useRenewals.ts
├── useRenewals()
├── useCustomerRenewals(customerId)
├── useCreateRenewal()
└── useUpdateRenewal()

src/hooks/useAnalytics.ts
├── usePipelineMetrics()
├── useDealDistribution()
├── usePerformanceData()
└── useRule40Data()
```

### AI Edge Function Structure

```text
supabase/functions/ai-deal-coach/
├── index.ts (main handler)
└── _shared/
    └── prompts.ts (system prompts)
```

---

## File Changes Summary

### New Files (15+)
- Database migration for Phase 5 tables
- `src/types/customers.ts`
- `src/hooks/useCustomers.ts`
- `src/hooks/useRenewals.ts`
- `src/hooks/useAnalytics.ts`
- `src/pages/CustomerDetail.tsx`
- `src/components/customers/CustomerHealthCard.tsx`
- `src/components/customers/HealthScoreHistory.tsx`
- `src/components/customers/RenewalPipeline.tsx`
- `src/components/analytics/MetricCard.tsx`
- `src/components/analytics/DealDistributionChart.tsx`
- `src/components/analytics/PerformanceTable.tsx`
- `src/components/deals/AICoachPanel.tsx`
- `supabase/functions/ai-deal-coach/index.ts`

### Modified Files
- `src/pages/Customers.tsx` - Full implementation
- `src/pages/Analytics.tsx` - Full implementation
- `src/pages/DealDetail.tsx` - Add AI coach panel
- `src/pages/Dashboard.tsx` - Add AI insights widget
- `src/App.tsx` - Add CustomerDetail route

---

## Expected Outcome

After implementation, the platform will include:

1. **Customer 360 View** - Complete customer lifecycle visibility
2. **Proactive Health Monitoring** - At-risk customer alerts
3. **Renewal Pipeline** - Upcoming renewals with risk indicators
4. **Executive Metrics** - Rule of 40, CAC ratios, performance benchmarks
5. **AI-Powered Insights** - Deal improvement suggestions and natural language queries
6. **Complete Revenue Lifecycle** - Marketing → Sales → Deals → Customer Success → Renewals

