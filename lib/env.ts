// This file ensures environment variables are set correctly

// Default values
const SUPABASE_URL = "https://libcdrnrkbwfnzbgbkca.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpYmNkcm5ya2J3Zm56Ymdia2NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2Mjg5NDAsImV4cCI6MjA2MDIwNDk0MH0.yU-IUhKQYA_p7qfRomKlnd1EW8Mo3miYukKF4LqkQGU"

// Set environment variables for server-side
if (typeof process !== "undefined" && process.env) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = SUPABASE_ANON_KEY
  }
}

// Export the values for use in other files
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY

// Function to ensure environment variables are set on the client side
export function ensureEnvVars() {
  if (typeof window !== "undefined") {
    window.process = {
      ...window.process,
      env: {
        ...window.process?.env,
        NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
      },
    }
  }
}
