import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const username = searchParams.get("username")

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // Get email from username
    const { data, error } = await supabase.from("profiles").select("email").eq("username", username).maybeSingle()

    if (error) {
      console.error("Error fetching user by username:", error)
      return NextResponse.json({ error: "Error fetching user data" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Username not found" }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in get-email API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
