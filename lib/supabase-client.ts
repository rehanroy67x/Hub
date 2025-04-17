import { createClient } from "@supabase/supabase-js"
import { SUPABASE_CONFIG } from "./config"

// Add better error handling for Supabase client creation
let supabase: ReturnType<typeof createClient>

try {
  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    console.error("Supabase configuration is missing. URL or anonymous key is not defined.")
    throw new Error("Supabase configuration error")
  }

  supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  console.log("Supabase client initialized successfully")
} catch (error) {
  console.error("Failed to initialize Supabase client:", error)
  // Create a mock client that logs errors instead of crashing
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: new Error("Supabase client not initialized") }),
      signInWithPassword: async () => ({ data: null, error: new Error("Supabase client not initialized") }),
      // Add other methods as needed
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: new Error("Supabase client not initialized") }),
        }),
      }),
    }),
  } as any
}

export { supabase }
