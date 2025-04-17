"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Bug } from "lucide-react"
import { supabase } from "@/lib/supabase-client"

export default function AuthDebug() {
  const [isOpen, setIsOpen] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const checkSupabaseConfig = async () => {
    setLoading(true)
    setError(null)

    try {
      // Check if we can connect to Supabase
      const { data: authData, error: authError } = await supabase.auth.getSession()

      // Check if Google provider is enabled
      const { data: settingsData, error: settingsError } = await supabase.auth.getSettings()

      setDebugInfo({
        supabaseUrl: supabase.supabaseUrl,
        hasAnonKey: !!supabase.supabaseKey,
        session: authData?.session ? "Active" : "None",
        authError: authError?.message || null,
        providers: settingsData?.providers || [],
        settingsError: settingsError?.message || null,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      })

      if (authError) {
        setError(`Auth error: ${authError.message}`)
      }

      if (settingsError) {
        setError(`Settings error: ${settingsError.message}`)
      }

      if (!settingsData?.providers?.includes("google")) {
        setError("Google provider is not enabled in your Supabase project")
      }
    } catch (err: any) {
      console.error("Debug error:", err)
      setError(err.message || "An error occurred during debugging")
    } finally {
      setLoading(false)
    }
  }

  const testGoogleRedirect = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=/dashboard`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        throw error
      }

      if (!data.url) {
        throw new Error("No redirect URL returned from Supabase")
      }

      setDebugInfo({
        ...debugInfo,
        redirectUrl: data.url,
        redirectTest: "Success",
      })

      // Don't actually redirect in debug mode
      // window.location.href = data.url
    } catch (err: any) {
      console.error("Google redirect test error:", err)
      setError(err.message || "Failed to get Google redirect URL")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 bg-black/50 text-white border-gray-700 hover:bg-black/70"
        onClick={() => setIsOpen(true)}
      >
        <Bug className="h-4 w-4 mr-2" />
        Debug Auth
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-black/80 border border-gray-700 rounded-lg p-4 text-white shadow-lg z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium flex items-center">
          <Bug className="h-4 w-4 mr-2" />
          Auth Debugger
        </h3>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={() => setIsOpen(false)}>
          ✕
        </Button>
      </div>

      {error && (
        <Alert className="mb-4 bg-red-900/20 border-red-800 text-white">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full border-blue-700 text-blue-400 hover:bg-blue-900/30"
          onClick={checkSupabaseConfig}
          disabled={loading}
        >
          Check Supabase Config
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full border-green-700 text-green-400 hover:bg-green-900/30"
          onClick={testGoogleRedirect}
          disabled={loading}
        >
          Test Google Redirect
        </Button>
      </div>

      {debugInfo && (
        <div className="bg-gray-900 rounded p-2 text-xs font-mono overflow-auto max-h-60">
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-2">
        Note: Make sure Google OAuth is enabled in your Supabase project and the callback URL is properly configured.
      </p>
    </div>
  )
}
