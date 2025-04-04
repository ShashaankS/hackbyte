import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
