"use client"

import { useEffect } from "react"
import { ensureEnvVars } from "@/lib/env"

export default function EnvSetup() {
  useEffect(() => {
    // Set environment variables on the client side
    ensureEnvVars()
  }, [])

  return null
}
