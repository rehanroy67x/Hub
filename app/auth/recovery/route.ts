import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token = requestUrl.searchParams.get("token")

  if (!token) {
    console.error("Missing recovery token")
    return NextResponse.redirect(`${requestUrl.origin}/login?error=Missing+recovery+token`)
  }

  try {
    // Create a Supabase client
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient(
      {
        cookies: () => cookieStore,
      },
      {
        supabaseUrl,
        supabaseKey: supabaseAnonKey,
      },
    )

    // Store the token in a cookie so the reset-password page can use it
    cookieStore.set("supabase_recovery_token", token, {
      path: "/",
      maxAge: 60 * 10, // 10 minutes
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    // Redirect to reset-password page
    return NextResponse.redirect(`${requestUrl.origin}/reset-password`)
  } catch (error) {
    console.error("Error in recovery route:", error)
    return NextResponse.redirect(`${requestUrl.origin}/login?error=Recovery+process+failed`)
  }
}
