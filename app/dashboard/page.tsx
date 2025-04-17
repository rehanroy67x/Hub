"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Database, Wrench, Info } from "lucide-react"
import { APP_CONFIG } from "@/lib/config"
import { useAuth } from "@/components/auth-provider"
import { getUserProfile } from "@/lib/auth"
import SidebarButton from "@/components/sidebar-button"
import SettingsButton from "@/components/settings-button"
import EnhancedSidebar from "@/components/enhanced-sidebar"

export default function Dashboard() {
  const [username, setUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const { session, isAuthenticated, isLoading } = useAuth()

  // Fetch user profile when component mounts
  useEffect(() => {
    let isMounted = true

    async function fetchUserProfile() {
      if (!session || !session.user) return

      try {
        setLoading(true)
        const profile = await getUserProfile(session.user.id)

        if (isMounted && profile) {
          setUsername(profile.username)
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (!isLoading && isAuthenticated) {
      fetchUserProfile()
    } else {
      setLoading(false)
    }

    return () => {
      isMounted = false
    }
  }, [session, isAuthenticated, isLoading])

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // If auth is still loading, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-950 via-navy-900 to-black text-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-white flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mb-2"></div>
            <div>Loading dashboard...</div>
          </div>
        </div>
      </div>
    )
  }

  // If not authenticated, show login message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-950 via-navy-900 to-black text-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-white flex flex-col items-center">
            <div className="text-xl font-bold mb-2">Authentication Required</div>
            <div className="text-white/70 mb-4">Please log in to access the dashboard</div>
            <Link href="/login">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">Go to Login</button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-950 via-navy-900 to-black text-white">
      {/* Sidebar Button */}
      <SidebarButton isOpen={sidebarOpen} onClick={toggleSidebar} />

      {/* Settings Button */}
      <SettingsButton />

      {/* Enhanced Sidebar */}
      <EnhancedSidebar />

      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-navy-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
              {username ? `Welcome, ${username}!` : "Welcome to Free Fire Tools Dashboard"}
            </h2>
            <p className="text-white/70">
              This dashboard provides access to various tools for Free Fire game. Use the sidebar menu to navigate
              between different tools.
            </p>
          </div>

          {/* Available Tools Section */}
          <div className="bg-navy-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Available Tools</h2>
            <p className="text-white/70 mb-6">
              This dashboard provides access to {APP_CONFIG.dashboard.toolCount} powerful tools for Free Fire game:
            </p>

            {/* API Tools */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Database className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">API Tools</h3>
              </div>
              <ul className="space-y-2 pl-7">
                <li className="flex items-start gap-2 text-white/80">
                  <span className="text-blue-400 mt-1.5">•</span>
                  <div>
                    <Link href="/like-sender" className="text-blue-400 hover:underline font-medium">
                      Like Sender
                    </Link>
                    <span> - Send likes to a Free Fire player profile</span>
                  </div>
                </li>
                <li className="flex items-start gap-2 text-white/80">
                  <span className="text-blue-400 mt-1.5">•</span>
                  <div>
                    <Link href="/player-info" className="text-blue-400 hover:underline font-medium">
                      Player Info
                    </Link>
                    <span> - Get detailed information about a Free Fire player</span>
                  </div>
                </li>
                <li className="flex items-start gap-2 text-white/80">
                  <span className="text-blue-400 mt-1.5">•</span>
                  <div>
                    <Link href="/ban-checker" className="text-blue-400 hover:underline font-medium">
                      Ban Checker
                    </Link>
                    <span> - Check if a Free Fire player account has been banned</span>
                  </div>
                </li>
                <li className="flex items-start gap-2 text-white/80">
                  <span className="text-blue-400 mt-1.5">•</span>
                  <div>
                    <Link href="/profile-visit" className="text-blue-400 hover:underline font-medium">
                      Profile Visit
                    </Link>
                    <span> - Send profile visits to boost your profile statistics</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Utility Tools */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Wrench className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Utility Tools</h3>
              </div>
              <ul className="space-y-2 pl-7">
                <li className="flex items-start gap-2 text-white/80">
                  <span className="text-blue-400 mt-1.5">•</span>
                  <div>
                    <Link href="/jwt-generator" className="text-blue-400 hover:underline font-medium">
                      JWT Generator
                    </Link>
                    <span> - Generate JWT tokens for Free Fire accounts</span>
                  </div>
                </li>
                <li className="flex items-start gap-2 text-white/80">
                  <span className="text-blue-400 mt-1.5">•</span>
                  <div>
                    <Link href="/guest-combiner" className="text-blue-400 hover:underline font-medium">
                      Guest Combiner
                    </Link>
                    <span> - Combine multiple .dat files into a single JSON file</span>
                  </div>
                </li>
                <li className="flex items-start gap-2 text-white/80">
                  <span className="text-blue-400 mt-1.5">•</span>
                  <div>
                    <Link href="/account-recovery" className="text-blue-400 hover:underline font-medium">
                      Account Recovery
                    </Link>
                    <span> - Recover lost Free Fire accounts</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* How to Access Section */}
          <div className="bg-navy-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-5 w-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">How to Access</h2>
            </div>
            <div className="flex items-start gap-3 text-white/80">
              <div className="bg-blue-900/30 p-2 rounded-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-400"
                >
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              </div>
              <div>
                <p>
                  <span className="font-medium">Click the menu icon in the top left corner</span> to open the sidebar,
                  then select any tool to access it. All tools are organized by category for easy navigation.
                </p>
              </div>
            </div>
          </div>

          {/* Note Section */}
          <div className="bg-navy-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <p className="text-white/80">
              <span className="font-semibold">Note:</span> All tools are for educational purposes only. Use them
              responsibly and in accordance with the game's terms of service.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
