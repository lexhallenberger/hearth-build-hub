import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the user from the auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Invalid user token");
    }

    const userId = user.id;

    // Check if user already has demo data
    const { count: dealCount } = await supabaseClient
      .from("deals")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", userId);

    if (dealCount && dealCount > 0) {
      return new Response(
        JSON.stringify({ success: false, message: "Demo data already exists for this user" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============ SEED CUSTOMERS ============
    const customers = [
      { name: "Acme Corporation", industry: "Technology", tier: "enterprise", mrr: 45000, health_score: 85, health_status: "healthy", primary_contact_name: "Sarah Johnson", primary_contact_email: "sarah@acme.com" },
      { name: "TechFlow Inc", industry: "SaaS", tier: "enterprise", mrr: 38000, health_score: 78, health_status: "healthy", primary_contact_name: "Mike Chen", primary_contact_email: "mike@techflow.io" },
      { name: "Global Dynamics", industry: "Manufacturing", tier: "enterprise", mrr: 52000, health_score: 62, health_status: "at_risk", primary_contact_name: "Jennifer Williams", primary_contact_email: "jwilliams@globaldyn.com" },
      { name: "Innovate Labs", industry: "Biotech", tier: "mid_market", mrr: 18000, health_score: 91, health_status: "healthy", primary_contact_name: "Dr. Robert Kim", primary_contact_email: "rkim@innovatelabs.co" },
      { name: "DataStream Analytics", industry: "Analytics", tier: "mid_market", mrr: 22000, health_score: 73, health_status: "healthy", primary_contact_name: "Emily Davis", primary_contact_email: "emily@datastream.ai" },
      { name: "CloudNine Solutions", industry: "Cloud Services", tier: "mid_market", mrr: 15000, health_score: 45, health_status: "at_risk", primary_contact_name: "James Wilson", primary_contact_email: "james@cloudnine.io" },
      { name: "FinanceHub", industry: "FinTech", tier: "mid_market", mrr: 28000, health_score: 88, health_status: "healthy", primary_contact_name: "Lisa Park", primary_contact_email: "lisa@financehub.com" },
      { name: "RetailMax", industry: "Retail", tier: "smb", mrr: 8500, health_score: 55, health_status: "at_risk", primary_contact_name: "Tom Anderson", primary_contact_email: "tom@retailmax.com" },
      { name: "HealthTech Pro", industry: "Healthcare", tier: "smb", mrr: 12000, health_score: 82, health_status: "healthy", primary_contact_name: "Dr. Maria Garcia", primary_contact_email: "mgarcia@healthtech.pro" },
      { name: "EduLearn Platform", industry: "EdTech", tier: "smb", mrr: 6500, health_score: 35, health_status: "critical", primary_contact_name: "Kevin Brown", primary_contact_email: "kevin@edulearn.io" },
      { name: "GreenEnergy Co", industry: "Energy", tier: "enterprise", mrr: 42000, health_score: 76, health_status: "healthy", primary_contact_name: "Susan Lee", primary_contact_email: "slee@greenenergy.com" },
      { name: "MediaWave Studios", industry: "Media", tier: "startup", mrr: 3500, health_score: 68, health_status: "healthy", primary_contact_name: "Alex Turner", primary_contact_email: "alex@mediawave.studio" },
      { name: "SecureNet Systems", industry: "Cybersecurity", tier: "mid_market", mrr: 25000, health_score: 94, health_status: "healthy", primary_contact_name: "Chris Martinez", primary_contact_email: "cmartinez@securenet.io" },
      { name: "LogiChain Express", industry: "Logistics", tier: "smb", mrr: 9000, health_score: 71, health_status: "healthy", primary_contact_name: "Patricia Moore", primary_contact_email: "pmoore@logichain.com" },
      { name: "FoodTech Innovations", industry: "Food & Beverage", tier: "startup", mrr: 4200, health_score: 58, health_status: "at_risk", primary_contact_name: "Daniel White", primary_contact_email: "dan@foodtech.io" },
    ];

    const { data: insertedCustomers, error: customerError } = await supabaseClient
      .from("customers")
      .insert(customers.map(c => ({ ...c, owner_id: userId })))
      .select();

    if (customerError) {
      console.error("Customer insert error:", customerError);
      throw customerError;
    }

    // ============ SEED VALUE MESSAGES ============
    const valueMessages = [
      { title: "ROI in 90 Days", message: "Our customers see an average 3x return on investment within the first 90 days of implementation.", category: "ROI", target_persona: "CFO", target_industry: null, usage_count: 45, win_rate: 72 },
      { title: "Time-to-Value Champion", message: "Go live in under 30 days with our proven implementation methodology and dedicated success team.", category: "Implementation", target_persona: "CTO", target_industry: "Technology", usage_count: 38, win_rate: 68 },
      { title: "Enterprise Security", message: "SOC2 Type II certified with 99.99% uptime SLA and enterprise-grade security features.", category: "Security", target_persona: "CISO", target_industry: null, usage_count: 52, win_rate: 81 },
      { title: "Scalability Story", message: "Built to scale from 10 to 10,000 users without performance degradation.", category: "Technical", target_persona: "CTO", target_industry: "SaaS", usage_count: 29, win_rate: 65 },
      { title: "Integration Excellence", message: "Native integrations with 200+ enterprise applications including Salesforce, SAP, and Oracle.", category: "Integration", target_persona: "IT Director", target_industry: null, usage_count: 61, win_rate: 74 },
      { title: "Customer Success Partnership", message: "Dedicated customer success manager and 24/7 premium support included in enterprise tier.", category: "Support", target_persona: "VP Operations", target_industry: null, usage_count: 33, win_rate: 69 },
      { title: "Competitive Displacement", message: "87% of customers who switched from [Competitor] reported improved efficiency within 60 days.", category: "Competitive", target_persona: "CEO", target_industry: null, usage_count: 21, win_rate: 58 },
      { title: "Healthcare Compliance", message: "HIPAA compliant with BAA included, trusted by 50+ healthcare organizations.", category: "Compliance", target_persona: "Compliance Officer", target_industry: "Healthcare", usage_count: 18, win_rate: 85 },
      { title: "Financial Services Ready", message: "PCI-DSS Level 1 certified with SOX compliance reporting built-in.", category: "Compliance", target_persona: "CFO", target_industry: "FinTech", usage_count: 24, win_rate: 79 },
      { title: "AI-Powered Insights", message: "Leverage machine learning to predict trends and automate routine decisions.", category: "Innovation", target_persona: "CDO", target_industry: "Analytics", usage_count: 42, win_rate: 71 },
    ];

    const { error: vmError } = await supabaseClient
      .from("value_messages")
      .insert(valueMessages.map(v => ({ ...v, owner_id: userId, is_active: true })));

    if (vmError) {
      console.error("Value message insert error:", vmError);
    }

    // ============ SEED JOURNEYS WITH STAGES & TOUCHPOINTS ============
    const journeys = [
      { name: "Enterprise Customer Journey", description: "End-to-end journey for enterprise customers from awareness to advocacy", journey_type: "customer", color: "#3b82f6", is_template: true, is_active: true },
      { name: "Sales Qualification Process", description: "Structured sales process from lead to closed deal", journey_type: "seller", color: "#10b981", is_template: true, is_active: true },
      { name: "Partner Enablement Journey", description: "Channel partner onboarding and certification path", journey_type: "partner", color: "#8b5cf6", is_template: true, is_active: true },
      { name: "Deal Lifecycle", description: "Complete deal progression from creation to close", journey_type: "deal", color: "#f59e0b", is_template: true, is_active: true },
    ];

    const { data: insertedJourneys, error: journeyError } = await supabaseClient
      .from("journeys")
      .insert(journeys.map(j => ({ ...j, owner_id: userId })))
      .select();

    if (journeyError) {
      console.error("Journey insert error:", journeyError);
    } else if (insertedJourneys && insertedJourneys.length > 0) {
      // Add stages for the first journey (Enterprise Customer Journey)
      const customerJourneyId = insertedJourneys[0].id;
      const customerStages = [
        { journey_id: customerJourneyId, name: "Awareness", description: "Customer becomes aware of the problem and potential solutions", stage_order: 1, target_conversion_rate: 45, target_time_days: 14, color: "#94a3b8", persona: "Marketing Qualified Lead", emotion_start: 3, emotion_end: 4 },
        { journey_id: customerJourneyId, name: "Consideration", description: "Customer evaluates different solutions and vendors", stage_order: 2, target_conversion_rate: 35, target_time_days: 21, color: "#60a5fa", persona: "Sales Qualified Lead", emotion_start: 4, emotion_end: 5 },
        { journey_id: customerJourneyId, name: "Decision", description: "Customer makes final vendor selection and negotiates terms", stage_order: 3, target_conversion_rate: 60, target_time_days: 14, color: "#34d399", persona: "Opportunity", emotion_start: 5, emotion_end: 6 },
        { journey_id: customerJourneyId, name: "Onboarding", description: "Customer begins implementation and initial usage", stage_order: 4, target_conversion_rate: 85, target_time_days: 30, color: "#fbbf24", persona: "New Customer", emotion_start: 5, emotion_end: 7 },
        { journey_id: customerJourneyId, name: "Adoption", description: "Customer achieves regular usage and value realization", stage_order: 5, target_conversion_rate: 90, target_time_days: 60, color: "#a78bfa", persona: "Active User", emotion_start: 6, emotion_end: 8 },
        { journey_id: customerJourneyId, name: "Advocacy", description: "Customer becomes a champion and refers others", stage_order: 6, target_conversion_rate: 40, target_time_days: 90, color: "#f472b6", persona: "Champion", emotion_start: 8, emotion_end: 9 },
      ];

      const { data: insertedStages, error: stageError } = await supabaseClient
        .from("journey_stages")
        .insert(customerStages)
        .select();

      if (stageError) {
        console.error("Stage insert error:", stageError);
      } else if (insertedStages) {
        // Add touchpoints for each stage
        const touchpoints = [];
        
        // Awareness stage touchpoints
        const awarenessStage = insertedStages.find(s => s.name === "Awareness");
        if (awarenessStage) {
          touchpoints.push(
            { stage_id: awarenessStage.id, name: "Content Discovery", description: "Prospect finds blog/whitepaper", touchpoint_type: "action", touchpoint_order: 1, channel: "web", lane: "front", is_moment_of_truth: false, pain_point_level: 2 },
            { stage_id: awarenessStage.id, name: "Social Engagement", description: "Engagement on LinkedIn/Twitter", touchpoint_type: "communication", touchpoint_order: 2, channel: "social", lane: "front", is_moment_of_truth: false, pain_point_level: 1 },
            { stage_id: awarenessStage.id, name: "Lead Capture", description: "Form submission for gated content", touchpoint_type: "milestone", touchpoint_order: 3, channel: "web", lane: "back", is_moment_of_truth: true, pain_point_level: 3 },
          );
        }

        // Consideration stage touchpoints
        const considerationStage = insertedStages.find(s => s.name === "Consideration");
        if (considerationStage) {
          touchpoints.push(
            { stage_id: considerationStage.id, name: "Discovery Call", description: "Initial sales conversation", touchpoint_type: "communication", touchpoint_order: 1, channel: "meeting", lane: "front", is_moment_of_truth: true, pain_point_level: 4 },
            { stage_id: considerationStage.id, name: "Demo Request", description: "Customer requests product demo", touchpoint_type: "decision", touchpoint_order: 2, channel: "web", lane: "front", is_moment_of_truth: true, pain_point_level: 3 },
            { stage_id: considerationStage.id, name: "Technical Evaluation", description: "POC or trial setup", touchpoint_type: "action", touchpoint_order: 3, channel: "in-person", lane: "back", is_moment_of_truth: false, pain_point_level: 5 },
          );
        }

        // Decision stage touchpoints
        const decisionStage = insertedStages.find(s => s.name === "Decision");
        if (decisionStage) {
          touchpoints.push(
            { stage_id: decisionStage.id, name: "Proposal Review", description: "Customer reviews formal proposal", touchpoint_type: "action", touchpoint_order: 1, channel: "document", lane: "front", is_moment_of_truth: true, pain_point_level: 4 },
            { stage_id: decisionStage.id, name: "Negotiation", description: "Terms and pricing discussion", touchpoint_type: "communication", touchpoint_order: 2, channel: "meeting", lane: "front", is_moment_of_truth: true, pain_point_level: 6 },
            { stage_id: decisionStage.id, name: "Contract Signed", description: "Deal closed and contract executed", touchpoint_type: "milestone", touchpoint_order: 3, channel: "document", lane: "back", is_moment_of_truth: true, pain_point_level: 2 },
          );
        }

        if (touchpoints.length > 0) {
          const { error: tpError } = await supabaseClient
            .from("journey_touchpoints")
            .insert(touchpoints);
          
          if (tpError) {
            console.error("Touchpoint insert error:", tpError);
          }
        }
      }
    }

    // ============ SEED LEADS ============
    const leads = [
      { first_name: "John", last_name: "Smith", email: "jsmith@megacorp.com", company: "MegaCorp Industries", title: "VP of Sales", source: "Webinar", status: "qualified", score: 85, pain_points: ["Manual processes", "Poor reporting"], interests: ["Automation", "Analytics"] },
      { first_name: "Amanda", last_name: "Chen", email: "achen@futuretech.io", company: "FutureTech", title: "Director of Operations", source: "LinkedIn", status: "contacted", score: 72, pain_points: ["Scaling challenges", "Integration gaps"], interests: ["API connectivity", "Scalability"] },
      { first_name: "Michael", last_name: "Brown", email: "mbrown@enterprise.com", company: "Enterprise Solutions", title: "CTO", source: "Referral", status: "new", score: 45, pain_points: ["Legacy systems"], interests: ["Modernization"] },
      { first_name: "Sarah", last_name: "Davis", email: "sdavis@innovate.co", company: "Innovate Co", title: "CEO", source: "Conference", status: "qualified", score: 91, pain_points: ["Time to market", "Competitive pressure"], interests: ["Speed", "Differentiation"] },
      { first_name: "Robert", last_name: "Wilson", email: "rwilson@globalbank.com", company: "Global Bank", title: "IT Manager", source: "Content Download", status: "contacted", score: 68, pain_points: ["Security concerns", "Compliance"], interests: ["Security features", "Audit trails"] },
      { first_name: "Emily", last_name: "Taylor", email: "etaylor@healthsys.org", company: "HealthSys", title: "COO", source: "Website", status: "new", score: 38, pain_points: ["HIPAA compliance"], interests: ["Healthcare solutions"] },
      { first_name: "David", last_name: "Martinez", email: "dmartinez@retailplus.com", company: "RetailPlus", title: "VP Marketing", source: "Paid Ad", status: "unqualified", score: 22, pain_points: ["Budget constraints"], interests: ["Cost-effective solutions"] },
      { first_name: "Jennifer", last_name: "Lee", email: "jlee@techstart.io", company: "TechStart", title: "Founder", source: "Product Hunt", status: "qualified", score: 88, pain_points: ["Rapid growth", "Process gaps"], interests: ["Startup-friendly pricing", "Fast implementation"] },
    ];

    const { data: insertedLeads, error: leadError } = await supabaseClient
      .from("leads")
      .insert(leads.map(l => ({ ...l, owner_id: userId })))
      .select();

    if (leadError) {
      console.error("Lead insert error:", leadError);
    }

    // ============ SEED OPPORTUNITIES ============
    const opportunities = [
      { name: "MegaCorp Enterprise Deal", company: "MegaCorp Industries", amount: 250000, stage: "negotiation", probability: 75, expected_close_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], contact_name: "John Smith", contact_email: "jsmith@megacorp.com", primary_value_message: "Enterprise Security", competitive_situation: "Competing with Salesforce" },
      { name: "FutureTech Platform Upgrade", company: "FutureTech", amount: 85000, stage: "proposal", probability: 60, expected_close_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], contact_name: "Amanda Chen", contact_email: "achen@futuretech.io", primary_value_message: "Scalability Story", competitive_situation: "Replacing legacy system" },
      { name: "Innovate Co Strategic Partnership", company: "Innovate Co", amount: 450000, stage: "qualification", probability: 40, expected_close_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], contact_name: "Sarah Davis", contact_email: "sdavis@innovate.co", primary_value_message: "Time-to-Value Champion", competitive_situation: "Greenfield opportunity" },
      { name: "Global Bank Security Suite", company: "Global Bank", amount: 180000, stage: "discovery", probability: 25, expected_close_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], contact_name: "Robert Wilson", contact_email: "rwilson@globalbank.com", primary_value_message: "Financial Services Ready", competitive_situation: "RFP process with 3 vendors" },
      { name: "TechStart Growth Package", company: "TechStart", amount: 35000, stage: "proposal", probability: 85, expected_close_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], contact_name: "Jennifer Lee", contact_email: "jlee@techstart.io", primary_value_message: "ROI in 90 Days", competitive_situation: "No competition" },
      { name: "HealthSys Compliance Module", company: "HealthSys", amount: 120000, stage: "discovery", probability: 20, expected_close_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], contact_name: "Emily Taylor", contact_email: "etaylor@healthsys.org", primary_value_message: "Healthcare Compliance", competitive_situation: "Budget approval pending" },
    ];

    const { data: insertedOpps, error: oppError } = await supabaseClient
      .from("opportunities")
      .insert(opportunities.map(o => ({ ...o, owner_id: userId })))
      .select();

    if (oppError) {
      console.error("Opportunity insert error:", oppError);
    }

    // ============ SEED DEALS ============
    const deals = [
      // Green deals (high score)
      { name: "Acme Enterprise Expansion", customer_name: "Acme Corporation", description: "Annual expansion with 3-year commitment", deal_value: 540000, discount_percent: 15, payment_terms: "net_30", contract_length_months: 36, status: "approved", classification: "green", total_score: 82, expected_close_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], products: ["Enterprise Suite", "Premium Support"] },
      { name: "TechFlow Platform Renewal", customer_name: "TechFlow Inc", description: "Renewal with upsell to enterprise tier", deal_value: 456000, discount_percent: 12, payment_terms: "net_30", contract_length_months: 24, status: "pending_approval", classification: "green", total_score: 78, expected_close_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], products: ["Enterprise Suite"] },
      { name: "SecureNet Security Bundle", customer_name: "SecureNet Systems", description: "New security features add-on", deal_value: 300000, discount_percent: 10, payment_terms: "net_30", contract_length_months: 24, status: "approved", classification: "green", total_score: 85, expected_close_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], products: ["Security Module", "Compliance Pack"] },
      { name: "GreenEnergy Digital Transformation", customer_name: "GreenEnergy Co", description: "Complete platform migration", deal_value: 504000, discount_percent: 18, payment_terms: "net_45", contract_length_months: 36, status: "pending_approval", classification: "green", total_score: 74, expected_close_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], products: ["Enterprise Suite", "Migration Services"] },
      
      // Yellow deals (medium score)
      { name: "Global Dynamics Recovery Deal", customer_name: "Global Dynamics", description: "Win-back with improved terms", deal_value: 624000, discount_percent: 28, payment_terms: "net_60", contract_length_months: 24, status: "pending_approval", classification: "yellow", total_score: 55, expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], products: ["Enterprise Suite"] },
      { name: "CloudNine Rescue Package", customer_name: "CloudNine Solutions", description: "Reduced scope to address budget concerns", deal_value: 180000, discount_percent: 35, payment_terms: "net_60", contract_length_months: 12, status: "pending_score", classification: "yellow", total_score: 48, expected_close_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], products: ["Standard Suite"] },
      { name: "RetailMax Holiday Push", customer_name: "RetailMax", description: "Q4 rush implementation", deal_value: 102000, discount_percent: 25, payment_terms: "net_30", contract_length_months: 12, status: "pending_approval", classification: "yellow", total_score: 52, expected_close_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], products: ["Retail Module"] },
      { name: "DataStream Analytics Upgrade", customer_name: "DataStream Analytics", description: "Adding AI/ML capabilities", deal_value: 264000, discount_percent: 22, payment_terms: "net_45", contract_length_months: 24, status: "draft", classification: "yellow", total_score: 58, expected_close_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], products: ["Analytics Pro", "AI Module"] },
      
      // Red deals (low score)
      { name: "EduLearn Startup Special", customer_name: "EduLearn Platform", description: "Heavy discount for startup tier", deal_value: 78000, discount_percent: 50, payment_terms: "net_90", contract_length_months: 12, status: "rejected", classification: "red", total_score: 28, expected_close_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], products: ["Starter Suite"] },
      { name: "FoodTech MVP Deal", customer_name: "FoodTech Innovations", description: "Minimal viable deployment", deal_value: 50400, discount_percent: 45, payment_terms: "net_90", contract_length_months: 6, status: "pending_score", classification: "red", total_score: 32, expected_close_date: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], products: ["Basic Module"] },
      { name: "MediaWave Proof of Concept", customer_name: "MediaWave Studios", description: "POC with uncertain conversion path", deal_value: 42000, discount_percent: 40, payment_terms: "net_60", contract_length_months: 6, status: "draft", classification: "red", total_score: 35, expected_close_date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], products: ["Media Module"] },
      
      // Closed deals
      { name: "Innovate Labs Success Story", customer_name: "Innovate Labs", description: "Flagship implementation - case study material", deal_value: 216000, discount_percent: 8, payment_terms: "net_30", contract_length_months: 36, status: "closed_won", classification: "green", total_score: 91, expected_close_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], actual_close_date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], products: ["Enterprise Suite", "Premium Support", "Training Package"] },
      { name: "FinanceHub Fast Track", customer_name: "FinanceHub", description: "Express implementation for fintech", deal_value: 336000, discount_percent: 12, payment_terms: "net_30", contract_length_months: 24, status: "closed_won", classification: "green", total_score: 88, expected_close_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], actual_close_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], products: ["FinTech Suite", "Compliance Module"] },
      { name: "HealthTech Pro Rollout", customer_name: "HealthTech Pro", description: "Multi-location healthcare deployment", deal_value: 144000, discount_percent: 15, payment_terms: "net_45", contract_length_months: 24, status: "closed_won", classification: "green", total_score: 82, expected_close_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], actual_close_date: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], products: ["Healthcare Suite", "HIPAA Module"] },
      { name: "LogiChain Pilot", customer_name: "LogiChain Express", description: "Pilot program for logistics module", deal_value: 108000, discount_percent: 20, payment_terms: "net_30", contract_length_months: 12, status: "closed_won", classification: "yellow", total_score: 68, expected_close_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], actual_close_date: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], products: ["Logistics Module"] },
      
      // Some lost deals for realism
      { name: "BigCorp Budget Freeze", customer_name: "BigCorp Ltd", description: "Lost due to budget freeze", deal_value: 380000, discount_percent: 20, payment_terms: "net_30", contract_length_months: 24, status: "closed_lost", classification: "yellow", total_score: 62, expected_close_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], actual_close_date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], products: ["Enterprise Suite"] },
      { name: "CompetitorWins Inc", customer_name: "CompetitorWins Inc", description: "Lost to primary competitor", deal_value: 220000, discount_percent: 25, payment_terms: "net_45", contract_length_months: 24, status: "closed_lost", classification: "yellow", total_score: 55, expected_close_date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], actual_close_date: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], products: ["Professional Suite"] },
    ];

    const { data: insertedDeals, error: dealError } = await supabaseClient
      .from("deals")
      .insert(deals.map(d => ({ ...d, owner_id: userId })))
      .select();

    if (dealError) {
      console.error("Deal insert error:", dealError);
    }

    // ============ SEED RENEWALS ============
    if (insertedCustomers) {
      const renewals = insertedCustomers.slice(0, 8).map((customer, i) => ({
        customer_id: customer.id,
        owner_id: userId,
        renewal_date: new Date(Date.now() + (30 + i * 15) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: i < 2 ? "in_progress" : "upcoming",
        current_value: customer.arr,
        proposed_value: Math.round(customer.arr * (1 + (0.05 + Math.random() * 0.15))),
        risk_level: customer.health_status === "critical" ? "high" : customer.health_status === "at_risk" ? "medium" : "low",
        risk_factors: customer.health_status !== "healthy" ? ["Declining usage", "Support escalations"] : [],
        notes: `Renewal opportunity for ${customer.name}`,
      }));

      const { error: renewalError } = await supabaseClient
        .from("renewals")
        .insert(renewals);

      if (renewalError) {
        console.error("Renewal insert error:", renewalError);
      }
    }

    // ============ SEED CAMPAIGNS ============
    const campaigns = [
      { name: "Q1 Enterprise Push", description: "Enterprise segment acquisition campaign", campaign_type: "ABM", budget: 150000, actual_spend: 125000, target_leads: 50, start_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], is_active: true },
      { name: "Product Launch Webinar Series", description: "New feature announcement webinars", campaign_type: "Digital", budget: 45000, actual_spend: 32000, target_leads: 200, start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], is_active: true },
      { name: "Partner Channel Enablement", description: "Partner recruitment and training", campaign_type: "Partner", budget: 75000, actual_spend: 68000, target_leads: 30, start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], end_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], is_active: false },
    ];

    const { error: campaignError } = await supabaseClient
      .from("campaigns")
      .insert(campaigns.map(c => ({ ...c, owner_id: userId })));

    if (campaignError) {
      console.error("Campaign insert error:", campaignError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Demo data seeded successfully!",
        summary: {
          customers: insertedCustomers?.length || 0,
          deals: insertedDeals?.length || 0,
          leads: insertedLeads?.length || 0,
          opportunities: insertedOpps?.length || 0,
          journeys: insertedJourneys?.length || 0,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error seeding demo data:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});