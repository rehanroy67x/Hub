"use client"

import { Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { memo } from "react"

function SettingsButton() {
  const router = useRouter()

  const handleClick = () => {
    router.push("/settings")
  }

  return (
    <button
      onClick={handleClick}
      className="fixed top-4 right-4 z-50 w-10 h-10 rounded-md bg-navy-900/80 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-navy-800/80 transition-colors"
      aria-label="Settings"
    >
      <Settings className="h-5 w-5" />
    </button>
  )
}

export default memo(SettingsButton)
