export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      campaigns: {
        Row: {
          actual_spend: number | null
          budget: number | null
          campaign_type: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          name: string
          owner_id: string
          start_date: string | null
          target_leads: number | null
          updated_at: string
        }
        Insert: {
          actual_spend?: number | null
          budget?: number | null
          campaign_type?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          owner_id: string
          start_date?: string | null
          target_leads?: number | null
          updated_at?: string
        }
        Update: {
          actual_spend?: number | null
          budget?: number | null
          campaign_type?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          owner_id?: string
          start_date?: string | null
          target_leads?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      customer_health_scores: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          indicators: Json | null
          score: number
          scored_at: string
          scored_by: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          indicators?: Json | null
          score: number
          scored_at?: string
          scored_by?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          indicators?: Json | null
          score?: number
          scored_at?: string
          scored_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_health_scores_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          arr: number | null
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string
          health_score: number | null
          health_status: Database["public"]["Enums"]["health_status"] | null
          id: string
          industry: string | null
          logo_url: string | null
          mrr: number | null
          name: string
          notes: string | null
          owner_id: string
          primary_contact_email: string | null
          primary_contact_name: string | null
          tier: Database["public"]["Enums"]["customer_tier"]
          updated_at: string
        }
        Insert: {
          arr?: number | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          health_score?: number | null
          health_status?: Database["public"]["Enums"]["health_status"] | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          mrr?: number | null
          name: string
          notes?: string | null
          owner_id: string
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          tier?: Database["public"]["Enums"]["customer_tier"]
          updated_at?: string
        }
        Update: {
          arr?: number | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          health_score?: number | null
          health_status?: Database["public"]["Enums"]["health_status"] | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          mrr?: number | null
          name?: string
          notes?: string | null
          owner_id?: string
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          tier?: Database["public"]["Enums"]["customer_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      deal_approvals: {
        Row: {
          approval_level: number
          assigned_to: string | null
          created_at: string
          deal_id: string
          id: string
          request_notes: string | null
          requested_at: string
          requested_by: string
          responded_at: string | null
          response_notes: string | null
          status: Database["public"]["Enums"]["approval_status"]
        }
        Insert: {
          approval_level?: number
          assigned_to?: string | null
          created_at?: string
          deal_id: string
          id?: string
          request_notes?: string | null
          requested_at?: string
          requested_by: string
          responded_at?: string | null
          response_notes?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Update: {
          approval_level?: number
          assigned_to?: string | null
          created_at?: string
          deal_id?: string
          id?: string
          request_notes?: string | null
          requested_at?: string
          requested_by?: string
          responded_at?: string | null
          response_notes?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Relationships: [
          {
            foreignKeyName: "deal_approvals_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_notes: {
        Row: {
          content: string
          created_at: string
          deal_id: string
          id: string
          metadata: Json | null
          note_type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          deal_id: string
          id?: string
          metadata?: Json | null
          note_type?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          deal_id?: string
          id?: string
          metadata?: Json | null
          note_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_notes_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_scores: {
        Row: {
          attribute_id: string
          deal_id: string
          id: string
          normalized_score: number
          notes: string | null
          raw_value: number
          scored_at: string
          scored_by: string | null
        }
        Insert: {
          attribute_id: string
          deal_id: string
          id?: string
          normalized_score: number
          notes?: string | null
          raw_value: number
          scored_at?: string
          scored_by?: string | null
        }
        Update: {
          attribute_id?: string
          deal_id?: string
          id?: string
          normalized_score?: number
          notes?: string | null
          raw_value?: number
          scored_at?: string
          scored_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_scores_attribute_id_fkey"
            columns: ["attribute_id"]
            isOneToOne: false
            referencedRelation: "scoring_attributes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_scores_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          actual_close_date: string | null
          classification:
            | Database["public"]["Enums"]["deal_classification"]
            | null
          contract_length_months: number | null
          created_at: string
          customer_name: string
          deal_value: number
          description: string | null
          discount_percent: number | null
          expected_close_date: string | null
          id: string
          name: string
          owner_id: string
          payment_terms: string | null
          products: Json | null
          status: Database["public"]["Enums"]["deal_status"]
          total_score: number | null
          updated_at: string
        }
        Insert: {
          actual_close_date?: string | null
          classification?:
            | Database["public"]["Enums"]["deal_classification"]
            | null
          contract_length_months?: number | null
          created_at?: string
          customer_name: string
          deal_value?: number
          description?: string | null
          discount_percent?: number | null
          expected_close_date?: string | null
          id?: string
          name: string
          owner_id: string
          payment_terms?: string | null
          products?: Json | null
          status?: Database["public"]["Enums"]["deal_status"]
          total_score?: number | null
          updated_at?: string
        }
        Update: {
          actual_close_date?: string | null
          classification?:
            | Database["public"]["Enums"]["deal_classification"]
            | null
          contract_length_months?: number | null
          created_at?: string
          customer_name?: string
          deal_value?: number
          description?: string | null
          discount_percent?: number | null
          expected_close_date?: string | null
          id?: string
          name?: string
          owner_id?: string
          payment_terms?: string | null
          products?: Json | null
          status?: Database["public"]["Enums"]["deal_status"]
          total_score?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      journey_metrics: {
        Row: {
          avg_time_in_stage_days: number | null
          conversions: number | null
          created_at: string
          entries: number | null
          exits: number | null
          id: string
          journey_id: string
          period_end: string
          period_start: string
          stage_id: string | null
        }
        Insert: {
          avg_time_in_stage_days?: number | null
          conversions?: number | null
          created_at?: string
          entries?: number | null
          exits?: number | null
          id?: string
          journey_id: string
          period_end: string
          period_start: string
          stage_id?: string | null
        }
        Update: {
          avg_time_in_stage_days?: number | null
          conversions?: number | null
          created_at?: string
          entries?: number | null
          exits?: number | null
          id?: string
          journey_id?: string
          period_end?: string
          period_start?: string
          stage_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journey_metrics_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_metrics_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "journey_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_stages: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          journey_id: string
          name: string
          stage_order: number
          target_conversion_rate: number | null
          target_time_days: number | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          journey_id: string
          name: string
          stage_order?: number
          target_conversion_rate?: number | null
          target_time_days?: number | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          journey_id?: string
          name?: string
          stage_order?: number
          target_conversion_rate?: number | null
          target_time_days?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_stages_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_touchpoints: {
        Row: {
          channel: string | null
          created_at: string
          description: string | null
          id: string
          is_moment_of_truth: boolean | null
          name: string
          owner_role: string | null
          pain_point_level: number | null
          stage_id: string
          touchpoint_order: number
          touchpoint_type: string
          updated_at: string
          value_message: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_moment_of_truth?: boolean | null
          name: string
          owner_role?: string | null
          pain_point_level?: number | null
          stage_id: string
          touchpoint_order?: number
          touchpoint_type?: string
          updated_at?: string
          value_message?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_moment_of_truth?: boolean | null
          name?: string
          owner_role?: string | null
          pain_point_level?: number | null
          stage_id?: string
          touchpoint_order?: number
          touchpoint_type?: string
          updated_at?: string
          value_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journey_touchpoints_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "journey_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      journeys: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          is_template: boolean | null
          journey_type: Database["public"]["Enums"]["journey_type"]
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_template?: boolean | null
          journey_type: Database["public"]["Enums"]["journey_type"]
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_template?: boolean | null
          journey_type?: Database["public"]["Enums"]["journey_type"]
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_activities: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          lead_id: string
          outcome: string | null
          subject: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          lead_id: string
          outcome?: string | null
          subject?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string
          outcome?: string | null
          subject?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          campaign_id: string | null
          company: string | null
          converted_at: string | null
          converted_to_opportunity_id: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          interests: string[] | null
          last_name: string
          notes: string | null
          owner_id: string
          pain_points: string[] | null
          phone: string | null
          score: number | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"]
          title: string | null
          updated_at: string
          value_proposition_fit: string | null
        }
        Insert: {
          campaign_id?: string | null
          company?: string | null
          converted_at?: string | null
          converted_to_opportunity_id?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          interests?: string[] | null
          last_name: string
          notes?: string | null
          owner_id: string
          pain_points?: string[] | null
          phone?: string | null
          score?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          title?: string | null
          updated_at?: string
          value_proposition_fit?: string | null
        }
        Update: {
          campaign_id?: string | null
          company?: string | null
          converted_at?: string | null
          converted_to_opportunity_id?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          interests?: string[] | null
          last_name?: string
          notes?: string | null
          owner_id?: string
          pain_points?: string[] | null
          phone?: string | null
          score?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          title?: string | null
          updated_at?: string
          value_proposition_fit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_converted_to_opportunity_id_fkey"
            columns: ["converted_to_opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          actual_close_date: string | null
          amount: number | null
          campaign_id: string | null
          company: string
          competitive_situation: string | null
          contact_email: string | null
          contact_name: string | null
          created_at: string
          deal_id: string | null
          expected_close_date: string | null
          id: string
          lead_id: string | null
          lost_reason: string | null
          name: string
          owner_id: string
          primary_value_message: string | null
          probability: number | null
          stage: Database["public"]["Enums"]["opportunity_stage"]
          updated_at: string
        }
        Insert: {
          actual_close_date?: string | null
          amount?: number | null
          campaign_id?: string | null
          company: string
          competitive_situation?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          deal_id?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          lost_reason?: string | null
          name: string
          owner_id: string
          primary_value_message?: string | null
          probability?: number | null
          stage?: Database["public"]["Enums"]["opportunity_stage"]
          updated_at?: string
        }
        Update: {
          actual_close_date?: string | null
          amount?: number | null
          campaign_id?: string | null
          company?: string
          competitive_situation?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          deal_id?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          lost_reason?: string | null
          name?: string
          owner_id?: string
          primary_value_message?: string | null
          probability?: number | null
          stage?: Database["public"]["Enums"]["opportunity_stage"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          team: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          team?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          team?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      renewals: {
        Row: {
          created_at: string
          current_value: number | null
          customer_id: string
          deal_id: string | null
          id: string
          notes: string | null
          owner_id: string
          proposed_value: number | null
          renewal_date: string
          risk_factors: string[] | null
          risk_level: string | null
          status: Database["public"]["Enums"]["renewal_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          customer_id: string
          deal_id?: string | null
          id?: string
          notes?: string | null
          owner_id: string
          proposed_value?: number | null
          renewal_date: string
          risk_factors?: string[] | null
          risk_level?: string | null
          status?: Database["public"]["Enums"]["renewal_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_value?: number | null
          customer_id?: string
          deal_id?: string | null
          id?: string
          notes?: string | null
          owner_id?: string
          proposed_value?: number | null
          renewal_date?: string
          risk_factors?: string[] | null
          risk_level?: string | null
          status?: Database["public"]["Enums"]["renewal_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "renewals_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renewals_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      scoring_attributes: {
        Row: {
          category: Database["public"]["Enums"]["scoring_category"]
          created_at: string
          description: string | null
          display_order: number | null
          evaluation_type: string
          green_threshold: number | null
          higher_is_better: boolean | null
          id: string
          is_active: boolean | null
          max_value: number | null
          min_value: number | null
          name: string
          updated_at: string
          weight: number
          yellow_threshold: number | null
        }
        Insert: {
          category: Database["public"]["Enums"]["scoring_category"]
          created_at?: string
          description?: string | null
          display_order?: number | null
          evaluation_type?: string
          green_threshold?: number | null
          higher_is_better?: boolean | null
          id?: string
          is_active?: boolean | null
          max_value?: number | null
          min_value?: number | null
          name: string
          updated_at?: string
          weight?: number
          yellow_threshold?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["scoring_category"]
          created_at?: string
          description?: string | null
          display_order?: number | null
          evaluation_type?: string
          green_threshold?: number | null
          higher_is_better?: boolean | null
          id?: string
          is_active?: boolean | null
          max_value?: number | null
          min_value?: number | null
          name?: string
          updated_at?: string
          weight?: number
          yellow_threshold?: number | null
        }
        Relationships: []
      }
      scoring_thresholds: {
        Row: {
          auto_approve_green: boolean | null
          created_at: string
          green_min: number
          id: string
          updated_at: string
          yellow_min: number
        }
        Insert: {
          auto_approve_green?: boolean | null
          created_at?: string
          green_min?: number
          id?: string
          updated_at?: string
          yellow_min?: number
        }
        Update: {
          auto_approve_green?: boolean | null
          created_at?: string
          green_min?: number
          id?: string
          updated_at?: string
          yellow_min?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      value_messages: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_active: boolean | null
          message: string
          owner_id: string
          target_industry: string | null
          target_persona: string | null
          title: string
          updated_at: string
          usage_count: number | null
          win_rate: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          message: string
          owner_id: string
          target_industry?: string | null
          target_persona?: string | null
          title: string
          updated_at?: string
          usage_count?: number | null
          win_rate?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          message?: string
          owner_id?: string
          target_industry?: string | null
          target_persona?: string | null
          title?: string
          updated_at?: string
          usage_count?: number | null
          win_rate?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_deal_score: {
        Args: { p_deal_id: string }
        Returns: {
          classification: Database["public"]["Enums"]["deal_classification"]
          total_score: number
        }[]
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "sales_rep" | "deal_desk" | "finance" | "executive"
      approval_status: "pending" | "approved" | "rejected" | "escalated"
      customer_tier: "enterprise" | "mid_market" | "smb" | "startup"
      deal_classification: "green" | "yellow" | "red"
      deal_status:
        | "draft"
        | "pending_score"
        | "pending_approval"
        | "approved"
        | "rejected"
        | "closed_won"
        | "closed_lost"
      health_status: "healthy" | "at_risk" | "critical"
      journey_type: "customer" | "seller" | "partner" | "deal"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "unqualified"
        | "converted"
      opportunity_stage:
        | "discovery"
        | "qualification"
        | "proposal"
        | "negotiation"
        | "closed_won"
        | "closed_lost"
      renewal_status:
        | "upcoming"
        | "in_progress"
        | "renewed"
        | "churned"
        | "expanded"
      scoring_category: "financial" | "strategic" | "risk" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "sales_rep", "deal_desk", "finance", "executive"],
      approval_status: ["pending", "approved", "rejected", "escalated"],
      customer_tier: ["enterprise", "mid_market", "smb", "startup"],
      deal_classification: ["green", "yellow", "red"],
      deal_status: [
        "draft",
        "pending_score",
        "pending_approval",
        "approved",
        "rejected",
        "closed_won",
        "closed_lost",
      ],
      health_status: ["healthy", "at_risk", "critical"],
      journey_type: ["customer", "seller", "partner", "deal"],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "unqualified",
        "converted",
      ],
      opportunity_stage: [
        "discovery",
        "qualification",
        "proposal",
        "negotiation",
        "closed_won",
        "closed_lost",
      ],
      renewal_status: [
        "upcoming",
        "in_progress",
        "renewed",
        "churned",
        "expanded",
      ],
      scoring_category: ["financial", "strategic", "risk", "customer"],
    },
  },
} as const
