import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const type = requestUrl.searchParams.get("type")

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

  // Handle password recovery flow
  if (type === "recovery" && code) {
    try {
      // For recovery, we'll set a special cookie and redirect to reset-password
      // This cookie will be used to verify the recovery flow in the reset-password page
      const recoveryToken = Buffer.from(code).toString("base64")

      // Set a cookie with the recovery token
      cookieStore.set("recovery_token", recoveryToken, {
        path: "/",
        maxAge: 60 * 10, // 10 minutes
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      })

      // Redirect to reset-password page
      return NextResponse.redirect(`${requestUrl.origin}/reset-password`)
    } catch (error) {
      console.error("Error processing recovery:", error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=Invalid+or+expired+reset+link`)
    }
  }

  // Handle regular sign-in/sign-up flow
  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code)
      return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
    } catch (error) {
      console.error("Error exchanging code for session:", error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=Authentication+failed`)
    }
  }

  // Default redirect if no code is present
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
