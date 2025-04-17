import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import LandingPage from "./landing-page"
import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase"

export default async function Home() {
  // Create a Supabase client for server components
  const supabase = createServerComponentClient({
    cookies,
    options: {
      supabaseUrl,
      supabaseKey: supabaseAnonKey,
    },
  })

  try {
    // Check if user is logged in
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If logged in, redirect to dashboard
    if (session) {
      redirect("/dashboard")
    }

    // Otherwise show the landing page
    return <LandingPage />
  } catch (error) {
    console.error("Error checking session:", error)
    // If there's an error, still show the landing page
    return <LandingPage />
  }
}
