// Set environment variables for server components
if (typeof process !== "undefined" && process.env) {
  process.env.NEXT_PUBLIC_SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://libcdrnrkbwfnzbgbkca.supabase.co"
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpYmNkcm5ya2J3Zm56Ymdia2NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2Mjg5NDAsImV4cCI6MjA2MDIwNDk0MH0.yU-IUhKQYA_p7qfRomKlnd1EW8Mo3miYukKF4LqkQGU"
}

export {}
