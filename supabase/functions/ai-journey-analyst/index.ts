import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface JourneyTouchpoint {
  id: string;
  name: string;
  description?: string;
  touchpoint_type: string;
  channel?: string;
  owner_role?: string;
  is_moment_of_truth: boolean;
  pain_point_level: number;
  value_message?: string;
  systems?: string[];
  kpis?: string[];
}

interface JourneyStage {
  id: string;
  name: string;
  description?: string;
  stage_order: number;
  touchpoints?: JourneyTouchpoint[];
}

interface Journey {
  id: string;
  name: string;
  description?: string;
  journey_type: string;
  stages?: JourneyStage[];
}

interface AnalysisRequest {
  journeyId: string;
  journeyData: Journey;
  analysisType: 'touchpoint' | 'stage' | 'journey' | 'cross_journey';
  touchpointId?: string;
  stageId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { journeyData, analysisType, touchpointId, stageId }: AnalysisRequest = await req.json();
    
    const stages = journeyData.stages || [];
    const allTouchpoints = stages.flatMap(s => s.touchpoints || []);

    // Build context for AI analysis
    const analysisContext = buildAnalysisContext(journeyData, stages, allTouchpoints, analysisType, touchpointId, stageId);

    const systemPrompt = `You are an expert Revenue Operations analyst specializing in B2B SaaS customer journey optimization. 
You analyze customer journeys to identify friction points, revenue leakage, and improvement opportunities.

Your analysis should:
1. Identify specific friction points with estimated revenue impact
2. Compare current state to world-class benchmarks
3. Provide actionable, prioritized recommendations
4. Focus on measurable improvements

Always provide dollar estimates for revenue impact based on:
- High pain points (level 4-5): ~$80,000/quarter impact each
- Missing value messages at Moments of Truth: ~$50,000/quarter each
- Missing systems/automation: ~$20,000/quarter each
- Missing KPIs (no measurement): ~$25,000/quarter each

Be specific and actionable. Avoid generic advice.`;

    const userPrompt = `Analyze this ${analysisType} and provide structured recommendations:

${analysisContext}

Provide your analysis in this JSON format:
{
  "summary": "One paragraph executive summary of key findings",
  "overallScore": <0-100 score>,
  "frictionPoints": [
    {
      "touchpointName": "name",
      "stageName": "stage",
      "painLevel": <1-5>,
      "issue": "specific issue description",
      "estimatedImpact": <dollar amount>,
      "rootCause": "why this is happening",
      "recommendation": "specific fix"
    }
  ],
  "recommendations": [
    {
      "priority": <1-5>,
      "title": "action title",
      "description": "detailed description",
      "estimatedImpact": <dollar amount>,
      "difficulty": "low|medium|high",
      "timeframe": "e.g., 1-2 weeks",
      "category": "Value Messaging|Process Optimization|Technology|Analytics|Training"
    }
  ],
  "systemicPatterns": ["pattern1", "pattern2"],
  "quickWins": ["quick win 1", "quick win 2"]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      // Return fallback analysis
      return new Response(JSON.stringify(generateFallbackAnalysis(stages, allTouchpoints)), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify(generateFallbackAnalysis(stages, allTouchpoints)), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse JSON from AI response
    let analysis;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                       content.match(/```\n?([\s\S]*?)\n?```/) ||
                       [null, content];
      analysis = JSON.parse(jsonMatch[1] || content);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      analysis = generateFallbackAnalysis(stages, allTouchpoints);
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        summary: "Analysis temporarily unavailable. Using fallback recommendations.",
        recommendations: []
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildAnalysisContext(
  journey: Journey,
  stages: JourneyStage[],
  allTouchpoints: JourneyTouchpoint[],
  analysisType: string,
  touchpointId?: string,
  stageId?: string
): string {
  let context = `Journey: ${journey.name} (${journey.journey_type})\n`;
  context += `Description: ${journey.description || 'Not provided'}\n\n`;
  
  context += `Total Stages: ${stages.length}\n`;
  context += `Total Touchpoints: ${allTouchpoints.length}\n\n`;

  // Summary stats
  const momentsOfTruth = allTouchpoints.filter(t => t.is_moment_of_truth);
  const highPainPoints = allTouchpoints.filter(t => t.pain_point_level >= 4);
  const missingValueMsg = allTouchpoints.filter(t => t.is_moment_of_truth && !t.value_message);
  const missingSystems = allTouchpoints.filter(t => !t.systems || t.systems.length === 0);
  const missingKPIs = allTouchpoints.filter(t => !t.kpis || t.kpis.length === 0);

  context += `Key Metrics:\n`;
  context += `- Moments of Truth: ${momentsOfTruth.length}\n`;
  context += `- High Friction Points (pain 4-5): ${highPainPoints.length}\n`;
  context += `- MOTs missing value messages: ${missingValueMsg.length}\n`;
  context += `- Touchpoints without systems: ${missingSystems.length}\n`;
  context += `- Touchpoints without KPIs: ${missingKPIs.length}\n\n`;

  // Detail by stage
  context += `Stage Details:\n`;
  stages.forEach(stage => {
    const tps = stage.touchpoints || [];
    context += `\n## ${stage.name} (${tps.length} touchpoints)\n`;
    tps.forEach(tp => {
      context += `  - ${tp.name}`;
      if (tp.is_moment_of_truth) context += ` ⭐MOT`;
      if (tp.pain_point_level >= 4) context += ` 🔴Pain:${tp.pain_point_level}`;
      if (!tp.value_message && tp.is_moment_of_truth) context += ` ❌NoValueMsg`;
      if (!tp.systems || tp.systems.length === 0) context += ` ⚠️NoSystems`;
      context += `\n`;
    });
  });

  return context;
}

function generateFallbackAnalysis(stages: JourneyStage[], allTouchpoints: JourneyTouchpoint[]) {
  const recommendations = [];
  let totalImpact = 0;

  // Check for value message gaps
  const momentsOfTruthWithoutValue = allTouchpoints.filter(
    tp => tp.is_moment_of_truth && !tp.value_message
  );
  if (momentsOfTruthWithoutValue.length > 0) {
    const impact = momentsOfTruthWithoutValue.length * 50000;
    totalImpact += impact;
    recommendations.push({
      priority: 1,
      title: 'Add Value Messages to Moments of Truth',
      description: `${momentsOfTruthWithoutValue.length} critical touchpoints lack defined value messages. These are make-or-break moments that directly impact conversion.`,
      estimatedImpact: impact,
      difficulty: 'low',
      timeframe: '1-2 weeks',
      category: 'Value Messaging',
    });
  }

  // Check for high pain points
  const highPainPoints = allTouchpoints.filter(tp => tp.pain_point_level >= 4);
  if (highPainPoints.length > 0) {
    const impact = highPainPoints.length * 80000;
    totalImpact += impact;
    recommendations.push({
      priority: 2,
      title: 'Address High-Friction Touchpoints',
      description: `${highPainPoints.length} touchpoints have critical friction levels causing customer drop-off. Focus on process optimization and automation.`,
      estimatedImpact: impact,
      difficulty: 'medium',
      timeframe: '4-6 weeks',
      category: 'Process Optimization',
    });
  }

  // Check for missing systems
  const withoutSystems = allTouchpoints.filter(tp => !tp.systems || tp.systems.length === 0);
  if (withoutSystems.length > 5) {
    const impact = withoutSystems.length * 20000;
    totalImpact += impact;
    recommendations.push({
      priority: 3,
      title: 'Implement Tech Stack Coverage',
      description: `${withoutSystems.length} touchpoints lack defined systems. Manual processes increase error rates and slow velocity.`,
      estimatedImpact: impact,
      difficulty: 'high',
      timeframe: '2-3 months',
      category: 'Technology',
    });
  }

  // Check for missing KPIs
  const withoutKPIs = allTouchpoints.filter(tp => !tp.kpis || tp.kpis.length === 0);
  if (withoutKPIs.length > 5) {
    const impact = withoutKPIs.length * 25000;
    totalImpact += impact;
    recommendations.push({
      priority: 4,
      title: 'Establish Measurement Framework',
      description: `${withoutKPIs.length} touchpoints have no KPIs defined. Without measurement, optimization is impossible.`,
      estimatedImpact: impact,
      difficulty: 'medium',
      timeframe: '3-4 weeks',
      category: 'Analytics',
    });
  }

  // Calculate overall score
  let score = 100;
  score -= momentsOfTruthWithoutValue.length * 5;
  score -= highPainPoints.length * 4;
  score -= Math.min(withoutSystems.length, 10) * 2;
  score -= Math.min(withoutKPIs.length, 10) * 1;
  score = Math.max(0, Math.min(100, score));

  return {
    summary: `This journey has ${recommendations.length} key areas for improvement. Addressing these could recover approximately $${(totalImpact / 1000).toFixed(0)}K in quarterly revenue. Top priority: ${recommendations[0]?.title || 'Continue monitoring'}.`,
    overallScore: score,
    frictionPoints: highPainPoints.map(tp => ({
      touchpointName: tp.name,
      stageName: 'Unknown',
      painLevel: tp.pain_point_level,
      issue: 'High friction causing customer drop-off',
      estimatedImpact: 80000,
      rootCause: 'Process complexity or manual steps',
      recommendation: 'Automate or streamline this touchpoint',
    })),
    recommendations,
    systemicPatterns: [
      withoutSystems.length > 5 ? 'Tech stack gaps across multiple stages' : null,
      momentsOfTruthWithoutValue.length > 0 ? 'Value messaging gaps at critical moments' : null,
      withoutKPIs.length > 5 ? 'Measurement gaps preventing optimization' : null,
    ].filter(Boolean),
    quickWins: [
      recommendations.find(r => r.difficulty === 'low')?.title,
      'Document existing tribal knowledge for key touchpoints',
    ].filter(Boolean),
  };
}
