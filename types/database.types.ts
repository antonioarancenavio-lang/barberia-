// Tipos generados a mano para la Fase 1.
// A partir de la Fase 2 se recomienda generar este archivo automaticamente con:
// npx supabase gen types typescript --project-id <tu-project-id> > types/database.types.ts

export type UserRole = 'platform_admin' | 'barbershop_owner' | 'barber';
export type PlanType = 'free' | 'pro' | 'premium';
export type ShopStatus = 'active' | 'suspended';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      barbershops: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          slug: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          description: string | null;
          logo_url: string | null;
          primary_color: string;
          plan: PlanType;
          status: ShopStatus;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['barbershops']['Row']> & {
          owner_id: string;
          name: string;
          slug: string;
        };
        Update: Partial<Database['public']['Tables']['barbershops']['Row']>;
      };
      barbers: {
        Row: {
          id: string;
          barbershop_id: string;
          profile_id: string | null;
          name: string;
          photo_url: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['barbers']['Row']> & {
          barbershop_id: string;
          name: string;
        };
        Update: Partial<Database['public']['Tables']['barbers']['Row']>;
      };
      services: {
        Row: {
          id: string;
          barbershop_id: string;
          name: string;
          description: string | null;
          price: number;
          duration_minutes: number;
          active: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['services']['Row']> & {
          barbershop_id: string;
          name: string;
        };
        Update: Partial<Database['public']['Tables']['services']['Row']>;
      };
      business_hours: {
        Row: {
          id: string;
          barbershop_id: string;
          day_of_week: number;
          open_time: string | null;
          close_time: string | null;
          closed: boolean;
        };
        Insert: Partial<Database['public']['Tables']['business_hours']['Row']> & {
          barbershop_id: string;
          day_of_week: number;
        };
        Update: Partial<Database['public']['Tables']['business_hours']['Row']>;
      };
      blocked_times: {
        Row: {
          id: string;
          barbershop_id: string;
          barber_id: string | null;
          start_time: string;
          end_time: string;
          reason: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['blocked_times']['Row']> & {
          barbershop_id: string;
          start_time: string;
          end_time: string;
        };
        Update: Partial<Database['public']['Tables']['blocked_times']['Row']>;
      };
      appointments: {
        Row: {
          id: string;
          barbershop_id: string;
          barber_id: string;
          service_id: string;
          client_name: string;
          client_phone: string;
          client_email: string | null;
          start_time: string;
          end_time: string;
          status: AppointmentStatus;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['appointments']['Row']> & {
          barbershop_id: string;
          barber_id: string;
          service_id: string;
          client_name: string;
          client_phone: string;
          start_time: string;
          end_time: string;
        };
        Update: Partial<Database['public']['Tables']['appointments']['Row']>;
      };
      subscriptions: {
        Row: {
          id: string;
          barbershop_id: string;
          plan: PlanType;
          status: string;
          stripe_subscription_id: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['subscriptions']['Row']> & {
          barbershop_id: string;
        };
        Update: Partial<Database['public']['Tables']['subscriptions']['Row']>;
      };
    };
      Views: Record<string, never>;
    Functions: {
      slug_is_available: {
        Args: { check_slug: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
  };
}
