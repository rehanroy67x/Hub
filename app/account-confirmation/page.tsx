"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, Gamepad2, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase-client"

export default function AccountConfirmationPage() {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(5)
  const router = useRouter()

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        setLoading(true)

        // Get the current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          console.error("Error getting user:", userError)
          return
        }

        // Get the user's profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single()

        if (profileError) {
          console.error("Error getting profile:", profileError)
        } else if (profile) {
          setUsername(profile.username)
        }
      } catch (error) {
        console.error("Error in checkAuthStatus:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      router.push("/login")
    }
  }, [countdown, router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-950 via-navy-900 to-black text-white flex flex-col">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Gamepad2 className="h-6 w-6 text-blue-400 mr-2" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Exe Toolz
            </h1>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-green-500/20 p-4 rounded-full">
                  <CheckCircle className="h-12 w-12 text-green-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Email Verified Successfully!</h2>
              <p className="text-white/70 mb-6">
                {username ? `Welcome, ${username}!` : "Your email has been verified."} You can now access all features
                of Exe Toolz.
              </p>

              <div className="bg-blue-900/30 rounded-lg p-4 mb-6">
                <p className="text-white/80">
                  You will be redirected to the login page in <span className="font-bold">{countdown}</span> seconds...
                </p>
              </div>

              <div className="flex flex-col space-y-3">
                <Button
                  onClick={() => router.push("/login")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Go to Login Now
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-6 text-center text-white/50 text-sm">
        <p>© {new Date().getFullYear()} Exe Toolz. All rights reserved.</p>
      </footer>
    </div>
  )
}
