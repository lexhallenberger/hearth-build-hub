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
      deal_classification: "green" | "yellow" | "red"
      deal_status:
        | "draft"
        | "pending_score"
        | "pending_approval"
        | "approved"
        | "rejected"
        | "closed_won"
        | "closed_lost"
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
      scoring_category: ["financial", "strategic", "risk", "customer"],
    },
  },
} as const
