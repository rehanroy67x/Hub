import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/auth"

export async function DELETE(request: NextRequest) {
  try {
    // Check if this is an admin request (in a real app, you'd verify admin credentials)
    // For simplicity, we're just checking if the request is coming from the admin page
    const referer = request.headers.get("referer") || ""
    if (!referer.includes("/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = request.nextUrl.searchParams.get("id")
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // First delete the profile
    const { error: profileError } = await supabase.from("profiles").delete().eq("id", userId)

    if (profileError) {
      console.error("Delete profile error:", profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // In a real app, you would also delete the auth user
    // This requires admin privileges which we don't have in this demo
    // const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in delete-user API:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
