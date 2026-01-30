import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AutoApproveRequest {
  dealId: string;
}

interface AutoApproveResponse {
  success: boolean;
  autoApproved: boolean;
  message: string;
  deal?: {
    id: string;
    name: string;
    classification: string;
    segment: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { dealId } = await req.json() as AutoApproveRequest;

    if (!dealId) {
      throw new Error("Deal ID is required");
    }

    // Fetch the deal
    const { data: deal, error: dealError } = await supabaseClient
      .from("deals")
      .select("*")
      .eq("id", dealId)
      .single();

    if (dealError || !deal) {
      throw new Error("Deal not found");
    }

    // Check if deal is already approved or not pending
    if (deal.status !== "pending_approval" && deal.status !== "pending_score") {
      return new Response(
        JSON.stringify({
          success: false,
          autoApproved: false,
          message: `Deal is in ${deal.status} status and cannot be auto-approved`,
        } as AutoApproveResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if deal has a classification and score
    if (!deal.classification || deal.total_score === null) {
      return new Response(
        JSON.stringify({
          success: false,
          autoApproved: false,
          message: "Deal must be scored before auto-approval check",
        } as AutoApproveResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find matching segment for this deal
    const { data: segments, error: segmentError } = await supabaseClient
      .from("deal_segments")
      .select("*")
      .eq("is_active", true)
      .order("priority", { ascending: true });

    if (segmentError) {
      throw segmentError;
    }

    // Find the best matching segment
    const matchingSegment = segments?.find(seg => {
      const valueMatch = deal.deal_value >= seg.min_deal_value && 
        (seg.max_deal_value === null || deal.deal_value <= seg.max_deal_value);
      const scoreMatch = deal.total_score >= seg.min_score && deal.total_score <= seg.max_score;
      return valueMatch && scoreMatch;
    });

    if (!matchingSegment) {
      return new Response(
        JSON.stringify({
          success: true,
          autoApproved: false,
          message: "No matching segment found - manual review required",
        } as AutoApproveResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update deal with segment_id if not set
    if (!deal.segment_id) {
      await supabaseClient
        .from("deals")
        .update({ segment_id: matchingSegment.id })
        .eq("id", dealId);
    }

    // Check if auto-approve is enabled for this segment
    if (!matchingSegment.auto_approve_enabled) {
      return new Response(
        JSON.stringify({
          success: true,
          autoApproved: false,
          message: `Deal assigned to "${matchingSegment.name}" segment - requires Level ${matchingSegment.approval_level} approval`,
          deal: {
            id: deal.id,
            name: deal.name,
            classification: deal.classification,
            segment: matchingSegment.name,
          },
        } as AutoApproveResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // AUTO-APPROVE the deal!
    const { error: updateError } = await supabaseClient
      .from("deals")
      .update({
        status: "approved",
        auto_approved: true,
        approved_at: new Date().toISOString(),
        segment_id: matchingSegment.id,
      })
      .eq("id", dealId);

    if (updateError) {
      throw updateError;
    }

    // Add a note about auto-approval
    await supabaseClient
      .from("deal_notes")
      .insert({
        deal_id: dealId,
        user_id: deal.owner_id,
        note_type: "approval",
        content: `🎉 Deal auto-approved! Matched segment "${matchingSegment.name}" with ${matchingSegment.touch_model} touch model.`,
        metadata: {
          segment_id: matchingSegment.id,
          segment_name: matchingSegment.name,
          auto_approved: true,
          score: deal.total_score,
          classification: deal.classification,
        },
      });

    return new Response(
      JSON.stringify({
        success: true,
        autoApproved: true,
        message: `🎉 Deal auto-approved! Matched "${matchingSegment.name}" segment.`,
        deal: {
          id: deal.id,
          name: deal.name,
          classification: deal.classification,
          segment: matchingSegment.name,
        },
      } as AutoApproveResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Auto-approve error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, autoApproved: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});