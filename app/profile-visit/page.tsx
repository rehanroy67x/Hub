"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Search, User, CheckCircle, XCircle, Activity, BarChart3 } from "lucide-react"
import DashboardLayout from "@/components/ui/dashboard-layout"
import { Progress } from "@/components/ui/progress"

interface VisitStats {
  FailedVisits: number
  PlayerNickname: string
  SuccessfulVisits: number
  TotalVisits: number
  UID: number
}

export default function ProfileVisit() {
  const [playerId, setPlayerId] = useState("")
  const [region, setRegion] = useState("IND") // Default and only option is India
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VisitStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Currently only India server is supported by the API

  // Clean text encoding
  const cleanTextEncoding = useCallback((text: string): string => {
    if (!text) return "Unknown"
    return text
      .replace(/[\u{0000}-\u{001F}\u{007F}-\u{009F}\u{FFFD}]/gu, "")
      .replace(/\//g, "")
      .trim()
  }, [])

  // Fetch visit stats using our own API route
  const fetchVisitStats = useCallback(async () => {
    if (!playerId) {
      setError("Please enter a player ID")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Use our own API route instead of directly calling the external API
      const apiUrl = `/api/visit-stats?id=${playerId}&region=${region}`
      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(`API request failed with status code: ${response.status}`)
      }

      const responseData = await response.json()

      if (responseData.status === "error") {
        throw new Error(responseData.message || "Failed to fetch visit statistics")
      }

      const data = responseData.data

      // Clean nickname if present
      if (data.PlayerNickname) {
        data.PlayerNickname = cleanTextEncoding(data.PlayerNickname)
      }

      setResult(data)
    } catch (err: any) {
      console.error("Error fetching visit stats:", err)
      setError(err.message || "An error occurred while fetching visit statistics")
      setResult(null)
    } finally {
      setLoading(false)
    }
  }, [playerId, region, cleanTextEncoding])

  // Calculate success rate percentage
  const calculateSuccessRate = (successful: number, total: number) => {
    if (total === 0) return 0
    return Math.round((successful / total) * 100)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  const pulseVariants = {
    pulse: {
      scale: [1, 1.02, 1],
      transition: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
    },
  }

  return (
    <DashboardLayout title="Profile Visit" description="Send profile visits to boost your profile statistics">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-xl max-w-3xl mx-auto overflow-hidden">
          <CardHeader className="relative">
            <motion.div
              className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -z-10"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.2, 0.3],
              }}
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -z-10"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />

            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              Profile Visit Booster
            </CardTitle>
            <CardDescription className="text-gray-200">
              Send profile visits to boost your profile statistics
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
                <Label htmlFor="region" className="text-white">
                  Region
                </Label>
                <div className="relative">
                  <select
                    id="region"
                    value={region}
                    disabled
                    className="w-full h-10 rounded-md border border-white/20 bg-white/10 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-not-allowed"
                  >
                    <option value="IND">India (IND)</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <motion.div
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                      className="text-xs px-1.5 py-0.5 rounded-full bg-blue-600/70 text-white"
                    >
                      Only
                    </motion.div>
                  </div>
                </div>
                <p className="text-xs text-amber-300 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Currently only India server is supported. More servers coming soon!
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  onClick={fetchVisitStats}
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
                      <Activity className="mr-2 h-5 w-5" />
                      Boost Profile Visits
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
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="bg-gradient-to-br from-blue-900/40 to-blue-900/40 border-blue-700/30 text-white overflow-hidden">
                    <CardHeader className="pb-2">
                      <motion.div variants={itemVariants} className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-2xl font-bold">
                            {result.PlayerNickname || "Unknown Player"}
                          </CardTitle>
                          <CardDescription className="text-blue-200">UID: {result.UID}</CardDescription>
                        </div>
                        <motion.div
                          variants={pulseVariants}
                          animate="pulse"
                          className="bg-gradient-to-r from-blue-600/40 to-blue-600/40 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {region}
                        </motion.div>
                      </motion.div>
                    </CardHeader>

                    <CardContent className="pt-4">
                      <motion.div variants={itemVariants} className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-300" />
                            <span className="text-sm font-medium">Total Visits</span>
                          </div>
                          <span className="text-xl font-bold">{result.TotalVisits.toLocaleString()}</span>
                        </div>
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-1 bg-gradient-to-r from-blue-500 to-blue-500 rounded-full"
                        />
                      </motion.div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div variants={itemVariants} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-400" />
                              <span className="text-sm font-medium">Successful Visits</span>
                            </div>
                            <span className="font-bold">{result.SuccessfulVisits.toLocaleString()}</span>
                          </div>
                          <div className="relative pt-1">
                            <div className="flex items-center justify-between mb-1">
                              <div>
                                <span className="text-xs font-semibold inline-block text-green-300">
                                  {calculateSuccessRate(result.SuccessfulVisits, result.TotalVisits)}%
                                </span>
                              </div>
                            </div>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${calculateSuccessRate(result.SuccessfulVisits, result.TotalVisits)}%`,
                              }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="flex h-2 mb-4 overflow-hidden text-xs bg-black/30 rounded-full"
                            >
                              <div className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full" />
                            </motion.div>
                          </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-red-400" />
                              <span className="text-sm font-medium">Failed Visits</span>
                            </div>
                            <span className="font-bold">{result.FailedVisits.toLocaleString()}</span>
                          </div>
                          <div className="relative pt-1">
                            <div className="flex items-center justify-between mb-1">
                              <div>
                                <span className="text-xs font-semibold inline-block text-red-300">
                                  {calculateSuccessRate(result.FailedVisits, result.TotalVisits)}%
                                </span>
                              </div>
                            </div>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${calculateSuccessRate(result.FailedVisits, result.TotalVisits)}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="flex h-2 mb-4 overflow-hidden text-xs bg-black/30 rounded-full"
                            >
                              <div className="bg-gradient-to-r from-red-400 to-red-600 h-full rounded-full" />
                            </motion.div>
                          </div>
                        </motion.div>
                      </div>

                      <motion.div variants={itemVariants} className="mt-6 bg-black/20 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                          <User className="h-5 w-5 text-blue-400" />
                          Visit Statistics Summary
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-blue-200">Success Rate</span>
                              <span className="text-sm font-medium">
                                {calculateSuccessRate(result.SuccessfulVisits, result.TotalVisits)}%
                              </span>
                            </div>
                            <Progress
                              value={calculateSuccessRate(result.SuccessfulVisits, result.TotalVisits)}
                              className="h-2 bg-black/30"
                              indicatorClassName="bg-gradient-to-r from-blue-500 to-blue-500"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-blue-200">Failure Rate</span>
                              <span className="text-sm font-medium">
                                {calculateSuccessRate(result.FailedVisits, result.TotalVisits)}%
                              </span>
                            </div>
                            <Progress
                              value={calculateSuccessRate(result.FailedVisits, result.TotalVisits)}
                              className="h-2 bg-black/30"
                              indicatorClassName="bg-gradient-to-r from-red-500 to-orange-500"
                            />
                          </div>
                        </div>
                      </motion.div>
                    </CardContent>

                    <CardFooter className="pt-2 pb-4">
                      <motion.p variants={itemVariants} className="text-xs text-blue-200/70 italic">
                        Data fetched from visit statistics API. Last updated: {new Date().toLocaleString()}
                      </motion.p>
                    </CardFooter>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  )
}
