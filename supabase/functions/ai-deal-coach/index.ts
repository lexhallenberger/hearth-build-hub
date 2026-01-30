import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DealContext {
  id: string;
  name: string;
  customer_name: string;
  deal_value: number;
  total_score: number | null;
  classification: string | null;
  status: string;
  discount_percent: number | null;
  contract_length_months: number | null;
  payment_terms: string | null;
  scores: Array<{
    attribute_name: string;
    category: string;
    raw_value: number;
    normalized_score: number;
  }>;
}

interface RiskFactor {
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  recommendation: string;
}

interface Recommendation {
  priority: number;
  title: string;
  description: string;
  impact: string;
  effort: "low" | "medium" | "high";
}

function analyzeRisks(dealContext: DealContext): RiskFactor[] {
  const risks: RiskFactor[] = [];
  
  // High discount risk
  if (dealContext.discount_percent && dealContext.discount_percent > 30) {
    risks.push({
      severity: "high",
      title: "Excessive Discount",
      description: `${dealContext.discount_percent}% discount exceeds standard thresholds and impacts margin significantly.`,
      recommendation: "Negotiate value-adds or extended terms instead of additional discount."
    });
  } else if (dealContext.discount_percent && dealContext.discount_percent > 20) {
    risks.push({
      severity: "medium",
      title: "Above-Average Discount",
      description: `${dealContext.discount_percent}% discount is above typical ranges for this deal size.`,
      recommendation: "Document competitive pressure or strategic justification."
    });
  }

  // Short contract risk
  if (dealContext.contract_length_months && dealContext.contract_length_months < 12) {
    risks.push({
      severity: "medium",
      title: "Short Contract Term",
      description: `${dealContext.contract_length_months}-month contract reduces lifetime value and increases churn risk.`,
      recommendation: "Offer incentives for longer commitment periods."
    });
  }

  // Low score attributes
  const lowScores = dealContext.scores.filter(s => s.normalized_score < 50);
  if (lowScores.length > 2) {
    risks.push({
      severity: "high",
      title: "Multiple Weak Scoring Areas",
      description: `${lowScores.length} attributes scoring below 50% threshold.`,
      recommendation: "Address weakest attributes before submitting for approval."
    });
  }

  // Classification risk
  if (dealContext.classification === "red") {
    risks.push({
      severity: "high",
      title: "Exception Required",
      description: "Deal requires executive exception approval due to red classification.",
      recommendation: "Prepare detailed justification with strategic rationale."
    });
  } else if (dealContext.classification === "yellow") {
    risks.push({
      severity: "medium",
      title: "Additional Review Required",
      description: "Deal requires Deal Desk review before approval.",
      recommendation: "Proactively address concerns flagged in scoring."
    });
  }

  // Payment terms risk
  if (dealContext.payment_terms && dealContext.payment_terms.includes("60")) {
    risks.push({
      severity: "medium",
      title: "Extended Payment Terms",
      description: "Net 60+ payment terms impact cash flow and increase risk.",
      recommendation: "Negotiate shorter terms or early payment discount."
    });
  }

  // Small deal size with high effort
  if (dealContext.deal_value < 10000) {
    risks.push({
      severity: "low",
      title: "Deal Size Efficiency",
      description: "Small deal value may not justify high-touch sales process.",
      recommendation: "Consider streamlined approval path or self-service options."
    });
  }

  return risks.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });
}

function generateRecommendations(dealContext: DealContext, risks: RiskFactor[]): Recommendation[] {
  const recommendations: Recommendation[] = [];
  let priority = 1;

  // Score-based recommendations
  const lowestScores = [...dealContext.scores]
    .sort((a, b) => a.normalized_score - b.normalized_score)
    .slice(0, 3);

  for (const score of lowestScores) {
    if (score.normalized_score < 70) {
      recommendations.push({
        priority: priority++,
        title: `Improve ${score.attribute_name}`,
        description: `Current score: ${Math.round(score.normalized_score)}%. This ${score.category} attribute is dragging down overall deal quality.`,
        impact: score.normalized_score < 50 ? "High - Could shift classification" : "Medium - Improves approval odds",
        effort: "medium"
      });
    }
  }

  // Contract optimization
  if (dealContext.contract_length_months && dealContext.contract_length_months < 24) {
    recommendations.push({
      priority: priority++,
      title: "Extend Contract Term",
      description: "Longer contracts improve LTV and reduce churn risk. Consider offering year 2-3 discounts.",
      impact: "Medium - Improves customer score and strategic value",
      effort: "low"
    });
  }

  // Discount optimization
  if (dealContext.discount_percent && dealContext.discount_percent > 15) {
    recommendations.push({
      priority: priority++,
      title: "Restructure Discount",
      description: "Convert some discount to value-adds (training, support, services) to protect margin.",
      impact: "High - Improves financial metrics",
      effort: "medium"
    });
  }

  // Product mix
  if (dealContext.deal_value > 50000) {
    recommendations.push({
      priority: priority++,
      title: "Add Strategic Products",
      description: "Large deals benefit from multi-product bundles that increase stickiness.",
      impact: "Medium - Improves strategic score",
      effort: "high"
    });
  }

  return recommendations.slice(0, 5);
}

function calculateScoreOptimization(dealContext: DealContext): { current: number; potential: number; actions: string[] } {
  const current = dealContext.total_score || 0;
  let potential = current;
  const actions: string[] = [];

  // Calculate potential improvements
  const lowScores = dealContext.scores.filter(s => s.normalized_score < 70);
  for (const score of lowScores) {
    const improvement = (70 - score.normalized_score) * 0.5; // 50% of gap is achievable
    potential += improvement;
    if (improvement > 5) {
      actions.push(`Improving ${score.attribute_name} could add ~${Math.round(improvement)} points`);
    }
  }

  // Contract length bonus
  if (dealContext.contract_length_months && dealContext.contract_length_months < 24) {
    potential += 5;
    actions.push("Extending to 24+ months adds ~5 points");
  }

  // Discount reduction
  if (dealContext.discount_percent && dealContext.discount_percent > 20) {
    const discountReduction = (dealContext.discount_percent - 20) * 0.3;
    potential += discountReduction;
    actions.push(`Reducing discount to 20% adds ~${Math.round(discountReduction)} points`);
  }

  return {
    current: Math.round(current),
    potential: Math.min(Math.round(potential), 100),
    actions: actions.slice(0, 4)
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { dealId, action, message } = await req.json();

    if (!dealId) {
      return new Response(JSON.stringify({ error: "dealId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch deal with scores
    const { data: deal, error: dealError } = await supabase
      .from("deals")
      .select("*")
      .eq("id", dealId)
      .single();

    if (dealError || !deal) {
      return new Response(JSON.stringify({ error: "Deal not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch scores with attribute names
    const { data: scores } = await supabase
      .from("deal_scores")
      .select(`
        raw_value,
        normalized_score,
        scoring_attributes (
          name,
          category
        )
      `)
      .eq("deal_id", dealId);

    const dealContext: DealContext = {
      id: deal.id,
      name: deal.name,
      customer_name: deal.customer_name,
      deal_value: deal.deal_value,
      total_score: deal.total_score,
      classification: deal.classification,
      status: deal.status,
      discount_percent: deal.discount_percent,
      contract_length_months: deal.contract_length_months,
      payment_terms: deal.payment_terms,
      scores: (scores || []).map((s: any) => ({
        attribute_name: s.scoring_attributes?.name || "Unknown",
        category: s.scoring_attributes?.category || "Unknown",
        raw_value: s.raw_value,
        normalized_score: s.normalized_score,
      })),
    };

    // Calculate risks and recommendations
    const risks = analyzeRisks(dealContext);
    const recommendations = generateRecommendations(dealContext, risks);
    const scoreOptimization = calculateScoreOptimization(dealContext);

    // For quick actions, return structured data without AI call
    if (action === "quick-analysis") {
      return new Response(JSON.stringify({
        risks,
        recommendations,
        scoreOptimization,
        dealContext: {
          name: deal.name,
          classification: deal.classification,
          total_score: deal.total_score,
        },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch similar won deals for comparison
    const { data: similarDeals } = await supabase
      .from("deals")
      .select("name, customer_name, deal_value, total_score, classification")
      .eq("status", "closed_won")
      .gte("deal_value", deal.deal_value * 0.5)
      .lte("deal_value", deal.deal_value * 2)
      .limit(3);

    // Fetch market strategy for context
    const { data: marketStrategy } = await supabase
      .from("market_strategy")
      .select("*")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    const systemPrompt = `You are an AI Deal Coach for a B2B sales organization using a Revenue Acceleration methodology. Your role is to analyze deal data and provide actionable recommendations to improve deal quality and increase win rates.

You have access to:
1. The current deal's scoring attributes and values
2. Risk analysis identifying potential issues
3. Similar successfully closed deals for comparison
4. The company's market strategy (${marketStrategy?.market_mode || "balanced"} mode)
5. Pre-calculated recommendations and score optimization opportunities

When responding:
- Be conversational but professional
- Provide specific, actionable advice
- Reference actual data from the deal
- Keep responses focused and valuable
- Use markdown formatting for clarity

Current Deal Risks Identified:
${risks.map(r => `- [${r.severity.toUpperCase()}] ${r.title}: ${r.description}`).join('\n')}

Score Optimization Potential:
- Current Score: ${scoreOptimization.current}
- Potential Score: ${scoreOptimization.potential}
- Key Actions: ${scoreOptimization.actions.join('; ')}

Top Recommendations:
${recommendations.map(r => `${r.priority}. ${r.title}: ${r.description}`).join('\n')}`;

    let userPrompt: string;
    
    if (action === "chat" && message) {
      // Conversational mode
      userPrompt = `User question about this deal: "${message}"

Deal Context:
${JSON.stringify(dealContext, null, 2)}

Similar Won Deals:
${JSON.stringify(similarDeals || [], null, 2)}

Please provide a helpful, conversational response to their question.`;
    } else if (action === "summary") {
      userPrompt = `Provide a brief 2-3 sentence executive summary of this deal's status and most important consideration:

${JSON.stringify(dealContext, null, 2)}`;
    } else if (action === "negotiation") {
      userPrompt = `The sales rep is about to enter final negotiations. Based on this deal's profile, provide tactical negotiation recommendations:

Deal Data:
${JSON.stringify(dealContext, null, 2)}

Focus on:
1. What concessions can be offered without impacting score
2. What should be protected at all costs
3. Creative alternatives to discounting
4. Recommended counter-offers for common customer requests`;
    } else {
      // Full analysis mode
      userPrompt = `Provide a comprehensive analysis of this deal with recommendations for improvement:

Deal Data:
${JSON.stringify(dealContext, null, 2)}

Similar Won Deals:
${JSON.stringify(similarDeals || [], null, 2)}

Company Strategy: ${marketStrategy?.market_mode || "balanced"} mode
Max allowed discount: ${marketStrategy?.max_discount_percent || 30}%

Focus on:
1. Overall deal health assessment
2. The 2-3 most impactful improvements
3. Risks that need addressing before approval
4. How this compares to similar successful deals
5. Next steps for the sales rep`;
    }

    // Call Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices?.[0]?.message?.content || "Unable to generate analysis";

    return new Response(JSON.stringify({ 
      analysis,
      risks,
      recommendations,
      scoreOptimization,
      dealContext: {
        name: deal.name,
        classification: deal.classification,
        total_score: deal.total_score,
      },
      similarDeals: similarDeals || [],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in ai-deal-coach:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
