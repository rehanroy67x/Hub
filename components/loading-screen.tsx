"use client"

import { useState, useEffect, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"

function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Listen for navigation events to show loading screen
    const handleShowLoading = () => {
      setIsLoading(true)

      // Auto-hide after a timeout in case navigation fails
      setTimeout(() => {
        setIsLoading(false)
      }, 2000) // Reduced timeout
    }

    // Listen for route change complete to hide loading
    const handleRouteComplete = () => {
      setTimeout(() => {
        setIsLoading(false)
      }, 100) // Reduced delay
    }

    // Add event listeners
    document.addEventListener("showLoading", handleShowLoading)
    window.addEventListener("popstate", handleRouteComplete)

    // Cleanup
    return () => {
      document.removeEventListener("showLoading", handleShowLoading)
      window.removeEventListener("popstate", handleRouteComplete)
    }
  }, [])

  // Simplified loading screen with minimal animations
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }} // Faster transition
          className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center"
        >
          <div className="bg-navy-900/80 p-6 rounded-lg border border-white/10 flex flex-col items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Loader2 className="h-8 w-8 text-blue-400" />
            </motion.div>
            <p className="mt-3 text-white font-medium">Loading...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default memo(LoadingScreen)
