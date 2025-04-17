"use client"

import type { ReactNode } from "react"
import { memo, useEffect, useState } from "react"
import EnhancedSidebar from "@/components/enhanced-sidebar"
import AnimatedBackground from "@/components/animated-background"
import { motion } from "framer-motion"
import Link from "next/link"
import LoadingScreen from "@/components/loading-screen"
import { useRouter } from "next/navigation"
import { Menu, X, Settings } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import Head from "next/head"

interface DashboardLayoutProps {
  children: ReactNode
  title: string
  description?: string
}

function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useMobile()

  // Close sidebar when switching from mobile to desktop
  useEffect(() => {
    if (!isMobile && sidebarOpen) {
      setSidebarOpen(false)
    }
  }, [isMobile, sidebarOpen])

  // Add navigation event listeners to trigger loading screen
  useEffect(() => {
    // Add a global click handler for all navigation links
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest("a")

      if (link && link.href && link.href.startsWith(window.location.origin) && !link.hasAttribute("target")) {
        e.preventDefault()
        document.dispatchEvent(new CustomEvent("showLoading"))

        setTimeout(() => {
          router.push(link.href)
        }, 50) // Reduced delay
      }
    }

    document.addEventListener("click", handleLinkClick)

    return () => {
      document.removeEventListener("click", handleLinkClick)
    }
  }, [router])

  return (
    <>
      <Head>
        <title>{title} | Free Fire Tools</title>
        <meta name="description" content={description || "Free Fire Tools Dashboard"} />
      </Head>

      <div className="min-h-screen w-full flex flex-col relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-black">
        {/* Loading Screen */}
        <LoadingScreen />

        {/* Animated background with reduced animations */}
        <AnimatedBackground />

        {/* Sidebar */}
        {!isMobile && <EnhancedSidebar className="fixed left-0 top-0 h-full w-64 z-30" />}

        {/* Mobile sidebar (overlay) */}
        {isMobile && sidebarOpen && (
          <div className="fixed inset-0 z-40">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)}></div>
            <EnhancedSidebar className="fixed left-0 top-0 h-full w-64 z-50" />
          </div>
        )}

        {/* Settings button (fixed position) */}
        <Link
          href="/settings"
          className="fixed top-4 right-4 z-50 p-2 rounded-full bg-navy-800/80 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10 transition-colors"
        >
          <Settings size={20} />
        </Link>

        {/* Hamburger menu button (fixed position) */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed top-4 left-4 z-50 p-2 rounded-full bg-navy-800/80 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}

        {/* Main content - simplified animations */}
        <motion.main
          className={`flex-grow flex flex-col p-4 pt-16 md:p-8 md:pt-16 ${!isMobile ? "ml-64" : "ml-0"} min-h-screen`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }} // Faster transition
        >
          <div className="container mx-auto max-w-6xl">
            {/* Page header */}
            <div className="mb-6 mt-4">
              <h1 className="text-3xl font-bold text-white">{title}</h1>
              {description && <p className="text-white/60 mt-2">{description}</p>}
            </div>

            {/* Page content */}
            <div>{children}</div>
          </div>
        </motion.main>

        {/* Footer with Terms and Privacy Policy */}
        <footer className="py-4 text-center text-white/60 text-sm relative z-10 border-t border-white/10 mt-auto">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mt-2 md:mt-0 flex gap-4">
                <Link href="/terms" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Terms & Conditions
                </Link>
                <Link href="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Privacy Policy
                </Link>
              </div>
            </div>

            <p className="mt-2 text-xs text-white/40">© {new Date().getFullYear()} Exe Toolz. All Rights Reserved.</p>
          </div>
        </footer>
      </div>
    </>
  )
}

export default memo(DashboardLayout)
