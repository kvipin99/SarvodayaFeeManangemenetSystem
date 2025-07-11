import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Using localStorage fallback.')
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Database types (will be generated from Supabase)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          password: string
          role: 'admin' | 'teacher'
          class: number | null
          division: string | null
          created_at: string
          last_login: string | null
        }
        Insert: {
          id?: string
          username: string
          password: string
          role: 'admin' | 'teacher'
          class?: number | null
          division?: string | null
          created_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          username?: string
          password?: string
          role?: 'admin' | 'teacher'
          class?: number | null
          division?: string | null
          created_at?: string
          last_login?: string | null
        }
      }
      students: {
        Row: {
          id: string
          admission_number: string
          name: string
          mobile: string
          class: number
          division: string
          bus_stop: string
          bus_number: number
          trip_number: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          admission_number: string
          name: string
          mobile: string
          class: number
          division: string
          bus_stop: string
          bus_number: number
          trip_number: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          admission_number?: string
          name?: string
          mobile?: string
          class?: number
          division?: string
          bus_stop?: string
          bus_number?: number
          trip_number?: number
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          student_id: string
          payment_type: 'development' | 'bus' | 'special'
          amount: number
          description: string
          receipt_number: string
          special_payment_type: string | null
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          student_id: string
          payment_type: 'development' | 'bus' | 'special'
          amount: number
          description: string
          receipt_number: string
          special_payment_type?: string | null
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          student_id?: string
          payment_type?: 'development' | 'bus' | 'special'
          amount?: number
          description?: string
          receipt_number?: string
          special_payment_type?: string | null
          created_at?: string
          created_by?: string
        }
      }
      fee_configurations: {
        Row: {
          id: string
          class: number
          development_fee: number
          updated_at: string
        }
        Insert: {
          id?: string
          class: number
          development_fee: number
          updated_at?: string
        }
        Update: {
          id?: string
          class?: number
          development_fee?: number
          updated_at?: string
        }
      }
      bus_stops: {
        Row: {
          id: string
          name: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          amount?: number
          created_at?: string
        }
      }
    }
  }
}

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabase !== null
}