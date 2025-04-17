import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Create profiles table if it doesn't exist
    const { error: profilesError } = await supabase.rpc("create_profiles_table_if_not_exists", {})

    if (profilesError) {
      // If RPC doesn't exist, create the table directly
      const { error } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id),
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          phone TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );
      `)

      if (error) throw error
    }

    return NextResponse.json({
      success: true,
      message: "Database tables created successfully",
    })
  } catch (error: any) {
    console.error("Error creating tables:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create database tables",
      },
      { status: 500 },
    )
  }
}
