"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Download, FileJson, Loader2, Key, Clock } from "lucide-react"
import DashboardLayout from "@/components/ui/dashboard-layout"
import { FileUpload } from "@/components/ui/file-upload"

interface TokenData {
  uid: string
  password: string
  token: string
}

export default function JwtGenerator() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tokens, setTokens] = useState<TokenData[] | null>(null)
  const [expirationTime, setExpirationTime] = useState<string | null>(null)
  const downloadLinkRef = useRef<HTMLAnchorElement>(null)

  const handleFileSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      // Check if the file is a JSON file
      if (!selectedFiles[0].name.toLowerCase().endsWith(".json")) {
        setError("Please upload a JSON file")
        return
      }

      setFile(selectedFiles[0])
      setTokens(null)
      setError(null)
      setExpirationTime(null)
    } else {
      setFile(null)
    }
  }

  const processFile = async () => {
    if (!file) {
      setError("Please upload a JSON file")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/generate-jwt", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to process file")
      }

      if (!result.data || !result.data.tokens) {
        throw new Error("Invalid response from server")
      }

      setTokens(result.data.tokens)

      // Extract expiration time from the first token
      if (result.data.tokens.length > 0) {
        try {
          // JWT tokens are in format: header.payload.signature
          // We need to decode the payload (second part)
          const token = result.data.tokens[0].token
          const payloadBase64 = token.split(".")[1]
          const payload = JSON.parse(atob(payloadBase64))

          if (payload.exp) {
            // Convert Unix timestamp to date
            const expirationDate = new Date(payload.exp * 1000)
            setExpirationTime(expirationDate.toLocaleString())
          } else {
            // Default expiration (15 days = 1296000 seconds from now)
            const expirationDate = new Date(Date.now() + 1296000 * 1000)
            setExpirationTime(expirationDate.toLocaleString() + " (Default)")
          }
        } catch (err) {
          // If there's an error parsing the token, use default expiration
          const expirationDate = new Date(Date.now() + 1296000 * 1000)
          setExpirationTime(expirationDate.toLocaleString() + " (Default)")
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while processing file")
      setTokens(null)
    } finally {
      setLoading(false)
    }
  }

  const downloadJSON = () => {
    if (!tokens) return

    const jsonData = { tokens }
    const jsonString = JSON.stringify(jsonData, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    if (downloadLinkRef.current) {
      downloadLinkRef.current.href = url
      downloadLinkRef.current.download = "jwt_tokens.json"
      downloadLinkRef.current.click()
    }

    // Clean up the URL
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }

  return (
    <DashboardLayout
      title="JWT Token Generator"
      description="Generate JWT tokens for Free Fire accounts from a JSON file"
    >
      <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-400" />
            JWT Token Generator
          </CardTitle>
          <CardDescription className="text-gray-200">
            Upload a JSON file containing Free Fire account data (UID and password) to generate JWT tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileUpload onFilesSelected={handleFileSelected} accept=".json" multiple={false} fileType="JSON" />

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

            {tokens && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Alert className="bg-green-900/50 border-green-700 text-white">
                  <FileJson className="h-4 w-4 text-green-400" />
                  <AlertTitle className="text-lg font-bold">Processing Complete</AlertTitle>
                  <AlertDescription className="mt-2">
                    <p>Successfully generated {tokens.length} JWT tokens.</p>
                    {expirationTime && (
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <Clock className="h-4 w-4 text-blue-300" />
                        <span>
                          Tokens expire at: <span className="font-medium">{expirationTime}</span>
                        </span>
                      </div>
                    )}
                    <p className="mt-1 text-sm">Click the download button below to get your JWT tokens JSON file.</p>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3">
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 hover:text-white w-full sm:w-auto"
            disabled={!file || loading}
            onClick={processFile}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Tokens...
              </>
            ) : (
              <>
                <Key className="mr-2 h-4 w-4" />
                Generate JWT Tokens
              </>
            )}
          </Button>

          <Button
            onClick={downloadJSON}
            disabled={!tokens || loading}
            className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white border-none w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Tokens
          </Button>

          {/* Hidden download link */}
          <a ref={downloadLinkRef} className="hidden" />
        </CardFooter>
      </Card>

      {tokens && (
        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-xl mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Preview</CardTitle>
            <CardDescription className="text-gray-200">Preview of the generated JWT tokens</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-black/50 rounded-lg p-4 overflow-auto max-h-[400px]">
              <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                {JSON.stringify({ tokens }, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  )
}
