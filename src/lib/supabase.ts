import { createClient } from "@supabase/supabase-js"

// 환경변수 체크 및 기본값 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Supabase가 설정되지 않은 경우를 위한 체크
export const isSupabaseConfigured = supabaseUrl && supabaseAnonKey

// Supabase 클라이언트 생성 (설정되지 않은 경우 null)
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null