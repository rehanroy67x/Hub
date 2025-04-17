"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertCircle,
  Search,
  Globe,
  Calendar,
  Heart,
  BookOpen,
  Trophy,
  Clock,
  Shield,
  Award,
  Gamepad2,
  Languages,
  Zap,
} from "lucide-react"
import DashboardLayout from "@/components/ui/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Update the PlayerInfo interface to include image URLs
interface PlayerInfo {
  basic_info: {
    name: string
    id: string
    likes?: number
    level?: number
    server?: string
    bio?: string
    booyah_pass_level?: number
    account_created?: string
    language?: string
    preferred_mode?: string
    credit_score?: number
    rank?: {
      br?: {
        current?: number
        max_rank?: number
        show?: boolean
      }
      cs?: {
        current?: number
        max_rank?: number
        show?: boolean
      }
    }
    last_login?: string
    equipped_weapon?: number[]
    title?: number
    avatar_id?: number
    banner_id?: number
    badge_id?: number
    badge_count?: number
    season_id?: number
    release_version?: string
    account_type?: number
    exp?: number
  }
  animal?: {
    name?: string
    id?: number
    level?: number
    exp?: number
    is_selected?: boolean
    skin_id?: number
    selected_skill_id?: number
  } | null
  Guild?: {
    name: string
    id: string
    level?: number
    members_count?: number
    capacity?: number
    leader?: {
      id?: string
      name?: string
      level?: number
    }
  } | null
  outfit?: number[]
  skills?: number[]
}

// Replace the result card header with the new design that matches the screenshot
// and update the content to show images instead of IDs
export default function PlayerInfo() {
  const [playerId, setPlayerId] = useState("")
  const [region, setRegion] = useState("ind")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PlayerInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("basic")
  const [leaderInfo, setLeaderInfo] = useState<{
    name: string
    id: string
    avatar_id?: number
    banner_id?: number
  } | null>(null)
  const [loadingLeader, setLoadingLeader] = useState(false)

  // Memoized utility functions
  const cleanTextEncoding = useCallback((text: string): string => {
    if (!text) return "Unknown"
    return text
      .replace(/[\u{0000}-\u{001F}\u{007F}-\u{009F}\u{FFFD}]/gu, "")
      .replace(/\//g, "")
      .trim()
  }, [])

  const formatDate = useCallback((dateString: string | undefined): string => {
    if (!dateString) return "Unknown"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (e) {
      return dateString
    }
  }, [])

  // Function to get image URL from the API
  const getImageUrl = useCallback((id: number | undefined): string => {
    if (!id) return "/placeholder.svg?height=64&width=64"
    return `https://thachmora.site/freefire/api.php?id=${id}`
  }, [])

  // Fetch guild leader info
  const fetchLeaderInfo = useCallback(
    async (leaderId: string | undefined) => {
      if (!leaderId) return

      setLoadingLeader(true)
      try {
        const response = await fetch(`/api/player-info?id=${leaderId}&region=${region}`)
        const data = await response.json()

        if (response.ok && data.data && data.data.basic_info) {
          setLeaderInfo({
            name: cleanTextEncoding(data.data.basic_info.name || "Unknown Leader"),
            id: leaderId,
            avatar_id: data.data.basic_info.avatar_id,
            banner_id: data.data.basic_info.banner_id,
          })
        }
      } catch (err) {
        console.error("Error fetching leader info:", err)
      } finally {
        setLoadingLeader(false)
      }
    },
    [region, cleanTextEncoding],
  )

  // Fetch player info with optimized performance
  const fetchPlayerInfo = useCallback(async () => {
    if (!playerId) {
      setError("Please enter a player ID")
      return
    }

    setLoading(true)
    setError(null)
    setLeaderInfo(null)

    try {
      const response = await fetch(`/api/player-info?id=${playerId}&region=${region}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch player information")
      }

      // Handle case where data might be incomplete
      if (!data.data || !data.data.basic_info) {
        throw new Error("Incomplete player data received")
      }

      // Clean up any potential encoding issues in the response data
      if (data.data.basic_info) {
        if (data.data.basic_info.name) {
          data.data.basic_info.name = cleanTextEncoding(data.data.basic_info.name)
        }
        if (data.data.basic_info.bio) {
          data.data.basic_info.bio = cleanTextEncoding(data.data.basic_info.bio)
        }
      }

      if (data.data.Guild) {
        if (data.data.Guild.name) {
          data.data.Guild.name = cleanTextEncoding(data.data.Guild.name)
        }
        if (data.data.Guild.leader?.name) {
          data.data.Guild.leader.name = cleanTextEncoding(data.data.Guild.leader.name)
        }

        // Fetch guild leader info if available
        if (data.data.Guild.leader?.id && data.data.Guild.leader.id !== playerId) {
          fetchLeaderInfo(data.data.Guild.leader.id)
        }
      }

      if (data.data.animal?.name) {
        data.data.animal.name = cleanTextEncoding(data.data.animal.name)
      }

      setResult(data.data)
    } catch (err: any) {
      console.error("Error fetching player info:", err)
      setError(err.message || "An error occurred while fetching player information")
      setResult(null)
    } finally {
      setLoading(false)
    }
  }, [playerId, region, cleanTextEncoding, fetchLeaderInfo])

  // Tab indicator animation variants
  const tabIndicatorVariants = {
    hidden: { width: 0, opacity: 0 },
    visible: { width: "100%", opacity: 1, transition: { duration: 0.3 } },
  }

  // Content animation variants
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  }

  // Update the region dropdown to include the specified regions
  const regionOptions = [
    { value: "ind", label: "India (IND)" },
    { value: "bd", label: "Bangladesh (BD)" },
    { value: "pk", label: "Pakistan (PK)" },
    { value: "sg", label: "Singapore (SG)" },
    { value: "id", label: "Indonesia (ID)" },
    { value: "br", label: "Brazil (BR)" },
    { value: "th", label: "Thailand (TH)" },
    { value: "vn", label: "Vietnam (VN)" },
    { value: "tw", label: "Taiwan (TW)" },
  ]

  return (
    <DashboardLayout title="Player Info" description="Get detailed information about a Free Fire player">
      <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-xl max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">Player Information</CardTitle>
          <CardDescription className="text-gray-200">
            Enter a player ID and select a region to get detailed information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 space-y-2">
              <Label htmlFor="player-id" className="text-white">
                Player ID
              </Label>
              <div className="relative">
                <Input
                  id="player-id"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  placeholder="Enter player ID"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search size={18} />
                </div>
              </div>
            </div>

            {/* Replace the existing region dropdown with this updated version */}
            <div className="space-y-2">
              <Label htmlFor="region" className="text-white">
                Region
              </Label>
              <select
                id="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full h-10 rounded-md border border-white/20 bg-white/10 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {regionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={fetchPlayerInfo}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white border-none"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
                    className="mr-2"
                  >
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                  </motion.div>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Get Player Info
                  </>
                )}
              </Button>
            </motion.div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant="destructive" className="border-red-800 bg-red-900/50 text-white">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Card className="bg-blue-900/30 border-blue-700/50 text-white overflow-hidden">
                  {/* New player header design that matches the screenshot */}
                  <div className="relative overflow-hidden">
                    {/* Player header with avatar and banner side by side */}
                    <div className="flex w-full h-16 relative">
                      {/* Avatar on the left - reduced size */}
                      <div className="w-16 h-16 min-w-16 relative overflow-hidden">
                        <img
                          src={getImageUrl(result.basic_info.avatar_id) || "/placeholder.svg"}
                          alt="Player Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Banner on the right - reduced height to show fully */}
                      <div className="flex-1 h-16 relative overflow-hidden">
                        <img
                          src={getImageUrl(result.basic_info.banner_id) || "/placeholder.svg"}
                          alt="Player Banner"
                          className="w-full h-full object-cover"
                        />

                        {/* Overlay gradient for better text visibility */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>

                        {/* Player info overlay */}
                        <div className="absolute left-3 top-2 text-white">
                          <h2 className="text-xl font-bold text-white drop-shadow-md">
                            {result.basic_info.name || "Unknown Player"}
                          </h2>
                          {result.Guild && <p className="text-sm text-white/90 drop-shadow-md">{result.Guild.name}</p>}
                        </div>

                        {/* Level badge on the right */}
                        <div className="absolute right-3 top-3">
                          <div className="bg-purple-600/70 px-2 py-1 rounded-md text-xs font-medium">
                            Level {result.basic_info.level || "?"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* UID and Server info below the avatar/banner */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-black/40">
                      <div className="text-sm text-white/90">
                        UID: <span className="font-medium">{result.basic_info.id}</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-white/40"></div>
                      <div className="text-sm text-white/90">
                        Server: <span className="font-medium">{result.basic_info.server || region.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="pt-4">
                    <Tabs defaultValue="basic" className="w-full" onValueChange={setActiveTab}>
                      <TabsList className="grid grid-cols-4 mb-4 bg-black/20 relative">
                        {/* Custom tab triggers with indicators */}
                        <TabsTrigger value="basic" className="relative z-10">
                          Basic Info
                          {activeTab === "basic" && (
                            <motion.div
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                              initial="hidden"
                              animate="visible"
                              variants={tabIndicatorVariants}
                            />
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="stats" className="relative z-10">
                          Stats
                          {activeTab === "stats" && (
                            <motion.div
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                              initial="hidden"
                              animate="visible"
                              variants={tabIndicatorVariants}
                            />
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="guild" disabled={!result.Guild} className="relative z-10">
                          Guild
                          {activeTab === "guild" && (
                            <motion.div
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                              initial="hidden"
                              animate="visible"
                              variants={tabIndicatorVariants}
                            />
                          )}
                        </TabsTrigger>
                        <TabsTrigger
                          value="other"
                          disabled={!result.animal && !result.outfit}
                          className="relative z-10"
                        >
                          Other
                          {activeTab === "other" && (
                            <motion.div
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                              initial="hidden"
                              animate="visible"
                              variants={tabIndicatorVariants}
                            />
                          )}
                        </TabsTrigger>
                      </TabsList>

                      <AnimatePresence mode="wait">
                        {activeTab === "basic" && (
                          <TabsContent value="basic" className="space-y-4">
                            <motion.div
                              key="basic-content"
                              variants={contentVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                              <div className="space-y-3">
                                {result.basic_info.account_created && (
                                  <motion.div
                                    className="flex items-center gap-2"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                  >
                                    <Calendar className="h-4 w-4 text-blue-300" />
                                    <span className="text-sm">
                                      Account Created:{" "}
                                      <span className="font-medium">
                                        {formatDate(result.basic_info.account_created)}
                                      </span>
                                    </span>
                                  </motion.div>
                                )}

                                {result.basic_info.last_login && (
                                  <motion.div
                                    className="flex items-center gap-2"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 }}
                                  >
                                    <Clock className="h-4 w-4 text-blue-300" />
                                    <span className="text-sm">
                                      Last Login:{" "}
                                      <span className="font-medium">{formatDate(result.basic_info.last_login)}</span>
                                    </span>
                                  </motion.div>
                                )}

                                {result.basic_info.likes !== undefined && (
                                  <motion.div
                                    className="flex items-center gap-2"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                  >
                                    <Heart className="h-4 w-4 text-blue-300" />
                                    <span className="text-sm">
                                      Likes: <span className="font-medium">{result.basic_info.likes}</span>
                                    </span>
                                  </motion.div>
                                )}

                                {result.basic_info.credit_score !== undefined && (
                                  <motion.div
                                    className="flex items-center gap-2"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.25 }}
                                  >
                                    <Shield className="h-4 w-4 text-blue-300" />
                                    <span className="text-sm">
                                      Credit Score:{" "}
                                      <span className="font-medium">{result.basic_info.credit_score}</span>
                                    </span>
                                  </motion.div>
                                )}

                                {result.basic_info.language && (
                                  <motion.div
                                    className="flex items-center gap-2"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                  >
                                    <Languages className="h-4 w-4 text-blue-300" />
                                    <span className="text-sm">
                                      Language: <span className="font-medium">{result.basic_info.language}</span>
                                    </span>
                                  </motion.div>
                                )}
                              </div>

                              <div className="space-y-3">
                                {result.basic_info.bio && (
                                  <motion.div
                                    className="flex items-start gap-2"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                  >
                                    <BookOpen className="h-4 w-4 text-blue-300 mt-1" />
                                    <span className="text-sm">
                                      Bio: <span className="font-medium">{result.basic_info.bio}</span>
                                    </span>
                                  </motion.div>
                                )}

                                {result.basic_info.server && (
                                  <motion.div
                                    className="flex items-center gap-2"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 }}
                                  >
                                    <Globe className="h-4 w-4 text-blue-300" />
                                    <span className="text-sm">
                                      Server: <span className="font-medium">{result.basic_info.server}</span>
                                    </span>
                                  </motion.div>
                                )}

                                {result.basic_info.preferred_mode && (
                                  <motion.div
                                    className="flex items-center gap-2"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                  >
                                    <Gamepad2 className="h-4 w-4 text-blue-300" />
                                    <span className="text-sm">
                                      Preferred Mode:{" "}
                                      <span className="font-medium">{result.basic_info.preferred_mode}</span>
                                    </span>
                                  </motion.div>
                                )}

                                {result.basic_info.release_version && (
                                  <motion.div
                                    className="flex items-center gap-2"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.25 }}
                                  >
                                    <Zap className="h-4 w-4 text-blue-300" />
                                    <span className="text-sm">
                                      Game Version:{" "}
                                      <span className="font-medium">{result.basic_info.release_version}</span>
                                    </span>
                                  </motion.div>
                                )}
                              </div>
                            </motion.div>
                          </TabsContent>
                        )}

                        {activeTab === "stats" && (
                          <TabsContent value="stats" className="space-y-4">
                            <motion.div
                              key="stats-content"
                              variants={contentVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {result.basic_info.rank?.br && (
                                  <motion.div
                                    className="bg-black/20 p-4 rounded-lg"
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    whileHover={{ scale: 1.02, backgroundColor: "rgba(0,0,0,0.25)" }}
                                  >
                                    <div className="flex items-center gap-2 mb-3">
                                      <Trophy className="h-5 w-5 text-yellow-400" />
                                      <span className="font-medium">Battle Royale Rank</span>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="text-sm">
                                        <span className="text-blue-200">Current Points:</span>{" "}
                                        <span className="font-medium">
                                          {result.basic_info.rank.br.current || "N/A"}
                                        </span>
                                      </div>
                                      <div className="text-sm">
                                        <span className="text-blue-200">Max Rank:</span>{" "}
                                        <span className="font-medium">
                                          {result.basic_info.rank.br.max_rank || "N/A"}
                                        </span>
                                      </div>
                                      <div className="text-sm">
                                        <span className="text-blue-200">Show Rank:</span>{" "}
                                        <span className="font-medium">
                                          {result.basic_info.rank.br.show ? "Yes" : "No"}
                                        </span>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}

                                {result.basic_info.rank?.cs && (
                                  <motion.div
                                    className="bg-black/20 p-4 rounded-lg"
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    whileHover={{ scale: 1.02, backgroundColor: "rgba(0,0,0,0.25)" }}
                                  >
                                    <div className="flex items-center gap-2 mb-3">
                                      <Award className="h-5 w-5 text-purple-400" />
                                      <span className="font-medium">Clash Squad Rank</span>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="text-sm">
                                        <span className="text-blue-200">Current Points:</span>{" "}
                                        <span className="font-medium">
                                          {result.basic_info.rank.cs.current || "N/A"}
                                        </span>
                                      </div>
                                      <div className="text-sm">
                                        <span className="text-blue-200">Max Rank:</span>{" "}
                                        <span className="font-medium">
                                          {result.basic_info.rank.cs.max_rank || "N/A"}
                                        </span>
                                      </div>
                                      <div className="text-sm">
                                        <span className="text-blue-200">Show Rank:</span>{" "}
                                        <span className="font-medium">
                                          {result.basic_info.rank.cs.show ? "Yes" : "No"}
                                        </span>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </div>

                              {/* Additional Stats */}
                              <motion.div
                                className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.4 }}
                              >
                                <motion.div
                                  className="bg-black/20 p-3 rounded-lg text-center"
                                  whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.3)" }}
                                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                  <div className="text-xs text-blue-200 mb-1">Season ID</div>
                                  <div className="font-medium">{result.basic_info.season_id || "N/A"}</div>
                                </motion.div>
                                <motion.div
                                  className="bg-black/20 p-3 rounded-lg text-center"
                                  whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.3)" }}
                                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                  <div className="text-xs text-blue-200 mb-1">Badge Count</div>
                                  <div className="font-medium">{result.basic_info.badge_count || "N/A"}</div>
                                </motion.div>
                                <motion.div
                                  className="bg-black/20 p-3 rounded-lg text-center"
                                  whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.3)" }}
                                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                  <div className="text-xs text-blue-200 mb-1">Badge ID</div>
                                  <div className="font-medium">{result.basic_info.badge_id || "N/A"}</div>
                                </motion.div>
                                <motion.div
                                  className="bg-black/20 p-3 rounded-lg text-center"
                                  whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.3)" }}
                                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                  <div className="text-xs text-blue-200 mb-1">Title ID</div>
                                  <div className="font-medium">{result.basic_info.title || "N/A"}</div>
                                </motion.div>
                              </motion.div>

                              {/* Experience and Account Type */}
                              <motion.div
                                className="mt-4 bg-black/20 p-4 rounded-lg"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.4 }}
                              >
                                <h3 className="text-lg font-medium mb-3">Additional Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="text-sm">
                                    <span className="text-blue-200">Account Type:</span>{" "}
                                    <span className="font-medium">
                                      {result.basic_info.account_type === 1
                                        ? "Regular Account"
                                        : `Type ${result.basic_info.account_type || "Unknown"}`}
                                    </span>
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-blue-200">Experience Points:</span>{" "}
                                    <span className="font-medium">{result.basic_info.exp || "N/A"}</span>
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-blue-200">Credit Score:</span>{" "}
                                    <span className="font-medium">{result.basic_info.credit_score || "N/A"}</span>
                                  </div>
                                </div>
                              </motion.div>
                            </motion.div>
                          </TabsContent>
                        )}

                        {activeTab === "guild" && result.Guild && (
                          <TabsContent value="guild" className="space-y-4">
                            <motion.div
                              key="guild-content"
                              variants={contentVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                            >
                              <div className="bg-black/20 p-4 rounded-lg">
                                <h3 className="text-xl font-medium mb-4 text-center">{result.Guild.name}</h3>

                                <div className="grid grid-cols-1 gap-4">
                                  {/* Guild Leader - Now first */}
                                  <motion.div
                                    className="bg-black/30 p-3 rounded-lg"
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                  >
                                    <div className="text-sm mb-2 text-blue-200">Guild Leader</div>
                                    {result.Guild.leader?.id === playerId ? (
                                      <div className="text-center font-medium">This Player (Owner)</div>
                                    ) : (
                                      <>
                                        {leaderInfo ? (
                                          <div className="flex items-center gap-3">
                                            {/* Leader Avatar - smaller size */}
                                            <div className="w-12 h-12 min-w-12 relative overflow-hidden rounded-md">
                                              <img
                                                src={
                                                  getImageUrl(leaderInfo.avatar_id) ||
                                                  "/placeholder.svg?height=48&width=48" ||
                                                  "/placeholder.svg"
                                                }
                                                alt="Leader Avatar"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                  e.currentTarget.src = "/placeholder.svg?height=48&width=48"
                                                }}
                                              />
                                            </div>

                                            {/* Leader info */}
                                            <div className="flex-1">
                                              <div className="text-white font-medium">{leaderInfo.name}</div>
                                              <div className="text-sm text-white/80">UID: {leaderInfo.id}</div>
                                              {result.Guild.leader?.level && (
                                                <div className="text-sm text-white/80">
                                                  Level: {result.Guild.leader.level}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="text-center">
                                            {loadingLeader ? (
                                              <div className="flex items-center justify-center gap-2">
                                                <motion.div
                                                  animate={{ rotate: 360 }}
                                                  transition={{
                                                    repeat: Number.POSITIVE_INFINITY,
                                                    duration: 1,
                                                    ease: "linear",
                                                  }}
                                                >
                                                  <svg
                                                    className="animate-spin h-5 w-5 text-blue-400"
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
                                                </motion.div>
                                                <span>Loading leader info...</span>
                                              </div>
                                            ) : (
                                              <div>
                                                <div className="font-medium">
                                                  UID: {result.Guild.leader?.id || "Unknown"}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </motion.div>

                                  {/* Guild UID - Now second */}
                                  <motion.div
                                    className="bg-black/30 p-3 rounded-lg"
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.15 }}
                                  >
                                    <div className="text-sm mb-1 text-blue-200">Guild UID</div>
                                    <div className="font-medium">{result.Guild.id || "N/A"}</div>
                                  </motion.div>

                                  {/* Guild Level - Now third */}
                                  <motion.div
                                    className="bg-black/30 p-3 rounded-lg"
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                  >
                                    <div className="text-sm mb-1 text-blue-200">Guild Level</div>
                                    <div className="font-medium">{result.Guild.level || "N/A"}</div>
                                  </motion.div>

                                  {/* Members - Now fourth */}
                                  <motion.div
                                    className="bg-black/30 p-3 rounded-lg"
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.25 }}
                                  >
                                    <div className="text-sm mb-1 text-blue-200">Members</div>
                                    <div className="font-medium">
                                      {result.Guild.members_count || "0"} / {result.Guild.capacity || "50"}
                                    </div>
                                  </motion.div>
                                </div>
                              </div>
                            </motion.div>
                          </TabsContent>
                        )}

                        {activeTab === "other" && (
                          <TabsContent value="other" className="space-y-4">
                            <motion.div
                              key="other-content"
                              variants={contentVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                            >
                              {/* Equipped Items - Now first */}
                              <motion.div
                                className="bg-black/20 p-4 rounded-lg mb-4"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                              >
                                <h3 className="text-lg font-medium mb-3">Equipped Items</h3>

                                {/* Outfit - Now first within Equipped Items */}
                                {result.outfit && result.outfit.length > 0 && (
                                  <div className="mb-4">
                                    <h4 className="text-md font-medium mb-2 text-blue-200">Outfit</h4>
                                    <div className="grid grid-cols-3 gap-3">
                                      {result.outfit.map((item, index) => (
                                        <div
                                          key={index}
                                          className="bg-black/30 p-2 rounded-lg flex flex-col items-center"
                                        >
                                          <img
                                            src={getImageUrl(item) || "/placeholder.svg"}
                                            alt={`Outfit ${item}`}
                                            className="w-16 h-16 object-contain mb-2"
                                          />
                                          <span className="text-xs text-center">ID: {item}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Weapons renamed to Items - Now second within Equipped Items */}
                                {result.basic_info.equipped_weapon && result.basic_info.equipped_weapon.length > 0 && (
                                  <div className="mb-4">
                                    <h4 className="text-md font-medium mb-2 text-blue-200">Items</h4>
                                    <div className="grid grid-cols-3 gap-3">
                                      {result.basic_info.equipped_weapon.map((weapon, index) => (
                                        <div
                                          key={index}
                                          className="bg-black/30 p-2 rounded-lg flex flex-col items-center"
                                        >
                                          <img
                                            src={getImageUrl(weapon) || "/placeholder.svg"}
                                            alt={`Item ${weapon}`}
                                            className="w-16 h-16 object-contain mb-2"
                                          />
                                          <span className="text-xs text-center">ID: {weapon}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </motion.div>

                              {/* Pet Information - Now second main section */}
                              {result.animal && (
                                <motion.div
                                  className="bg-black/20 p-4 rounded-lg mb-4"
                                  initial={{ y: 20, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  <h3 className="text-lg font-medium mb-3">Pet Information</h3>

                                  {/* Pet, Pet Skin, and Selected Skill in a single row */}
                                  <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="bg-black/30 p-3 rounded-lg">
                                      <div className="text-sm mb-1 text-blue-200">Pet</div>
                                      <div className="flex flex-col items-center">
                                        <img
                                          src={getImageUrl(result.animal.id) || "/placeholder.svg"}
                                          alt="Pet"
                                          className="w-16 h-16 object-contain mb-2"
                                        />
                                        <span className="text-xs font-medium">ID: {result.animal.id || "N/A"}</span>
                                      </div>
                                    </div>
                                    <div className="bg-black/30 p-3 rounded-lg">
                                      <div className="text-sm mb-1 text-blue-200">Pet Skin</div>
                                      <div className="flex flex-col items-center">
                                        <img
                                          src={getImageUrl(result.animal.skin_id) || "/placeholder.svg"}
                                          alt="Pet Skin"
                                          className="w-16 h-16 object-contain mb-2"
                                        />
                                        <span className="text-xs font-medium">
                                          ID: {result.animal.skin_id || "N/A"}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="bg-black/30 p-3 rounded-lg">
                                      <div className="text-sm mb-1 text-blue-200">Selected Skill</div>
                                      <div className="flex flex-col items-center">
                                        <img
                                          src={getImageUrl(result.animal.selected_skill_id) || "/placeholder.svg"}
                                          alt="Pet Skill"
                                          className="w-16 h-16 object-contain mb-2"
                                        />
                                        <span className="text-xs font-medium">
                                          ID: {result.animal.selected_skill_id || "N/A"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Keep Pet Level, Pet Experience, and Is Selected as they are */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="bg-black/30 p-3 rounded-lg">
                                      <div className="text-sm mb-1 text-blue-200">Pet Level</div>
                                      <div className="font-medium">{result.animal.level || "N/A"}</div>
                                    </div>
                                    <div className="bg-black/30 p-3 rounded-lg">
                                      <div className="text-sm mb-1 text-blue-200">Pet Experience</div>
                                      <div className="font-medium">{result.animal.exp || "N/A"}</div>
                                    </div>
                                    <div className="bg-black/30 p-3 rounded-lg">
                                      <div className="text-sm mb-1 text-blue-200">Is Selected</div>
                                      <div className="font-medium">{result.animal.is_selected ? "Yes" : "No"}</div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}

                              {/* Skills section has been removed as requested */}
                            </motion.div>
                          </TabsContent>
                        )}
                      </AnimatePresence>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
