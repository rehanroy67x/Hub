import { createClient } from "@supabase/supabase-js"

// Hardcoded Supabase credentials
export const supabaseUrl = "https://libcdrnrkbwfnzbgbkca.supabase.co"
export const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpYmNkcm5ya2J3Zm56Ymdia2NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2Mjg5NDAsImV4cCI6MjA2MDIwNDk0MH0.yU-IUhKQYA_p7qfRomKlnd1EW8Mo3miYukKF4LqkQGU"

// Create a single instance of the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
