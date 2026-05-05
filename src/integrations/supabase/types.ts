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
      appointments: {
        Row: {
          booked_by: string | null
          created_at: string | null
          duration_minutes: number | null
          google_event_id: string | null
          id: string
          lead_name: string | null
          lead_phone: string
          notes: string | null
          procedure_interest: string | null
          reminder_sent: boolean | null
          scheduled_at: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          booked_by?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          google_event_id?: string | null
          id?: string
          lead_name?: string | null
          lead_phone: string
          notes?: string | null
          procedure_interest?: string | null
          reminder_sent?: boolean | null
          scheduled_at: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          booked_by?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          google_event_id?: string | null
          id?: string
          lead_name?: string | null
          lead_phone?: string
          notes?: string | null
          procedure_interest?: string | null
          reminder_sent?: boolean | null
          scheduled_at?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      before_after_cases: {
        Row: {
          active: boolean
          after_image: string
          before_image: string
          created_at: string
          detail: string
          display_order: number
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          after_image?: string
          before_image?: string
          created_at?: string
          detail?: string
          display_order?: number
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          after_image?: string
          before_image?: string
          created_at?: string
          detail?: string
          display_order?: number
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      connection_logs: {
        Row: {
          created_at: string | null
          disconnect_reason: string | null
          event_data: Json | null
          id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          disconnect_reason?: string | null
          event_data?: Json | null
          id?: string
          status: string
        }
        Update: {
          created_at?: string | null
          disconnect_reason?: string | null
          event_data?: Json | null
          id?: string
          status?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string
          read: boolean
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          email?: string
          id?: string
          message: string
          name: string
          phone?: string
          read?: boolean
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string
          read?: boolean
        }
        Relationships: []
      }
      conversations_log: {
        Row: {
          audio_pending: boolean | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          direction: string | null
          hidden_from_ai: boolean | null
          id: string
          is_audio: boolean | null
          lead_phone: string
          message_text: string | null
          message_type: string | null
          remote_jid: string
          sent_by: string | null
          whatsapp_message_id: string | null
          whatsapp_timestamp: number | null
        }
        Insert: {
          audio_pending?: boolean | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          direction?: string | null
          hidden_from_ai?: boolean | null
          id?: string
          is_audio?: boolean | null
          lead_phone: string
          message_text?: string | null
          message_type?: string | null
          remote_jid: string
          sent_by?: string | null
          whatsapp_message_id?: string | null
          whatsapp_timestamp?: number | null
        }
        Update: {
          audio_pending?: boolean | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          direction?: string | null
          hidden_from_ai?: boolean | null
          id?: string
          is_audio?: boolean | null
          lead_phone?: string
          message_text?: string | null
          message_type?: string | null
          remote_jid?: string
          sent_by?: string | null
          whatsapp_message_id?: string | null
          whatsapp_timestamp?: number | null
        }
        Relationships: []
      }
      deleted_message_audit: {
        Row: {
          author: string | null
          author_phone: string | null
          content: string
          deleted_at: string
          deleted_by: string | null
          deletion_reason: string | null
          id: string
          metadata: Json | null
          sent_at: string
          source_id: string
          source_table: string
        }
        Insert: {
          author?: string | null
          author_phone?: string | null
          content: string
          deleted_at?: string
          deleted_by?: string | null
          deletion_reason?: string | null
          id?: string
          metadata?: Json | null
          sent_at: string
          source_id: string
          source_table: string
        }
        Update: {
          author?: string | null
          author_phone?: string | null
          content?: string
          deleted_at?: string
          deleted_by?: string | null
          deletion_reason?: string | null
          id?: string
          metadata?: Json | null
          sent_at?: string
          source_id?: string
          source_table?: string
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
      lead_tag_assignments: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_tag_assignments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "lead_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_tags: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          ai_enabled: boolean | null
          assigned_to: string | null
          created_at: string | null
          data_agendamento: string | null
          first_contact_at: string | null
          gcal_event_id: string | null
          id: string
          ja_e_paciente: boolean | null
          last_contact_at: string | null
          last_message_preview: string | null
          name: string | null
          notes: string | null
          phone: string
          priority: number | null
          procedimento_interesse: string | null
          profile_pic_url: string | null
          push_name: string | null
          resumo: string | null
          sla_due_at: string | null
          status: string | null
          total_messages_in: number | null
          total_messages_out: number | null
          ultimo_interesse: string | null
          updated_at: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          ai_enabled?: boolean | null
          assigned_to?: string | null
          created_at?: string | null
          data_agendamento?: string | null
          first_contact_at?: string | null
          gcal_event_id?: string | null
          id?: string
          ja_e_paciente?: boolean | null
          last_contact_at?: string | null
          last_message_preview?: string | null
          name?: string | null
          notes?: string | null
          phone: string
          priority?: number | null
          procedimento_interesse?: string | null
          profile_pic_url?: string | null
          push_name?: string | null
          resumo?: string | null
          sla_due_at?: string | null
          status?: string | null
          total_messages_in?: number | null
          total_messages_out?: number | null
          ultimo_interesse?: string | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          ai_enabled?: boolean | null
          assigned_to?: string | null
          created_at?: string | null
          data_agendamento?: string | null
          first_contact_at?: string | null
          gcal_event_id?: string | null
          id?: string
          ja_e_paciente?: boolean | null
          last_contact_at?: string | null
          last_message_preview?: string | null
          name?: string | null
          notes?: string | null
          phone?: string
          priority?: number | null
          procedimento_interesse?: string | null
          profile_pic_url?: string | null
          push_name?: string | null
          resumo?: string | null
          sla_due_at?: string | null
          status?: string | null
          total_messages_in?: number | null
          total_messages_out?: number | null
          ultimo_interesse?: string | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
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
      section_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          section_name: string
          session_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          section_name: string
          session_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          section_name?: string
          session_id?: string
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
          chat_enabled: boolean
          created_at: string
          email: string
          facebook_url: string | null
          google_maps_embed_url: string | null
          google_reviews_url: string | null
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
          chat_enabled?: boolean
          created_at?: string
          email?: string
          facebook_url?: string | null
          google_maps_embed_url?: string | null
          google_reviews_url?: string | null
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
          chat_enabled?: boolean
          created_at?: string
          email?: string
          facebook_url?: string | null
          google_maps_embed_url?: string | null
          google_reviews_url?: string | null
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
      traffic_sessions: {
        Row: {
          browser: string | null
          browser_in_app: boolean | null
          created_at: string
          device_os: string | null
          fbclid: string | null
          gclid: string | null
          id: string
          network_type: string | null
          referrer: string | null
          screen_resolution: string | null
          session_id: string
          ttclid: string | null
          user_language: string | null
          user_timezone: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          browser?: string | null
          browser_in_app?: boolean | null
          created_at?: string
          device_os?: string | null
          fbclid?: string | null
          gclid?: string | null
          id?: string
          network_type?: string | null
          referrer?: string | null
          screen_resolution?: string | null
          session_id: string
          ttclid?: string | null
          user_language?: string | null
          user_timezone?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          browser?: string | null
          browser_in_app?: boolean | null
          created_at?: string
          device_os?: string | null
          fbclid?: string | null
          gclid?: string | null
          id?: string
          network_type?: string | null
          referrer?: string | null
          screen_resolution?: string | null
          session_id?: string
          ttclid?: string | null
          user_language?: string | null
          user_timezone?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          active: boolean
          avatar_url: string | null
          created_at: string
          department: string | null
          full_name: string | null
          job_title: string | null
          last_login_at: string | null
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          full_name?: string | null
          job_title?: string | null
          last_login_at?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          full_name?: string | null
          job_title?: string | null
          last_login_at?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
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
      vera_audit_log: {
        Row: {
          acao: string
          criado_em: string | null
          dados_antes: Json | null
          dados_depois: Json | null
          id: number
          ip: string | null
          registro_id: string | null
          tabela: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          acao: string
          criado_em?: string | null
          dados_antes?: Json | null
          dados_depois?: Json | null
          id?: number
          ip?: string | null
          registro_id?: string | null
          tabela?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          acao?: string
          criado_em?: string | null
          dados_antes?: Json | null
          dados_depois?: Json | null
          id?: number
          ip?: string | null
          registro_id?: string | null
          tabela?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      vera_config: {
        Row: {
          ai_enabled: boolean | null
          away_message: string | null
          greeting_message: string | null
          id: string
          system_prompt: string | null
          updated_at: string | null
          working_days: number[] | null
          working_hours_end: string | null
          working_hours_start: string | null
        }
        Insert: {
          ai_enabled?: boolean | null
          away_message?: string | null
          greeting_message?: string | null
          id?: string
          system_prompt?: string | null
          updated_at?: string | null
          working_days?: number[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Update: {
          ai_enabled?: boolean | null
          away_message?: string | null
          greeting_message?: string | null
          id?: string
          system_prompt?: string | null
          updated_at?: string | null
          working_days?: number[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Relationships: []
      }
      vera_conversation_state: {
        Row: {
          channel: string
          chat_id: string
          id: number
          spin_stage: string
          stage_entered_at: string | null
          updated_at: string | null
        }
        Insert: {
          channel: string
          chat_id: string
          id?: number
          spin_stage?: string
          stage_entered_at?: string | null
          updated_at?: string | null
        }
        Update: {
          channel?: string
          chat_id?: string
          id?: number
          spin_stage?: string
          stage_entered_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vera_handoff_queue: {
        Row: {
          assumido_em: string | null
          assumido_por: string | null
          channel: string
          chat_id: string
          criado_em: string | null
          id: number
          motivo: string
          notas: string | null
          payload: Json | null
          resolvido_em: string | null
          status: string
        }
        Insert: {
          assumido_em?: string | null
          assumido_por?: string | null
          channel: string
          chat_id: string
          criado_em?: string | null
          id?: number
          motivo: string
          notas?: string | null
          payload?: Json | null
          resolvido_em?: string | null
          status?: string
        }
        Update: {
          assumido_em?: string | null
          assumido_por?: string | null
          channel?: string
          chat_id?: string
          criado_em?: string | null
          id?: number
          motivo?: string
          notas?: string | null
          payload?: Json | null
          resolvido_em?: string | null
          status?: string
        }
        Relationships: []
      }
      vera_resumos: {
        Row: {
          channel: string
          criado_em: string | null
          data_agendamento: string | null
          id: number
          origem: string | null
          outcome: string | null
          resumo: string
          tags: string[] | null
          user_id: string
        }
        Insert: {
          channel: string
          criado_em?: string | null
          data_agendamento?: string | null
          id?: number
          origem?: string | null
          outcome?: string | null
          resumo: string
          tags?: string[] | null
          user_id: string
        }
        Update: {
          channel?: string
          criado_em?: string | null
          data_agendamento?: string | null
          id?: number
          origem?: string | null
          outcome?: string | null
          resumo?: string
          tags?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      vera_spin_prompts: {
        Row: {
          atualizado_em: string | null
          atualizado_por: string | null
          chave: string
          descricao: string | null
          valor: string
        }
        Insert: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          chave: string
          descricao?: string | null
          valor?: string
        }
        Update: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          chave?: string
          descricao?: string | null
          valor?: string
        }
        Relationships: []
      }
      vera_spin_prompts_history: {
        Row: {
          alterado_em: string | null
          alterado_por: string | null
          chave: string
          id: number
          valor_antigo: string | null
          valor_novo: string
        }
        Insert: {
          alterado_em?: string | null
          alterado_por?: string | null
          chave: string
          id?: number
          valor_antigo?: string | null
          valor_novo: string
        }
        Update: {
          alterado_em?: string | null
          alterado_por?: string | null
          chave?: string
          id?: number
          valor_antigo?: string | null
          valor_novo?: string
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
      whatsapp_leads: {
        Row: {
          button_id: string
          click_timestamp: string
          created_at: string
          geo_city: string | null
          geo_state: string | null
          id: string
          ip_address: string | null
          ip_isp: string | null
          is_bot: boolean
          max_scroll_depth: number | null
          session_id: string
          time_on_site_seconds: number | null
          user_language: string | null
          user_timezone: string | null
        }
        Insert: {
          button_id: string
          click_timestamp?: string
          created_at?: string
          geo_city?: string | null
          geo_state?: string | null
          id?: string
          ip_address?: string | null
          ip_isp?: string | null
          is_bot?: boolean
          max_scroll_depth?: number | null
          session_id: string
          time_on_site_seconds?: number | null
          user_language?: string | null
          user_timezone?: string | null
        }
        Update: {
          button_id?: string
          click_timestamp?: string
          created_at?: string
          geo_city?: string | null
          geo_state?: string | null
          id?: string
          ip_address?: string | null
          ip_isp?: string | null
          is_bot?: boolean
          max_scroll_depth?: number | null
          session_id?: string
          time_on_site_seconds?: number | null
          user_language?: string | null
          user_timezone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      analytics_daily_comparison: {
        Args: { _type?: string }
        Returns: {
          current_count: number
          growth_percentage: number
          previous_count: number
        }[]
      }
      analytics_device_breakdown: {
        Args: never
        Returns: {
          browser_in_app: boolean
          device_os: string
          network_type: string
          session_count: number
        }[]
      }
      analytics_leads_by_button: {
        Args: never
        Returns: {
          button_id: string
          lead_count: number
        }[]
      }
      analytics_leads_by_geo: {
        Args: { _group_by?: string }
        Returns: {
          lead_count: number
          location_name: string
        }[]
      }
      analytics_leads_by_source: {
        Args: never
        Returns: {
          campaign: string
          lead_count: number
          source: string
        }[]
      }
      analytics_monthly_comparison: {
        Args: { _type?: string }
        Returns: {
          current_count: number
          growth_percentage: number
          previous_count: number
        }[]
      }
      analytics_scroll_quality: {
        Args: never
        Returns: {
          high_scroll_leads: number
          high_scroll_pct: number
          total_leads: number
        }[]
      }
      analytics_section_engagement: {
        Args: never
        Returns: {
          clicks: number
          section_name: string
          views: number
        }[]
      }
      analytics_weekly_comparison: {
        Args: { _type?: string }
        Returns: {
          current_count: number
          growth_percentage: number
          previous_count: number
        }[]
      }
      can_view_analytics: { Args: { _user_id: string }; Returns: boolean }
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
      is_secretaria_only: { Args: { _uid: string }; Returns: boolean }
      is_staff: { Args: { _uid: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "user"
        | "socio"
        | "gerente"
        | "dentista"
        | "recepcionista"
        | "agencia"
        | "secretaria"
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
        "agencia",
        "secretaria",
      ],
    },
  },
} as const
