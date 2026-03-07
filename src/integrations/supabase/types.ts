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
      about_content: {
        Row: {
          created_at: string
          id: string
          paragraph_1: string
          paragraph_2: string | null
          paragraph_3: string | null
          stat_patients: string | null
          stat_treatments: string | null
          stat_years: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          paragraph_1?: string
          paragraph_2?: string | null
          paragraph_3?: string | null
          stat_patients?: string | null
          stat_treatments?: string | null
          stat_years?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          paragraph_1?: string
          paragraph_2?: string | null
          paragraph_3?: string | null
          stat_patients?: string | null
          stat_treatments?: string | null
          stat_years?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string
          read: boolean
        }
        Insert: {
          created_at?: string
          email?: string
          id?: string
          message: string
          name: string
          phone?: string
          read?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string
          read?: boolean
        }
        Relationships: []
      }
      dentists: {
        Row: {
          active: boolean
          bio: string
          created_at: string
          cro: string
          display_order: number
          id: string
          name: string
          photo_url: string | null
          specialty: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          bio?: string
          created_at?: string
          cro?: string
          display_order?: number
          id?: string
          name: string
          photo_url?: string | null
          specialty?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          bio?: string
          created_at?: string
          cro?: string
          display_order?: number
          id?: string
          name?: string
          photo_url?: string | null
          specialty?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          active: boolean
          created_at: string
          description: string
          event_date: string
          id: string
          image_url: string | null
          location: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string
          event_date?: string
          id?: string
          image_url?: string | null
          location?: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          event_date?: string
          id?: string
          image_url?: string | null
          location?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      features: {
        Row: {
          created_at: string
          description: string
          display_order: number
          icon: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          display_order?: number
          icon?: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          icon?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      roadmap_items: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          phase: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          phase?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          phase?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          can_delete: boolean | null
          can_edit: boolean | null
          can_view: boolean | null
          id: string
          module: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          id?: string
          module: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          id?: string
          module?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean
          benefits: string[] | null
          created_at: string
          description: string
          display_order: number
          icon: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          benefits?: string[] | null
          created_at?: string
          description?: string
          display_order?: number
          icon?: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          benefits?: string[] | null
          created_at?: string
          description?: string
          display_order?: number
          icon?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          about_image: string | null
          address: string
          created_at: string
          email: string
          facebook_url: string | null
          google_maps_embed_url: string | null
          hero_bg_image: string | null
          hero_doctor_image: string | null
          hero_subtitle: string
          hero_title: string
          hours_saturday: string | null
          hours_weekday: string
          id: string
          instagram_url: string | null
          phone: string
          phone_secondary: string | null
          updated_at: string
          whatsapp_message: string | null
          whatsapp_number: string
        }
        Insert: {
          about_image?: string | null
          address?: string
          created_at?: string
          email?: string
          facebook_url?: string | null
          google_maps_embed_url?: string | null
          hero_bg_image?: string | null
          hero_doctor_image?: string | null
          hero_subtitle?: string
          hero_title?: string
          hours_saturday?: string | null
          hours_weekday?: string
          id?: string
          instagram_url?: string | null
          phone?: string
          phone_secondary?: string | null
          updated_at?: string
          whatsapp_message?: string | null
          whatsapp_number?: string
        }
        Update: {
          about_image?: string | null
          address?: string
          created_at?: string
          email?: string
          facebook_url?: string | null
          google_maps_embed_url?: string | null
          hero_bg_image?: string | null
          hero_doctor_image?: string | null
          hero_subtitle?: string
          hero_title?: string
          hours_saturday?: string | null
          hours_weekday?: string
          id?: string
          instagram_url?: string | null
          phone?: string
          phone_secondary?: string | null
          updated_at?: string
          whatsapp_message?: string | null
          whatsapp_number?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          active: boolean
          created_at: string
          featured: boolean
          id: string
          patient_name: string
          rating: number
          text: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          featured?: boolean
          id?: string
          patient_name: string
          rating?: number
          text: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          featured?: boolean
          id?: string
          patient_name?: string
          rating?: number
          text?: string
          updated_at?: string
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
      videos: {
        Row: {
          active: boolean
          created_at: string
          description: string
          display_order: number
          featured: boolean
          id: string
          title: string
          updated_at: string
          youtube_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string
          display_order?: number
          featured?: boolean
          id?: string
          title: string
          updated_at?: string
          youtube_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          display_order?: number
          featured?: boolean
          id?: string
          title?: string
          updated_at?: string
          youtube_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "user"
        | "socio"
        | "gerente"
        | "dentista"
        | "recepcionista"
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
      app_role: [
        "admin",
        "user",
        "socio",
        "gerente",
        "dentista",
        "recepcionista",
      ],
    },
  },
} as const
