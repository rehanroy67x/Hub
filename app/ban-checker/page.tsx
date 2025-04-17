"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Search, Shield, CheckCircle, XCircle } from "lucide-react"
import DashboardLayout from "@/components/ui/dashboard-layout"

interface BanCheckResult {
  player_id: string
  nickname?: string | null
  region?: string | null
  is_banned: boolean
  status: string
  ban_period?: string | null
  ban_message?: string
}

export default function BanChecker() {
  const [playerId, setPlayerId] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BanCheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkBanStatus = async () => {
    if (!playerId) {
      setError("Please enter a player ID")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/check?check=checkbanned&id=${playerId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to check ban status")
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || "An error occurred while checking ban status")
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  // Get encouraging message for non-banned users
  const getEncouragingMessage = () => {
    const messages = [
      "Keep enjoying Free Fire! Your account is in good standing.",
      "All clear! Continue your gaming journey with confidence.",
      "Good news! Your account is active and ready for battle.",
      "You're good to go! Keep playing and improving your skills.",
      "Account verified! Enjoy your Free Fire experience.",
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  // Get message for banned users
  const getBannedMessage = () => {
    const messages = [
      "Unfortunately, this account has been restricted from playing.",
      "This account has violated Free Fire's terms of service.",
      "Account access has been suspended. Please contact support.",
      "This account has been flagged for suspicious activity.",
      "Account banned. Review Free Fire's community guidelines.",
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

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
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 },
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
    <DashboardLayout title="Ban Checker" description="Check if a Free Fire player account has been banned">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-xl max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              Ban Status Checker
            </CardTitle>
            <CardDescription className="text-gray-200">
              Enter a player ID to check if the account has been banned
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      checkBanStatus()
                    }
                  }}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search size={18} />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  onClick={checkBanStatus}
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
                      <Shield className="mr-2 h-5 w-5" />
                      Check Ban Status
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
                <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit">
                  <Card
                    className={`border-2 ${
                      result.is_banned ? "bg-red-900/30 border-red-700/50" : "bg-green-900/30 border-green-700/50"
                    } text-white overflow-hidden`}
                  >
                    <CardHeader className="pb-2">
                      <motion.div variants={itemVariants} className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-2xl font-bold">{result.nickname || "Unknown Player"}</CardTitle>
                          <CardDescription className={result.is_banned ? "text-red-200" : "text-green-200"}>
                            UID: {result.player_id}
                          </CardDescription>
                        </div>
                        <motion.div
                          variants={itemVariants}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            result.is_banned ? "bg-red-600/40" : "bg-green-600/40"
                          }`}
                        >
                          {result.region || "Unknown Region"}
                        </motion.div>
                      </motion.div>
                    </CardHeader>

                    <CardContent className="pt-4">
                      <motion.div variants={itemVariants} className="flex items-center gap-3 mb-4">
                        {result.is_banned ? (
                          <div className="bg-red-900/50 p-3 rounded-full">
                            <XCircle className="h-6 w-6 text-red-400" />
                          </div>
                        ) : (
                          <div className="bg-green-900/50 p-3 rounded-full">
                            <CheckCircle className="h-6 w-6 text-green-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-bold">{result.is_banned ? "BANNED" : "NOT BANNED"}</h3>
                          <p className={`text-sm ${result.is_banned ? "text-red-300" : "text-green-300"}`}>
                            {result.is_banned ? getBannedMessage() : getEncouragingMessage()}
                          </p>
                        </div>
                      </motion.div>

                      {result.is_banned && result.ban_period && (
                        <motion.div variants={itemVariants} className="bg-black/20 p-3 rounded-lg mt-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Shield className="h-4 w-4 text-blue-300" />
                            <span className="text-sm text-blue-200">Ban Period</span>
                          </div>
                          <div className="font-medium">{result.ban_period}</div>
                        </motion.div>
                      )}
                    </CardContent>

                    <CardFooter className="pt-2 pb-4">
                      <motion.p variants={itemVariants} className="text-xs text-white/70 italic">
                        Ban status checked on {new Date().toLocaleString()}
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
