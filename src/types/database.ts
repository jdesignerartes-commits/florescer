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
      };
      garden_days: {
        Row: {
          user_id: string;
          entry_date: string;
          grew: boolean | null;
        };
      };
      current_streak: {
        Row: {
          user_id: string;
          streak_days: number;
        };
      };
      garden_progress: {
        Row: {
          user_id: string;
          total_growth_days: number;
          stage: GardenStage;
        };
      };
      life_area_engagement: {
        Row: {
          user_id: string;
          life_area_id: string;
          life_area_name: string;
          points_earned: number | null;
          activities_completed: number | null;
        };
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type LifeArea = Database["public"]["Tables"]["life_areas"]["Row"];
export type Activity = Database["public"]["Tables"]["activities"]["Row"];
export type ActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"];
export type DayEntry = Database["public"]["Tables"]["day_entries"]["Row"];
export type DailyPoints = Database["public"]["Views"]["daily_points"]["Row"];
export type GardenProgress = Database["public"]["Views"]["garden_progress"]["Row"];
