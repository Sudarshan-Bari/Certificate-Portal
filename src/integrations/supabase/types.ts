export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      application_documents: {
        Row: {
          application_id: string
          document_name: string
          document_type: string
          file_path: string
          file_size: number | null
          id: string
          uploaded_at: string | null
        }
        Insert: {
          application_id: string
          document_name: string
          document_type: string
          file_path: string
          file_size?: number | null
          id?: string
          uploaded_at?: string | null
        }
        Update: {
          application_id?: string
          document_name?: string
          document_type?: string
          file_path?: string
          file_size?: number | null
          id?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "certificate_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_applications: {
        Row: {
          additional_info: string | null
          address: string
          application_id: string
          approved_at: string | null
          assigned_officer: string | null
          certificate_type: Database["public"]["Enums"]["certificate_type"]
          clerk_verified_at: string | null
          created_at: string | null
          current_stage: string | null
          date_of_birth: string
          email: string
          estimated_completion: string | null
          father_name: string
          full_name: string
          id: string
          phone_number: string
          progress: number | null
          purpose: string
          rejected_at: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          staff_reviewed_at: string | null
          status: Database["public"]["Enums"]["application_status"] | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string
          verification_1_at: string | null
          verification_1_by: string | null
          verification_2_at: string | null
          verification_2_by: string | null
          verification_3_at: string | null
          verification_3_by: string | null
        }
        Insert: {
          additional_info?: string | null
          address: string
          application_id: string
          approved_at?: string | null
          assigned_officer?: string | null
          certificate_type: Database["public"]["Enums"]["certificate_type"]
          clerk_verified_at?: string | null
          created_at?: string | null
          current_stage?: string | null
          date_of_birth: string
          email: string
          estimated_completion?: string | null
          father_name: string
          full_name: string
          id?: string
          phone_number: string
          progress?: number | null
          purpose: string
          rejected_at?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          staff_reviewed_at?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
          verification_1_at?: string | null
          verification_1_by?: string | null
          verification_2_at?: string | null
          verification_2_by?: string | null
          verification_3_at?: string | null
          verification_3_by?: string | null
        }
        Update: {
          additional_info?: string | null
          address?: string
          application_id?: string
          approved_at?: string | null
          assigned_officer?: string | null
          certificate_type?: Database["public"]["Enums"]["certificate_type"]
          clerk_verified_at?: string | null
          created_at?: string | null
          current_stage?: string | null
          date_of_birth?: string
          email?: string
          estimated_completion?: string | null
          father_name?: string
          full_name?: string
          id?: string
          phone_number?: string
          progress?: number | null
          purpose?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          staff_reviewed_at?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
          verification_1_at?: string | null
          verification_1_by?: string | null
          verification_2_at?: string | null
          verification_2_by?: string | null
          verification_3_at?: string | null
          verification_3_by?: string | null
        }
        Relationships: []
      }
      certificates: {
        Row: {
          application_id: string
          certificate_data: Json | null
          certificate_number: string
          certificate_type: Database["public"]["Enums"]["certificate_type"]
          created_at: string | null
          digital_signature: string | null
          id: string
          issued_date: string | null
          issued_to: string
          valid_until: string | null
        }
        Insert: {
          application_id: string
          certificate_data?: Json | null
          certificate_number: string
          certificate_type: Database["public"]["Enums"]["certificate_type"]
          created_at?: string | null
          digital_signature?: string | null
          id?: string
          issued_date?: string | null
          issued_to: string
          valid_until?: string | null
        }
        Update: {
          application_id?: string
          certificate_data?: Json | null
          certificate_number?: string
          certificate_type?: Database["public"]["Enums"]["certificate_type"]
          created_at?: string | null
          digital_signature?: string | null
          id?: string
          issued_date?: string | null
          issued_to?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "certificate_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          related_application_id: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          related_application_id?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          related_application_id?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_application_id_fkey"
            columns: ["related_application_id"]
            isOneToOne: false
            referencedRelation: "certificate_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string | null
          full_name: string
          id: string
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          full_name: string
          id: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_application_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      application_status:
        | "pending"
        | "under_review"
        | "approved"
        | "rejected"
        | "document_verification"
        | "verification_level_1"
        | "verification_level_2"
        | "verification_level_3"
        | "staff_review"
        | "awaiting_sdo"
        | "additional_info_needed"
      certificate_type: "caste" | "income" | "domicile" | "residence"
      user_role:
        | "citizen"
        | "admin"
        | "officer"
        | "staff_officer"
        | "sdo"
        | "clerk"
        | "verification_officer_1"
        | "verification_officer_2"
        | "verification_officer_3"
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
      application_status: [
        "pending",
        "under_review",
        "approved",
        "rejected",
        "document_verification",
        "verification_level_1",
        "verification_level_2",
        "verification_level_3",
        "staff_review",
        "awaiting_sdo",
        "additional_info_needed",
      ],
      certificate_type: ["caste", "income", "domicile", "residence"],
      user_role: [
        "citizen",
        "admin",
        "officer",
        "staff_officer",
        "sdo",
        "clerk",
        "verification_officer_1",
        "verification_officer_2",
        "verification_officer_3",
      ],
    },
  },
} as const
