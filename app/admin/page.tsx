"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  Gamepad2,
  AlertCircle,
  LogIn,
  Users,
  Settings,
  LogOut,
  User,
  Trash2,
  Edit,
  Save,
  X,
  BarChart3,
  Activity,
  Clock,
  Bell,
  AlertTriangle,
  CheckCircle,
  Info,
  MessageSquare,
  RefreshCw,
  Search,
  UserPlus,
  Zap,
} from "lucide-react"
import {
  adminLogin,
  adminLogout,
  isAdmin,
  ADMIN_USERNAME,
  getAllUsers,
  updateUserProfile,
  getSiteStatistics,
  getRecentActivity,
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
  toggleAnnouncementStatus,
  getMaintenanceMode,
  updateToolStatus,
} from "@/lib/auth"
import { Progress } from "@/components/ui/progress"

export default function AdminPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [toolStatus, setToolStatus] = useState<Record<string, "online" | "offline">>({
    "like-sender": "online",
    "player-info": "online",
    "ban-checker": "online",
    "profile-visit": "offline",
    "jwt-generator": "offline",
    "guest-combiner": "online",
  })
  const [statistics, setStatistics] = useState<any>({
    userCount: 0,
    totalVisits: 0,
    toolUsage: {},
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    type: "info" as "info" | "warning" | "success" | "error",
  })
  const [maintenanceMode, setMaintenanceMode] = useState({
    enabled: false,
    message: "The site is currently under maintenance. Please check back later.",
  })

  const router = useRouter()

  // Check if admin is already logged in
  useEffect(() => {
    const adminAuthenticated = isAdmin()
    setAuthenticated(adminAuthenticated)

    // If authenticated, load data
    if (adminAuthenticated) {
      fetchUsers()
      fetchStatistics()
      fetchRecentActivity()
      fetchAnnouncements()
      fetchMaintenanceMode()

      // Load tool status from localStorage if available
      const savedToolStatus = localStorage.getItem("tool_status")
      if (savedToolStatus) {
        try {
          setToolStatus(JSON.parse(savedToolStatus))
        } catch (error) {
          console.error("Error parsing tool status:", error)
        }
      }
    }
  }, [])

  // Fetch all users
  const fetchUsers = async () => {
    if (!isAdmin()) return

    setLoadingUsers(true)
    try {
      const usersData = await getAllUsers()
      setUsers(usersData)
      setFilteredUsers(usersData)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoadingUsers(false)
    }
  }

  // Fetch site statistics
  const fetchStatistics = async () => {
    if (!isAdmin()) return

    try {
      const stats = await getSiteStatistics()
      setStatistics(stats)
    } catch (error) {
      console.error("Error fetching statistics:", error)
    }
  }

  // Fetch recent activity
  const fetchRecentActivity = async () => {
    if (!isAdmin()) return

    try {
      const activity = await getRecentActivity()
      setRecentActivity(activity)
    } catch (error) {
      console.error("Error fetching recent activity:", error)
    }
  }

  // Fetch announcements
  const fetchAnnouncements = () => {
    if (!isAdmin()) return

    try {
      const announcements = getAnnouncements()
      setAnnouncements(announcements)
    } catch (error) {
      console.error("Error fetching announcements:", error)
    }
  }

  // Fetch maintenance mode
  const fetchMaintenanceMode = () => {
    if (!isAdmin()) return

    try {
      const maintenance = getMaintenanceMode()
      setMaintenanceMode(maintenance)
    } catch (error) {
      console.error("Error fetching maintenance mode:", error)
    }
  }

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredUsers(filtered)
    }
  }, [searchTerm, users])

  // Handle admin login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const success = adminLogin(username, password)
      if (success) {
        setAuthenticated(true)
        fetchUsers()
        fetchStatistics()
        fetchRecentActivity()
        fetchAnnouncements()
        fetchMaintenanceMode()
      } else {
        setError("Invalid admin credentials")
      }
    } catch (error) {
      console.error("Admin login error:", error)
      setError("An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  // Handle admin logout
  const handleLogout = () => {
    adminLogout()
    setAuthenticated(false)
    router.push("/")
  }

  // Start editing a user
  const startEditUser = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      setEditForm({
        username: user.username,
        email: user.email,
      })
      setEditingUser(userId)
    }
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingUser(null)
    setEditForm({})
  }

  // Save user edits
  const saveUserEdit = async (userId: string) => {
    if (!editForm.username || !editForm.email) {
      return
    }

    setLoading(true)
    try {
      await updateUserProfile(userId, {
        username: editForm.username,
        email: editForm.email,
      })

      // Update local users list
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, username: editForm.username, email: editForm.email } : user,
        ),
      )

      setEditingUser(null)
    } catch (error) {
      console.error("Error updating user:", error)
    } finally {
      setLoading(false)
    }
  }

  // Delete user
  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    setLoading(true)
    try {
      // Call API to delete user
      const response = await fetch(`/api/admin/delete-user?id=${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete user")
      }

      // Update local users list
      setUsers(users.filter((user) => user.id !== userId))
      setFilteredUsers(filteredUsers.filter((user) => user.id !== userId))
    } catch (error) {
      console.error("Error deleting user:", error)
    } finally {
      setLoading(false)
    }
  }

  // Toggle tool status
  const toggleToolStatus = useCallback(
    (toolId: string) => {
      const newStatus = toolStatus[toolId] === "online" ? "offline" : "online"
      const updatedStatus = { ...toolStatus, [toolId]: newStatus }
      setToolStatus(updatedStatus)

      // Update tool status in localStorage and broadcast to other tabs
      updateToolStatus(toolId, newStatus)
    },
    [toolStatus],
  )

  // Handle creating a new announcement
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newAnnouncement.title || !newAnnouncement.content) {
      return
    }

    try {
      const announcement = createAnnouncement(newAnnouncement.title, newAnnouncement.content, newAnnouncement.type)

      setAnnouncements([announcement, ...announcements])
      setNewAnnouncement({
        title: "",
        content: "",
        type: "info",
      })
    } catch (error) {
      console.error("Error creating announcement:", error)
    }
  }

  // Handle deleting an announcement
  const handleDeleteAnnouncement = (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) {
      return
    }

    try {
      deleteAnnouncement(id)
      setAnnouncements(announcements.filter((a) => a.id !== id))
    } catch (error) {
      console.error("Error deleting announcement:", error)
    }
  }

  // Handle toggling announcement status
  const handleToggleAnnouncementStatus = (id: string) => {
    try {
      toggleAnnouncementStatus(id)
      setAnnouncements(announcements.map((a) => (a.id === id ? { ...a, active: !a.active } : a)))
    } catch (error) {
      console.error("Error toggling announcement status:", error)
    }
  }

  // Handle toggling maintenance mode
  const handleToggleMaintenanceMode = () => {
    try {
      const newState = !maintenanceMode.enabled
      setMaintenanceMode({
        ...maintenanceMode,
        enabled: newState,
      })
      setMaintenanceMode(newState, maintenanceMode.message)
    } catch (error) {
      console.error("Error toggling maintenance mode:", error)
    }
  }

  // Handle updating maintenance message
  const handleUpdateMaintenanceMessage = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setMaintenanceMode(maintenanceMode.enabled, maintenanceMode.message)
    } catch (error) {
      console.error("Error updating maintenance message:", error)
    }
  }

  // If not authenticated, show login form
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-950 via-navy-900 to-black text-white flex flex-col">
        <header className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Gamepad2 className="h-6 w-6 text-blue-400 mr-2" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Exe Toolz Admin
              </h1>
            </div>
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
                <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
                <CardDescription className="text-white/70">
                  Enter your admin credentials to access the admin panel
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert className="mb-4 bg-red-900/20 border-red-800 text-white">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Admin Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter admin username"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Admin Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter admin password"
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
                        Logging in...
                      </div>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                      </>
                    )}
                  </Button>
                </form>
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

  // Admin dashboard
  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-950 via-navy-900 to-black text-white flex flex-col">
      <header className="container mx-auto px-4 py-6 border-b border-white/10">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Gamepad2 className="h-6 w-6 text-blue-400 mr-2" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Exe Toolz Admin Panel
            </h1>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-white/10">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Welcome, {ADMIN_USERNAME}</h2>
          <p className="text-white/70">Manage your application from this admin dashboard</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white/10 border border-white/20 flex flex-wrap">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-900/50">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-blue-900/50">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="tools" className="data-[state=active]:bg-blue-900/50">
              <Settings className="h-4 w-4 mr-2" />
              Tools
            </TabsTrigger>
            <TabsTrigger value="announcements" className="data-[state=active]:bg-blue-900/50">
              <Bell className="h-4 w-4 mr-2" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="data-[state=active]:bg-blue-900/50">
              <Zap className="h-4 w-4 mr-2" />
              Maintenance
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6 space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-400 mr-3" />
                    <div className="text-3xl font-bold">{statistics.userCount}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Total Visits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Activity className="h-8 w-8 text-green-400 mr-3" />
                    <div className="text-3xl font-bold">{statistics.totalVisits.toLocaleString()}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Active Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Settings className="h-8 w-8 text-purple-400 mr-3" />
                    <div className="text-3xl font-bold">
                      {Object.values(toolStatus).filter((status) => status === "online").length} /{" "}
                      {Object.keys(toolStatus).length}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tool Usage Chart */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Tool Usage Statistics</CardTitle>
                <CardDescription className="text-white/70">
                  Overview of how frequently each tool is being used
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(statistics.toolUsage || {}).map(([tool, count]) => (
                    <div key={tool} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium capitalize">{tool.replace(/-/g, " ")}</span>
                        <span className="text-sm text-white/70">{count} uses</span>
                      </div>
                      <Progress
                        value={
                          ((count as number) / Math.max(...(Object.values(statistics.toolUsage || {}) as number[]))) *
                          100
                        }
                        className="h-2 bg-white/10"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
                <CardDescription className="text-white/70">Latest actions performed by users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-md bg-white/5">
                      <Clock className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{activity.username}</span>
                          <span className="text-xs text-white/50">{new Date(activity.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-white/70 mt-1">{activity.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t border-white/10 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-white/20 hover:bg-white/10"
                  onClick={fetchRecentActivity}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Activity
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Users Management</CardTitle>
                <CardDescription className="text-white/70">View and manage all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Refresh */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
                    <Input
                      placeholder="Search users by username or email"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <Button variant="outline" className="border-white/20 hover:bg-white/10" onClick={fetchUsers}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                {loadingUsers ? (
                  <div className="flex justify-center py-8">
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
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="px-4 py-3 text-left text-sm font-medium text-white/70">Username</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-white/70">Email</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-white/70">Created At</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-white/70">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-6 text-center text-white/50">
                              {searchTerm ? "No users found matching your search" : "No users found"}
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((user) => (
                            <tr key={user.id} className="border-b border-white/10 hover:bg-white/5">
                              <td className="px-4 py-3">
                                {editingUser === user.id ? (
                                  <Input
                                    value={editForm.username}
                                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                    className="bg-white/10 border-white/20 text-white h-8 py-1"
                                  />
                                ) : (
                                  <div className="flex items-center">
                                    <User className="h-4 w-4 mr-2 text-blue-400" />
                                    {user.username}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {editingUser === user.id ? (
                                  <Input
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="bg-white/10 border-white/20 text-white h-8 py-1"
                                  />
                                ) : (
                                  user.email
                                )}
                              </td>
                              <td className="px-4 py-3 text-white/70">
                                {new Date(user.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {editingUser === user.id ? (
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={cancelEdit}
                                      className="h-8 px-2 text-white/70 hover:text-white hover:bg-white/10"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => saveUserEdit(user.id)}
                                      className="h-8 px-2 bg-green-600/30 hover:bg-green-600/50 text-white"
                                    >
                                      <Save className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => startEditUser(user.id)}
                                      className="h-8 px-2 text-white/70 hover:text-white hover:bg-white/10"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => deleteUser(user.id)}
                                      className="h-8 px-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t border-white/10 pt-4 flex justify-between">
                <div className="text-sm text-white/70">
                  Total Users: <span className="font-medium text-white">{users.length}</span>
                </div>
                <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Tools Status Tab */}
          <TabsContent value="tools" className="mt-6">
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Tools Status Management</CardTitle>
                <CardDescription className="text-white/70">Update the status indicators for each tool</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(toolStatus).map(([toolId, status]) => (
                      <div
                        key={toolId}
                        className="flex items-center justify-between p-4 bg-white/10 rounded-lg border border-white/20"
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-3 ${
                              status === "online" ? "bg-green-500" : "bg-red-500"
                            }`}
                          ></div>
                          <span className="font-medium capitalize">{toolId.replace(/-/g, " ")}</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => toggleToolStatus(toolId)}
                          className={`${
                            status === "online"
                              ? "bg-green-600/30 hover:bg-green-600/50"
                              : "bg-red-600/30 hover:bg-red-600/50"
                          }`}
                        >
                          {status === "online" ? "Set Offline" : "Set Online"}
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-900/30">
                    <h3 className="text-lg font-medium mb-2">About Tool Status</h3>
                    <p className="text-white/70 text-sm">
                      The status indicators are shown in the sidebar next to each tool. Setting a tool to "offline" will
                      display a red dot, while "online" will show a green dot. This helps users know which tools are
                      currently available.
                    </p>
                    <p className="text-white/70 text-sm mt-2">
                      Status changes are immediately visible to all users across all devices and browser tabs.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="mt-6 space-y-6">
            {/* Create New Announcement */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Create Announcement</CardTitle>
                <CardDescription className="text-white/70">
                  Create system-wide announcements that will be displayed to all users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="announcement-title">Announcement Title</Label>
                    <Input
                      id="announcement-title"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                      placeholder="Enter announcement title"
                      className="bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="announcement-content">Announcement Content</Label>
                    <Textarea
                      id="announcement-content"
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                      placeholder="Enter announcement content"
                      className="bg-white/10 border-white/20 text-white min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Announcement Type</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className={`border-white/20 ${
                          newAnnouncement.type === "info" ? "bg-blue-900/50 border-blue-500" : "hover:bg-white/10"
                        }`}
                        onClick={() => setNewAnnouncement({ ...newAnnouncement, type: "info" })}
                      >
                        <Info className="h-4 w-4 mr-2 text-blue-400" />
                        Info
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className={`border-white/20 ${
                          newAnnouncement.type === "warning"
                            ? "bg-orange-900/50 border-orange-500"
                            : "hover:bg-white/10"
                        }`}
                        onClick={() => setNewAnnouncement({ ...newAnnouncement, type: "warning" })}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2 text-orange-400" />
                        Warning
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className={`border-white/20 ${
                          newAnnouncement.type === "success" ? "bg-green-900/50 border-green-500" : "hover:bg-white/10"
                        }`}
                        onClick={() => setNewAnnouncement({ ...newAnnouncement, type: "success" })}
                      >
                        <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                        Success
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className={`border-white/20 ${
                          newAnnouncement.type === "error" ? "bg-red-900/50 border-red-500" : "hover:bg-white/10"
                        }`}
                        onClick={() => setNewAnnouncement({ ...newAnnouncement, type: "error" })}
                      >
                        <AlertCircle className="h-4 w-4 mr-2 text-red-400" />
                        Error
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Create Announcement
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Manage Announcements */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Manage Announcements</CardTitle>
                <CardDescription className="text-white/70">
                  View, edit, and delete existing announcements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {announcements.length === 0 ? (
                  <div className="text-center py-8 text-white/50">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No announcements have been created yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div
                        key={announcement.id}
                        className={`p-4 rounded-lg border ${
                          announcement.type === "warning"
                            ? "bg-orange-900/20 border-orange-800/50"
                            : announcement.type === "error"
                              ? "bg-red-900/20 border-red-800/50"
                              : announcement.type === "success"
                                ? "bg-green-900/20 border-green-800/50"
                                : "bg-blue-900/20 border-blue-800/50"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{announcement.title}</h4>
                            <p className="text-sm text-white/70 mt-1">{announcement.content}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-white/50">
                              <span>Created: {new Date(announcement.timestamp).toLocaleString()}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full ${
                                  announcement.active ? "bg-green-900/50 text-green-300" : "bg-red-900/50 text-red-300"
                                }`}
                              >
                                {announcement.active ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
                              onClick={() => handleToggleAnnouncementStatus(announcement.id)}
                            >
                              {announcement.active ? <X className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              onClick={() => handleDeleteAnnouncement(announcement.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance Mode Tab */}
          <TabsContent value="maintenance" className="mt-6">
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Maintenance Mode</CardTitle>
                <CardDescription className="text-white/70">
                  Enable maintenance mode to notify users of scheduled downtime
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg border border-white/20">
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-3 ${
                          maintenanceMode.enabled ? "bg-yellow-500" : "bg-green-500"
                        }`}
                      ></div>
                      <div>
                        <span className="font-medium">Maintenance Mode</span>
                        <p className="text-sm text-white/70 mt-1">
                          {maintenanceMode.enabled
                            ? "Maintenance mode is currently active. Users will see a maintenance notification."
                            : "Maintenance mode is currently disabled."}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleToggleMaintenanceMode}
                      className={`${
                        maintenanceMode.enabled
                          ? "bg-green-600/30 hover:bg-green-600/50"
                          : "bg-yellow-600/30 hover:bg-yellow-600/50"
                      }`}
                    >
                      {maintenanceMode.enabled ? "Disable Maintenance Mode" : "Enable Maintenance Mode"}
                    </Button>
                  </div>

                  <form onSubmit={handleUpdateMaintenanceMessage} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="maintenance-message">Maintenance Message</Label>
                      <Textarea
                        id="maintenance-message"
                        value={maintenanceMode.message}
                        onChange={(e) => setMaintenanceMode({ ...maintenanceMode, message: e.target.value })}
                        placeholder="Enter maintenance message"
                        className="bg-white/10 border-white/20 text-white min-h-[100px]"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Update Maintenance Message
                    </Button>
                  </form>

                  <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-900/30">
                    <h3 className="text-lg font-medium mb-2">About Maintenance Mode</h3>
                    <p className="text-white/70 text-sm">
                      When maintenance mode is enabled, users will see a maintenance notification in the sidebar. This
                      is useful for scheduled maintenance or when you need to temporarily disable access to certain
                      features.
                    </p>
                    <p className="text-white/70 text-sm mt-2">
                      The maintenance message will be displayed to all users across all devices and browser tabs.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="container mx-auto px-4 py-6 border-t border-white/10 text-center text-white/50 text-sm">
        <p>© {new Date().getFullYear()} Exe Toolz Admin Panel. All rights reserved.</p>
      </footer>
    </div>
  )
}
