"use client"

import { motion } from "framer-motion"

interface SidebarButtonProps {
  isOpen: boolean
  onClick: () => void
}

export default function SidebarButton({ isOpen, onClick }: SidebarButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center">
        <motion.span
          className="w-5 h-0.5 bg-white rounded-full block"
          animate={{
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 2 : 0,
          }}
          transition={{ duration: 0.2 }}
        />
        <motion.span
          className="w-5 h-0.5 bg-white rounded-full block my-1"
          animate={{
            opacity: isOpen ? 0 : 1,
            x: isOpen ? -10 : 0,
          }}
          transition={{ duration: 0.2 }}
        />
        <motion.span
          className="w-5 h-0.5 bg-white rounded-full block"
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? -2 : 0,
          }}
          transition={{ duration: 0.2 }}
        />
      </div>
    </motion.button>
  )
}
