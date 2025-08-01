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
      admin_configuration: {
        Row: {
          created_at: string
          id: string
          setting_name: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_name: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_name?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      article_submissions: {
        Row: {
          admin_notes: string | null
          content: string
          created_at: string
          id: string
          keywords: string[] | null
          meta_description: string | null
          reference_sources: Json | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitter_email: string
          submitter_message: string | null
          submitter_name: string
          title: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          content: string
          created_at?: string
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          reference_sources?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitter_email: string
          submitter_message?: string | null
          submitter_name: string
          title: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          content?: string
          created_at?: string
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          reference_sources?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitter_email?: string
          submitter_message?: string | null
          submitter_name?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          auto_publish_linkedin: boolean | null
          auto_publish_medium: boolean | null
          auto_publish_substack: boolean | null
          chapter_id: string | null
          content: string
          content_images: string[] | null
          content_type: string | null
          created_at: string
          featured_image: string | null
          id: string
          image_associations: Json | null
          keywords: string[] | null
          meta_description: string | null
          published_at: string | null
          reading_time_minutes: number | null
          reference_sources: Json | null
          related_articles: string[] | null
          slug: string | null
          status: string
          title: string
          transcript: string | null
          updated_at: string
          user_id: string
          video_duration: number | null
          video_thumbnail: string | null
          video_url: string | null
        }
        Insert: {
          auto_publish_linkedin?: boolean | null
          auto_publish_medium?: boolean | null
          auto_publish_substack?: boolean | null
          chapter_id?: string | null
          content: string
          content_images?: string[] | null
          content_type?: string | null
          created_at?: string
          featured_image?: string | null
          id?: string
          image_associations?: Json | null
          keywords?: string[] | null
          meta_description?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          reference_sources?: Json | null
          related_articles?: string[] | null
          slug?: string | null
          status?: string
          title: string
          transcript?: string | null
          updated_at?: string
          user_id: string
          video_duration?: number | null
          video_thumbnail?: string | null
          video_url?: string | null
        }
        Update: {
          auto_publish_linkedin?: boolean | null
          auto_publish_medium?: boolean | null
          auto_publish_substack?: boolean | null
          chapter_id?: string | null
          content?: string
          content_images?: string[] | null
          content_type?: string | null
          created_at?: string
          featured_image?: string | null
          id?: string
          image_associations?: Json | null
          keywords?: string[] | null
          meta_description?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          reference_sources?: Json | null
          related_articles?: string[] | null
          slug?: string | null
          status?: string
          title?: string
          transcript?: string | null
          updated_at?: string
          user_id?: string
          video_duration?: number | null
          video_thumbnail?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "book_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_rate_limits: {
        Row: {
          attempt_count: number
          blocked_until: string | null
          created_at: string
          id: string
          identifier: string
          window_start: string
        }
        Insert: {
          attempt_count?: number
          blocked_until?: string | null
          created_at?: string
          id?: string
          identifier: string
          window_start?: string
        }
        Update: {
          attempt_count?: number
          blocked_until?: string | null
          created_at?: string
          id?: string
          identifier?: string
          window_start?: string
        }
        Relationships: []
      }
      book_chapters: {
        Row: {
          article_id: string | null
          book_title: string
          chapter_number: number
          chapter_slug: string | null
          chapter_title: string
          created_at: string
          id: string
          is_published: boolean | null
          key_concepts: Json | null
          publish_date: string | null
          reading_time_minutes: number | null
          sequence_order: number
          shorts_duration: number | null
          shorts_id: string | null
          shorts_url: string | null
          transcript: string | null
          updated_at: string
          video_15min_id: string | null
          video_15min_url: string | null
          video_5min_id: string | null
          video_5min_url: string | null
          video_duration_15min: number | null
          video_duration_5min: number | null
        }
        Insert: {
          article_id?: string | null
          book_title?: string
          chapter_number: number
          chapter_slug?: string | null
          chapter_title: string
          created_at?: string
          id?: string
          is_published?: boolean | null
          key_concepts?: Json | null
          publish_date?: string | null
          reading_time_minutes?: number | null
          sequence_order: number
          shorts_duration?: number | null
          shorts_id?: string | null
          shorts_url?: string | null
          transcript?: string | null
          updated_at?: string
          video_15min_id?: string | null
          video_15min_url?: string | null
          video_5min_id?: string | null
          video_5min_url?: string | null
          video_duration_15min?: number | null
          video_duration_5min?: number | null
        }
        Update: {
          article_id?: string | null
          book_title?: string
          chapter_number?: number
          chapter_slug?: string | null
          chapter_title?: string
          created_at?: string
          id?: string
          is_published?: boolean | null
          key_concepts?: Json | null
          publish_date?: string | null
          reading_time_minutes?: number | null
          sequence_order?: number
          shorts_duration?: number | null
          shorts_id?: string | null
          shorts_url?: string | null
          transcript?: string | null
          updated_at?: string
          video_15min_id?: string | null
          video_15min_url?: string | null
          video_5min_id?: string | null
          video_5min_url?: string | null
          video_duration_15min?: number | null
          video_duration_5min?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "book_chapters_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_preferences: {
        Row: {
          communication_preference: string | null
          concierge_services: boolean | null
          created_at: string
          id: string
          industry_focus: string[] | null
          meeting_frequency: string | null
          notification_preferences: Json | null
          preferred_meeting_times: Json | null
          premium_support: boolean | null
          project_updates_frequency: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          communication_preference?: string | null
          concierge_services?: boolean | null
          created_at?: string
          id?: string
          industry_focus?: string[] | null
          meeting_frequency?: string | null
          notification_preferences?: Json | null
          preferred_meeting_times?: Json | null
          premium_support?: boolean | null
          project_updates_frequency?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          communication_preference?: string | null
          concierge_services?: boolean | null
          created_at?: string
          id?: string
          industry_focus?: string[] | null
          meeting_frequency?: string | null
          notification_preferences?: Json | null
          preferred_meeting_times?: Json | null
          premium_support?: boolean | null
          project_updates_frequency?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_versions: {
        Row: {
          chapter_id: string | null
          content_id: string | null
          content_type: string
          created_at: string
          id: string
          status: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          chapter_id?: string | null
          content_id?: string | null
          content_type: string
          created_at?: string
          id?: string
          status?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          chapter_id?: string | null
          content_id?: string | null
          content_type?: string
          created_at?: string
          id?: string
          status?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_versions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "book_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: number
          title: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: never
          title?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: never
          title?: string | null
        }
        Relationships: []
      }
      data_processing_log: {
        Row: {
          action: string
          created_at: string
          data_type: string
          id: string
          legal_basis: string
          purpose: string
          retention_period: string | null
          third_parties: Json | null
          user_id: string | null
          visitor_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          data_type: string
          id?: string
          legal_basis: string
          purpose: string
          retention_period?: string | null
          third_parties?: Json | null
          user_id?: string | null
          visitor_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          data_type?: string
          id?: string
          legal_basis?: string
          purpose?: string
          retention_period?: string | null
          third_parties?: Json | null
          user_id?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      gallery: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string
          instagram_post_id: string | null
          is_featured: boolean | null
          is_visible: boolean | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          instagram_post_id?: string | null
          is_featured?: boolean | null
          is_visible?: boolean | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          instagram_post_id?: string | null
          is_featured?: boolean | null
          is_visible?: boolean | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      gdpr_deletion_requests: {
        Row: {
          created_at: string
          email: string | null
          id: string
          ip_address: unknown | null
          processed_at: string | null
          processed_by: string | null
          reason: string | null
          request_type: string
          requested_data: Json | null
          status: string
          updated_at: string
          visitor_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: unknown | null
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          request_type: string
          requested_data?: Json | null
          status?: string
          updated_at?: string
          visitor_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: unknown | null
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          request_type?: string
          requested_data?: Json | null
          status?: string
          updated_at?: string
          visitor_id?: string | null
        }
        Relationships: []
      }
      image_usage: {
        Row: {
          article_id: string | null
          created_at: string | null
          id: string
          image_id: string | null
          usage_type: string
        }
        Insert: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          image_id?: string | null
          usage_type: string
        }
        Update: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          image_id?: string | null
          usage_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "image_usage_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "image_usage_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "images"
            referencedColumns: ["id"]
          },
        ]
      }
      images: {
        Row: {
          alt_text: string | null
          category: string
          created_at: string | null
          description: string | null
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          is_public: boolean | null
          name: string
          tags: string[] | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          is_public?: boolean | null
          name: string
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          is_public?: boolean | null
          name?: string
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      integration_logs: {
        Row: {
          created_at: string
          error_code: string | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          integration_type: string
          ip_address: unknown | null
          operation: string
          request_data: Json | null
          response_data: Json | null
          retry_count: number | null
          status: string
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          integration_type: string
          ip_address?: unknown | null
          operation: string
          request_data?: Json | null
          response_data?: Json | null
          retry_count?: number | null
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          integration_type?: string
          ip_address?: unknown | null
          operation?: string
          request_data?: Json | null
          response_data?: Json | null
          retry_count?: number | null
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      linkedin_articles: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_migrated: boolean | null
          linkedin_id: string
          migrated_article_id: string | null
          published_at: string | null
          synced_at: string | null
          title: string
          updated_at: string | null
          user_id: string
          visibility: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_migrated?: boolean | null
          linkedin_id: string
          migrated_article_id?: string | null
          published_at?: string | null
          synced_at?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          visibility?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_migrated?: boolean | null
          linkedin_id?: string
          migrated_article_id?: string | null
          published_at?: string | null
          synced_at?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          visibility?: string | null
        }
        Relationships: []
      }
      linkedin_posts: {
        Row: {
          author: string | null
          created_at: string | null
          id: string
          is_visible: boolean | null
          media_url: string | null
          message: string | null
          post_url: string | null
          raw_data: Json | null
          updated_at: string
        }
        Insert: {
          author?: string | null
          created_at?: string | null
          id: string
          is_visible?: boolean | null
          media_url?: string | null
          message?: string | null
          post_url?: string | null
          raw_data?: Json | null
          updated_at?: string
        }
        Update: {
          author?: string | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          media_url?: string | null
          message?: string | null
          post_url?: string | null
          raw_data?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: number | null
          created_at: string | null
          id: number
          sender_id: string | null
        }
        Insert: {
          content: string
          conversation_id?: number | null
          created_at?: string | null
          id?: never
          sender_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: number | null
          created_at?: string | null
          id?: never
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      outbound_shares: {
        Row: {
          article_id: string | null
          created_at: string | null
          error_msg: string | null
          id: string
          post_urn: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          article_id?: string | null
          created_at?: string | null
          error_msg?: string | null
          id?: string
          post_urn?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          article_id?: string | null
          created_at?: string | null
          error_msg?: string | null
          id?: string
          post_urn?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      publishing_schedule: {
        Row: {
          article_id: string | null
          chapter_id: string | null
          created_at: string
          error_message: string | null
          id: string
          platform: string
          published_url: string | null
          scheduled_date: string
          status: string | null
          updated_at: string
        }
        Insert: {
          article_id?: string | null
          chapter_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          platform: string
          published_url?: string | null
          scheduled_date: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          article_id?: string | null
          chapter_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          platform?: string
          published_url?: string | null
          scheduled_date?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "publishing_schedule_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publishing_schedule_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "book_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      social_media_credentials: {
        Row: {
          access_token_encrypted: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          platform: string
          platform_user_id: string
          profile_data: Json | null
          refresh_token_encrypted: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          platform_user_id: string
          profile_data?: Json | null
          refresh_token_encrypted?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          platform_user_id?: string
          profile_data?: Json | null
          refresh_token_encrypted?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      social_media_posts: {
        Row: {
          approval_status: string | null
          content: string | null
          created_at: string
          engagement_data: Json | null
          hashtags: string[] | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_visible: boolean | null
          platform: string
          platform_post_id: string
          post_type: string
          post_url: string | null
          published_at: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          approval_status?: string | null
          content?: string | null
          created_at?: string
          engagement_data?: Json | null
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_visible?: boolean | null
          platform: string
          platform_post_id: string
          post_type: string
          post_url?: string | null
          published_at?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          approval_status?: string | null
          content?: string | null
          created_at?: string
          engagement_data?: Json | null
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_visible?: boolean | null
          platform?: string
          platform_post_id?: string
          post_type?: string
          post_url?: string | null
          published_at?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_consent: {
        Row: {
          consent_date: string
          consent_given: boolean
          consent_type: string
          created_at: string
          id: string
          ip_address: unknown | null
          legal_basis: string | null
          purpose: string
          updated_at: string
          visitor_id: string
          withdrawal_date: string | null
        }
        Insert: {
          consent_date?: string
          consent_given?: boolean
          consent_type: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          legal_basis?: string | null
          purpose: string
          updated_at?: string
          visitor_id: string
          withdrawal_date?: string | null
        }
        Update: {
          consent_date?: string
          consent_given?: boolean
          consent_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          legal_basis?: string | null
          purpose?: string
          updated_at?: string
          visitor_id?: string
          withdrawal_date?: string | null
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
          role?: Database["public"]["Enums"]["app_role"]
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
      visitor_analytics: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          id: string
          ip_address: unknown | null
          language: string | null
          os: string | null
          page_url: string
          page_views: number | null
          referrer: string | null
          screen_resolution: string | null
          session_id: string
          timezone: string | null
          updated_at: string
          user_agent: string | null
          visit_duration: number | null
          visitor_id: string
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: unknown | null
          language?: string | null
          os?: string | null
          page_url: string
          page_views?: number | null
          referrer?: string | null
          screen_resolution?: string | null
          session_id: string
          timezone?: string | null
          updated_at?: string
          user_agent?: string | null
          visit_duration?: number | null
          visitor_id: string
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: unknown | null
          language?: string | null
          os?: string | null
          page_url?: string
          page_views?: number | null
          referrer?: string | null
          screen_resolution?: string | null
          session_id?: string
          timezone?: string | null
          updated_at?: string
          user_agent?: string | null
          visit_duration?: number | null
          visitor_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_admin_role: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      assign_initial_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          identifier_value: string
          max_attempts?: number
          window_minutes?: number
        }
        Returns: boolean
      }
      decrypt_token_secure: {
        Args: { encrypted_token: string }
        Returns: string
      }
      encrypt_token_secure: {
        Args: { token_text: string }
        Returns: string
      }
      extract_first_ip: {
        Args: { ip_string: string }
        Returns: unknown
      }
      get_admin_emails: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      log_integration_event: {
        Args: {
          p_integration_type: string
          p_operation: string
          p_status?: string
          p_user_id?: string
          p_error_message?: string
          p_error_code?: string
          p_request_data?: Json
          p_response_data?: Json
          p_execution_time_ms?: number
          p_retry_count?: number
        }
        Returns: string
      }
      log_security_event_enhanced: {
        Args: {
          event_action: string
          event_details?: Json
          event_severity?: string
          client_ip?: string
        }
        Returns: undefined
      }
      log_security_violation: {
        Args: { violation_type: string; details?: Json; severity?: string }
        Returns: undefined
      }
      migrate_existing_tokens: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      prevent_role_self_elevation: {
        Args: {
          target_user_id: string
          old_role: Database["public"]["Enums"]["app_role"]
          new_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      sync_linkedin_article_to_articles: {
        Args: { linkedin_article_id: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
