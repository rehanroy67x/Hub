import { createClient } from "@supabase/supabase-js"
import { SUPABASE_CONFIG } from "./config"

// Create a single Supabase client instance
export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Public routes that don't require authentication
export const publicRoutes = [
  "/login",
  "/register",
  "/terms",
  "/privacy",
  "/",
  "/auth/callback",
  "/account-confirmation",
  "/reset-password",
]

// Check if a route is public - EXPLICITLY EXPORTED
export function isPublicRoute(path: string): boolean {
  return publicRoutes.some((route) => {
    if (route === path) return true
    if (path.startsWith("/auth/")) return true
    if (path.startsWith("/admin")) return true // Admin route is public but has its own auth
    return false
  })
}

// Admin credentials
export const ADMIN_USERNAME = "Admin Rahul"
export const ADMIN_PASSWORD = "1837290546"

// Login with email and password
export async function loginWithEmail(email: string, password: string) {
  console.log("Attempting login with email:", email)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Login error:", error.message)
    throw error
  }

  console.log("Login successful, session established:", !!data.session)
  return data
}

// Login with Google
export async function loginWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?redirect=/dashboard`,
    },
  })

  if (error) {
    console.error("Google login error:", error)
    throw error
  }

  return data
}

// Register new user - NO EMAIL CONFIRMATION
export async function registerUser(email: string, password: string, username: string) {
  try {
    // First create the auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: null, // Disable email redirect
      },
    })

    if (error) {
      console.error("Registration error:", error)
      throw error
    }

    if (!data.user) {
      throw new Error("Failed to create user")
    }

    // Manually confirm the user's email in the database
    const { error: updateError } = await supabase.auth.admin.updateUserById(data.user.id, { email_confirm: true })

    if (updateError) {
      console.error("Error confirming email:", updateError)
      // Continue anyway
    }

    // Create profile record with email_confirmed set to true
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      username,
      email,
      email_confirmed: true, // Auto-confirm email
    })

    if (profileError) {
      console.error("Error creating profile:", profileError)
      // Continue anyway
    }

    return data
  } catch (error) {
    console.error("Error in registerUser:", error)
    throw error
  }
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error("Sign out error:", error)
    throw error
  }
  return true
}

// Get current session
export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.error("Get session error:", error)
    return null
  }
  return data.session
}

// Function to simulate admin login
export function adminLogin(username: string, password: string): boolean {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Set admin session in localStorage
    localStorage.setItem(
      "admin_session",
      JSON.stringify({
        isAdmin: true,
        username: ADMIN_USERNAME,
        timestamp: Date.now(),
      }),
    )
    return true
  }
  return false
}

// Function to simulate admin logout
export function adminLogout(): void {
  localStorage.removeItem("admin_session")
}

// Function to check if the user is an admin
export function isAdmin(): boolean {
  try {
    const adminSession = localStorage.getItem("admin_session")
    if (!adminSession) return false

    const session = JSON.parse(adminSession)
    // Check if session is valid (less than 24 hours old)
    if (session.isAdmin && Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
      return true
    }

    // Clear invalid session
    localStorage.removeItem("admin_session")
    return false
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

// Function to simulate getting all users
export async function getAllUsers(): Promise<any[]> {
  try {
    // Direct query to ensure we get all users
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Get all users error:", error)
      throw error
    }

    console.log("Retrieved users count:", data?.length || 0)
    return data || []
  } catch (error) {
    console.error("Unexpected error in getAllUsers:", error)
    return []
  }
}

// Function to simulate getting site statistics
export async function getSiteStatistics(): Promise<any> {
  try {
    // Get user count
    const { count: userCount, error: userError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })

    if (userError) {
      console.error("Error getting user count:", userError)
      throw userError
    }

    // In a real app, you would get these from your database
    // For demo purposes, we'll return mock data
    return {
      userCount: userCount || 0,
      totalVisits: Math.floor(Math.random() * 10000) + 5000,
      toolUsage: {
        "like-sender": Math.floor(Math.random() * 1000) + 500,
        "player-info": Math.floor(Math.random() * 800) + 300,
        "ban-checker": Math.floor(Math.random() * 600) + 200,
        "profile-visit": Math.floor(Math.random() * 400) + 100,
        "jwt-generator": Math.floor(Math.random() * 200) + 50,
        "guest-combiner": Math.floor(Math.random() * 300) + 150,
      },
    }
  } catch (error) {
    console.error("Error getting site statistics:", error)
    return {
      userCount: 0,
      totalVisits: 0,
      toolUsage: {},
    }
  }
}

// Function to simulate getting recent activity
export async function getRecentActivity(): Promise<any[]> {
  try {
    // In a real app, you would get these from your database
    // For demo purposes, we'll return mock data
    return [
      {
        id: "1",
        username: "user123",
        action: "Used Like Sender",
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
      },
      {
        id: "2",
        username: "gamer456",
        action: "Used Ban Checker",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
      },
      {
        id: "3",
        username: "player789",
        action: "Used Player Info",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      },
      {
        id: "4",
        username: "newuser",
        action: "Registered",
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
      },
      {
        id: "5",
        username: "visitor123",
        action: "Used Profile Visit",
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      },
    ]
  } catch (error) {
    console.error("Error getting recent activity:", error)
    return []
  }
}

// Function to simulate creating an announcement
export function createAnnouncement(title: string, content: string, type: "info" | "warning" | "success" | "error") {
  try {
    const announcements = getAnnouncements()

    const newAnnouncement = {
      id: Date.now().toString(),
      title,
      content,
      type,
      timestamp: new Date().toISOString(),
      active: true,
    }

    announcements.unshift(newAnnouncement)

    // Save to localStorage
    localStorage.setItem("system_announcements", JSON.stringify(announcements))

    // Broadcast to other tabs
    const broadcastChannel = new BroadcastChannel("announcement_update")
    broadcastChannel.postMessage({ action: "new", announcement: newAnnouncement })

    return newAnnouncement
  } catch (error) {
    console.error("Error creating announcement:", error)
    throw error
  }
}

// Get all announcements
export function getAnnouncements() {
  try {
    const savedAnnouncements = localStorage.getItem("system_announcements")
    if (savedAnnouncements) {
      return JSON.parse(savedAnnouncements)
    }
    return []
  } catch (error) {
    console.error("Error getting announcements:", error)
    return []
  }
}

// Delete an announcement
export function deleteAnnouncement(id: string) {
  try {
    const announcements = getAnnouncements()
    const filteredAnnouncements = announcements.filter((a: any) => a.id !== id)

    // Save to localStorage
    localStorage.setItem("system_announcements", JSON.stringify(filteredAnnouncements))

    // Broadcast to other tabs
    const broadcastChannel = new BroadcastChannel("announcement_update")
    broadcastChannel.postMessage({ action: "delete", id })

    return true
  } catch (error) {
    console.error("Error deleting announcement:", error)
    return false
  }
}

// Toggle announcement active status
export function toggleAnnouncementStatus(id: string) {
  try {
    const announcements = getAnnouncements()
    const updatedAnnouncements = announcements.map((a: any) => {
      if (a.id === id) {
        return { ...a, active: !a.active }
      }
      return a
    })

    // Save to localStorage
    localStorage.setItem("system_announcements", JSON.stringify(updatedAnnouncements))

    // Broadcast to other tabs
    const broadcastChannel = new BroadcastChannel("announcement_update")
    broadcastChannel.postMessage({ action: "update", announcements: updatedAnnouncements })

    return true
  } catch (error) {
    console.error("Error toggling announcement status:", error)
    return false
  }
}

// Update tool status in localStorage and broadcast to all tabs
export function updateToolStatus(toolId: string, status: "online" | "offline") {
  try {
    // Get current tool status
    let toolStatus: Record<string, "online" | "offline"> = {}
    const savedToolStatus = localStorage.getItem("tool_status")

    if (savedToolStatus) {
      toolStatus = JSON.parse(savedToolStatus)
    }

    // Update status
    toolStatus[toolId] = status

    // Save to localStorage
    localStorage.setItem("tool_status", JSON.stringify(toolStatus))

    // Broadcast to other tabs
    const broadcastChannel = new BroadcastChannel("tool_status_update")
    broadcastChannel.postMessage({ toolId, status })

    return true
  } catch (error) {
    console.error("Error updating tool status:", error)
    return false
  }
}

// Get all tool statuses
export function getAllToolStatuses(): Record<string, "online" | "offline"> {
  try {
    const savedToolStatus = localStorage.getItem("tool_status")
    if (savedToolStatus) {
      return JSON.parse(savedToolStatus)
    }

    // Default statuses if none found
    return {
      "like-sender": "online",
      "player-info": "online",
      "ban-checker": "online",
      "profile-visit": "online",
      "jwt-generator": "online",
      "guest-combiner": "online",
    }
  } catch (error) {
    console.error("Error getting tool statuses:", error)
    return {}
  }
}

// Maintenance mode functions
export function setMaintenanceMode(enabled: boolean, message?: string) {
  try {
    localStorage.setItem(
      "maintenance_mode",
      JSON.stringify({
        enabled,
        message: message || "The site is currently under maintenance. Please check back later.",
        timestamp: Date.now(),
      }),
    )

    // Broadcast to other tabs
    const broadcastChannel = new BroadcastChannel("maintenance_update")
    broadcastChannel.postMessage({ enabled, message })

    return true
  } catch (error) {
    console.error("Error setting maintenance mode:", error)
    return false
  }
}

// Get maintenance mode status
export function getMaintenanceMode() {
  try {
    const maintenanceMode = localStorage.getItem("maintenance_mode")
    if (maintenanceMode) {
      return JSON.parse(maintenanceMode)
    }
    return { enabled: false }
  } catch (error) {
    console.error("Error getting maintenance mode:", error)
    return { enabled: false }
  }
}

// Get user profile
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error getting user profile:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in getUserProfile:", error)
    throw error
  }
}

// Update user profile
export async function updateUserProfile(userId: string, updates: any) {
  try {
    const { error } = await supabase.from("profiles").update(updates).eq("id", userId)

    if (error) {
      console.error("Error updating user profile:", error)
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error("Error in updateUserProfile:", error)
    throw error
  }
}

// Update user password
export async function updateUserPassword(userId: string, newPassword: string) {
  try {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (error) {
      console.error("Error updating user password:", error)
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error("Error in updateUserPassword:", error)
    throw error
  }
}

// Update user email
export async function updateUserEmail(userId: string, newEmail: string) {
  try {
    // Update email in auth
    const { error: authError } = await supabase.auth.updateUser({
      email: newEmail,
    })

    if (authError) {
      console.error("Error updating user email in auth:", authError)
      throw authError
    }

    // Update email in profile
    const { error: profileError } = await supabase.from("profiles").update({ email: newEmail }).eq("id", userId)

    if (profileError) {
      console.error("Error updating user email in profile:", profileError)
      throw profileError
    }

    return { success: true }
  } catch (error) {
    console.error("Error in updateUserEmail:", error)
    throw error
  }
}

// Get security questions for a user
export async function getSecurityQuestions(userId: string) {
  try {
    const { data, error } = await supabase
      .from("user_security_questions")
      .select("primary_question_id, secondary_question_id, custom_question")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error getting security questions:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in getSecurityQuestions:", error)
    throw error
  }
}

// Get security question by ID
export async function getSecurityQuestionById(questionId: number) {
  try {
    const { data, error } = await supabase.from("security_questions").select("question").eq("id", questionId).single()

    if (error) {
      console.error("Error getting security question:", error)
      throw error
    }

    return data.question
  } catch (error) {
    console.error("Error in getSecurityQuestionById:", error)
    throw error
  }
}

// Get all security questions
export async function getAllSecurityQuestions() {
  try {
    const { data, error } = await supabase.from("security_questions").select("id, question").order("id")

    if (error) {
      console.error("Error getting all security questions:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in getAllSecurityQuestions:", error)
    throw error
  }
}

// Save security questions for a user
export async function saveSecurityQuestions(
  userId: string,
  primaryQuestionId: number,
  primaryAnswer: string,
  secondaryQuestionId: number,
  secondaryAnswer: string,
  customQuestion: string,
  customAnswer: string,
) {
  try {
    const { error } = await supabase.from("user_security_questions").insert({
      id: userId,
      primary_question_id: primaryQuestionId,
      primary_answer: primaryAnswer.toLowerCase().trim(),
      secondary_question_id: secondaryQuestionId,
      secondary_answer: secondaryAnswer.toLowerCase().trim(),
      custom_question: customQuestion.trim(),
      custom_answer: customAnswer.toLowerCase().trim(),
    })

    if (error) {
      console.error("Error saving security questions:", error)
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error("Error in saveSecurityQuestions:", error)
    throw error
  }
}

// Update security questions for a user
export async function updateSecurityQuestions(
  userId: string,
  primaryQuestionId: number,
  primaryAnswer: string,
  secondaryQuestionId: number,
  secondaryAnswer: string,
  customQuestion: string,
  customAnswer: string,
) {
  try {
    const { error } = await supabase
      .from("user_security_questions")
      .update({
        primary_question_id: primaryQuestionId,
        primary_answer: primaryAnswer.toLowerCase().trim(),
        secondary_question_id: secondaryQuestionId,
        secondary_answer: secondaryAnswer.toLowerCase().trim(),
        custom_question: customQuestion.trim(),
        custom_answer: customAnswer.toLowerCase().trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("Error updating security questions:", error)
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error("Error in updateSecurityQuestions:", error)
    throw error
  }
}

// Check if user has security questions
export async function hasSecurityQuestions(userId: string) {
  try {
    const { data, error } = await supabase.from("user_security_questions").select("id").eq("id", userId).single()

    if (error && error.code !== "PGRST116") {
      console.error("Error checking security questions:", error)
      throw error
    }

    return !!data
  } catch (error) {
    console.error("Error in hasSecurityQuestions:", error)
    throw error
  }
}

// Get user by email - FIXED to handle no results or multiple results
export async function getUserByEmail(email: string) {
  try {
    // Use .select() without .single() to get all matching rows
    const { data, error } = await supabase.from("profiles").select("*").eq("email", email)

    if (error) {
      console.error("Error getting user by email:", error)
      throw error
    }

    // Check if we got any results
    if (!data || data.length === 0) {
      console.log("No user found with email:", email)
      return null
    }

    // If multiple users found, use the first one
    if (data.length > 1) {
      console.warn(`Multiple users found with email ${email}, using the first one`)
    }

    return data[0]
  } catch (error) {
    console.error("Error in getUserByEmail:", error)
    throw error
  }
}

// Verify security question
export async function verifySecurityQuestion(userId: string, questionType: string, answer: string): Promise<boolean> {
  try {
    let query = supabase.from("user_security_questions").select("*").eq("id", userId)

    if (questionType === "primary") {
      query = query.eq("primary_answer", answer.toLowerCase().trim())
    } else if (questionType === "secondary") {
      query = query.eq("secondary_answer", answer.toLowerCase().trim())
    } else {
      query = query.eq("custom_answer", answer.toLowerCase().trim())
    }

    const { data, error } = await query.single()

    if (error) {
      console.error("Error verifying security question:", error)
      return false
    }

    return !!data
  } catch (error) {
    console.error("Error in verifySecurityQuestion:", error)
    return false
  }
}

// Reset password with security question
export async function resetPasswordWithSecurityQuestion(userId: string, newPassword: string) {
  try {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (error) {
      console.error("Error resetting password:", error)
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error("Error in resetPasswordWithSecurityQuestion:", error)
    throw error
  }
}
