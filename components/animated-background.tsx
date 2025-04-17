"use client"
import { memo } from "react"
import { motion } from "framer-motion"

// Optimized Particle component with minimal animation
const Particle = memo(({ delay = 0 }: { delay?: number }) => {
  const size = Math.random() * 1 + 0.5 // Reduced size for better performance
  const initialX = Math.random() * 100
  const initialY = Math.random() * 100

  return (
    <motion.div
      className="absolute rounded-full bg-white"
      style={{
        width: size,
        height: size,
        left: `${initialX}%`,
        top: `${initialY}%`,
        opacity: Math.random() * 0.2 + 0.05, // Reduced opacity
      }}
      animate={{
        y: [0, -5, 0], // Minimal movement
        opacity: [0.05, 0.1, 0.05],
      }}
      transition={{
        duration: 8, // Slower animation
        repeat: Number.POSITIVE_INFINITY,
        delay: delay,
        ease: "linear",
      }}
    />
  )
})
Particle.displayName = "Particle"

function AnimatedBackground() {
  // Generate fewer particles for better performance
  const particles = Array.from({ length: 6 }, (_, i) => <Particle key={`particle-${i}`} delay={i * 0.5} />)

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Single gradient orb with minimal animation */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-blue-900/5 blur-3xl"
        animate={{
          x: [0, 10, 0],
          y: [0, -10, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 30, // Very slow animation for better performance
          ease: "linear",
        }}
      />

      {/* Sparkling particles */}
      {particles}
    </div>
  )
}

export default memo(AnimatedBackground)
