// Espelha supabase/migrations/0001_init_schema.sql à mão — regenerar com
// `supabase gen types typescript` assim que o projeto Supabase existir de verdade.

export type RecurrenceType = "nenhuma" | "diaria" | "semanal" | "mensal";
export type PriorityLevel = "baixa" | "media" | "alta";
export type GardenStage =
  | "semente"
  | "broto"
  | "muda"
  | "planta"
  | "arvore"
  | "jardim_completo";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface WeeklyRecurrenceConfig {
  days_of_week: number[]; // 0 = domingo … 6 = sábado
}

export interface MonthlyRecurrenceConfig {
  day_of_month: number; // 1-31
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          daily_goal_points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          daily_goal_points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      life_areas: {
        Row: {
          id: string;
          slug: string;
          name: string;
          icon: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          icon: string;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["life_areas"]["Insert"]>;
        Relationships: [];
      };
      activities: {
        Row: {
          id: string;
          user_id: string;
          life_area_id: string;
          name: string;
          description: string | null;
          scheduled_time: string | null;
          duration_minutes: number | null;
          priority: PriorityLevel;
          points: number;
          recurrence: RecurrenceType;
          recurrence_config: Json | null;
          is_required: boolean;
          notes: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          life_area_id: string;
          name: string;
          description?: string | null;
          scheduled_time?: string | null;
          duration_minutes?: number | null;
          priority?: PriorityLevel;
          points?: number;
          recurrence?: RecurrenceType;
          recurrence_config?: Json | null;
          is_required?: boolean;
          notes?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["activities"]["Insert"]>;
        Relationships: [];
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string;
          activity_id: string | null;
          life_area_id: string;
          scheduled_date: string;
          name: string;
          points: number;
          is_required: boolean;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_id?: string | null;
          life_area_id: string;
          scheduled_date: string;
          name: string;
          points: number;
          is_required?: boolean;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["activity_logs"]["Insert"]>;
        Relationships: [];
      };
      day_entries: {
        Row: {
          id: string;
          user_id: string;
          entry_date: string;
          mood_start: number | null;
          energy_start: number | null;
          intention: string | null;
          gratitude: string | null;
          reflection: string | null;
          tomorrow_note: string | null;
          mood_end: number | null;
          energy_end: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entry_date: string;
          mood_start?: number | null;
          energy_start?: number | null;
          intention?: string | null;
          gratitude?: string | null;
          reflection?: string | null;
          tomorrow_note?: string | null;
          mood_end?: number | null;
          energy_end?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["day_entries"]["Insert"]>;
        Relationships: [];
      };
      golden_verses: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          verse_text: string;
          book: string;
          chapter: number | null;
          verse_number: string | null;
          bible_version: string | null;
          reflection: string | null;
          is_favorite: boolean;
          audio_url: string | null;
          transcription_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          verse_text: string;
          book: string;
          chapter?: number | null;
          verse_number?: string | null;
          bible_version?: string | null;
          reflection?: string | null;
          is_favorite?: boolean;
          audio_url?: string | null;
          transcription_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["golden_verses"]["Insert"]>;
        Relationships: [];
      };
      verse_collections: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["verse_collections"]["Insert"]>;
        Relationships: [];
      };
      verse_collection_items: {
        Row: {
          id: string;
          collection_id: string;
          verse_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          collection_id: string;
          verse_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["verse_collection_items"]["Insert"]>;
        Relationships: [];
      };
      verse_tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["verse_tags"]["Insert"]>;
        Relationships: [];
      };
      verse_tag_relations: {
        Row: {
          id: string;
          verse_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          verse_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["verse_tag_relations"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      daily_points: {
        Row: {
          user_id: string;
          entry_date: string;
          points_earned: number | null;
          points_possible: number | null;
          activities_completed: number | null;
          activities_total: number | null;
          all_required_done: boolean | null;
        };
        Relationships: [];
      };
      garden_days: {
        Row: {
          user_id: string;
          entry_date: string;
          grew: boolean | null;
        };
        Relationships: [];
      };
      current_streak: {
        Row: {
          user_id: string;
          streak_days: number;
        };
        Relationships: [];
      };
      garden_progress: {
        Row: {
          user_id: string;
          total_growth_days: number;
          stage: GardenStage;
        };
        Relationships: [];
      };
      life_area_engagement: {
        Row: {
          user_id: string;
          life_area_id: string;
          life_area_name: string;
          points_earned: number | null;
          activities_completed: number | null;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type LifeArea = Database["public"]["Tables"]["life_areas"]["Row"];
export type Activity = Database["public"]["Tables"]["activities"]["Row"];
export type ActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"];
export type DayEntry = Database["public"]["Tables"]["day_entries"]["Row"];
export type DailyPoints = Database["public"]["Views"]["daily_points"]["Row"];
export type GardenProgress = Database["public"]["Views"]["garden_progress"]["Row"];
