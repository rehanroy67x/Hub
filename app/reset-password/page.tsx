"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Gamepad2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validToken, setValidToken] = useState(false)
  const [checkingToken, setCheckingToken] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const verifyRecoveryToken = async () => {
      try {
        setCheckingToken(true)

        // First, check if we already have a valid session
        const { data: sessionData } = await supabase.auth.getSession()

        if (sessionData?.session) {
          console.log("Valid session found")
          setValidToken(true)
          setCheckingToken(false)
          return
        }

        // Check for token_hash in URL
        const urlParams = new URLSearchParams(window.location.search)
        const tokenHash = urlParams.get("token_hash")
        const type = urlParams.get("type")

        if (tokenHash && type === "recovery") {
          console.log("Found token_hash in URL, verifying...")

          // Use the token to verify the OTP
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          })

          if (verifyError) {
            console.error("Error verifying token:", verifyError)
            setError("Invalid or expired recovery token. Please request a new password reset.")
            setValidToken(false)
          } else {
            console.log("Token verified successfully")
            setValidToken(true)
          }
        } else {
          // If no token in URL, check for recovery token cookie as fallback
          const cookies = document.cookie.split(";")
          const tokenCookie = cookies.find((c) => c.trim().startsWith("supabase_recovery_token="))

          if (!tokenCookie) {
            console.log("No recovery token found")
            setError("No recovery token found. Please request a new password reset.")
            setValidToken(false)
            setCheckingToken(false)
            return
          }

          const token = tokenCookie.split("=")[1]
          if (!token) {
            setError("Invalid recovery token. Please request a new password reset.")
            setValidToken(false)
            setCheckingToken(false)
            return
          }

          // Use the token to verify the OTP
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: "recovery",
          })

          if (verifyError) {
            console.error("Error verifying token:", verifyError)
            setError("Invalid or expired recovery token. Please request a new password reset.")
            setValidToken(false)
          } else {
            console.log("Token verified successfully")
            setValidToken(true)

            // Clear the cookie
            document.cookie = "supabase_recovery_token=; path=/; max-age=0"
          }
        }
      } catch (err) {
        console.error("Error in verifyRecoveryToken:", err)
        setError("An error occurred while verifying your recovery token.")
        setValidToken(false)
      } finally {
        setCheckingToken(false)
      }
    }

    verifyRecoveryToken()
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        throw new Error(error.message)
      }

      setSuccess("Password has been reset successfully!")

      // Sign out the user after password reset
      await supabase.auth.signOut()

      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err: any) {
      console.error("Password reset error:", err)
      setError(err.message || "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

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
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
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
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Reset Your Password</h2>
              <p className="text-white/70 mt-1">Enter your new password below</p>
            </div>

            {error && (
              <Alert className="mb-4 bg-red-900/20 border-red-800 text-white">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 bg-green-900/20 border-green-800 text-white">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {checkingToken ? (
              <div className="text-center py-4">
                <div className="flex justify-center mb-4">
                  <svg
                    className="animate-spin h-8 w-8 text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
                <p className="text-white">Verifying your reset link...</p>
              </div>
            ) : validToken ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                  <p className="text-xs text-white/50">Password must be at least 8 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Resetting Password...
                    </div>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-white mb-4">
                  {error || "Invalid or expired password reset link. Please request a new password reset."}
                </p>
                <Button
                  onClick={() => router.push("/login")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Back to Login
                </Button>
              </div>
            )}
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
