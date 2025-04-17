import { NextResponse } from "next/server"
import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase"

export async function GET() {
  // Only return public information that's safe to expose
  return NextResponse.json({
    supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    googleEnabled: true, // This should be determined by your actual configuration
    callbackConfigured: true, // This should be determined by your actual configuration
  })
}
