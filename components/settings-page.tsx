"use client"

import type React from "react"

// Add SQL table creation code as a comment at the top of the file
/*
-- SQL for creating the necessary tables

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  email_confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create security questions table if it doesn't exist
CREATE TABLE IF NOT EXISTS security_questions (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL
);

-- Create user security questions table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_security_questions (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_question_id INTEGER REFERENCES security_questions(id),
  primary_answer TEXT NOT NULL,
  secondary_question_id INTEGER REFERENCES security_questions(id),
  secondary_answer TEXT NOT NULL,
  custom_question TEXT NOT NULL,
  custom_answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default security questions if they don't exist
INSERT INTO security_questions (question)
VALUES 
  ('What was the name of your first pet?'),
  ('In what city were you born?'),
  ('What is your mother''s maiden name?'),
  ('What high school did you attend?'),
  ('What was the make of your first car?'),
  ('What is your favorite movie?'),
  ('What is your favorite book?'),
  ('What is the name of your favorite childhood teacher?')
ON CONFLICT DO NOTHING;
*/

// Completely redesign the settings page to show all sections at once instead of tabs
// Replace the entire component with a new implementation

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Lock, Mail, HelpCircle, Save, AlertCircle, CheckCircle, ChevronDown, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"
import {
  getUserProfile,
  hasSecurityQuestions,
  getAllSecurityQuestions,
  getSecurityQuestions,
  updateUserEmail,
  updateUserPassword,
  updateSecurityQuestions,
  saveSecurityQuestions,
} from "@/lib/auth"

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Account settings
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newEmail, setNewEmail] = useState("")

  // Password settings
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Security questions settings
  const [securityQuestions, setSecurityQuestions] = useState<{ id: number; question: string }[]>([])
  const [primaryQuestionId, setPrimaryQuestionId] = useState<number | null>(null)
  const [primaryAnswer, setPrimaryAnswer] = useState("")
  const [secondaryQuestionId, setSecondaryQuestionId] = useState<number | null>(null)
  const [secondaryAnswer, setSecondaryAnswer] = useState("")
  const [customQuestion, setCustomQuestion] = useState("")
  const [customAnswer, setCustomAnswer] = useState("")
  const [securityPassword, setSecurityPassword] = useState("")
  const [hasSecurityQuestionsSet, setHasSecurityQuestionsSet] = useState(false)
  const [isGoogleUser, setIsGoogleUser] = useState(false)
  const [hasPassword, setHasPassword] = useState(true)

  // UI state
  const [activeSection, setActiveSection] = useState<string | null>(null)

  // Load user data
  useEffect(() => {
    async function loadUserData() {
      if (!user) {
        console.log("No user found in auth context")
        return
      }

      try {
        setLoading(true)
        console.log("Loading user profile for ID:", user.id)

        // Get user profile
        const profile = await getUserProfile(user.id)

        if (profile) {
          console.log("Profile loaded successfully:", profile.username)
          setUsername(profile.username || "")
          setEmail(profile.email || "")
          setNewEmail(profile.email || "")
        } else {
          console.log("No profile found for user")
          setError("No profile found for your account")
        }

        // Check if user has security questions
        const hasQuestions = await hasSecurityQuestions(user.id)
        setHasSecurityQuestionsSet(hasQuestions)

        if (hasQuestions) {
          // Get user's security questions
          const userQuestions = await getSecurityQuestions(user.id)
          setPrimaryQuestionId(userQuestions.primary_question_id)
          setSecondaryQuestionId(userQuestions.secondary_question_id)
          setCustomQuestion(userQuestions.custom_question)
        }

        // Load security questions
        const questions = await getAllSecurityQuestions()
        setSecurityQuestions(questions || [])

        // Check if user is a Google user
        setIsGoogleUser(user.app_metadata?.provider === "google")

        // Check if user has a password
        setHasPassword(!!user.email && !isGoogleUser)
      } catch (err) {
        console.error("Error in loadUserData:", err)
        setError("Failed to load user data")
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [user, isGoogleUser])

  // Toggle section
  const toggleSection = (section: string) => {
    if (activeSection === section) {
      setActiveSection(null)
    } else {
      setActiveSection(section)
    }
  }

  // Handle email change
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (!user) {
        throw new Error("User not authenticated")
      }

      if (!currentPassword) {
        throw new Error("Please enter your current password")
      }

      if (!newEmail) {
        throw new Error("Please enter a new email address")
      }

      if (newEmail === email) {
        throw new Error("New email is the same as current email")
      }

      // Verify password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: currentPassword,
      })

      if (signInError) {
        throw new Error("Current password is incorrect")
      }

      // Update email
      await updateUserEmail(user.id, newEmail)

      setSuccess("Email updated successfully!")
      setEmail(newEmail)

      // Clear form
      setCurrentPassword("")
    } catch (err: any) {
      console.error("Error updating email:", err)
      setError(err.message || "Failed to update email")
    } finally {
      setLoading(false)
    }
  }

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (!user) {
        throw new Error("User not authenticated")
      }

      if (isGoogleUser && !hasPassword) {
        // Setting password for the first time (Google user)
        if (newPassword.length < 8) {
          throw new Error("Password must be at least 8 characters")
        }

        if (newPassword !== confirmPassword) {
          throw new Error("Passwords do not match")
        }

        // Update user with new password
        await updateUserPassword(user.id, newPassword)

        setSuccess("Password set successfully!")
        setHasPassword(true)
      } else {
        // Changing existing password
        if (!oldPassword) {
          throw new Error("Please enter your current password")
        }

        if (newPassword.length < 8) {
          throw new Error("New password must be at least 8 characters")
        }

        if (newPassword !== confirmPassword) {
          throw new Error("New passwords do not match")
        }

        // Verify old password
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: oldPassword,
        })

        if (signInError) {
          throw new Error("Current password is incorrect")
        }

        // Update password
        await updateUserPassword(user.id, newPassword)

        setSuccess("Password updated successfully!")
      }

      // Clear form
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      console.error("Error updating password:", err)
      setError(err.message || "Failed to update password")
    } finally {
      setLoading(false)
    }
  }

  // Handle security questions update
  const handleSecurityQuestionsUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (!user) {
        throw new Error("User not authenticated")
      }

      // If user has a password, verify it
      if (hasPassword && !securityPassword) {
        throw new Error("Please enter your password")
      }

      if (hasPassword) {
        // Verify password
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: securityPassword,
        })

        if (signInError) {
          throw new Error("Password is incorrect")
        }
      }

      if (!primaryQuestionId || !primaryAnswer.trim()) {
        throw new Error("Please select a primary security question and provide an answer")
      }

      if (!secondaryQuestionId || !secondaryAnswer.trim()) {
        throw new Error("Please select a secondary security question and provide an answer")
      }

      if (!customQuestion.trim() || !customAnswer.trim()) {
        throw new Error("Please provide a custom security question and answer")
      }

      // Check if user already has security questions
      if (hasSecurityQuestionsSet) {
        // Update existing security questions
        await updateSecurityQuestions(
          user.id,
          primaryQuestionId,
          primaryAnswer,
          secondaryQuestionId,
          secondaryAnswer,
          customQuestion,
          customAnswer,
        )
      } else {
        // Insert new security questions
        await saveSecurityQuestions(
          user.id,
          primaryQuestionId,
          primaryAnswer,
          secondaryQuestionId,
          secondaryAnswer,
          customQuestion,
          customAnswer,
        )

        setHasSecurityQuestionsSet(true)
      }

      setSuccess("Security questions updated successfully!")

      // Clear form
      setSecurityPassword("")
      setPrimaryAnswer("")
      setSecondaryAnswer("")
      setCustomAnswer("")
    } catch (err: any) {
      console.error("Error updating security questions:", err)
      setError(err.message || "Failed to update security questions")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </div>

      {error && (
        <Alert className="mb-6 bg-red-900/20 border-red-800 text-white">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-900/20 border-green-800 text-white">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Account Information Section */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
        <button onClick={() => toggleSection("account")} className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <User className="h-5 w-5 text-blue-400 mr-2" />
            <h2 className="text-xl font-semibold">Account Information</h2>
          </div>
          <ChevronDown
            className={`h-5 w-5 transition-transform ${activeSection === "account" ? "transform rotate-180" : ""}`}
          />
        </button>

        {activeSection === "account" && (
          <div className="space-y-6 mt-4 pt-4 border-t border-white/10">
            {/* Username (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} className="bg-white/10 border-white/20 text-white" disabled />
              <p className="text-xs text-white/50">Username cannot be changed</p>
            </div>

            {/* Email change form */}
            <form onSubmit={handleEmailChange} className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="text-lg font-medium">Change Email Address</h3>

              <div className="space-y-2">
                <Label htmlFor="current-email">Current Email</Label>
                <Input id="current-email" value={email} className="bg-white/10 border-white/20 text-white" disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-email">New Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                  <Input
                    id="new-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter new email address"
                    className="bg-white/10 border-white/20 text-white pl-10 placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="bg-white/10 border-white/20 text-white pl-10 placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
                    Updating Email...
                  </div>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Email
                  </>
                )}
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Password Section */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
        <button onClick={() => toggleSection("password")} className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <Lock className="h-5 w-5 text-blue-400 mr-2" />
            <h2 className="text-xl font-semibold">
              {isGoogleUser && !hasPassword ? "Set Password" : "Change Password"}
            </h2>
          </div>
          <ChevronDown
            className={`h-5 w-5 transition-transform ${activeSection === "password" ? "transform rotate-180" : ""}`}
          />
        </button>

        {activeSection === "password" && (
          <div className="space-y-6 mt-4 pt-4 border-t border-white/10">
            {isGoogleUser && !hasPassword && (
              <Alert className="mb-4 bg-blue-900/20 border-blue-800 text-white">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You signed up with Google. Please set a password to enable all account features.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Only show current password field if user already has a password */}
              {(!isGoogleUser || hasPassword) && (
                <div className="space-y-2">
                  <Label htmlFor="old-password">Current Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                    <Input
                      id="old-password"
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="bg-white/10 border-white/20 text-white pl-10 placeholder:text-gray-400"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="bg-white/10 border-white/20 text-white pl-10 placeholder:text-gray-400"
                    required
                  />
                </div>
                <p className="text-xs text-white/50">Password must be at least 8 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="bg-white/10 border-white/20 text-white pl-10 placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
                    {isGoogleUser && !hasPassword ? "Setting Password..." : "Updating Password..."}
                  </div>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isGoogleUser && !hasPassword ? "Set Password" : "Update Password"}
                  </>
                )}
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Security Questions Section */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <button onClick={() => toggleSection("security")} className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <HelpCircle className="h-5 w-5 text-blue-400 mr-2" />
            <h2 className="text-xl font-semibold">
              {hasSecurityQuestionsSet ? "Update Security Questions" : "Set Security Questions"}
            </h2>
          </div>
          <ChevronDown
            className={`h-5 w-5 transition-transform ${activeSection === "security" ? "transform rotate-180" : ""}`}
          />
        </button>

        {activeSection === "security" && (
          <div className="space-y-6 mt-4 pt-4 border-t border-white/10">
            {isGoogleUser && !hasPassword && (
              <Alert className="mb-4 bg-yellow-900/20 border-yellow-800 text-white">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You need to set a password before you can set up security questions. Please go to the Password section
                  first.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSecurityQuestionsUpdate} className="space-y-5">
              {/* Password verification */}
              {hasPassword && (
                <div className="space-y-2">
                  <Label htmlFor="security-password">Enter Your Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                    <Input
                      id="security-password"
                      type="password"
                      value={securityPassword}
                      onChange={(e) => setSecurityPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="bg-white/10 border-white/20 text-white pl-10 placeholder:text-gray-400"
                      required
                      disabled={isGoogleUser && !hasPassword}
                    />
                  </div>
                </div>
              )}

              {/* Primary Security Question */}
              <div className="space-y-2">
                <Label htmlFor="primary-question">Primary Security Question</Label>
                <div className="relative">
                  <select
                    id="primary-question"
                    value={primaryQuestionId || ""}
                    onChange={(e) => setPrimaryQuestionId(Number(e.target.value))}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 appearance-none pl-10"
                    required
                    disabled={isGoogleUser && !hasPassword}
                  >
                    <option value="">Select a security question</option>
                    {securityQuestions.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.question}
                      </option>
                    ))}
                  </select>
                  <HelpCircle className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-white/50" />
                </div>
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
                  disabled={isGoogleUser && !hasPassword}
                />
              </div>

              {/* Secondary Security Question */}
              <div className="space-y-2">
                <Label htmlFor="secondary-question">Secondary Security Question</Label>
                <div className="relative">
                  <select
                    id="secondary-question"
                    value={secondaryQuestionId || ""}
                    onChange={(e) => setSecondaryQuestionId(Number(e.target.value))}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 appearance-none pl-10"
                    required
                    disabled={isGoogleUser && !hasPassword}
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
                  <HelpCircle className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-white/50" />
                </div>
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
                  disabled={isGoogleUser && !hasPassword}
                />
              </div>

              {/* Custom Security Question */}
              <div className="space-y-2">
                <Label htmlFor="custom-question">Custom Security Question</Label>
                <Input
                  id="custom-question"
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="Create your own security question"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  required
                  disabled={isGoogleUser && !hasPassword}
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
                  disabled={isGoogleUser && !hasPassword}
                />
              </div>

              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={loading || (isGoogleUser && !hasPassword)}
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
                    Updating Security Questions...
                  </div>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {hasSecurityQuestionsSet ? "Update Security Questions" : "Save Security Questions"}
                  </>
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
