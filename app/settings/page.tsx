"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import SidebarButton from "@/components/sidebar-button"
import EnhancedSidebar from "@/components/enhanced-sidebar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

/*
SQL Tables Creation:

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  email_confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create security questions table
CREATE TABLE security_questions (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL
);

-- Insert default security questions
INSERT INTO security_questions (question) VALUES 
('What was the name of your first pet?'),
('In what city were you born?'),
('What is your mother''s maiden name?'),
('What high school did you attend?'),
('What was the make of your first car?'),
('What is your favorite movie?'),
('What is your favorite book?'),
('What is your favorite food?');

-- Create user security questions table
CREATE TABLE user_security_questions (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  primary_question_id INTEGER REFERENCES security_questions(id),
  primary_answer TEXT NOT NULL,
  secondary_question_id INTEGER REFERENCES security_questions(id),
  secondary_answer TEXT NOT NULL,
  custom_question TEXT NOT NULL,
  custom_answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"account" | "password" | "security">("account")
  const [activeSection, setActiveSection] = useState<"profile" | "security" | "preferences">("profile")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // If auth is still loading, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-950 via-navy-900 to-black text-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-white flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mb-2"></div>
            <div>Loading settings...</div>
          </div>
        </div>
      </div>
    )
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    router.push("/login")
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-950 via-navy-900 to-black text-white">
      {/* Sidebar Button */}
      <SidebarButton isOpen={sidebarOpen} onClick={toggleSidebar} />

      {/* Enhanced Sidebar */}
      <EnhancedSidebar />

      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Settings</h1>
            <Link href="/dashboard">
              <button className="flex items-center text-white/70 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </button>
            </Link>
          </div>
          <p className="text-white/70 mt-1">Manage your account settings</p>
        </div>

        <div className="bg-navy-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Account Settings</h2>
          <p className="text-white/70 mb-6">Manage your account preferences and security</p>

          {/* Tabs */}
          {/* <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setActiveTab("account")}
              className={`flex items-center px-4 py-2 rounded-md ${
                activeTab === "account"
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              <User className="h-4 w-4 mr-2" />
              Account
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`flex items-center px-4 py-2 rounded-md ${
                activeTab === "password"
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              <Lock className="h-4 w-4 mr-2" />
              Password
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center px-4 py-2 rounded-md ${
                activeTab === "security"
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              <ShieldQuestion className="h-4 w-4 mr-2" />
              Security Questions
            </button>
          </div> */}

          {/* Account Tab Content */}
          {/* {activeTab === "account" && (
            <div className="bg-navy-800/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-6">Account Information</h3>

              {/* Username Field */}
          {/* <div className="mb-6">
                <label className="block text-white/70 mb-2">Username</label>
                <input
                  type="text"
                  className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-2 text-white"
                  placeholder="RahulExe"
                  disabled
                />
                <p className="text-white/50 text-sm mt-1">Username cannot be changed</p>
              </div>

              {/* Email Field */}
          {/* <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">Change Email Address</h4>
                <label className="block text-white/70 mb-2">Current Email</label>
                <input
                  type="email"
                  className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-2 text-white mb-4"
                  placeholder="bodruddoja4@gmail.com"
                  disabled
                />

                <label className="block text-white/70 mb-2">New Email</label>
                <input
                  type="email"
                  className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-2 text-white mb-4"
                  placeholder="Enter new email address"
                />

                <label className="block text-white/70 mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-2 text-white mb-4"
                  placeholder="Enter your current password"
                />

                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">Update Email</button>
              </div>

              {/* Email Verification */}
          {/* <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">Email Verification</h4>
                <div className="flex items-center justify-between bg-yellow-900/30 border border-yellow-800/50 rounded-md p-4">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-yellow-500 mr-3" />
                    <div>
                      <p className="text-white">Your email is not verified</p>
                      <p className="text-white/70 text-sm">Verify your email to enhance account security</p>
                    </div>
                  </div>
                  <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-md text-sm">
                    Send Verification
                  </button>
                </div>
              </div>

              {/* Delete Account */}
          {/* <div>
                <h4 className="text-lg font-semibold mb-4">Delete Account</h4>
                <div className="bg-red-900/30 border border-red-800/50 rounded-md p-4">
                  <p className="text-white mb-3">
                    Deleting your account will permanently remove all your data. This action cannot be undone.
                  </p>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )} */}

          {/* Password Tab Content */}
          {/* {activeTab === "password" && (
            <div className="bg-navy-800/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-6">Change Password</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 mb-2">Current Password</label>
                  <input
                    type="password"
                    className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-2 text-white"
                    placeholder="Enter your current password"
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-2">New Password</label>
                  <input
                    type="password"
                    className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-2 text-white"
                    placeholder="Enter new password"
                  />
                  <p className="text-white/50 text-sm mt-1">Password must be at least 8 characters</p>
                </div>

                <div>
                  <label className="block text-white/70 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-2 text-white"
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="pt-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )} */}

          {/* Security Questions Tab Content */}
          {/* {activeTab === "security" && (
            <div className="bg-navy-800/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-6">Security Questions</h3>
              <p className="text-white/70 mb-4">
                Security questions help you recover your account if you forget your password.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-white/70 mb-2">Primary Security Question</label>
                  <select className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-2 text-white">
                    <option>What was the name of your first pet?</option>
                    <option>In what city were you born?</option>
                    <option>What is your mother's maiden name?</option>
                    <option>What high school did you attend?</option>
                    <option>What was the make of your first car?</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 mb-2">Your Answer</label>
                  <input
                    type="text"
                    className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-2 text-white"
                    placeholder="Enter your answer"
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-2">Secondary Security Question</label>
                  <select className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-2 text-white">
                    <option>What is your favorite movie?</option>
                    <option>What is your favorite book?</option>
                    <option>What is your favorite food?</option>
                    <option>What was your childhood nickname?</option>
                    <option>What was your first job?</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 mb-2">Your Answer</label>
                  <input
                    type="text"
                    className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-2 text-white"
                    placeholder="Enter your answer"
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-2">Custom Security Question</label>
                  <input
                    type="text"
                    className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-2 text-white"
                    placeholder="Enter your custom question"
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-2">Your Answer</label>
                  <input
                    type="text"
                    className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-2 text-white"
                    placeholder="Enter your answer"
                  />
                </div>

                <div className="pt-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                    Update Security Questions
                  </button>
                </div>
              </div>
            </div>
          )} */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/70">Update your personal information and profile settings</p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white"
                  onClick={() => setActiveSection("profile")}
                >
                  Manage Profile
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/70">Manage your password and security questions</p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white"
                  onClick={() => setActiveSection("security")}
                >
                  Manage Security
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/70">Customize your app experience and notification settings</p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white"
                  onClick={() => setActiveSection("preferences")}
                >
                  Manage Preferences
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
