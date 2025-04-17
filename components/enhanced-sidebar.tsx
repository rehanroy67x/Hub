"use client"

import { useState, useCallback, memo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  User,
  Shield,
  FileJson,
  ChevronRight,
  Database,
  Wrench,
  BarChart3,
  Instagram,
  Key,
  LogOut,
  Heart,
  AlertTriangle,
} from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { getAnnouncements, getMaintenanceMode } from "@/lib/auth"

function EnhancedSidebar() {
  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<"apis" | "tools">("apis")
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    apis: true,
    tools: true,
  })
  const [username, setUsername] = useState<string | null>(null)
  const [toolStatus, setToolStatus] = useState<Record<string, "online" | "offline">>({
    "like-sender": "online",
    "player-info": "online",
    "ban-checker": "online",
    "profile-visit": "offline",
    "jwt-generator": "offline",
    "guest-combiner": "online",
  })
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [maintenanceMode, setMaintenanceMode] = useState<{ enabled: boolean; message?: string }>({ enabled: false })

  const pathname = usePathname()
  const router = useRouter()

  // Fetch user info when sidebar loads
  useEffect(() => {
    let isMounted = true

    async function getUserInfo() {
      try {
        // First check if we have a session
        const { data: sessionData } = await supabase.auth.getSession()

        // If no session, don't try to get user info
        if (!sessionData.session || !isMounted) {
          return
        }

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !isMounted) {
          return
        }

        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", user.id)
            .single()

          if (profileError || !isMounted) {
            return
          }

          if (profile) {
            setUsername(profile.username)
          }
        }
      } catch (error) {
        console.error("Error fetching user info:", error)
      }
    }

    getUserInfo()

    // Load tool status from localStorage if available
    const savedToolStatus = localStorage.getItem("tool_status")
    if (savedToolStatus) {
      try {
        setToolStatus(JSON.parse(savedToolStatus))
      } catch (error) {
        console.error("Error parsing tool status:", error)
      }
    }

    // Load announcements
    const activeAnnouncements = getAnnouncements().filter((a: any) => a.active)
    setAnnouncements(activeAnnouncements)

    // Check maintenance mode
    const maintenance = getMaintenanceMode()
    setMaintenanceMode(maintenance)

    // Listen for tool status updates from other tabs
    const toolStatusChannel = new BroadcastChannel("tool_status_update")
    toolStatusChannel.onmessage = (event) => {
      setToolStatus((prev) => ({
        ...prev,
        [event.data.toolId]: event.data.status,
      }))
    }

    // Listen for announcement updates
    const announcementChannel = new BroadcastChannel("announcement_update")
    announcementChannel.onmessage = (event) => {
      if (event.data.action === "new") {
        setAnnouncements((prev) => [event.data.announcement, ...prev])
      } else if (event.data.action === "delete") {
        setAnnouncements((prev) => prev.filter((a) => a.id !== event.data.id))
      } else if (event.data.action === "update") {
        setAnnouncements(event.data.announcements.filter((a: any) => a.active))
      }
    }

    // Listen for maintenance mode updates
    const maintenanceChannel = new BroadcastChannel("maintenance_update")
    maintenanceChannel.onmessage = (event) => {
      setMaintenanceMode({ enabled: event.data.enabled, message: event.data.message })
    }

    return () => {
      isMounted = false
      toolStatusChannel.close()
      announcementChannel.close()
      maintenanceChannel.close()
    }
  }, [])

  const toggleSidebar = useCallback(() => {
    setOpen(!open)
  }, [open])

  const closeSidebar = useCallback(() => setOpen(false), [])

  // Toggle section expansion
  const toggleSection = useCallback((section: "apis" | "tools") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
    setActiveSection(section)
  }, [])

  // Handle logout
  const { signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  // Define the navigation items - updated with status indicators
  const apiItems = [
    { name: "Like Sender", path: "/like-sender", icon: Heart, status: toolStatus["like-sender"] || "online" },
    { name: "Player Info", path: "/player-info", icon: User, status: toolStatus["player-info"] || "online" },
    { name: "Ban Checker", path: "/ban-checker", icon: Shield, status: toolStatus["ban-checker"] || "online" },
    {
      name: "Profile Visit",
      path: "/profile-visit",
      icon: BarChart3,
      status: toolStatus["profile-visit"] || "offline",
    },
  ]

  const toolItems = [
    { name: "JWT Generator", path: "/jwt-generator", icon: Key, status: toolStatus["jwt-generator"] || "offline" },
    {
      name: "Guest Combiner",
      path: "/guest-combiner",
      icon: FileJson,
      status: toolStatus["guest-combiner"] || "online",
    },
  ]

  // Check if the current path is active
  const isActive = useCallback((path: string) => pathname === path, [pathname])

  // Handle navigation with loading state
  const handleNavigation = useCallback(
    (path: string) => {
      closeSidebar()

      // We'll handle navigation in the component to show loading state
      if (path !== pathname) {
        // Show loading state (handled by LoadingScreen component)
        document.dispatchEvent(new CustomEvent("showLoading"))

        // Navigate after a small delay to allow loading screen to show
        setTimeout(() => {
          router.push(path)
        }, 50) // Reduced delay
      }
    },
    [closeSidebar, pathname, router],
  )

  // Animation variants - simplified and faster
  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        when: "beforeChildren",
        staggerChildren: 0.05,
      },
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  }

  const overlayVariants = {
    open: {
      opacity: 1,
      pointerEvents: "auto" as const,
      transition: { duration: 0.3 },
    },
    closed: {
      opacity: 0,
      pointerEvents: "none" as const,
      transition: { duration: 0.3 },
    },
  }

  const itemVariants = {
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
    closed: {
      opacity: 0,
      y: 10,
      transition: {
        duration: 0.3,
      },
    },
  }

  const sectionVariants = {
    expanded: {
      height: "auto",
      opacity: 1,
      transition: { duration: 0.3, when: "beforeChildren", staggerChildren: 0.05 },
    },
    collapsed: {
      height: 0,
      opacity: 0,
      transition: { duration: 0.3, when: "afterChildren" },
    },
  }

  // Status indicator component
  const StatusIndicator = ({ status }: { status: "online" | "offline" }) => (
    <div
      className={`absolute right-2 top-2 w-2 h-2 rounded-full ${status === "online" ? "bg-green-500" : "bg-red-500"}`}
    />
  )

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial="closed"
        animate={open ? "open" : "closed"}
        variants={overlayVariants}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <motion.div
        initial="closed"
        animate={open ? "open" : "closed"}
        variants={sidebarVariants}
        className="fixed inset-y-0 left-0 z-50 w-72 bg-navy-900/95 backdrop-blur-lg border-r border-white/10 shadow-xl"
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <motion.div className="p-6 border-b border-white/10" variants={itemVariants}>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Exe Toolz
              </h2>
            </div>
            <p className="text-sm text-white/60 mt-1">Advanced utilities for Free Fire</p>
          </motion.div>

          {/* Maintenance mode banner */}
          {maintenanceMode.enabled && (
            <motion.div
              className="mx-4 mt-4 p-3 bg-yellow-900/30 border border-yellow-800/50 rounded-md flex items-start gap-2"
              variants={itemVariants}
            >
              <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-500">Maintenance Mode</p>
                <p className="text-xs text-white/70">{maintenanceMode.message}</p>
              </div>
            </motion.div>
          )}

          {/* Announcements */}
          {announcements.length > 0 && (
            <motion.div className="px-4 py-3" variants={itemVariants}>
              <div className="space-y-2">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`p-2 rounded-md text-xs ${
                      announcement.type === "warning"
                        ? "bg-orange-900/30 border border-orange-800/50 text-orange-300"
                        : announcement.type === "error"
                          ? "bg-red-900/30 border border-red-800/50 text-red-300"
                          : announcement.type === "success"
                            ? "bg-green-900/30 border border-green-800/50 text-green-300"
                            : "bg-blue-900/30 border border-blue-800/50 text-blue-300"
                    }`}
                  >
                    <p className="font-medium">{announcement.title}</p>
                    <p className="mt-1 text-white/70">{announcement.content}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            {/* Dashboard button */}
            <motion.div className="mb-6" variants={itemVariants}>
              <button
                onClick={() => handleNavigation("/dashboard")}
                className={`flex w-full items-center px-4 py-3 rounded-lg transition-all ${
                  isActive("/dashboard") || pathname === "/"
                    ? "bg-gradient-to-r from-blue-800 to-blue-900 text-white font-medium shadow-md"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Home className="mr-3 h-5 w-5" />
                Dashboard
              </button>
            </motion.div>

            {/* APIs Section */}
            <motion.div className="mb-4" variants={itemVariants}>
              <button
                onClick={() => toggleSection("apis")}
                className={`flex items-center justify-between w-full px-4 py-2 rounded-md transition-colors ${
                  activeSection === "apis"
                    ? "bg-blue-900/50 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center">
                  <Database className="mr-2 h-4 w-4" />
                  <span className="font-medium">APIs</span>
                </div>
                <div className="flex items-center">
                  <motion.div animate={{ rotate: expandedSections.apis ? 90 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronRight className="h-4 w-4" />
                  </motion.div>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {expandedSections.apis && (
                  <motion.div
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    variants={sectionVariants}
                    className="overflow-hidden"
                  >
                    <ul className="mt-2 ml-4 space-y-1">
                      {apiItems.map((item) => (
                        <motion.li key={item.path} variants={itemVariants}>
                          <button
                            onClick={() => handleNavigation(item.path)}
                            className={`flex w-full items-center px-4 py-2 rounded-md transition-colors relative ${
                              isActive(item.path)
                                ? "bg-blue-800/50 text-white"
                                : "text-white/70 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <item.icon className="mr-2 h-4 w-4" />
                            <span>{item.name}</span>
                            <StatusIndicator status={item.status} />
                          </button>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Tools Section */}
            <motion.div className="mb-4" variants={itemVariants}>
              <button
                onClick={() => toggleSection("tools")}
                className={`flex items-center justify-between w-full px-4 py-2 rounded-md transition-colors ${
                  activeSection === "tools"
                    ? "bg-blue-900/50 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center">
                  <Wrench className="mr-2 h-4 w-4" />
                  <span className="font-medium">Tools</span>
                </div>
                <div className="flex items-center">
                  <motion.div animate={{ rotate: expandedSections.tools ? 90 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronRight className="h-4 w-4" />
                  </motion.div>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {expandedSections.tools && (
                  <motion.div
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    variants={sectionVariants}
                    className="overflow-hidden"
                  >
                    <ul className="mt-2 ml-4 space-y-1">
                      {toolItems.map((item) => (
                        <motion.li key={item.path} variants={itemVariants}>
                          <button
                            onClick={() => handleNavigation(item.path)}
                            className={`flex w-full items-center px-4 py-2 rounded-md transition-colors relative ${
                              isActive(item.path)
                                ? "bg-blue-800/50 text-white"
                                : "text-white/70 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <item.icon className="mr-2 h-4 w-4" />
                            <span>{item.name}</span>
                            <StatusIndicator status={item.status} />
                          </button>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Settings button */}
            <motion.div className="mb-4" variants={itemVariants}>
              <button
                onClick={() => handleNavigation("/settings")}
                className={`flex w-full items-center px-4 py-2 rounded-md transition-colors ${
                  isActive("/settings")
                    ? "bg-blue-800/50 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </button>
            </motion.div>
          </nav>

          {/* User info and logout */}
          {username && (
            <motion.div className="p-4 border-t border-white/10" variants={itemVariants}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">{username.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-sm font-medium text-white">{username}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Logout button */}
          <motion.div className="p-4 border-t border-white/10" variants={itemVariants}>
            <Button
              variant="destructive"
              size="sm"
              className="w-full bg-red-900/30 hover:bg-red-800/50 text-white"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </motion.div>

          {/* Sidebar footer with developer credit */}
          <motion.div className="p-4 border-t border-white/10" variants={itemVariants}>
            <div className="flex items-center justify-center gap-2">
              <p className="text-xs text-white/60">Developer</p>
              <a
                href="https://instagram.com/rahulexez"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span className="text-xs font-medium">@RahulExeZ</span>
                <Instagram className="h-3 w-3" />
              </a>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  )
}

export default memo(EnhancedSidebar)
