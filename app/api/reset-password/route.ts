import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // First check if the user exists in auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers({
      filter: {
        email: email,
      },
    })

    if (userError) {
      console.error("Error checking user:", userError)
      // Fall back to checking profiles table if admin API fails
      const { data: profileData } = await supabase.from("profiles").select("email").eq("email", email).maybeSingle()

      if (!profileData) {
        return NextResponse.json({ error: "No account found with this email address" }, { status: 404 })
      }
    } else if (!userData || userData.users.length === 0) {
      return NextResponse.json({ error: "No account found with this email address" }, { status: 404 })
    }

    // If email exists, proceed with password reset
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${request.nextUrl.origin}/auth/callback?type=recovery`,
    })

    if (error) {
      console.error("Reset password error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in reset-password API:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
