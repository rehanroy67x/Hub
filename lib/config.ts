// Central configuration file for the application
export const SUPABASE_CONFIG = {
  url: "https://libcdrnrkbwfnzbgbkca.supabase.co",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpYmNkcm5ya2J3Zm56Ymdia2NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2Mjg5NDAsImV4cCI6MjA2MDIwNDk0MH0.yU-IUhKQYA_p7qfRomKlnd1EW8Mo3miYukKF4LqkQGU",
}

// Application settings
export const APP_CONFIG = {
  // Number of milliseconds to wait before showing loading indicators
  loadingDelay: 300,

  // Maximum time to wait for authentication operations (in milliseconds)
  authTimeout: 10000,

  // Dashboard configuration
  dashboard: {
    toolCount: 6, // Total number of tools available
  },
}
