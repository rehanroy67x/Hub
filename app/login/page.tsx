"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Gamepad2, AlertCircle, LogIn, Mail, Lock, ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  loginWithEmail,
  loginWithGoogle,
  getUserByEmail,
  getSecurityQuestions,
  getSecurityQuestionById,
  verifySecurityQuestion,
  resetPasswordWithSecurityQuestion,
} from "@/lib/auth"
import { supabase } from "@/lib/supabase-client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetStep, setResetStep] = useState(1)
  const [userEmail, setUserEmail] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [securityQuestion, setSecurityQuestion] = useState("")
  const [securityAnswer, setSecurityAnswer] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const [questionType, setQuestionType] = useState<"primary" | "secondary" | "custom">("primary")
  const [questionId, setQuestionId] = useState<number | null>(null)

  const router = useRouter()

  // Check if user is already logged in
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      }
    }
    checkAuth()
  }, [router])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      await loginWithEmail(email, password)
      setSuccess("Login successful! Redirecting...")
      setTimeout(() => {
        router.push("/dashboard")
      }, 500)
    } catch (error: any) {
      console.error("Login error:", error)
      let errorMessage = "Failed to login. Please check your credentials."
      if (error.message) {
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password"
        } else {
          errorMessage = error.message
        }
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError(null)
    setSuccess(null)
    setGoogleLoading(true)

    try {
      await loginWithGoogle()
      // Will redirect to Google
    } catch (error: any) {
      console.error("Google login error:", error)
      setGoogleLoading(false)
      setError(error.message || "Failed to login with Google. Please try again.")
    }
  }

  const handleForgotPasswordStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setResetLoading(true)

    try {
      if (!userEmail) {
        throw new Error("Please enter your email")
      }

      // Find user by email
      const user = await getUserByEmail(userEmail)
      if (!user) {
        throw new Error("No account found with this email address")
      }

      setUserId(user.id)

      try {
        // Get security questions
        const questions = await getSecurityQuestions(user.id)
        if (!questions) {
          throw new Error("No security questions found for this account")
        }

        // Randomly select one question
        const questionTypes = [
          { type: "primary", id: questions.primary_question_id },
          { type: "secondary", id: questions.secondary_question_id },
          { type: "custom", question: questions.custom_question },
        ]

        const randomIndex = Math.floor(Math.random() * 3)
        const selectedQuestion = questionTypes[randomIndex]

        if (selectedQuestion.type === "custom") {
          setSecurityQuestion(selectedQuestion.question)
          setQuestionType("custom")
          setQuestionId(null)
        } else {
          const questionText = await getSecurityQuestionById(selectedQuestion.id)
          setSecurityQuestion(questionText)
          setQuestionType(selectedQuestion.type as "primary" | "secondary")
          setQuestionId(selectedQuestion.id)
        }

        setResetStep(2)
      } catch (error) {
        console.error("Error getting security questions:", error)
        throw new Error("This account doesn't have security questions set up. Please contact support.")
      }
    } catch (err: any) {
      console.error("Password reset error:", err)
      setError(err.message || "An error occurred")
    } finally {
      setResetLoading(false)
    }
  }

  const handleSecurityQuestionVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setResetLoading(true)

    try {
      if (!securityAnswer) {
        throw new Error("Please provide an answer to the security question")
      }

      if (!userId) {
        throw new Error("User ID is missing. Please try again.")
      }

      // Verify security answer
      const isCorrect = await verifySecurityQuestion(userId, questionType, securityAnswer)

      if (!isCorrect) {
        throw new Error("Incorrect answer. Please try again.")
      }

      // Move to password reset step
      setResetStep(3)
    } catch (err: any) {
      console.error("Security verification error:", err)
      setError(err.message || "An error occurred")
    } finally {
      setResetLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setResetLoading(true)

    try {
      if (!userId) {
        throw new Error("User ID is missing. Please try again.")
      }

      if (newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters")
      }

      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match")
      }

      // Reset password
      await resetPasswordWithSecurityQuestion(userId, newPassword)

      setSuccess("Password has been reset successfully! You can now login with your new password.")

      // Reset form after a delay
      setTimeout(() => {
        setShowForgotPassword(false)
        resetForgotPasswordForm()
      }, 3000)
    } catch (err: any) {
      console.error("Password reset error:", err)
      setError(err.message || "An error occurred")
    } finally {
      setResetLoading(false)
    }
  }

  const resetForgotPasswordForm = () => {
    setShowForgotPassword(false)
    setResetStep(1)
    setUserEmail("")
    setSecurityQuestion("")
    setSecurityAnswer("")
    setNewPassword("")
    setConfirmPassword("")
    setUserId(null)
    setQuestionType("primary")
    setQuestionId(null)
    setError(null)
    setSuccess(null)
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-950 via-navy-900 to-black text-white flex flex-col">
        <header className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <Gamepad2 className="h-6 w-6 text-blue-400 mr-2" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Exe Toolz
              </h1>
            </Link>
            <Button variant="ghost" className="text-white hover:bg-white/10" onClick={resetForgotPasswordForm}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                <CardDescription className="text-white/70">
                  {resetStep === 1 && "Enter your email to begin the password reset process"}
                  {resetStep === 2 && "Answer your security question to verify your identity"}
                  {resetStep === 3 && "Create a new password for your account"}
                </CardDescription>
              </CardHeader>
              <CardContent>
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

                {resetStep === 1 && (
                  <form onSubmit={handleForgotPasswordStep1} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="user-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                        <Input
                          id="user-email"
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="bg-white/10 border-white/20 text-white pl-10 placeholder:text-gray-400"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      disabled={resetLoading}
                    >
                      {resetLoading ? (
                        <div className="flex items-center justify-center">
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
                          Verifying...
                        </div>
                      ) : (
                        "Continue"
                      )}
                    </Button>
                  </form>
                )}

                {resetStep === 2 && (
                  <form onSubmit={handleSecurityQuestionVerification} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="security-question">Security Question</Label>
                      <div className="p-3 bg-white/10 border border-white/20 rounded-md text-white">
                        {securityQuestion}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="security-answer">Your Answer</Label>
                      <Input
                        id="security-answer"
                        type="text"
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        placeholder="Enter your answer"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      disabled={resetLoading}
                    >
                      {resetLoading ? (
                        <div className="flex items-center justify-center">
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
                          Verifying...
                        </div>
                      ) : (
                        "Verify Answer"
                      )}
                    </Button>
                  </form>
                )}

                {resetStep === 3 && (
                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        required
                      />
                      <p className="text-xs text-white/50">Password must be at least 8 characters</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                      <Input
                        id="confirm-new-password"
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
                      disabled={resetLoading}
                    >
                      {resetLoading ? (
                        <div className="flex items-center justify-center">
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
                          Updating Password...
                        </div>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>

        <footer className="container mx-auto px-4 py-6 text-center text-white/50 text-sm">
          <p>© {new Date().getFullYear()} Exe Toolz. All rights reserved.</p>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-950 via-navy-900 to-black text-white flex flex-col">
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

      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription className="text-white/70">Login to access Free Fire tools</CardDescription>
            </CardHeader>
            <CardContent>
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

              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="bg-white/10 border-white/20 text-white pl-10 placeholder:text-gray-400"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="bg-white/10 border-white/20 text-white pl-10 placeholder:text-gray-400"
                      required
                    />
                  </div>
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
                      Logging in...
                    </div>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Login with Email
                    </>
                  )}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-black px-2 text-white/50">OR</span>
                </div>
              </div>

              <Button
                type="button"
                className="w-full bg-white text-gray-800 hover:bg-gray-200 flex items-center justify-center"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-800"
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
                    Connecting...
                  </div>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>

              <div className="mt-6 text-center">
                <p className="text-white/70">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-blue-400 hover:text-blue-300">
                    Sign up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <footer className="container mx-auto px-4 py-6 text-center text-white/50 text-sm">
        <p>© {new Date().getFullYear()} Exe Toolz. All rights reserved.</p>
      </footer>
    </div>
  )
}
