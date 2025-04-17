"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"
import { supabase, isPublicRoute } from "@/lib/auth"

// Auth context type
type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  signOut: async () => {},
})

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext)

// Auth provider component
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname() || "/"

  // Initialize auth state
  useEffect(() => {
    let isMounted = true

    // Function to get the current session
    const initAuth = async () => {
      try {
        console.log("Initializing auth state...")

        // Get the current session
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          return
        }

        if (isMounted) {
          const currentSession = data.session
          setSession(currentSession)
          setUser(currentSession?.user || null)

          console.log("Auth initialized, session exists:", !!currentSession)

          // If user exists but no profile, create one (for OAuth users)
          if (currentSession?.user && currentSession.user.app_metadata.provider !== "email") {
            try {
              const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", currentSession.user.id)
                .single()

              if (!profile) {
                console.log("Creating profile for OAuth user")
                await supabase.from("profiles").insert({
                  id: currentSession.user.id,
                  username:
                    currentSession.user.user_metadata.full_name ||
                    currentSession.user.user_metadata.name ||
                    `user_${Math.floor(Math.random() * 10000)}`,
                  email: currentSession.user.email,
                  avatar_url: currentSession.user.user_metadata.avatar_url || null,
                })
              }
            } catch (err) {
              console.error("Error checking/creating profile:", err)
            }
          }
        }
      } catch (error) {
        console.error("Error in initAuth:", error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    // Initialize auth
    initAuth()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      console.log("Auth state changed, event:", _event)

      if (isMounted) {
        setSession(newSession)
        setUser(newSession?.user || null)

        // If this is a new sign in with OAuth, create a profile
        if (_event === "SIGNED_IN" && newSession?.user && newSession.user.app_metadata.provider !== "email") {
          try {
            const { data: profile } = await supabase.from("profiles").select("*").eq("id", newSession.user.id).single()

            if (!profile) {
              console.log("Creating profile for new OAuth user")
              await supabase.from("profiles").insert({
                id: newSession.user.id,
                username:
                  newSession.user.user_metadata.full_name ||
                  newSession.user.user_metadata.name ||
                  `user_${Math.floor(Math.random() * 10000)}`,
                email: newSession.user.email,
                avatar_url: newSession.user.user_metadata.avatar_url || null,
              })
            }
          } catch (err) {
            console.error("Error checking/creating profile:", err)
          }
        }

        setIsLoading(false)
        console.log("Auth state updated, session exists:", !!newSession)
      }
    })

    // Cleanup
    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Handle routing based on auth state
  useEffect(() => {
    if (isLoading) return

    const isPublic = isPublicRoute(pathname)
    const isAuthed = !!session

    console.log("Checking route access:", {
      path: pathname,
      isPublic,
      isAuthed,
    })

    // If not authenticated and trying to access a protected route
    if (!isAuthed && !isPublic) {
      console.log("Redirecting to login from:", pathname)
      router.push("/login")
      return
    }

    // If authenticated and trying to access login/register
    if (isAuthed && (pathname === "/login" || pathname === "/register" || pathname === "/")) {
      console.log("Redirecting to dashboard from:", pathname)
      router.push("/dashboard")
      return
    }
  }, [session, isLoading, pathname, router])

  // Sign out function
  const signOut = async () => {
    try {
      setIsLoading(true)
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Compute authenticated state
  const isAuthenticated = !!session && !!user

  // Context value
  const value = {
    user,
    session,
    isLoading,
    isAuthenticated,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
