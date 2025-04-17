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
import { Gamepad2, UserPlus, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { loginWithGoogle, registerUser, saveSecurityQuestions, getAllSecurityQuestions } from "@/lib/auth"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)

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

  const handleFirstStep = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    // Validate inputs
    if (username.length < 3) {
      setError("Username must be at least 3 characters")
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address")
      setLoading(false)
      return
    }

    try {
      // Check if username already exists
      const { data: usernameData, error: usernameError } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .maybeSingle()

      if (usernameError) {
        console.error("Error checking username:", usernameError)
      }

      if (usernameData) {
        setError("Username already taken")
        setLoading(false)
        return
      }

      // Check if email already exists
      const { data: emailData, error: emailError } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", email)
        .maybeSingle()

      if (emailError) {
        console.error("Error checking email:", emailError)
      }

      if (emailData) {
        setError("Email already registered")
        setLoading(false)
        return
      }

      // Register user
      const { user } = await registerUser(email, password, username)

      if (!user) {
        throw new Error("Failed to create user")
      }

      // Store the user ID for the next step
      setUserId(user.id)

      // Move to the next step
      setStep(2)
    } catch (err: any) {
      console.error("Registration error:", err)
      setError(err.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setError(null)
    setSuccess(null)
    setGoogleLoading(true)

    try {
      await loginWithGoogle()
      // Will redirect to Google
    } catch (error: any) {
      console.error("Google sign up error:", error)
      setGoogleLoading(false)
      setError(error.message || "Failed to sign up with Google. Please try again.")
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
          {step === 1 ? (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">Create an Account</h2>
                <p className="text-white/70 mt-1">Step 1: Basic Information</p>
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

              <form onSubmit={handleFirstStep} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-white/50">Password must be at least 8 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                    disabled={loading}
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
                      Creating Account...
                    </div>
                  ) : (
                    "Continue to Security Setup"
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
                onClick={handleGoogleSignUp}
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
                  Already have an account?{" "}
                  <Link href="/login" className="text-blue-400 hover:text-blue-300">
                    Login
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <SecurityQuestionsSetup userId={userId} />
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-6 text-center text-white/50 text-sm">
        © {new Date().getFullYear()} Exe Toolz. All rights reserved.
      </footer>
    </div>
  )
}

function SecurityQuestionsSetup({ userId }: { userId: string | null }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [securityQuestions, setSecurityQuestions] = useState<{ id: number; question: string }[]>([])
  const [primaryQuestionId, setPrimaryQuestionId] = useState<number | null>(null)
  const [primaryAnswer, setPrimaryAnswer] = useState("")
  const [secondaryQuestionId, setSecondaryQuestionId] = useState<number | null>(null)
  const [secondaryAnswer, setSecondaryAnswer] = useState("")
  const [customQuestion, setCustomQuestion] = useState("")
  const [customAnswer, setCustomAnswer] = useState("")
  const [customQuestionSuggestions] = useState([
    "What was your favorite game as a child?",
    "What is the name of your childhood best friend?",
    "What is your favorite color?",
    "What is your favorite food?",
    "What was the name of your first crush?",
    "What was the model of your first phone?",
    "What is the name of the street you grew up on?",
    "What was your first job?",
  ])
  const [selectedCustomQuestion, setSelectedCustomQuestion] = useState("")

  const router = useRouter()

  useEffect(() => {
    // Fetch security questions from the database
    async function fetchSecurityQuestions() {
      try {
        const questions = await getAllSecurityQuestions()
        setSecurityQuestions(questions || [])
      } catch (err) {
        console.error("Error in fetchSecurityQuestions:", err)
        setError("An unexpected error occurred. Please try again.")
      }
    }

    fetchSecurityQuestions()

    // Set a random custom question suggestion
    const randomIndex = Math.floor(Math.random() * customQuestionSuggestions.length)
    setSelectedCustomQuestion(customQuestionSuggestions[randomIndex])
  }, [customQuestionSuggestions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (!userId) {
        throw new Error("User ID is missing. Please try registering again.")
      }

      if (!primaryQuestionId || !primaryAnswer.trim()) {
        throw new Error("Please select a primary security question and provide an answer.")
      }

      if (!secondaryQuestionId || !secondaryAnswer.trim()) {
        throw new Error("Please select a secondary security question and provide an answer.")
      }

      if (!customQuestion.trim() || !customAnswer.trim()) {
        throw new Error("Please provide a custom security question and answer.")
      }

      // Save security questions
      await saveSecurityQuestions(
        userId,
        primaryQuestionId,
        primaryAnswer,
        secondaryQuestionId,
        secondaryAnswer,
        customQuestion,
        customAnswer,
      )

      setSuccess("Security questions saved successfully!")

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (err: any) {
      console.error("Error in handleSubmit:", err)
      setError(err.message || "Failed to complete registration. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCustomQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomQuestion(e.target.value)
  }

  const useCustomQuestionSuggestion = () => {
    setCustomQuestion(selectedCustomQuestion)
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Security Setup</h2>
        <p className="text-white/70 mt-1">Step 2: Set up security questions for account recovery</p>
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

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Primary Security Question */}
        <div className="space-y-2">
          <Label htmlFor="primary-question">Primary Security Question</Label>
          <select
            id="primary-question"
            value={primaryQuestionId || ""}
            onChange={(e) => setPrimaryQuestionId(Number(e.target.value))}
            className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
            required
            disabled={loading}
          >
            <option value="">Select a security question</option>
            {securityQuestions.map((q) => (
              <option key={q.id} value={q.id}>
                {q.question}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="primary-answer">Your Answer</Label>
          <Input
            id="primary-answer"
            type="text"
            value={primaryAnswer}
            onChange={(e) => setPrimaryAnswer(e.target.value)}
            placeholder="Enter your answer"
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            required
            disabled={loading}
          />
        </div>

        {/* Secondary Security Question */}
        <div className="space-y-2">
          <Label htmlFor="secondary-question">Secondary Security Question</Label>
          <select
            id="secondary-question"
            value={secondaryQuestionId || ""}
            onChange={(e) => setSecondaryQuestionId(Number(e.target.value))}
            className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
            required
            disabled={loading}
          >
            <option value="">Select a security question</option>
            {securityQuestions
              .filter((q) => q.id !== primaryQuestionId)
              .map((q) => (
                <option key={q.id} value={q.id}>
                  {q.question}
                </option>
              ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="secondary-answer">Your Answer</Label>
          <Input
            id="secondary-answer"
            type="text"
            value={secondaryAnswer}
            onChange={(e) => setSecondaryAnswer(e.target.value)}
            placeholder="Enter your answer"
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            required
            disabled={loading}
          />
        </div>

        {/* Custom Security Question */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="custom-question">Custom Security Question</Label>
            <button
              type="button"
              onClick={useCustomQuestionSuggestion}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Use suggestion
            </button>
          </div>
          <Input
            id="custom-question"
            type="text"
            value={customQuestion}
            onChange={handleCustomQuestionChange}
            placeholder={selectedCustomQuestion}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom-answer">Your Answer</Label>
          <Input
            id="custom-answer"
            type="text"
            value={customAnswer}
            onChange={(e) => setCustomAnswer(e.target.value)}
            placeholder="Enter your answer"
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            required
            disabled={loading}
          />
        </div>

        <div className="pt-2">
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
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Completing Registration...
              </div>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Complete Registration
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
