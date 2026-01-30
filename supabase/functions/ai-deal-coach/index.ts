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
  scores: Array<{
    attribute_name: string;
    category: string;
    raw_value: number;
    normalized_score: number;
  }>;
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

    const { dealId, action } = await req.json();

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
      scores: (scores || []).map((s: any) => ({
        attribute_name: s.scoring_attributes?.name || "Unknown",
        category: s.scoring_attributes?.category || "Unknown",
        raw_value: s.raw_value,
        normalized_score: s.normalized_score,
      })),
    };

    // Fetch similar won deals for comparison
    const { data: similarDeals } = await supabase
      .from("deals")
      .select("name, customer_name, deal_value, total_score, classification")
      .eq("status", "closed_won")
      .gte("deal_value", deal.deal_value * 0.5)
      .lte("deal_value", deal.deal_value * 2)
      .limit(3);

    const systemPrompt = `You are an AI Deal Coach for a B2B sales organization. Your role is to analyze deal data and provide actionable recommendations to improve deal quality, identify risks, and suggest strategies for closing deals successfully.

You have access to:
1. The current deal's scoring attributes and values
2. Similar successfully closed deals for comparison
3. The deal's classification (green = high quality, yellow = needs review, red = exception required)

When analyzing deals:
- Focus on specific, actionable recommendations
- Identify the 2-3 biggest opportunities for improvement
- Highlight any red flags or risks
- Compare against similar successful deals
- Keep responses concise but valuable

Format your response with clear sections:
- **Summary**: 1-2 sentence deal overview
- **Key Risks**: Bullet points of concerns
- **Recommendations**: Numbered action items
- **Similar Wins**: Brief comparison to successful deals`;

    const userPrompt = action === "summary" 
      ? `Provide a brief summary of this deal and its current status:\n\n${JSON.stringify(dealContext, null, 2)}`
      : `Analyze this deal and provide recommendations for improving its score and chances of success:

Deal Data:
${JSON.stringify(dealContext, null, 2)}

Similar Won Deals:
${JSON.stringify(similarDeals || [], null, 2)}

Focus on:
1. Which scoring attributes are holding back the overall score
2. Specific actions to improve weak areas
3. Risks that need to be addressed before approval
4. How this deal compares to similar successful deals`;

    // Call Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", errorText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices?.[0]?.message?.content || "Unable to generate analysis";

    return new Response(JSON.stringify({ 
      analysis,
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
