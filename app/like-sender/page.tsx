"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Search, Heart, CheckCircle, User, ArrowUp, ArrowDown } from "lucide-react"
import DashboardLayout from "@/components/ui/dashboard-layout"

interface LikeResponse {
  LikesGivenByAPI: number
  LikesafterCommand: number
  LikesbeforeCommand: number
  PlayerNickname: string
  UID: number
  status: number
}

export default function LikeSender() {
  const [playerId, setPlayerId] = useState("")
  const [server, setServer] = useState("ind")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LikeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Server options
  const serverOptions = [
    { value: "ind", label: "India (IND)" },
    { value: "bd", label: "Bangladesh (BD)" },
    { value: "sg", label: "Singapore (SG)" },
  ]

  // Send likes to the player
  const sendLikes = useCallback(async () => {
    if (!playerId) {
      setError("Please enter a player ID")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    setResult(null)

    try {
      // Call our API route which will then call the external API
      const response = await fetch(`/api/like-sender?uid=${playerId}&server=${server}`)

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`)
      }

      const data = await response.json()

      if (data.status !== 1) {
        throw new Error(
          data.status === 2
            ? "You've already reached the maximum API likes for today. Please try again tomorrow."
            : "Failed to send likes. Please try again.",
        )
      }

      setResult(data)
      setSuccess(`Successfully sent ${data.LikesGivenByAPI} likes to ${data.PlayerNickname}!`)
    } catch (err: any) {
      console.error("Error sending likes:", err)
      setError(err.message || "An error occurred while sending likes")
    } finally {
      setLoading(false)
    }
  }, [playerId, server])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  return (
    <DashboardLayout title="Like Sender" description="Send likes to a Free Fire player profile">
      <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-xl max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-400" />
            Like Sender
          </CardTitle>
          <CardDescription className="text-gray-200">
            Enter a player ID and select a server to send likes to their profile
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

            <div className="space-y-2">
              <Label htmlFor="server" className="text-white">
                Server
              </Label>
              <select
                id="server"
                value={server}
                onChange={(e) => setServer(e.target.value)}
                className="w-full h-10 rounded-md border border-white/20 bg-white/10 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {serverOptions.map((option) => (
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
                onClick={sendLikes}
                disabled={loading}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white border-none"
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
                    <Heart className="mr-2 h-5 w-5" />
                    Send Likes
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

            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert className="border-green-800 bg-green-900/50 text-white">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {result && (
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mt-4">
                <Card className="bg-gradient-to-br from-pink-900/30 to-purple-900/30 border-pink-700/30 text-white overflow-hidden">
                  <CardHeader className="pb-2">
                    <motion.div variants={itemVariants} className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                          <User className="h-6 w-6 text-pink-400" />
                          {result.PlayerNickname}
                        </CardTitle>
                        <CardDescription className="text-white/80">UID: {result.UID}</CardDescription>
                      </div>
                      <motion.div
                        variants={itemVariants}
                        className="px-3 py-1 rounded-full text-sm font-medium bg-pink-600/40"
                      >
                        {server.toUpperCase()}
                      </motion.div>
                    </motion.div>
                  </CardHeader>

                  <CardContent className="pt-4">
                    <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
                      <div className="bg-pink-900/50 p-3 rounded-full">
                        <Heart className="h-6 w-6 text-pink-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{result.LikesGivenByAPI} Likes Sent</h3>
                        <p className="text-sm text-pink-300">Successfully sent likes to this player's profile</p>
                      </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.div
                        variants={itemVariants}
                        className="bg-black/20 p-4 rounded-lg flex items-center gap-3"
                      >
                        <div className="bg-blue-900/30 p-2 rounded-full">
                          <ArrowDown className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm text-blue-200">Likes Before</div>
                          <div className="text-xl font-bold">{result.LikesbeforeCommand.toLocaleString()}</div>
                        </div>
                      </motion.div>

                      <motion.div
                        variants={itemVariants}
                        className="bg-black/20 p-4 rounded-lg flex items-center gap-3"
                      >
                        <div className="bg-green-900/30 p-2 rounded-full">
                          <ArrowUp className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <div className="text-sm text-green-200">Likes After</div>
                          <div className="text-xl font-bold">{result.LikesafterCommand.toLocaleString()}</div>
                        </div>
                      </motion.div>
                    </div>
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
